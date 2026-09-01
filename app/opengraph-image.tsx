import { ImageResponse } from 'next/og'

// Social share card (og:image / twitter:image) for every page that does not
// declare its own. File-convention metadata overrides the config export in
// app/layout.tsx, so this is the site-wide default.
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'
export const alt = 'PawLL — Premium Pet Supplies for Dogs & Cats'

export default function OpengraphImage() {
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
          background: 'linear-gradient(135deg, #1f2e44 0%, #2a3f5c 100%)',
          color: '#faf8f5',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <div style={{ fontSize: 96 }}>🐾</div>
          <div style={{ fontSize: 132, fontWeight: 800, letterSpacing: -4 }}>PawLL</div>
        </div>
        <div style={{ width: 160, height: 6, background: '#D4B28C', borderRadius: 3, margin: '28px 0' }} />
        <div style={{ fontSize: 40, color: '#f5f0ea' }}>Premium Pet Supplies for Dogs &amp; Cats</div>
        <div style={{ fontSize: 30, color: '#D4B28C', marginTop: 20 }}>pawllpet.com</div>
      </div>
    ),
    size,
  )
}
