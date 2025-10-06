import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Fagulha',
  description: 'App',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-br">
      <head />
      <body>{children}</body>
    </html>
  )
}