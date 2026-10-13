import { ImageResponse } from 'next/og';
import { createClient } from '@/lib/supabase/server';
import { Inmueble } from '@/lib/types';
import { formatPrice, formatArea, getPropertyMainArea } from '@/lib/utils';

export const alt = 'Vista previa del inmueble — Sandra Nino';
export const size = {
  width: 1200,
  height: 630,
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
          <div style={{ fontSize: 22, letterSpacing: '0.25em', color: '#C97B5A', marginBottom: 16 }}>
            SANDRA NINO • INVENTARIO EXCLUSIVO
          </div>
          <div style={{ fontSize: 48, fontWeight: 700 }}>Inmueble Exclusivo</div>
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
        img.startsWith('data:image/png'))
  );

  const priceText = formatPrice(property.price, property.operation);
  const mainArea = getPropertyMainArea(property);
  const areaText = mainArea ? formatArea(mainArea) : '';
  const locationText = `${property.sector ? `${property.sector}, ` : ''}${property.city}, ${property.state}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#faf9f6',
          fontFamily: 'sans-serif',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Collage de fotos (parte superior: 430px) */}
        <div
          style={{
            width: '1200px',
            height: '430px',
            display: 'flex',
            flexDirection: 'row',
            gap: '8px',
            padding: '12px 12px 0 12px',
            backgroundColor: '#faf9f6',
          }}
        >
          {validImages.length >= 3 ? (
            <>
              <div
                style={{
                  width: '720px',
                  height: '418px',
                  display: 'flex',
                  overflow: 'hidden',
                  borderRadius: '16px',
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
                  width: '448px',
                  height: '418px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                }}
              >
                <div
                  style={{
                    width: '448px',
                    height: '205px',
                    display: 'flex',
                    overflow: 'hidden',
                    borderRadius: '16px',
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
                    width: '448px',
                    height: '205px',
                    display: 'flex',
                    overflow: 'hidden',
                    borderRadius: '16px',
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
                  width: '584px',
                  height: '418px',
                  display: 'flex',
                  overflow: 'hidden',
                  borderRadius: '16px',
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
                  width: '584px',
                  height: '418px',
                  display: 'flex',
                  overflow: 'hidden',
                  borderRadius: '16px',
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
                width: '1176px',
                height: '418px',
                display: 'flex',
                overflow: 'hidden',
                borderRadius: '16px',
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
                width: '1176px',
                height: '418px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '16px',
                backgroundColor: '#1e3a5f',
                color: '#faf9f6',
                fontSize: 32,
                fontWeight: 600,
              }}
            >
              Sandra Nino • Inmuebles Exclusivos
            </div>
          )}
        </div>

        {/* Franja inferior informativa estilo ficha (200px) */}
        <div
          style={{
            width: '1200px',
            height: '200px',
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '20px 36px',
            backgroundColor: '#faf9f6',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', maxWidth: '780px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '8px',
              }}
            >
              <span
                style={{
                  backgroundColor: '#1e3a5f',
                  color: '#ffffff',
                  fontSize: '15px',
                  fontWeight: 700,
                  padding: '5px 14px',
                  borderRadius: '999px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                }}
              >
                {property.type} en {property.operation}
              </span>
              <span
                style={{
                  color: '#C97B5A',
                  fontSize: '15px',
                  fontWeight: 700,
                  letterSpacing: '0.15em',
                  textTransform: 'uppercase',
                }}
              >
                SANDRA NINO • INVENTARIO EXCLUSIVO
              </span>
            </div>

            <div
              style={{
                fontSize: '34px',
                fontWeight: 700,
                color: '#1c1917',
                lineHeight: 1.15,
                marginBottom: '8px',
              }}
            >
              {property.title.length > 52 ? `${property.title.slice(0, 52)}...` : property.title}
            </div>

            <div style={{ fontSize: '20px', color: '#57534e', display: 'flex', gap: '16px' }}>
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
              padding: '18px 28px',
              borderRadius: '18px',
              border: '1px solid #e7e2da',
            }}
          >
            <span
              style={{
                fontSize: '13px',
                textTransform: 'uppercase',
                letterSpacing: '0.18em',
                color: '#78716c',
                marginBottom: '4px',
              }}
            >
              PRECIO DE {property.operation.toUpperCase()}
            </span>
            <span
              style={{
                fontSize: '42px',
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

