// app/_components/TurnstileExplicit.tsx
"use client"

import { useEffect } from "react"

interface TurnstileExplicitProps {
  onVerify: (token: string) => void
}

export default function TurnstileExplicit({ onVerify }: TurnstileExplicitProps) {
  useEffect(() => {
    if (typeof window !== "undefined" && (window as any).turnstile) {
      ;(window as any).turnstile.ready(() => {
        ;(window as any).turnstile.render("#turnstile-explicit", {
          sitekey: process.env.NEXT_PUBLIC_TURNSTILE_SITEKEY,
          callback: onVerify,
        })
      })
    }
  }, [onVerify])

  return <div id="turnstile-explicit"></div>
}
