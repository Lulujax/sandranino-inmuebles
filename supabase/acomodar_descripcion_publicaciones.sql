-- ==============================================================================
-- ACTUALIZACIÓN RETROACTIVA: Descripción de las publicaciones
-- ==============================================================================
-- Contexto:
--   La descripción que se muestra en la web y la que se descarga en el ZIP de
--   Herramientas se arma automáticamente con este formato:
--
--     REPUBLICACION              <- solo si el contacto es un Colega Asesor
--     SN-03                      <- código del portal
--     REF: Marcos Rivas          <- solo si es colega (sin [Colega]/[Propietario])
--
--     <texto escrito por la asesora>
--
--     Sandra Niño
--     0424.496.01.02
--     Century21 A1
--     Cc. Guaparo
--
--   Por eso en la base de datos la descripción debe quedar SOLO con el texto
--   escrito por la asesora.
--
--   Este script limpia las descripciones ya publicadas aunque el formato se
--   haya escrito a mano: detecta y quita REPUBLICACION / REPUBLICACIÓN, las
--   líneas REF (con o sin dos puntos, con o sin el código SN-XX), el código del
--   portal y la firma, estén donde estén dentro del texto. Se puede ejecutar
--   varias veces sin duplicar ni borrar el texto real.
--
-- Instrucciones para ejecutar en Supabase:
--   1. Abre https://supabase.com/dashboard/project/wynqjsmrdwocfrtjojss/sql/new
--   2. Pega este código completo y haz clic en "Run".
--   3. Al final verás la lista de publicaciones con la descripción resultante.
-- ==============================================================================

BEGIN;

-- 0) VISTA PREVIA (solo lectura): muestra cómo quedaría cada descripción
--    sin modificar nada. Revisa esta columna antes de confirmar el resto.
WITH base AS (
  SELECT
    id,
    REPLACE(REPLACE(COALESCE(description, ''), chr(13) || chr(10), chr(10)), chr(13), chr(10)) AS desc_actual
  FROM public.inmuebles
  WHERE status = 'Publicado'
    AND TRIM(COALESCE(description, '')) <> ''
),
lineas AS (
  SELECT b.id, t.linea, t.pos
  FROM base b,
  UNNEST(STRING_TO_ARRAY(b.desc_actual, chr(10))) WITH ORDINALITY AS t(linea, pos)
),
filtradas AS (
  SELECT id, ARRAY_AGG(TRIM(linea) ORDER BY pos) AS lineas
  FROM lineas
  WHERE TRIM(linea) !~* '^(republicaci[oó]n|ref)\y'
    AND LOWER(TRIM(linea)) NOT IN (
      'sandra niño',
      '0424.496.01.02',
      'century21 a1',
      'cc. guaparo'
    )
  GROUP BY id
)
SELECT
  i.internal_code AS codigo,
  i.title,
  SUBSTRING(i.description, 1, 160) AS descripcion_actual,
  SUBSTRING(
    BTRIM(
      REGEXP_REPLACE(
        REGEXP_REPLACE(
          REGEXP_REPLACE(ARRAY_TO_STRING(f.lineas, chr(10)), '^\s*SN-\d+\s*\n?', '', 'i'),
          '\n\s*SN-\d+\s*$', '', 'i'
        ),
        '\n{3,}', chr(10) || chr(10), 'g'
      ),
      chr(10) || ' '
    ),
    1,
    160
  ) AS descripcion_resultante
FROM public.inmuebles i
JOIN filtradas f ON f.id = i.id
ORDER BY i.created_at DESC;

-- 1) Respaldo de las descripciones actuales (permite revertir si algo no gusta)
DROP TABLE IF EXISTS public.inmuebles_desc_respaldo;
CREATE TABLE public.inmuebles_desc_respaldo AS
SELECT id, internal_code, description, updated_at
FROM public.inmuebles
WHERE status = 'Publicado';

-- El respaldo no debe ser accesible desde la API pública:
-- RLS activado y sin políticas = solo el dueño/service role puede leerlo.
ALTER TABLE public.inmuebles_desc_respaldo ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.inmuebles_desc_respaldo FROM anon, authenticated;

-- 2) Dejar en la descripción solo el texto de la asesora
WITH base AS (
  SELECT
    id,
    REPLACE(REPLACE(COALESCE(description, ''), chr(13) || chr(10), chr(10)), chr(13), chr(10)) AS desc_actual
  FROM public.inmuebles
  WHERE status = 'Publicado'
    AND TRIM(COALESCE(description, '')) <> ''
),
lineas AS (
  SELECT
    b.id,
    t.linea,
    t.pos
  FROM base b,
  UNNEST(STRING_TO_ARRAY(b.desc_actual, chr(10))) WITH ORDINALITY AS t(linea, pos)
),
filtradas AS (
  -- Quita las líneas del formato escritas a mano, en cualquier posición
  SELECT
    id,
    ARRAY_AGG(TRIM(linea) ORDER BY pos) AS lineas
  FROM lineas
  WHERE TRIM(linea) !~* '^(republicaci[oó]n|ref)\y'
    AND LOWER(TRIM(linea)) NOT IN (
      'sandra niño',
      '0424.496.01.02',
      'century21 a1',
      'cc. guaparo'
    )
  GROUP BY id
),
limpias AS (
  -- Quita el código del portal (SN-XX) al inicio o al final y normaliza espacios
  SELECT
    id,
    BTRIM(
      REGEXP_REPLACE(
        REGEXP_REPLACE(
          REGEXP_REPLACE(
            ARRAY_TO_STRING(lineas, chr(10)),
            '^\s*SN-\d+\s*\n?', '', 'i'
          ),
          '\n\s*SN-\d+\s*$', '', 'i'
        ),
        '\n{3,}', chr(10) || chr(10), 'g'
      ),
      chr(10) || ' '
    ) AS texto
  FROM filtradas
)
UPDATE public.inmuebles i
SET
  description = l.texto,
  updated_at = NOW()
FROM limpias l
WHERE i.id = l.id
  AND l.texto <> ''
  AND l.texto IS DISTINCT FROM i.description;

-- 3) Verificación: cómo quedaron las publicaciones
SELECT
  internal_code AS codigo,
  title,
  owner_name,
  -- El tipo de contacto se deduce del prefijo guardado en owner_name
  CASE
    WHEN COALESCE(owner_name, '') ~* '^\[Colega\]' THEN 'Colega'
    WHEN COALESCE(owner_name, '') = '' THEN 'Sin contacto'
    ELSE 'Propietario'
  END AS tipo_contacto,
  description
FROM public.inmuebles
WHERE status = 'Publicado'
ORDER BY created_at DESC;

COMMIT;

-- ==============================================================================
-- REVERTIR (solo si fuera necesario):
--   UPDATE public.inmuebles i
--   SET description = r.description, updated_at = r.updated_at
--   FROM public.inmuebles_desc_respaldo r
--   WHERE i.id = r.id;
--   DROP TABLE public.inmuebles_desc_respaldo;
-- ==============================================================================
