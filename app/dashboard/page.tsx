// app/dashboard/page.tsx
'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'

type TokenRow = {
  id: string
  user_id: string
  amount: number
  description: string | null
  created_at: string | null
}

type GenerationRow = {
  id: string
  created_at: string | null
  image_url: string | null
  thumb_url: string | null
  prompt: string | null
}

function cx(...p: (string | null | undefined | false)[]) { return p.filter(Boolean).join(' ') }

function AvatarMenu({ nickname, avatarUrl }: { nickname: string; avatarUrl?: string | null }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/70 px-2 py-1 hover:border-brand transition-colors"
      >
        <div className="w-8 h-8 rounded-full overflow-hidden bg-zinc-800 flex items-center justify-center">
          {avatarUrl ? (
            <Image src={avatarUrl} alt={nickname} width={32} height={32} />
          ) : (
            <span className="text-xs text-zinc-400">AV</span>
          )}
        </div>
        <span className="text-sm text-zinc-200">{nickname}</span>
        <svg className={cx('w-4 h-4 text-zinc-400 transition-transform', open && 'rotate-180')} viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 10.94l3.71-3.71a.75.75 0 1 1 1.06 1.06l-4.24 4.24a.75.75 0 0 1-1.06 0L5.21 8.29a.75.75 0 0 1 .02-1.08z" clipRule="evenodd" />
        </svg>
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-56 rounded-xl border border-zinc-800 bg-zinc-900/95 shadow-xl backdrop-blur">
          <div className="py-2 text-sm">
            <Link href="/gallery" className="block px-4 py-2 hover:bg-zinc-800">Sua Galeria</Link>
            <Link href="/settings?tab=perfil" className="block px-4 py-2 hover:bg-zinc-800">Editar Perfil</Link>
            <Link href="/planos" className="block px-4 py-2 hover:bg-zinc-800">Comprar token</Link>
            <button
              onClick={async () => { await supabase.auth.signOut(); window.location.href = '/' }}
              className="w-full text-left px-4 py-2 hover:bg-zinc-800 text-red-400"
            >
              Sair
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function TopNav({ nickname, avatarUrl }: { nickname: string; avatarUrl?: string | null }) {
  return (
    <nav className="w-full bg-black/60 backdrop-blur border-b border-zinc-800 text-zinc-100">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="font-semibold">Fagulha<span className="text-brand">.</span></Link>
          <Link href="/" className="hover:text-brand">Início</Link>
          <Link href="/gallery" className="hover:text-brand">Sua Galeria</Link>
          <Link href="/generate" className="hover:text-brand">Criação</Link>
        </div>
        <AvatarMenu nickname={nickname} avatarUrl={avatarUrl ?? undefined} />
      </div>
    </nav>
  )
}

export default function DashboardPage() {
  const router = useRouter()
  const [nickname, setNickname] = useState('Você')
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [purchases, setPurchases] = useState<TokenRow[]>([]) // amount > 0
  const [usages, setUsages] = useState<TokenRow[]>([]) // amount < 0
  const [gens, setGens] = useState<GenerationRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    async function load() {
      try {
        const { data: s } = await supabase.auth.getSession()
        const user = s?.session?.user
        if (!user) { router.replace('/auth/login'); return }

        // perfil
        const { data: profile } = await supabase.from('profiles').select('nickname, avatar_url').eq('id', user.id).maybeSingle()
        const nick = (profile?.nickname) || (user.user_metadata?.nickname) || (user.email?.split('@')[0] ?? 'Você')
        if (mounted) {
          setNickname(nick)
          setAvatarUrl(profile?.avatar_url ?? user.user_metadata?.avatar_url ?? null)
        }

        // tokens
        const { data: tokens } = await supabase
          .from('tokens')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(20) as unknown as { data: TokenRow[] | null }

        const all = tokens ?? []
        if (mounted) {
          setPurchases(all.filter(t => (t.amount ?? 0) > 0).slice(0, 10))
          setUsages(all.filter(t => (t.amount ?? 0) < 0).slice(0, 10))
        }

        // últimas 4 gerações
        const { data: g } = await supabase
          .from('generations')
          .select('id, created_at, image_url, thumb_url, prompt')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(4) as unknown as { data: GenerationRow[] | null }
        if (mounted) setGens(g ?? [])
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [router])

  return (
    <div className="min-h-screen bg-background text-gray-200">
      <TopNav nickname={nickname} avatarUrl={avatarUrl} />
      <main className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Histórico de compras */}
          <div className="card">
            <div className="card-header">
              <h2 className="font-semibold">Histórico de compras</h2>
              <div className="muted">últimas 10</div>
            </div>
            <div className="card-body space-y-3">
              {loading && <div className="muted">Carregando…</div>}
              {!loading && purchases.length === 0 && <div className="muted">Nenhuma compra encontrada.</div>}
              {purchases.map((p) => (
                <div key={p.id} className="item-row">
                  <div className="space-y-0.5">
                    <div className="text-gray-100">+{p.amount ?? 0} tokens</div>
                    <div className="muted">{p.created_at ? new Date(p.created_at).toLocaleString() : '—'}</div>
                  </div>
                  <div className="text-right muted text-xs">{p.description ?? '—'}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Gastos de tokens */}
          <div className="card">
            <div className="card-header">
              <h2 className="font-semibold">Gastos de tokens</h2>
              <div className="muted">últimos 10</div>
            </div>
            <div className="card-body space-y-3">
              {loading && <div className="muted">Carregando…</div>}
              {!loading && usages.length === 0 && <div className="muted">Nenhum gasto encontrado.</div>}
              {usages.map((u) => (
                <div key={u.id} className="item-row">
                  <div className="space-y-0.5">
                    <div className="text-gray-100">-{Math.abs(u.amount ?? 0)} tokens</div>
                    <div className="muted">{u.created_at ? new Date(u.created_at).toLocaleString() : '—'}</div>
                  </div>
                  <div className="text-right muted text-xs">{u.description ?? '—'}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Últimas 4 gerações */}
          <div className="card">
            <div className="card-header">
              <h2 className="font-semibold">Últimas gerações</h2>
              <div className="muted">4 mais recentes</div>
            </div>
            <div className="p-4 grid grid-cols-2 gap-3">
              {loading && <div className="col-span-2 muted">Carregando…</div>}
              {!loading && gens.length === 0 && <div className="col-span-2 muted">Nenhuma geração encontrada.</div>}
              {gens.map((g) => (
                <div key={g.id} className="aspect-square relative rounded-xl overflow-hidden border border-zinc-800">
                  <Image
                    src={(g.thumb_url || g.image_url || '/gallery/1.jpg') as string}
                    alt={g.prompt || 'Geração'}
                    fill
                    className="object-cover"
                    sizes="(max-width:768px) 50vw, (max-width:1200px) 33vw, 25vw"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}