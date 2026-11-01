import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Cargar variables de entorno desde .env.local
const envLocalPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envLocalPath)) {
  const content = fs.readFileSync(envLocalPath, 'utf8');
  for (const line of content.split(/\r?\n/)) {
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
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const EMAIL = 'asesorsandranino@gmail.com';
const PASSWORD = process.env.SANDRA_PASSWORD || 'SandraNino2026!';

function parseContactInfo(prop) {
  const rawName = (prop?.owner_name || '').trim();
  let cleanName = rawName;
  if (/^\[(Colega|Propietario)\]/i.test(rawName)) {
    cleanName = rawName.replace(/^\[(Colega|Propietario)\]\s*/i, '').trim();
  }
  return { name: cleanName };
}

function formatDescriptionWithContactRef(description, ownerName) {
  const rawDesc = (description || '').trim();
  const contact = parseContactInfo({ owner_name: ownerName });
  const cleanName = contact.name.trim();

  const descWithoutTrailingRef = rawDesc
    .replace(/(?:\r?\n)+\s*REF(?:\s*:|\s+)[^\r\n]*$/i, '')
    .trim();

  if (!cleanName) {
    return descWithoutTrailingRef;
  }

  const refLine = `REF: ${cleanName}`;

  if (descWithoutTrailingRef.toLowerCase().includes(refLine.toLowerCase())) {
    return descWithoutTrailingRef;
  }

  return descWithoutTrailingRef ? `${descWithoutTrailingRef}\n\n${refLine}` : refLine;
}

async function main() {
  console.log('='.repeat(65));
  console.log('🔄 ACTUALIZACIÓN RETROACTIVA DE DESCRIPCIONES EN SUPABASE');
  console.log('='.repeat(65));

  const supabase = createClient(SUPABASE_URL, ANON_KEY);

  // Iniciar sesión con credenciales de Sandra
  console.log(`🔐 Autenticando sesión como ${EMAIL}...`);
  const { data: authData, error: authErr } = await supabase.auth.signInWithPassword({
    email: EMAIL,
    password: PASSWORD,
  });

  if (authErr) {
    console.error('❌ Error de autenticación:', authErr.message);
    console.log('💡 Puedes ejecutar directamente el script SQL en el panel de Supabase:');
    console.log('   supabase/retroactivo_ref_descripcion.sql');
    process.exit(1);
  }

  console.log('✅ Sesión iniciada con éxito. Consultando inmuebles...');

  const { data: properties, error: fetchErr } = await supabase
    .from('inmuebles')
    .select('id, title, internal_code, description, owner_name, contact_type');

  if (fetchErr) {
    console.error('❌ Error al obtener inmuebles:', fetchErr.message);
    process.exit(1);
  }

  console.log(`📋 Total de inmuebles encontrados: ${properties.length}`);

  let updatedCount = 0;
  let alreadyUpToDateCount = 0;
  let withoutContactCount = 0;

  for (const prop of properties) {
    const contact = parseContactInfo(prop);
    if (!contact.name) {
      withoutContactCount++;
      continue;
    }

    const currentDesc = (prop.description || '').trim();
    const targetDesc = formatDescriptionWithContactRef(prop.description, prop.owner_name);

    if (currentDesc === targetDesc) {
      alreadyUpToDateCount++;
      continue;
    }

    console.log(`\n✏️  Actualizando: [${prop.internal_code || prop.id}] "${prop.title}"`);
    console.log(`   Contacto: ${contact.name}`);
    console.log(`   Línea anexada: REF: ${contact.name}`);

    const { error: updateErr } = await supabase
      .from('inmuebles')
      .update({ description: targetDesc, updated_at: new Date().toISOString() })
      .eq('id', prop.id);

    if (updateErr) {
      console.error(`   ❌ Error al actualizar ${prop.id}:`, updateErr.message);
    } else {
      updatedCount++;
      console.log('   ✅ Actualizado.');
    }
  }

  console.log('\n' + '='.repeat(65));
  console.log('📊 RESUMEN FINAL:');
  console.log(`   - Inmuebles actualizados en la base de datos: ${updatedCount}`);
  console.log(`   - Inmuebles que ya estaban al día:            ${alreadyUpToDateCount}`);
  console.log(`   - Inmuebles sin nombre de contacto cargado:   ${withoutContactCount}`);
  console.log('='.repeat(65));
}

main().catch(console.error);
