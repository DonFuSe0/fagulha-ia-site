'use client'
import { useState } from 'react'

type Props = {
  onRetry: () => void
  disabled?: boolean
}

export default function TurnstileRetryButton({ onRetry, disabled = false }: Props) {
  const [isRetrying, setIsRetrying] = useState(false)

  const handleRetry = async () => {
    setIsRetrying(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 500)) // Small delay for UX
      onRetry()
    } finally {
      setIsRetrying(false)
    }
  }

  return (
    <button
      type="button"
      onClick={handleRetry}
      disabled={disabled || isRetrying}
      className="px-3 py-1 text-xs rounded bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 border border-orange-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isRetrying ? 'Tentando...' : 'Tentar novamente'}
    </button>
  )
}
