// app/layout.tsx
import { headers } from 'next/headers'
import Script from 'next/script'

export const dynamic = 'force-dynamic'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const nonce = headers().get('x-nonce') ?? ''

  return (
    <html lang="pt-BR">
      <head>
        {/* outros <meta> etc */}
      </head>
      <body>
        {/* define nonce para Webpack / bundles */}
        <Script
          id="webpack-nonce"
          nonce={nonce}
          strategy="afterInteractive"
        >
          {`__webpack_nonce__ = ${JSON.stringify(nonce)}`}
        </Script>

        {children}
      </body>
    </html>
  )
}
