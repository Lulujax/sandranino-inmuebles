-- ==============================================================================
-- SCRIPT DE ACTUALIZACIÓN DE CORREO DE SANDRA EN SUPABASE
-- Objetivo: Cambiar correo de acceso y contacto a asesorsandranino@gmail.com
-- ID de Sandra: f1cbb235-7e25-4efc-9673-03c2e4878c80
-- ==============================================================================
-- Instrucciones:
-- 1. Ve a tu panel de Supabase:
--    https://supabase.com/dashboard/project/wynqjsmrdwocfrtjojss/sql/new
-- 2. Pega este código completo en el SQL Editor y presiona "Run".
-- ==============================================================================

-- 1. Actualizar credenciales y confirmación en auth.users
UPDATE auth.users
SET 
  email = 'asesorsandranino@gmail.com',
  email_confirmed_at = COALESCE(email_confirmed_at, NOW()),
  updated_at = NOW(),
  raw_user_meta_data = jsonb_set(
    COALESCE(raw_user_meta_data, '{}'::jsonb),
    '{email}',
    '"asesorsandranino@gmail.com"'
  )
WHERE id = 'f1cbb235-7e25-4efc-9673-03c2e4878c80'
   OR email = 'sandra@sandranino.com';

-- 2. Actualizar identidad para permitir inicio de sesión inmediato con el nuevo correo
UPDATE auth.identities
SET 
  provider_id = CASE 
    WHEN provider_id = 'sandra@sandranino.com' THEN 'asesorsandranino@gmail.com' 
    ELSE provider_id 
  END,
  identity_data = jsonb_set(
    COALESCE(identity_data, '{}'::jsonb),
    '{email}',
    '"asesorsandranino@gmail.com"'
  ),
  updated_at = NOW()
WHERE user_id = 'f1cbb235-7e25-4efc-9673-03c2e4878c80'
   OR identity_data->>'email' = 'sandra@sandranino.com';

-- 3. Actualizar la tabla pública perfil_asesor (para que la web muestre el correo correcto)
UPDATE public.perfil_asesor
SET 
  email = 'asesorsandranino@gmail.com',
  updated_at = NOW()
WHERE id = 'f1cbb235-7e25-4efc-9673-03c2e4878c80';

-- 4. Verificación de resultados (deben aparecer ambos con asesorsandranino@gmail.com)
SELECT 'auth.users' AS tabla, id, email, email_confirmed_at, updated_at 
FROM auth.users 
WHERE id = 'f1cbb235-7e25-4efc-9673-03c2e4878c80'
UNION ALL
SELECT 'public.perfil_asesor' AS tabla, id, email, NULL AS email_confirmed_at, updated_at 
FROM public.perfil_asesor 
WHERE id = 'f1cbb235-7e25-4efc-9673-03c2e4878c80';

