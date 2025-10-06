// app/layout.tsx — aplica nonce nos <Script> e remove scripts inline
import './globals.css'
import Script from 'next/script'
import { headers } from 'next/headers'
import type { Metadata } from 'next'
import AuthWatcher from '@/components/AuthWatcher'

export const metadata: Metadata = {
  title: 'Fagulha',
  description: 'Login seguro com CSP + Supabase',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const nonce = headers().get('x-nonce') ?? ''

  return (
    <html lang="pt-br">
      <head>
        {/* Cloudflare Turnstile (sempre com nonce) */}
        <Script
          id="turnstile"
          nonce={nonce}
          src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
          async
          defer
        />
        {/* Outras libs externas devem receber nonce={nonce} também */}
      </head>
      <body>
        <AuthWatcher />
        {children}
      </body>
    </html>
  )
}