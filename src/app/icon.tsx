import { ImageResponse } from 'next/og';

export const size = {
  width: 32,
  height: 32,
};
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 15,
          background: '#1e3a5f',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#faf9f6',
          fontWeight: 700,
          borderRadius: 6,
          fontFamily: 'sans-serif',
          border: '1px solid rgba(255, 255, 255, 0.2)',
        }}
      >
        SN
      </div>
    ),
    {
      ...size,
    }
  );
}

