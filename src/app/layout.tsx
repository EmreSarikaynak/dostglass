import type { Metadata } from 'next'
import { Providers } from './providers'
import { getSystemSettings } from '@/lib/getSystemSettings'
import 'react-quill-new/dist/quill.snow.css'

// Cloudflare Pages için Edge Runtime
export const runtime = 'edge'

// Metadata'yı 5 saniyede bir yenile
export const revalidate = 5

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSystemSettings()
  
  // Cache bypass için timestamp ekle
  const timestamp = Date.now()
  const faviconUrl = settings.favicon_url 
    ? `${settings.favicon_url}?v=${timestamp}` 
    : '/favicon.ico'
  
  return {
    title: settings.site_title || 'DostlarGlass',
    description: settings.site_description || 'Cam Montaj ve Yönetim Sistemi',
    icons: {
      icon: [
        {
          url: faviconUrl,
          sizes: '32x32',
          type: 'image/png',
        },
        {
          url: faviconUrl,
          sizes: '16x16',
          type: 'image/png',
        },
      ],
      shortcut: faviconUrl,
      apple: {
        url: settings.site_logo_url || faviconUrl,
        sizes: '180x180',
        type: 'image/png',
      },
    },
    manifest: '/manifest.json',
    appleWebApp: {
      capable: true,
      statusBarStyle: 'default',
      title: settings.site_title || 'DostlarGlass',
    },
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="tr">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
