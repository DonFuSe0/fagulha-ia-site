'use client'
import { useEffect, useRef } from 'react'

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
  const widgetIdRef = useRef<string | null>(null)
  const scriptInjectedRef = useRef<boolean>(false)

  useEffect(() => {
    if (!sitekey) return

    // injeta script apenas uma vez
    if (!scriptInjectedRef.current) {
      const s = document.createElement('script')
      s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js'
      s.async = true
      s.defer = true
      document.head.appendChild(s)
      scriptInjectedRef.current = true
    }

    const render = () => {
      if (!containerRef.current || !window.turnstile) return
      // limpa widget anterior se existir
      containerRef.current.innerHTML = ''
      widgetIdRef.current = window.turnstile.render(containerRef.current, {
        sitekey,
        theme: 'auto',
        callback: (token: string) => onVerify(token),
        'error-callback': () => onError?.(),
        'expired-callback': () => {
          onExpire?.()
          window.turnstile?.reset(widgetIdRef.current || undefined)
        },
      })
    }

    const id = setInterval(() => {
      if (window.turnstile) {
        clearInterval(id)
        window.turnstile.ready(render)
      }
    }, 50)

    return () => clearInterval(id)
  }, [onVerify, onError, onExpire, sitekey])

  if (!sitekey) {
    return (
      <div className="text-xs text-red-400">
        Falta configurar <code>NEXT_PUBLIC_TURNSTILE_SITE_KEY</code> na Vercel e redeploy.
      </div>
    )
  }

  return <div ref={containerRef} />
}
