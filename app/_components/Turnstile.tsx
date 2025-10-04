'use client'
import { useEffect, useRef, useState } from 'react'

declare global {
  interface Window {
    onTurnstileCallback?: (token: string) => void
    turnstile?: any
  }
}

export default function Turnstile({ onVerify }: { onVerify: (token: string) => void }) {
  const sitekey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY
  const [ready, setReady] = useState(false)
  const scriptInjected = useRef(false)

  useEffect(() => {
    if (!sitekey) return

    window.onTurnstileCallback = (token: string) => onVerify(token)

    // Inject only once
    if (!scriptInjected.current) {
      const script = document.createElement('script')
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js'
      script.async = true
      script.defer = true
      script.onload = () => setReady(true)
      document.body.appendChild(script)
      scriptInjected.current = true
    } else {
      setReady(true)
    }

    return () => {
      delete window.onTurnstileCallback
    }
  }, [onVerify, sitekey])

  if (!sitekey) {
    return (
      <div className="text-xs text-red-400">
        Falta configurar <code>NEXT_PUBLIC_TURNSTILE_SITE_KEY</code>.
      </div>
    )
  }

  return (
    <div
      className="cf-turnstile"
      data-sitekey={sitekey}
      data-callback="onTurnstileCallback"
      data-theme="auto"
    />
  )
}
