'use client'

import Link from 'next/link'
import Image from 'next/image'
import Header from '@/components/Header'
import { Card, CardHeader, CardBody } from '@/components/Card'
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

export default function DashboardPage() {
  const router = useRouter()
  const [nickname, setNickname] = useState('Você')
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [purchases, setPurchases] = useState<TokenRow[]>([])
  const [usages, setUsages] = useState<TokenRow[]>([])
  const [gens, setGens] = useState<GenerationRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    async function load() {
      try {
        const { data: s } = await supabase.auth.getSession()
        const user = s?.session?.user
        if (!user) { router.replace('/auth/login'); return }

        const { data: profile } = await supabase.from('profiles').select('nickname, avatar_url').eq('id', user.id).maybeSingle()
        const nick = (profile?.nickname) || (user.user_metadata?.nickname) || (user.email?.split('@')[0] ?? 'Você')
        if (mounted) {
          setNickname(nick)
          setAvatarUrl(profile?.avatar_url ?? user.user_metadata?.avatar_url ?? null)
        }

        const { data: tokens } = await supabase.from('tokens')
          .select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(20) as any
        const all: TokenRow[] = tokens ?? []
        if (mounted) {
          setPurchases(all.filter(t => (t.amount ?? 0) > 0).slice(0, 10))
          setUsages(all.filter(t => (t.amount ?? 0) < 0).slice(0, 10))
        }

        const { data: g } = await supabase.from('generations')
          .select('id, created_at, image_url, thumb_url, prompt').eq('user_id', user.id)
          .order('created_at', { ascending: false }).limit(4) as any
        if (mounted) setGens(g ?? [])
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [router])

  return (
    <div className="min-h-screen bg-background text-gray-200 relative">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-1/3 left-1/2 -translate-x-1/2 w-[1200px] h-[1200px] rounded-full blur-3xl opacity-20"
             style={{background: 'radial-gradient(closest-side, #ff7a18, transparent 70%)'}} />
      </div>

      <Header />

      <main className="max-w-7xl mx-auto px-4 py-10 space-y-10">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">Bem-vindo, <span className="text-brand">{nickname}</span></h1>
            <p className="text-zinc-400 mt-2">Acompanhe suas compras, consumo de tokens e últimas criações.</p>
          </div>
          <div className="hidden md:flex gap-3">
            <Link href="/generate" className="btn-primary">Criar agora</Link>
            <Link href="/planos" className="rounded-xl border border-zinc-700 hover:border-brand px-4 py-2">Adquirir Tokens</Link>
          </div>
        </header>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <h2 className="font-semibold">Histórico de compras</h2>
              <div className="text-xs text-zinc-400">últimas 10</div>
            </CardHeader>
            <CardBody>
              <div className="space-y-3">
                {loading && <div className="text-zinc-400 text-sm">Carregando…</div>}
                {!loading && purchases.length === 0 && <div className="text-zinc-400 text-sm">Nenhuma compra encontrada.</div>}
                {purchases.map((p) => (
                  <div key={p.id} className="flex items-center justify-between text-sm bg-zinc-950/50 border border-zinc-800 rounded-lg px-3 py-2">
                    <div className="space-y-0.5">
                      <div className="text-gray-100">+{p.amount ?? 0} tokens</div>
                      <div className="text-zinc-500">{p.created_at ? new Date(p.created_at).toLocaleString() : '—'}</div>
                    </div>
                    <div className="text-right text-zinc-400 text-xs">{p.description ?? '—'}</div>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <h2 className="font-semibold">Gastos de tokens</h2>
              <div className="text-xs text-zinc-400">últimos 10</div>
            </CardHeader>
            <CardBody>
              <div className="space-y-3">
                {loading && <div className="text-zinc-400 text-sm">Carregando…</div>}
                {!loading && usages.length === 0 && <div className="text-zinc-400 text-sm">Nenhum gasto encontrado.</div>}
                {usages.map((u) => (
                  <div key={u.id} className="flex items-center justify-between text-sm bg-zinc-950/50 border border-zinc-800 rounded-lg px-3 py-2">
                    <div className="space-y-0.5">
                      <div className="text-gray-100">-{Math.abs(u.amount ?? 0)} tokens</div>
                      <div className="text-zinc-500">{u.created_at ? new Date(u.created_at).toLocaleString() : '—'}</div>
                    </div>
                    <div className="text-right text-zinc-400 text-xs">{u.description ?? '—'}</div>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <h2 className="font-semibold">Últimas gerações</h2>
              <div className="text-xs text-zinc-400">4 mais recentes</div>
            </CardHeader>
            <CardBody>
              <div className="grid grid-cols-2 gap-3">
                {loading && <div className="col-span-2 text-zinc-400 text-sm">Carregando…</div>}
                {!loading && gens.length === 0 && <div className="col-span-2 text-zinc-400 text-sm">Nenhuma geração encontrada.</div>}
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
            </CardBody>
          </Card>
        </section>
      </main>
    </div>
  )
}
