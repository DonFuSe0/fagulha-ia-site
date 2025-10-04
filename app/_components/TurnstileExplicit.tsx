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
  const ref = useRef<HTMLDivElement | null>(null)
  const [loaded, setLoaded] = useState(false)

  // Injeta o script do Turnstile com a mesma nonce aplicada no CSP
  useEffect(() => {
    if (!sitekey) {
      console.error('Turnstile sitekey não configurado')
      return
    }
    if (window.turnstile) {
      setLoaded(true)
      return
    }
    const nonce = document.querySelector('meta[name="csp-nonce"]')?.getAttribute('content') || undefined
    const s = document.createElement('script')
    s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js'
    if (nonce) s.setAttribute('nonce', nonce)
    // Sem async/defer quando usamos turnstile.ready/render explícito
    document.head.appendChild(s)
    s.onload = () => setLoaded(true)
    s.onerror = () => {
      console.error('Falha ao carregar Turnstile script')
      onError?.('load-failed')
    }
  }, [sitekey, onError])

  // Render explícito somente quando visível e script carregado
  useEffect(() => {
    if (!loaded) return
    if (!ref.current) return
    if (!window.turnstile) return

    const el = ref.current
    if (el.offsetParent === null) {
      // container invisível — evita crash; tente novamente quando ficar visível
      const obs = new IntersectionObserver((entries) => {
        const visible = entries.some((e) => e.isIntersecting)
        if (visible) {
          obs.disconnect()
          if (!window.turnstile) return
          el.innerHTML = ''
          window.turnstile.render(el, {
            sitekey,
            theme: 'auto',
            callback: (token: string) => onVerify(token),
            'error-callback': (err: any) => {
              console.error('Turnstile error:', err)
              onError?.(err)
              try { window.turnstile.reset() } catch {}
            },
            'expired-callback': () => {
              onExpire?.()
              try { window.turnstile.reset() } catch {}
            },
            retry: 'never'
          })
        }
      })
      obs.observe(el)
      return () => obs.disconnect()
    }

    el.innerHTML = ''
    window.turnstile.render(el, {
      sitekey,
      theme: 'auto',
      callback: (token: string) => onVerify(token),
      'error-callback': (err: any) => {
        console.error('Turnstile error:', err)
        onError?.(err)
        try { window.turnstile.reset() } catch {}
      },
      'expired-callback': () => {
        onExpire?.()
        try { window.turnstile.reset() } catch {}
      },
      retry: 'never'
    })
  }, [loaded, onVerify, onError, onExpire, sitekey])

  if (!sitekey) {
    return <div className="text-xs text-red-400">Falta configurar <code>NEXT_PUBLIC_TURNSTILE_SITE_KEY</code></div>
  }

  return <div ref={ref} />
}
