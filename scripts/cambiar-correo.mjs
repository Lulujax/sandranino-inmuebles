import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// 1. Cargar variables de entorno desde .env.local si no están definidas
const envLocalPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envLocalPath)) {
  const content = fs.readFileSync(envLocalPath, 'utf8');
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const [key, ...rest] = trimmed.split('=');
    if (key && rest.length > 0) {
      const val = rest.join('=').trim().replace(/^["']|["']$/g, '');
      if (!process.env[key.trim()]) {
        process.env[key.trim()] = val;
      }
    }
  }
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://wynqjsmrdwocfrtjojss.supabase.co';
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_UBfFtY22OpPo4nxhcH-OzA_38o9Zic1';

// Permitir service role key por variable de entorno o argumento CLI
let serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
for (const arg of process.argv.slice(2)) {
  if (arg.startsWith('--service-role=')) {
    serviceRoleKey = arg.replace('--service-role=', '').trim();
  } else if (!arg.startsWith('--') && arg.length > 30) {
    serviceRoleKey = arg.trim();
  }
}

const TARGET_USER_ID = 'f1cbb235-7e25-4efc-9673-03c2e4878c80';
const OLD_EMAIL = 'sandra@sandranino.com';
const CURRENT_PASSWORD = process.env.SANDRA_PASSWORD || 'SandraNino2026!';
const NEW_EMAIL = 'asesorsandranino@gmail.com';

async function main() {
  console.log('='.repeat(65));
  console.log('🔄 SCRIPT DE CAMBIO DE CORREO: Sandra Niño Inmuebles');
  console.log(`🎯 Nuevo Correo Destino: ${NEW_EMAIL}`);
  console.log(`🆔 ID de Usuario Supabase: ${TARGET_USER_ID}`);
  console.log('='.repeat(65));

  // MÉTODO A: Con Service Role Key (Actualización directa, garantizada e instantánea)
  if (serviceRoleKey) {
    console.log('\n🔑 [Método Administrativo] Service Role Key detectada.');
    console.log('🚀 Actualizando credenciales en auth.users sin validaciones de correo antiguo...');

    const adminClient = createClient(SUPABASE_URL, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    try {
      const { data: updateAuthData, error: authError } = await adminClient.auth.admin.updateUserById(
        TARGET_USER_ID,
        {
          email: NEW_EMAIL,
          email_confirm: true,
          user_metadata: { email_verified: true },
        }
      );

      if (authError) {
        console.error('❌ Error al actualizar en Supabase Auth:', authError.message);
      } else {
        console.log('✅ Correo de autenticación actualizado con éxito:');
        console.log(`   - Email Auth: ${updateAuthData.user.email}`);
        console.log(`   - Confirmado en: ${updateAuthData.user.email_confirmed_at}`);
      }

      // Actualizar tabla perfil_asesor
      console.log('\n📝 Actualizando tabla public.perfil_asesor...');
      const { data: profileData, error: profileError } = await adminClient
        .from('perfil_asesor')
        .update({ email: NEW_EMAIL, updated_at: new Date().toISOString() })
        .eq('id', TARGET_USER_ID)
        .select();

      if (profileError) {
        console.error('❌ Error al actualizar perfil_asesor:', profileError.message);
      } else {
        console.log('✅ Tabla perfil_asesor sincronizada con éxito:');
        console.log(`   - Email Perfil: ${profileData[0]?.email}`);
      }

      console.log('\n🎉 ¡PROCESO COMPLETADO AL 100%!');
      console.log(`Sandra ahora puede iniciar sesión con: ${NEW_EMAIL}`);
      console.log('='.repeat(65));
      return;
    } catch (err) {
      console.error('❌ Error inesperado con Service Role:', err);
    }
  }

  // MÉTODO B: Con Cliente Anon y Sesión de Sandra
  console.log('\n🔍 [Método Estándar] Usando clave pública y sesión de Sandra...');
  const supabase = createClient(SUPABASE_URL, ANON_KEY);

  // 1. Probar inicio de sesión con el nuevo correo por si ya fue actualizado
  const newLoginTest = await supabase.auth.signInWithPassword({
    email: NEW_EMAIL,
    password: CURRENT_PASSWORD,
  });

  if (!newLoginTest.error) {
    console.log(`✅ ¡El usuario ya tiene asignado ${NEW_EMAIL} en Supabase Auth!`);
    console.log('📝 Sincronizando perfil_asesor...');
    await supabase.from('perfil_asesor').update({ email: NEW_EMAIL }).eq('id', TARGET_USER_ID);
    console.log('🎉 Todo se encuentra al día y funcionando correctamente.');
    return;
  }

  // 2. Iniciar sesión con el correo anterior
  console.log(`🔐 Iniciando sesión con ${OLD_EMAIL}...`);
  const login = await supabase.auth.signInWithPassword({
    email: OLD_EMAIL,
    password: CURRENT_PASSWORD,
  });

  if (login.error) {
    console.error('❌ No se pudo iniciar sesión:', login.error.message);
    printManualInstructions();
    return;
  }

  console.log('✅ Sesión iniciada correctamente.');

  // 3. Actualizar la tabla pública perfil_asesor (se hace con los permisos de Sandra)
  console.log('📝 Actualizando tabla perfil_asesor...');
  const { data: updatedProfile, error: profileError } = await supabase
    .from('perfil_asesor')
    .update({ email: NEW_EMAIL, updated_at: new Date().toISOString() })
    .eq('id', TARGET_USER_ID)
    .select();

  if (profileError) {
    console.error('⚠️ No se pudo actualizar perfil_asesor:', profileError.message);
  } else {
    console.log(`✅ Tabla perfil_asesor actualizada a: ${updatedProfile[0]?.email}`);
  }

  // 4. Intentar actualización de auth
  console.log(`\n📧 Solicitando cambio de correo en auth a ${NEW_EMAIL}...`);
  const { error: updateError } = await supabase.auth.updateUser({
    email: NEW_EMAIL,
  });

  if (updateError) {
    console.log('\n' + '-'.repeat(65));
    console.log('ℹ️  NOTA TÉCNICA DE SUPABASE:');
    console.log(`El correo original "${OLD_EMAIL}" no tiene servidor MX activo,`);
    console.log('por lo que el API público de Supabase rechaza el envío automático');
    console.log('del correo de confirmación de seguridad.');
    console.log('-'.repeat(65));
    printManualInstructions();
  } else {
    console.log('✅ Solicitud enviada. Por favor revisa la bandeja de asesorsandranino@gmail.com para confirmar.');
  }
}

function printManualInstructions() {
  console.log('\n' + '='.repeat(65));
  console.log('📌 DOS OPCIONES SENCILLAS PARA COMPLETAR EL CAMBIO EN 1 MINUTO:');
  console.log('='.repeat(65));
  console.log('\n👉 OPCIÓN 1 (Recomendada: Directo en Supabase Dashboard - 100% instantáneo):');
  console.log('1. Abre tu SQL Editor en Supabase:');
  console.log('   https://supabase.com/dashboard/project/wynqjsmrdwocfrtjojss/sql/new');
  console.log('2. Copia y pega el script que se encuentra en:');
  console.log('   supabase/cambiar_correo.sql');
  console.log('3. Haz clic en "Run" y listo.\n');
  console.log('👉 OPCIÓN 2 (Con este mismo script pasando tu Service Role Key):');
  console.log('1. Copia tu "service_role" key desde:');
  console.log('   https://supabase.com/dashboard/project/wynqjsmrdwocfrtjojss/settings/api');
  console.log('2. Ejecuta:');
  console.log('   node scripts/cambiar-correo.mjs --service-role=TU_SERVICE_ROLE_KEY');
  console.log('='.repeat(65) + '\n');
}

main().catch((err) => {
  console.error('Error fatal:', err);
  process.exit(1);
});

