// app/layout.tsx
import { ReactNode } from 'react'
import { headers } from 'next/headers'
import Script from 'next/script'

export const dynamic = 'force-dynamic'

export default function RootLayout({ children }: { children: ReactNode }) {
  const nonce = headers().get('x-nonce') ?? ''

  return (
    <html lang="pt-BR">
      <head>
        {/* outros meta tags */}
      </head>
      <body>
        <Script id="webpack-nonce" nonce={nonce} strategy="afterInteractive">
          {`__webpack_nonce__ = ${JSON.stringify(nonce)}`}
        </Script>
        {children}
      </body>
    </html>
  )
}
