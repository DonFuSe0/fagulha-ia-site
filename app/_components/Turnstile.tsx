'use client'
import { useEffect } from 'react'

declare global {
  interface Window {
    onTurnstileCallback?: (token: string) => void
  }
}

export default function Turnstile({ onVerify }: { onVerify: (token: string) => void }) {
  useEffect(() => {
    window.onTurnstileCallback = (token: string) => onVerify(token)

    const script = document.createElement('script')
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js'
    script.async = true
    document.body.appendChild(script)

    return () => {
      document.body.removeChild(script)
      delete window.onTurnstileCallback
    }
  }, [onVerify])

  return (
    <div
      className="cf-turnstile"
      data-sitekey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
      data-callback="onTurnstileCallback"
    />
  )
}
