import { ImageResponse } from 'next/og'

// Next.js metadata API için icon export
export const size = {
  width: 32,
  height: 32,
}
export const contentType = 'image/png'

// Default export - Next.js metadata API'nin gerektirdiği format
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 24,
          fontWeight: 'bold',
          background: 'linear-gradient(135deg, #025691 0%, #002C51 100%)',
          color: 'white',
        }}
      >
        DG
      </div>
    ),
    {
      ...size,
    }
  )
}
