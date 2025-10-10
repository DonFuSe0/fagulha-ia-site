'use client'
import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

type Kind = 'success' | 'error'

export default function SettingsNotifier() {
  const [msg, setMsg] = useState<string | null>(null)
  const [kind, setKind] = useState<Kind>('success')
  const searchParams = useSearchParams()
  const router = useRouter()

  // Listen to programmatic notifications (avatar/nick)
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as { kind: Kind; message: string }
      if (!detail?.message) return
      setKind(detail.kind || 'success')
      setMsg(detail.message)
      // auto-hide after 4s
      setTimeout(() => setMsg(null), 4000)
    }
    window.addEventListener('notify', handler as EventListener)
    return () => window.removeEventListener('notify', handler as EventListener)
  }, [])

  // Handle password feedback via querystring
  useEffect(() => {
    const pwd = searchParams?.get('pwd')
    const perr = searchParams?.get('pwd_error')
    if (pwd === 'ok') {
      setKind('success'); setMsg('Senha atualizada com sucesso.')
      setTimeout(() => setMsg(null), 4000)
      router.replace('/settings?tab=seguranca')
    } else if (perr) {
      const map: Record<string, string> = {
        invalid: 'Dados inválidos para alterar a senha.',
        update_failed: 'Não foi possível atualizar a senha.',
        method_not_allowed: 'Método não permitido.',
        unexpected: 'Ocorreu um erro inesperado.'
      }
      setKind('error'); setMsg(map[perr] || map['unexpected'])
      setTimeout(() => setMsg(null), 5000)
      router.replace('/settings?tab=seguranca')
    }
  }, [searchParams, router])

  if (!msg) return null

  const base = 'mt-3 text-sm rounded-md border px-3 py-2'
  const ok = 'border-green-500 text-green-400 bg-green-500/10'
  const bad = 'border-red-500 text-red-400 bg-red-500/10'

  return (
    <div className={\`\${base} \${kind === 'success' ? ok : bad}\`}>
      {msg}
    </div>
  )
}
