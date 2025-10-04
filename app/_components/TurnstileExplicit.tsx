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
    // injeta o nonce que o middleware enviou
    const nonce = document.querySelector("meta[name='x-nonce']")?.getAttribute('content') 
      || (document as any).querySelector?.('meta[http-equiv=x-nonce]')?.getAttribute('content')
    if (nonce) {
      script.setAttribute('nonce', nonce)
    }
    document.head.appendChild(script)
    script.onload = () => {
      setScriptLoaded(true)
    }
    script.onerror = () => {
      console.error('Falha ao carregar Turnstile script')
      onError?.('load-failed')
    }
  }, [sitekey, onError])

  useEffect(() => {
    if (!scriptLoaded) return
    if (!containerRef.current) return
    if (!window.turnstile) {
      console.warn('turnstile não inicializado')
      return
    }

    containerRef.current.innerHTML = ''
    window.turnstile.render(containerRef.current, {
      sitekey,
      theme: 'auto',
      callback: (token: string) => onVerify(token),
      'error-callback': () => onError?.('challenge-error'),
      'expired-callback': () => {
        onExpire?.()
        window.turnstile.reset()
      },
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
