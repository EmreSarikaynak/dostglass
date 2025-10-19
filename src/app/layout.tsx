import type { Metadata } from 'next'
import { Providers } from './providers'
import 'react-quill/dist/quill.snow.css'

export const metadata: Metadata = {
  title: 'DostGlass - Cam Sigorta Yönetimi',
  description: 'Kurumsal cam sigorta yönetim sistemi',
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
