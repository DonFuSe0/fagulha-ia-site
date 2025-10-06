// app/layout.tsx — sem Turnstile, mantendo nonce infra
import './globals.css'
import { headers } from 'next/headers'
import type { Metadata } from 'next'
import AuthWatcher from '@/components/AuthWatcher'

export const metadata: Metadata = {
  title: 'Fagulha',
  description: 'App',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const _nonce = headers().get('x-nonce') ?? '' // reservado caso precise em <Script>

  return (
    <html lang="pt-br">
      <head />
      <body>
        <AuthWatcher />
        {children}
      </body>
    </html>
  )
}