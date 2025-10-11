import './globals.css'
import type { Metadata } from 'next'
import { headers } from 'next/headers'
import AuthSessionSync from './_components/AuthSessionSync'

export const metadata: Metadata = {
  title: 'Fagulha',
  description: 'App',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const _nonce = headers().get('x-nonce') ?? ''
  return (
    <html lang="pt-BR">
      <head />
      <body>
        <AuthSessionSync />
        {children}
      </body>
    </html>
  )
}
