-- ==============================================================================
-- AGREGAR TIKTOK Y CARGAR LAS REDES SOCIALES REALES DE SANDRA
-- Objetivo:
--   1. Crear la columna "tiktok" en public.perfil_asesor (necesaria para que la
--      web y el panel admin puedan guardar y mostrar el TikTok).
--   2. Cargar los enlaces reales de contacto (WhatsApp, correo, Instagram,
--      Facebook y TikTok) para que aparezcan de inmediato en las páginas públicas.
-- ID de Sandra: f1cbb235-7e25-4efc-9673-03c2e4878c80
-- ==============================================================================
-- Instrucciones:
-- 1. Ve a tu panel de Supabase:
--    https://supabase.com/dashboard/project/wynqjsmrdwocfrtjojss/sql/new
-- 2. Pega este código completo en el SQL Editor y presiona "Run".
-- ==============================================================================

-- 1. Crear la columna para TikTok (segura de ejecutar varias veces)
ALTER TABLE public.perfil_asesor
  ADD COLUMN IF NOT EXISTS tiktok text;

-- 2. Cargar los datos reales de contacto
UPDATE public.perfil_asesor
SET
  whatsapp = '584244960102',
  email = 'asesorsandranino@gmail.com',
  instagram = 'https://www.instagram.com/sandranino_century21a1',
  facebook = 'https://www.facebook.com/consorcio.vergara.1',
  tiktok = 'https://www.tiktok.com/@inmuebles_carabobo_sandr',
  updated_at = NOW()
WHERE id = 'f1cbb235-7e25-4efc-9673-03c2e4878c80';

-- 3. Verificación de resultados (debe mostrar los 5 canales cargados)
SELECT id, full_name, whatsapp, email, instagram, facebook, tiktok, updated_at
FROM public.perfil_asesor
WHERE id = 'f1cbb235-7e25-4efc-9673-03c2e4878c80';
