-- ==============================================================================
-- CORRELATIVO PÚBLICO DE INMUEBLES (Ref: SN-01, SN-02, SN-03...)
-- Objetivo:
--   Asignar el correlativo público (columna internal_code) a los inmuebles que
--   aún no lo tengan, continuando la numeración existente.
--   Los inmuebles NUEVOS ya se numeran automáticamente al guardarlos o
--   publicarlos desde el panel admin; este script es solo para los existentes.
-- Nota: el correlativo se muestra discretamente en la ficha pública y viaja
--   en los mensajes de compartir para que puedas localizar el inmueble
--   escribiéndolo en el buscador del panel admin.
-- ==============================================================================
-- Instrucciones:
-- 1. Ve a tu panel de Supabase:
--    https://supabase.com/dashboard/project/wynqjsmrdwocfrtjojss/sql/new
-- 2. Pega este código completo en el SQL Editor y presiona "Run".
-- ==============================================================================

WITH existing AS (
  SELECT COALESCE(
    MAX(NULLIF(regexp_replace(internal_code, '\D', '', 'g'), '')::int),
    0
  ) AS max_n
  FROM public.inmuebles
  WHERE internal_code ~ '\d'
),
pending AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at) AS rn
  FROM public.inmuebles
  WHERE internal_code IS NULL OR trim(internal_code) = ''
)
UPDATE public.inmuebles i
SET
  internal_code = 'SN-' || LPAD((e.max_n + p.rn)::text, 2, '0'),
  updated_at = NOW()
FROM pending p, existing e
WHERE i.id = p.id;

-- Verificación (deben aparecer todos los inmuebles con su Ref)
SELECT internal_code AS ref, status, title
FROM public.inmuebles
ORDER BY internal_code NULLS LAST;
