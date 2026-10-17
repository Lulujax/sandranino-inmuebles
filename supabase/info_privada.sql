-- ==============================================================================
-- INFO PRIVADA POR INMUEBLE (ubicación exacta + fotos de fachada + notas)
-- Objetivo:
--   Guardar en un lugar SEPARADO y 100% PRIVADO la información delicada de cada
--   inmueble: ubicación exacta descrita por ti, fotos de la fachada de enfrente
--   y notas. Nadie sin tu sesión puede leerla ni ver las fotos:
--   - Tabla nueva con políticas RLS que SOLO permiten acceso a tu usuario.
--   - Bucket de Storage privado ('inmuebles-privadas') con acceso por URL
--     firmada de 1 hora, también restringido a tu usuario.
--   La llave pública de la web (anónima) NO tiene permisos sobre esta tabla ni
--   este bucket: los visitantes siguen viendo exactamente lo mismo que hoy.
-- Instrucciones:
-- 1. Ve a tu panel de Supabase:
--    https://supabase.com/dashboard/project/wynqjsmrdwocfrtjojss/sql/new
-- 2. Pega este código completo en el SQL Editor y presiona "Run".
-- ==============================================================================

-- 1) Tabla de información privada (una fila por inmueble)
CREATE TABLE IF NOT EXISTS public.info_privada_inmuebles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  inmueble_id uuid NOT NULL REFERENCES public.inmuebles (id) ON DELETE CASCADE,
  user_id uuid NOT NULL DEFAULT auth.uid(),
  ubicacion_exacta text,
  fachada_urls text[] NOT NULL DEFAULT '{}',
  notas text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Solo puede existir una fila de info privada por inmueble (necesario para el upsert)
CREATE UNIQUE INDEX IF NOT EXISTS info_privada_inmuebles_inmueble_id_key
  ON public.info_privada_inmuebles (inmueble_id);

-- 2) Seguridad a nivel de fila: SOLO el asesor dueño (sesión autenticada) ve/edita.
--    Sin política para el rol anónimo => la web pública no puede leerla jamás.
ALTER TABLE public.info_privada_inmuebles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "dueno_total_info_privada" ON public.info_privada_inmuebles;
CREATE POLICY "dueno_total_info_privada"
  ON public.info_privada_inmuebles
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- 3) Bucket privado de Storage para las fotos de fachada
INSERT INTO storage.buckets (id, name, public)
VALUES ('inmuebles-privadas', 'inmuebles-privadas', false)
ON CONFLICT (id) DO NOTHING;

-- 4) Políticas del bucket: cada asesor solo entra a SU carpeta (su user_id)
DROP POLICY IF EXISTS "fachadas_dueno_total" ON storage.objects;
CREATE POLICY "fachadas_dueno_total"
  ON storage.objects
  FOR ALL
  TO authenticated
  USING (
    bucket_id = 'inmuebles-privadas'
    AND (storage.foldername(name))[1] = auth.uid()::text
  )
  WITH CHECK (
    bucket_id = 'inmuebles-privadas'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- 5) Verificación: deben aparecer la tabla y el bucket creados.
SELECT 'info_privada_inmuebles'::text AS objeto, 'TABLA OK (RLS activo)' AS estado
UNION ALL
SELECT id, 'BUCKET OK (privado)' FROM storage.buckets WHERE id = 'inmuebles-privadas';
