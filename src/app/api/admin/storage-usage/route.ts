import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const BUCKETS = ['inmuebles', 'inmuebles-privadas'];

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

async function listAllObjects(
  supabase: ReturnType<typeof createClient>,
  bucket: string,
  prefix = ''
): Promise<Array<{ name: string; size: number }>> {
  const results: Array<{ name: string; size: number }> = [];

  const { data, error } = await supabase.storage.from(bucket).list(prefix, {
    limit: 1000,
    offset: 0,
    sortBy: { column: 'name', order: 'asc' },
  });

  if (error) {
    console.error(`Error listando ${bucket}/${prefix}:`, error.message);
    return results;
  }

  for (const item of data || []) {
    // Si tiene metadata.size suele ser archivo, si no suele ser carpeta
    const meta = (item as any).metadata;
    const isFile = meta && typeof meta.size === 'number';
    if (isFile) {
      const fullPath = prefix ? `${prefix}/${item.name}` : item.name;
      results.push({
        name: fullPath,
        size: meta.size,
      });
    } else {
      // Carpetas o entradas sin metadata: listar recursivamente
      const nextPrefix = prefix ? `${prefix}/${item.name}` : item.name;
      const nested = await listAllObjects(supabase, bucket, nextPrefix);
      results.push(...nested);
    }
  }

  return results;
}

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json(
        { error: 'Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en el servidor' },
        { status: 500 }
      );
    }

    const supabase: any = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    } as any);

    let totalBytes = 0;
    const byBucket: Record<string, { bytes: number; mb: number; gb: number; count: number; human: string }> = {};

    for (const bucket of BUCKETS) {
      try {
        const objects = await listAllObjects(supabase, bucket);
        let bucketBytes = 0;
        for (const obj of objects) {
          bucketBytes += obj.size || 0;
        }
        totalBytes += bucketBytes;
        const mb = bucketBytes / 1024 / 1024;
        const gb = bucketBytes / 1024 / 1024 / 1024;
        byBucket[bucket] = {
          bytes: bucketBytes,
          mb: Number(mb.toFixed(2)),
          gb: Number(gb.toFixed(4)),
          count: objects.length,
          human: formatBytes(bucketBytes),
        };
      } catch (err) {
        console.error(`Error procesando bucket ${bucket}:`, err);
        byBucket[bucket] = {
          bytes: 0,
          mb: 0,
          gb: 0,
          count: 0,
          human: '0 B',
        };
      }
    }

    const totalMb = totalBytes / 1024 / 1024;
    const totalGb = totalBytes / 1024 / 1024 / 1024;
    const limitMb = 1000;
    const limitGb = 1;

    return NextResponse.json({
      success: true,
      totalBytes,
      totalMb: Number(totalMb.toFixed(2)),
      totalGb: Number(totalGb.toFixed(4)),
      totalHuman: formatBytes(totalBytes),
      limitMb,
      limitGb,
      limitHuman: `${limitGb} GB`,
      percentage: Number(((totalMb / limitMb) * 100).toFixed(2)),
      byBucket,
      checkedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('storage-usage error:', error);
    return NextResponse.json({ error: error?.message || 'Error desconocido' }, { status: 500 });
  }
}
