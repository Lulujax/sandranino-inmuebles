import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/supabase/client';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const cronSecret = process.env.CRON_SECRET;
    if (cronSecret) {
      const authHeader = request.headers.get('authorization');
      if (authHeader !== `Bearer ${cronSecret}`) {
        return NextResponse.json(
          { status: 'unauthorized' },
          { status: 401 }
        );
      }
    }

    // Solo consultar si Supabase está configurado con credenciales reales
    if (isSupabaseConfigured()) {
      const supabase = await createClient();
      const { error } = await supabase
        .from('inmuebles')
        .select('id', { count: 'exact', head: true });
      if (error) {
        console.error('[keep-alive] Supabase ping error:', error.message);
      }
    }

    return NextResponse.json(
      {
        status: 'ok',
        message: 'Keep-alive ping exitoso para evitar pausa de base de datos',
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error('[keep-alive] Unexpected error:', error);
    return NextResponse.json(
      {
        status: 'error',
        message: 'No se pudo completar el ping de mantenimiento',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
