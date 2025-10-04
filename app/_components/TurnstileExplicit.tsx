'use client'
import { useEffect, useRef, useState } from 'react'

declare global {
  interface Window {
    turnstile?: any
  }
}

type Props = {
  onVerify: (token: string) => void
  onError?: (err?: any) => void
  onExpire?: () => void
}

export default function TurnstileExplicit({ onVerify, onError, onExpire }: Props) {
  const sitekey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [scriptLoaded, setScriptLoaded] = useState(false)

  useEffect(() => {
    if (!sitekey) return
    if (window.turnstile) {
      setScriptLoaded(true)
      return
    }
    const script = document.createElement('script')
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js'
    // sem async / defer
    document.head.appendChild(script)
    script.onload = () => setScriptLoaded(true)
    script.onerror = () => {
      console.error('Falha ao carregar Turnstile script')
      onError?.('load-failed')
    }
  }, [sitekey, onError])

  useEffect(() => {
    if (!scriptLoaded) return
    if (!containerRef.current) return
    if (!window.turnstile) {
      console.warn('turnstile não definido ainda')
      return
    }

    // certificar que container está visível antes de renderizar
    const container = containerRef.current
    if (container.offsetParent === null) {
      // container invisível (por exemplo dentro de modal fechado) → não renderizar agora
      return
    }

    // evitar múltiplas renderizações
    if (container.dataset.turnstileRendered === 'true') {
      return
    }
    container.dataset.turnstileRendered = 'true'

    window.turnstile.render(container, {
      sitekey,
      theme: 'auto',
      callback: (token: string) => {
        onVerify(token)
      },
      'error-callback': (err: any) => {
        console.error('Turnstile error:', err)
        onError?.(err)
        try {
          window.turnstile.reset()
        } catch (_) {}
      },
      'expired-callback': () => {
        onExpire?.()
        try {
          window.turnstile.reset()
        } catch (_) {}
      },
      retry: 'never'
    })
  }, [scriptLoaded, onVerify, onError, onExpire, sitekey])

  if (!sitekey) {
    return (
      <div className="text-xs text-red-400">
        Falta configurar <code>NEXT_PUBLIC_TURNSTILE_SITE_KEY</code>
      </div>
    )
  }

  return <div ref={containerRef} />
}
