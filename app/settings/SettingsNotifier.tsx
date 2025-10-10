'use client'
import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

type Kind = 'success' | 'error'

export default function SettingsNotifier() {
  const [open, setOpen] = useState(false)
  const [msg, setMsg] = useState<string>('')
  const [kind, setKind] = useState<Kind>('success')
  const searchParams = useSearchParams()
  const router = useRouter()

  // Programmatic notifications (apelido/avatar)
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as { kind: Kind; message: string }
      if (!detail || !detail.message) return
      setKind(detail.kind || 'success')
      setMsg(detail.message)
      setOpen(true)
      const t = window.setTimeout(() => setOpen(false), 4000)
      return () => window.clearTimeout(t)
    }
    window.addEventListener('notify', handler as EventListener)
    return () => window.removeEventListener('notify', handler as EventListener)
  }, [])

  // Password feedback via query params
  useEffect(() => {
    const pwd = searchParams?.get('pwd')
    const perr = searchParams?.get('pwd_error')
    if (pwd === 'ok') {
      setKind('success'); setMsg('Senha atualizada com sucesso.'); setOpen(true)
      const t = window.setTimeout(() => setOpen(false), 4000)
      router.replace('/settings?tab=seguranca')
      return () => window.clearTimeout(t)
    }
    if (perr) {
      const map: Record<string, string> = {
        invalid: 'Dados inválidos para alterar a senha.',
        update_failed: 'Não foi possível atualizar a senha.',
        method_not_allowed: 'Método não permitido.',
        unexpected: 'Ocorreu um erro inesperado.'
      }
      setKind('error'); setMsg(map[perr] || map['unexpected']); setOpen(true)
      const t = window.setTimeout(() => setOpen(false), 5000)
      router.replace('/settings?tab=seguranca')
      return () => window.clearTimeout(t)
    }
  }, [searchParams, router])

  if (!open) return null

  const base = "mt-3 text-sm rounded-md border px-3 py-2"
  const ok = "border-green-500 text-green-400 bg-green-500/10"
  const bad = "border-red-500 text-red-400 bg-red-500/10"
  const classes = base + " " + (kind === 'success' ? ok : bad)

  return <div className={classes}>{msg}</div>
}
