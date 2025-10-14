'use client'

import { useEffect, useState } from 'react'
import AnimatedToast from '../../components/AnimatedToast'

export default function GlobalToastListener() {
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null)
  
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as { kind: 'success' | 'error'; message: string }
      if (!detail || !detail.message) return
      setToast({ message: detail.message, type: detail.kind || 'success' })
    }
    window.addEventListener('notify', handler as EventListener)
    return () => window.removeEventListener('notify', handler as EventListener)
  }, [])
  
  if (!toast) return null
  return <AnimatedToast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
}