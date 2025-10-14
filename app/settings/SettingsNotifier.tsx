'use client'
import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import AnimatedToast from '../../components/AnimatedToast'

type Kind = 'success' | 'error'

export default function SettingsNotifier() {
  const [toast, setToast] = useState<{ message: string, type: Kind } | null>(null)
  const searchParams = useSearchParams()
  const router = useRouter()

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as { kind: Kind; message: string }
      if (!detail || !detail.message) return
      setToast({ message: detail.message, type: detail.kind || 'success' })
    }
    window.addEventListener('notify', handler as EventListener)
    return () => window.removeEventListener('notify', handler as EventListener)
  }, [])

  useEffect(() => {
    const pwd = searchParams?.get('pwd')
    const perr = searchParams?.get('pwd_error')
    if (pwd === 'ok') {
      setToast({ message: 'Senha atualizada com sucesso.', type: 'success' })
      router.replace('/settings?tab=seguranca')
    }
    if (perr) {
      const map: Record<string, string> = {
        invalid: 'Dados inválidos para alterar a senha.',
        update_failed: 'Não foi possível atualizar a senha.',
        method_not_allowed: 'Método não permitido.',
        unexpected: 'Ocorreu um erro inesperado.'
      }
      setToast({ message: map[perr] || map['unexpected'], type: 'error' })
      router.replace('/settings?tab=seguranca')
    }
  }, [searchParams, router])

  if (!toast) return null

  return <AnimatedToast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
}
