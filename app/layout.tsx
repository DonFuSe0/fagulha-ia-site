// app/layout.tsx — sem AuthWatcher


import './globals.css'
import type { Metadata } from 'next'
import { headers } from 'next/headers'
import PageTransition from '../components/PageTransition'
import AnimatedToast from '../components/AnimatedToast'
import { useEffect, useState } from 'react'

export const metadata: Metadata = {
  title: 'Fagulha',
  description: 'App',
}


// Componente Client para listener global de toast
function GlobalToastListener() {
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null)
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as { kind: 'success' | 'error'; message: string }
      if (!detail || !detail.message) return
      setToast({ message: detail.message, type: detail.kind || 'success' })
    }
    window.addEventListener('notify', handler as EventListener)
    return () => window.removeEventListener('notify', handler as EventListener)
  }, [])
  if (!toast) return null
  return <AnimatedToast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
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