'use client'
import { useEffect, useRef } from 'react'

declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement | string, opts: any) => string
      reset: (id: string) => void
      remove: (id: string) => void
      getResponse: (id: string) => string | undefined
    }
  }
}

type Props = {
  onVerify: (token: string) => void
  onError?: (code?: string) => void
  onExpire?: () => void
}

export default function TurnstileExplicit({ onVerify, onError, onExpire }: Props) {
  const sitekey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY
  const containerRef = useRef<HTMLDivElement | null>(null)
  const widgetIdRef = useRef<string | null>(null)
  const renderedRef = useRef(false)

  useEffect(() => {
    if (!sitekey || !containerRef.current) return

    let canceled = false
    const tryRender = () => {
      if (canceled || renderedRef.current) return
      if (!window.turnstile) {
        // Script ainda não carregou — tenta novamente em seguida
        setTimeout(tryRender, 150)
        return
      }
      // Renderiza apenas UMA vez por montagem
      renderedRef.current = true
      widgetIdRef.current = window.turnstile.render(containerRef.current!, {
        sitekey,
        theme: 'auto',
        retry: 'auto', // mude para 'never' se quiser evitar tentativas automáticas
        'error-callback': (code?: string) => onError?.(code),
        'expired-callback': () => onExpire?.(),
        callback: (token: string) => onVerify(token),
      })
    }

    tryRender()

    // Cleanup remove o widget para evitar múltiplas instâncias/listeners
    return () => {
      canceled = true
      if (widgetIdRef.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current)
        } catch {}
      }
    }
  }, [sitekey, onVerify, onError, onExpire])

  if (!sitekey) {
    return (
      <div className="text-xs text-red-400">
        Falta configurar <code>NEXT_PUBLIC_TURNSTILE_SITE_KEY</code> na Vercel e fazer deploy.
      </div>
    )
  }

  return <div ref={containerRef} />
}
