import { ImageResponse } from 'next/og';

export const alt = 'Grace — a Bible that reads to you';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          background: '#FBF9F4',
          color: '#3A2C22',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: 80,
          fontFamily: 'Georgia, serif',
        }}
      >
        <div style={{ fontSize: 28, letterSpacing: 6, color: '#B58A3F' }}>AUDIO-FIRST BIBLE</div>
        <div style={{ fontSize: 120, lineHeight: 1, marginTop: 16 }}>Grace</div>
        <div style={{ fontSize: 36, marginTop: 24, color: '#6B5D4E' }}>
          A quiet place for your soul to breathe.
        </div>
      </div>
    ),
    { ...size },
  );
}
