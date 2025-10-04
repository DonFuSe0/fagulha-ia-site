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
  const widgetIdRef = useRef<string | null>(null)
  const scriptInjectedRef = useRef<boolean>(false)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    if (!sitekey) return

    if (!scriptInjectedRef.current) {
      const s = document.createElement('script')
      s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js'
      // Não usar async ou defer no script
      document.head.appendChild(s)
      s.onload = () => {
        setLoaded(true)
      }
      scriptInjectedRef.current = true
    } else {
      setLoaded(true)
    }
  }, [sitekey])

  useEffect(() => {
    if (!loaded) return
    if (!containerRef.current) return
    if (!window.turnstile) return

    containerRef.current.innerHTML = ''
    widgetIdRef.current = window.turnstile.render(containerRef.current, {
      sitekey,
      theme: 'auto',
      callback: (token: string) => onVerify(token),
      'error-callback': () => onError?.(),
      'expired-callback': () => {
        onExpire?.()
        window.turnstile.reset(widgetIdRef.current || undefined)
      },
    })
  }, [loaded, onVerify, onError, onExpire, sitekey])

  if (!sitekey) {
    return (
      <div className="text-xs text-red-400">
        Falta configurar <code>NEXT_PUBLIC_TURNSTILE_SITE_KEY</code> e reimplantar
      </div>
    )
  }

  return <div ref={containerRef} />
}
