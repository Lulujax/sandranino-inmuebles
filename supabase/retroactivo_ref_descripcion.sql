-- ==============================================================================
-- ACTUALIZACIÓN RETROACTIVA: Anexar REF: [Nombre] a las descripciones existentes
-- ==============================================================================
-- Objetivo:
--   Recorrer todos los inmuebles de la base de datos que tengan cargado un
--   nombre de contacto (owner_name) y asegurar que en su descripción termine con:
--
--     \n\nREF: [Nombre]
--
--   (Sin las palabras "Colega" ni "Propietario").
--   Si el inmueble ya tenía una referencia previa, se limpia y actualiza
--   para evitar cualquier duplicado.
-- ==============================================================================
-- Instrucciones para ejecutar en Supabase:
-- 1. Abre tu panel de Supabase:
--    https://supabase.com/dashboard/project/wynqjsmrdwocfrtjojss/sql/new
-- 2. Pega este código completo y haz clic en "Run".
-- ==============================================================================

WITH cleaned_contacts AS (
  SELECT
    id,
    -- Limpiar descripción quitando cualquier REF final previo si existía
    TRIM(REGEXP_REPLACE(COALESCE(description, ''), '(\r?\n)+\s*REF(?:\s*:|\s+)[^\r\n]*$', '', 'i')) AS base_desc,
    -- Limpiar el nombre quitando [Colega] o [Propietario]
    TRIM(REGEXP_REPLACE(TRIM(owner_name), '^\[(Colega|Propietario)\]\s*', '', 'i')) AS clean_name
  FROM public.inmuebles
  WHERE owner_name IS NOT NULL AND TRIM(owner_name) <> ''
)
UPDATE public.inmuebles i
SET
  description = CASE
    WHEN c.base_desc = '' THEN 'REF: ' || c.clean_name
    ELSE c.base_desc || E'\n\nREF: ' || c.clean_name
  END,
  updated_at = NOW()
FROM cleaned_contacts c
WHERE i.id = c.id
  AND c.clean_name <> ''
  -- Evitar actualizar si ya tiene exactamente esa misma línea
  AND NOT (COALESCE(i.description, '') ILIKE '%REF: ' || c.clean_name);

-- Consulta de verificación (muestra cómo quedaron las descripciones actualizadas)
SELECT
  internal_code AS ref_inmueble,
  title,
  owner_name,
  description
FROM public.inmuebles
WHERE owner_name IS NOT NULL AND TRIM(owner_name) <> ''
ORDER BY created_at DESC;
