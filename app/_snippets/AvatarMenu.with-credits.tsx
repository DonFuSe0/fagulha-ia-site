// Substitua a função AvatarMenu existente por ESTA versão limpa.
import { useEffect, useState } from 'react'

type AvatarMenuProps = {
  nickname: string
  avatarUrl: string | null
}

function AvatarMenu({ nickname, avatarUrl }: AvatarMenuProps) {
  const [open, setOpen] = useState(false)
  const [credits, setCredits] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        setLoading(true)
        const res = await fetch('/api/profile/credits', {
          credentials: 'include',
          headers: { 'cache-control': 'no-cache' },
        })
        const data = await res.json()
        if (alive && typeof data?.credits === 'number') setCredits(data.credits)
      } catch {
        // silencioso
      } finally {
        if (alive) setLoading(false)
      }
    })()
    return () => { alive = false }
  }, [])

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-full px-2 py-1 hover:bg-white/5 transition"
      >
        {/* Avatar */}
        <img
          src={avatarUrl || '/avatar-fallback.png'}
          alt="Avatar"
          className="h-8 w-8 rounded-full object-cover ring-1 ring-white/10"
        />

        {/* Nickname + Saldo */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-zinc-200">{nickname || 'Seu perfil'}</span>
          <span className="ml-1 text-xs text-white/80 bg-white/10 border border-white/10 rounded px-2 py-0.5">
            Saldo: <strong>{credits ?? 0}</strong>
          </span>
        </div>
      </button>

      {/* Dropdown (se já existia na sua versão, mantenha o conteúdo original aqui) */}
      {open && (
        <div className="absolute right-0 mt-2 w-56 rounded-xl bg-zinc-950/90 backdrop-blur border border-white/10 shadow-xl p-2">
          {/* ... suas opções existentes: Sua Galeria, Editar Perfil, Adquirir Tokens, Sair ... */}
        </div>
      )}
    </div>
  )
}

export default AvatarMenu
