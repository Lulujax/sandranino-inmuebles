import { ImageResponse } from 'next/og';
import { createClient } from '@/lib/supabase/server';
import { Inmueble } from '@/lib/types';
import { formatPrice, formatArea, getPropertyMainArea } from '@/lib/utils';

export const alt = 'Mini collage del inmueble — Sandra Niño';
export const size = {
  width: 800,
  height: 418,
};
export const contentType = 'image/png';

export default async function Image({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let property: Inmueble | null = null;
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from('inmuebles_publicos')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    property = data as Inmueble | null;
  } catch {}

  if (!property) {
    return new ImageResponse(
      (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#1e3a5f',
            color: '#faf9f6',
            fontFamily: 'sans-serif',
          }}
        >
          <div style={{ fontSize: 16, letterSpacing: '0.25em', color: '#C97B5A', marginBottom: 10 }}>
            SANDRA NIÑO • INVENTARIO EXCLUSIVO
          </div>
          <div style={{ fontSize: 32, fontWeight: 700 }}>Inmueble Exclusivo</div>
        </div>
      ),
      { ...size }
    );
  }

  const validImages = (property.images || []).filter(
    (img) =>
      typeof img === 'string' &&
      (img.startsWith('http://') ||
        img.startsWith('https://') ||
        img.startsWith('data:image/jpeg') ||
        img.startsWith('data:image/png') ||
        img.startsWith('data:image/webp'))
  );

  const priceText = formatPrice(property.price, property.operation);
  const mainArea = getPropertyMainArea(property);
  const areaText = mainArea ? formatArea(mainArea) : '';
  const locationText = `${property.sector ? `${property.sector}, ` : ''}${property.city}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: '800px',
          height: '418px',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#faf9f6',
          fontFamily: 'sans-serif',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Mini Collage de fotos superior (altura 290px) */}
        <div
          style={{
            width: '800px',
            height: '290px',
            display: 'flex',
            flexDirection: 'row',
            gap: '6px',
            padding: '8px 8px 0 8px',
            backgroundColor: '#faf9f6',
          }}
        >
          {validImages.length >= 3 ? (
            <>
              {/* Foto Principal Hero Izquierda */}
              <div
                style={{
                  width: '488px',
                  height: '282px',
                  display: 'flex',
                  overflow: 'hidden',
                  borderRadius: '12px',
                  backgroundColor: '#e7e2da',
                }}
              >
                <img
                  src={validImages[0]}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>

              {/* 2 Fotos Subordinadas Derecha */}
              <div
                style={{
                  width: '290px',
                  height: '282px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                }}
              >
                <div
                  style={{
                    width: '290px',
                    height: '138px',
                    display: 'flex',
                    overflow: 'hidden',
                    borderRadius: '10px',
                    backgroundColor: '#e7e2da',
                  }}
                >
                  <img
                    src={validImages[1]}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
                <div
                  style={{
                    width: '290px',
                    height: '138px',
                    display: 'flex',
                    overflow: 'hidden',
                    borderRadius: '10px',
                    backgroundColor: '#e7e2da',
                  }}
                >
                  <img
                    src={validImages[2]}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
              </div>
            </>
          ) : validImages.length === 2 ? (
            <>
              <div
                style={{
                  width: '389px',
                  height: '282px',
                  display: 'flex',
                  overflow: 'hidden',
                  borderRadius: '12px',
                  backgroundColor: '#e7e2da',
                }}
              >
                <img
                  src={validImages[0]}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
              <div
                style={{
                  width: '389px',
                  height: '282px',
                  display: 'flex',
                  overflow: 'hidden',
                  borderRadius: '12px',
                  backgroundColor: '#e7e2da',
                }}
              >
                <img
                  src={validImages[1]}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
            </>
          ) : validImages.length === 1 ? (
            <div
              style={{
                width: '784px',
                height: '282px',
                display: 'flex',
                overflow: 'hidden',
                borderRadius: '12px',
                backgroundColor: '#e7e2da',
              }}
            >
              <img
                src={validImages[0]}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
          ) : (
            <div
              style={{
                width: '784px',
                height: '282px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '12px',
                backgroundColor: '#1e3a5f',
                color: '#faf9f6',
                fontSize: 24,
                fontWeight: 600,
              }}
            >
              Sandra Niño • Inmuebles Exclusivos
            </div>
          )}
        </div>

        {/* Franja inferior informativa (altura 128px) */}
        <div
          style={{
            width: '800px',
            height: '128px',
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 24px',
            backgroundColor: '#faf9f6',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', maxWidth: '530px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '4px',
              }}
            >
              <span
                style={{
                  backgroundColor: '#1e3a5f',
                  color: '#ffffff',
                  fontSize: '11px',
                  fontWeight: 700,
                  padding: '3px 10px',
                  borderRadius: '999px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                }}
              >
                {property.type} en {property.operation}
              </span>
              <span
                style={{
                  color: '#C97B5A',
                  fontSize: '11px',
                  fontWeight: 700,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                }}
              >
                SANDRA NIÑO
              </span>
            </div>

            <div
              style={{
                fontSize: '22px',
                fontWeight: 700,
                color: '#1c1917',
                lineHeight: 1.15,
                marginBottom: '4px',
              }}
            >
              {property.title.length > 44 ? `${property.title.slice(0, 44)}...` : property.title}
            </div>

            <div style={{ fontSize: '13px', color: '#57534e', display: 'flex', gap: '12px' }}>
              <span>📍 {locationText}</span>
              {areaText ? <span>📐 {areaText}</span> : null}
              {property.bedrooms ? <span>🛏️ {property.bedrooms} hab.</span> : null}
              {property.bathrooms ? <span>🚿 {property.bathrooms} baños</span> : null}
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-end',
              justifyContent: 'center',
              backgroundColor: '#f5f1ea',
              padding: '10px 18px',
              borderRadius: '14px',
              border: '1px solid #e7e2da',
            }}
          >
            <span
              style={{
                fontSize: '10px',
                textTransform: 'uppercase',
                letterSpacing: '0.14em',
                color: '#78716c',
                marginBottom: '2px',
              }}
            >
              {property.operation.toUpperCase()}
            </span>
            <span
              style={{
                fontSize: '28px',
                fontWeight: 800,
                color: '#1e3a5f',
              }}
            >
              {priceText}
            </span>
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
