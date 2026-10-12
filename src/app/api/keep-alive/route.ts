import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/client';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

    // Solo consultar si Supabase está configurado con credenciales reales
    if (supabaseUrl && supabaseUrl !== 'https://placeholder.supabase.co') {
      const supabase = createClient();
      await supabase.from('inmuebles').select('id', { count: 'exact', head: true });
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
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      {
        status: 'error',
        error: message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

