// app/login/page.tsx — exemplo mínimo sem scripts inline
'use client'
import { useEffect, useRef } from 'react'

export default function LoginPage() {
  const widgetRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Renderiza o Turnstile quando o script já estiver carregado
    // @ts-ignore
    if (window.turnstile && widgetRef.current) {
      // @ts-ignore
      window.turnstile.render(widgetRef.current, {
        sitekey: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY,
        theme: 'auto',
      })
    }
  }, [])

  return (
    <main className="mx-auto max-w-md p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Entrar</h1>
      {/* seu formulário aqui */}
      <div ref={widgetRef} className="mt-4" />
    </main>
  )
}