#!/usr/bin/env node
/**
 * Comprime todas las imágenes existentes en el bucket 'inmuebles' de Supabase
 * a 1920px / JPEG 83% usando sharp. Sube con upsert para reutilizar la misma ruta
 * y mantener las URLs públicas sin actualizar la BD.
 * 
 * Requiere: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (en .env.local)
 */
import fs from 'node:fs';
import path from 'node:path';
import { createClient } from '@supabase/supabase-js';
import sharp from 'sharp';

const BUCKET = 'inmuebles';
const MAX_DIM = 1920;
const QUALITY = 83;

function loadEnv() {
  const envPath = path.resolve(process.cwd(), '.env.local');
  if (!fs.existsSync(envPath)) {
    console.error('No se encontró .env.local');
    process.exit(1);
  }
  const content = fs.readFileSync(envPath, 'utf8');
  const env = {};
  for (const line of content.split(/\r?\n/)) {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m) {
      env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, '');
    }
  }
  return env;
}

async function listAll(supabase, bucket, prefix = '') {
  const { data, error } = await supabase.storage.from(bucket).list(prefix, {
    limit: 1000,
    offset: 0,
    sortBy: { column: 'name', order: 'asc' },
  });
  if (error) throw error;
  let files = [];
  for (const item of data || []) {
    if (item.name.includes('.')) {
      files.push(prefix ? `${prefix}/${item.name}` : item.name);
    } else {
      const sub = await listAll(supabase, bucket, prefix ? `${prefix}/${item.name}` : item.name);
      files = files.concat(sub);
    }
  }
  return files;
}

async function main() {
  const env = loadEnv();
  const url = env.SUPABASE_URL;
  const key = env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error('Faltan SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en .env.local');
    process.exit(1);
  }
  const supabase = createClient(url, key);
  console.log(`Listando archivos en bucket ${BUCKET}...`);
  const files = await listAll(supabase, BUCKET);
  const images = files.filter((f) => /\.(jpg|jpeg|png|webp|avif|gif)$/i.test(f));
  console.log(`Encontradas ${images.length} imágenes. Optimizando a ${MAX_DIM}px / JPEG ${QUALITY}%...`);
  
  let done = 0, saved = 0;
  for (const filePath of images) {
    try {
      const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(filePath);
      const publicUrl = urlData.publicUrl;
      const res = await fetch(publicUrl);
      if (!res.ok) throw new Error(`fetch ${res.status}`);
      const buf = Buffer.from(await res.arrayBuffer());
      const before = buf.length;
      const optimized = await sharp(buf)
        .rotate()
        .resize(MAX_DIM, MAX_DIM, { fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: QUALITY, mozjpeg: true })
        .toBuffer();
      const after = optimized.length;
      if (after >= before) {
        done++;
        continue;
      }
      const { error: upErr } = await supabase.storage
        .from(BUCKET)
        .upload(filePath, optimized, {
          contentType: 'image/jpeg',
          upsert: true,
          cacheControl: '31536000',
        });
      if (upErr) throw upErr;
      saved += before - after;
      done++;
      if (done % 10 === 0) {
        console.log(`Progreso: ${done}/${images.length} | Ahorrado: ${(saved/1024/1024).toFixed(2)} MB`);
      }
    } catch (e) {
      console.error(`Error en ${filePath}:`, e.message);
    }
  }
  console.log(`Listo. Optimizadas: ${done}/${images.length}. Ahorrado aproximado: ${(saved/1024/1024).toFixed(2)} MB`);
}
main().catch((e) => {
  console.error(e);
  process.exit(1);
});
