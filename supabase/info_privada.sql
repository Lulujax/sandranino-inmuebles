-- ============================================================================
-- supabase/info_privada.sql — Ejecutar en el SQL Editor de Supabase (idempotente)
--
-- 1) Crea (si no existe) la tabla 🔒 info_privada_inmuebles con RLS estricta
-- 2) Crea (si no existe) el bucket privado 'inmuebles-privadas' y sus policies
-- 3) Migra las notas del antiguo campo `inmuebles.notes` hacia esta tabla
-- 4) Limpia `inmuebles.notes`
--
-- Notas:
-- - La columna `inmuebles.address` quedó obsoleta en el código (el wizard ya no
--   la usa); se conservan sus datos históricos en la base, sin afectar nada.
-- - Idempotente: se puede re-ejecutar sin romper nada.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1) Tabla de info privada
-- ---------------------------------------------------------------------------
create table if not exists public.info_privada_inmuebles (
  id uuid primary key default gen_random_uuid(),
  inmueble_id uuid not null references public.inmuebles (id) on delete cascade,
  user_id uuid not null,
  ubicacion_exacta text,
  fachada_urls text[] not null default '{}',
  notas text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Necesario para el upsert por inmueble_id desde la app (privateInfoStore.save).
-- Idempotente real: solo crea el unique si aún no existe tal constraint ni tal índice.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conrelid = 'public.info_privada_inmuebles'::regclass
      AND contype IN ('u', 'p')
      AND pg_get_constraintdef(oid) ILIKE '%(inmueble_id)%'
  )
  AND NOT EXISTS (
    SELECT 1
    FROM pg_indexes
    WHERE schemaname = 'public'
      AND tablename = 'info_privada_inmuebles'
      AND indexdef ILIKE '%UNIQUE%(inmueble_id)%'
  ) THEN
    ALTER TABLE public.info_privada_inmuebles
      ADD CONSTRAINT info_privada_inmuebles_inmueble_id_key UNIQUE (inmueble_id);
  END IF;
END $$;

-- ---------------------------------------------------------------------------
-- RLS: cada asesor ve EXCLUSIVAMENTE su propia info privada
-- ---------------------------------------------------------------------------
alter table public.info_privada_inmuebles enable row level security;

drop policy if exists "info_privada_select_own" on public.info_privada_inmuebles;
drop policy if exists "info_privada_insert_own" on public.info_privada_inmuebles;
drop policy if exists "info_privada_update_own" on public.info_privada_inmuebles;
drop policy if exists "info_privada_delete_own" on public.info_privada_inmuebles;

create policy "info_privada_select_own" on public.info_privada_inmuebles
  for select using (auth.uid() = user_id);

create policy "info_privada_insert_own" on public.info_privada_inmuebles
  for insert with check (auth.uid() = user_id);

create policy "info_privada_update_own" on public.info_privada_inmuebles
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "info_privada_delete_own" on public.info_privada_inmuebles
  for delete using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- 2) Bucket privado de fachadas
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('inmuebles-privadas', 'inmuebles-privadas', false)
on conflict (id) do update set public = false;

-- Policies del bucket privado (acc only con sesión del dueño)
drop policy if exists "fachadas_read_own" on storage.objects;
drop policy if exists "fachadas_insert_own" on storage.objects;
drop policy if exists "fachadas_update_own" on storage.objects;
drop policy if exists "fachadas_delete_own" on storage.objects;

create policy "fachadas_read_own" on storage.objects
  for select using (bucket_id = 'inmuebles-privadas' and auth.role() = 'authenticated');

create policy "fachadas_insert_own" on storage.objects
  for insert with check (
    bucket_id = 'inmuebles-privadas'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "fachadas_update_own" on storage.objects
  for update using (
    bucket_id = 'inmuebles-privadas'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  ) with check (
    bucket_id = 'inmuebles-privadas'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "fachadas_delete_own" on storage.objects
  for delete using (
    bucket_id = 'inmuebles-privadas'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- ---------------------------------------------------------------------------
-- 3) Migración: notas privadas antiguas (inmuebles.notes) → info_privada_inmuebles.notas
--    Si el inmueble aún no tiene fila privada, la crea;
--    respeta lo que ya exista en info_privada_inmuebles.notas.
-- ---------------------------------------------------------------------------
insert into public.info_privada_inmuebles (inmueble_id, user_id, notas)
select i.id, i.user_id, i.notes
from public.inmuebles i
where i.notes is not null and btrim(i.notes) <> ''
on conflict (inmueble_id) do update
  set notas  = coalesce(public.info_privada_inmuebles.notas, excluded.notas),
      updated_at = now();

-- ---------------------------------------------------------------------------
-- 4) Limpieza del campo antiguo (obsoleto en el código; queda histórico en la BD)
-- ---------------------------------------------------------------------------
update public.inmuebles
set notes = null
where notes is not null and btrim(notes) <> '';

-- select count(*) from public.info_privada_inmuebles;  -- verificación rápida
