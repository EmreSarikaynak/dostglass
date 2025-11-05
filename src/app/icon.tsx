import { ImageResponse } from 'next/og'
import { getSystemSettings } from '@/lib/getSystemSettings'

export const size = {
  width: 32,
  height: 32,
}

export const runtime = 'nodejs'

export default async function Icon() {
  const settings = await getSystemSettings()
  const faviconUrl = settings.favicon_url

  if (faviconUrl) {
    try {
      const response = await fetch(faviconUrl, { cache: 'no-store' })
      if (response.ok) {
        const buffer = await response.arrayBuffer()
        const type = response.headers.get('content-type') || 'image/png'
        return new Response(buffer, {
          headers: {
            'content-type': type,
            'cache-control': 'public, max-age=300',
          },
        })
      }
    } catch (error) {
      console.error('Favicon fetch failed:', error)
    }
  }

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
