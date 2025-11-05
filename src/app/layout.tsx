import type { Metadata } from 'next'
import { Providers } from './providers'
import { getSystemSettings } from '@/lib/getSystemSettings'
import 'react-quill-new/dist/quill.snow.css'

// Metadata'yı 5 saniyede bir yenile
export const revalidate = 5

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSystemSettings()

  // Cache bypass için timestamp ekle
  const timestamp = Date.now()
  const rawFaviconUrl = settings.favicon_url || ''
  const faviconUrl = rawFaviconUrl
    ? `${rawFaviconUrl}?v=${timestamp}`
    : '/favicon.ico'
  const faviconType =
    rawFaviconUrl.endsWith('.svg')
      ? 'image/svg+xml'
      : rawFaviconUrl.endsWith('.jpeg') || rawFaviconUrl.endsWith('.jpg')
        ? 'image/jpeg'
        : rawFaviconUrl.endsWith('.ico')
          ? 'image/x-icon'
          : 'image/png'

  return {
    title: settings.site_title || 'DostlarGlass',
    description: settings.site_description || 'Cam Montaj ve Yönetim Sistemi',
    icons: {
      icon: [
        {
          url: faviconUrl,
          sizes: '32x32',
          type: faviconType,
        },
        {
          url: faviconUrl,
          sizes: '16x16',
          type: faviconType,
        },
      ],
      shortcut: faviconUrl,
      apple: {
        url: settings.site_logo_url || faviconUrl,
        sizes: '180x180',
        type: settings.site_logo_url?.endsWith('.svg')
          ? 'image/svg+xml'
          : 'image/png',
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
