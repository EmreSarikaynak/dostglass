import { ImageResponse } from 'next/og'
import { getSystemSettings } from '@/lib/getSystemSettings'

export const runtime = 'edge'
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  try {
    const settings = await getSystemSettings()
    
    if (settings.favicon_url) {
      // Supabase'den favicon'i fetch et ve döndür
      const response = await fetch(settings.favicon_url)
      
      if (response.ok) {
        const blob = await response.blob()
        const arrayBuffer = await blob.arrayBuffer()
        
        return new Response(arrayBuffer, {
          headers: {
            'Content-Type': response.headers.get('content-type') || 'image/png',
            'Cache-Control': 'public, max-age=300, s-maxage=300',
          },
        })
      }
    }
  } catch (error) {
    console.error('Icon error:', error)
  }
  
  // Varsayılan olarak basit bir favicon oluştur
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
      width: 32,
      height: 32,
    }
  )
}
