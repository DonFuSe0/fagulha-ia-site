// app/layout.tsx — sem AuthWatcher para evitar duplicidade de listeners
import './globals.css'
import type { Metadata } from 'next'
import { headers } from 'next/headers'

export const metadata: Metadata = {
  title: 'Fagulha',
  description: 'App',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const _nonce = headers().get('x-nonce') ?? ''
  return (
    <html lang="pt-br">
      <head />
      <body>{children}</body>
    </html>
  )
}