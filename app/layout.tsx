// app/layout.tsx — sem AuthWatcher

import './globals.css'
import type { Metadata } from 'next'
import { headers } from 'next/headers'
import PageTransition from '../components/PageTransition'
import GlobalToastListener from './_components/GlobalToastListener'

export const metadata: Metadata = {
  title: 'Fagulha',
  description: 'App',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const _nonce = headers().get('x-nonce') ?? ''
  return (
    <html lang="pt-br">
      <head />
      <body>
        <GlobalToastListener />
        <PageTransition>{children}</PageTransition>
      </body>
    </html>
  )
}