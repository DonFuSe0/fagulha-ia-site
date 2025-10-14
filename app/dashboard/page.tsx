// app/dashboard/page.tsx — UI moderna, mantendo estilo dos botões do projeto
'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import CreditsBadge from '@/app/_components/CreditsBadge'

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

// Componente separado para gerenciar o avatar de forma independente
function AvatarDisplay({ nickname }: { nickname: string }) {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [tick, setTick] = useState(Date.now())

  useEffect(() => {
    let mounted = true

    // Carrega avatar do banco apenas uma vez
    const loadAvatar = async () => {
      try {
        const supabaseClient = createClientComponentClient()
        const { data: s } = await supabaseClient.auth.getSession()
        const user = s?.session?.user
        if (!user || !mounted) return

        const { data: profile } = await supabaseClient.from('profiles').select('avatar_url').eq('id', user.id).maybeSingle()
        if (mounted && profile?.avatar_url) {
          setAvatarUrl(profile.avatar_url)
          console.log('AvatarDisplay - Avatar loaded')
        }
      } catch (error) {
        console.error('AvatarDisplay - Error loading avatar:', error)
      }
    }

    loadAvatar()

    // Escuta eventos de atualização
    const handler = (e: CustomEvent) => {
      if (!mounted) return
      const detail = e.detail as any
      const newUrl = detail?.url as string | undefined

      if (newUrl) {
        setAvatarUrl(newUrl)
        setTick(Date.now())
      }
    }
    window.addEventListener('avatar:updated', handler as any)

    return () => {
      mounted = false
      window.removeEventListener('avatar:updated', handler as any)
    }
  }, [])

  // Monta a URL do Supabase Storage se avatarUrl for relativo
  let imageUrl = null;
  if (avatarUrl) {
    const isFullUrl = avatarUrl.startsWith('http://') || avatarUrl.startsWith('https://');
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const base = isFullUrl
      ? avatarUrl
      : `${supabaseUrl}/storage/v1/object/public/${avatarUrl}`;
    imageUrl = `${base}${base.includes('?') ? '&' : '?'}cb=${tick}`;
  }

  console.log('AvatarDisplay - avatarUrl:', avatarUrl, 'imageUrl:', imageUrl)

  const [imgError, setImgError] = useState(false);
  // Atualiza fallback se avatarUrl mudar
  useEffect(() => { setImgError(false); }, [avatarUrl, tick]);

  function getInitials(name: string) {
    return name
      .split(' ')
      .map((n) => n[0]?.toUpperCase())
      .join('')
      .slice(0, 2);
  }

  return (
    <div className="w-8 h-8 rounded-full overflow-hidden bg-zinc-800 flex items-center justify-center">
      {imageUrl && !imgError ? (
        <img
          key={`avatar-${tick}`}
          src={imageUrl}
          alt={nickname}
          width={32}
          height={32}
          className="object-cover w-full h-full"
          onError={e => {
            setImgError(true);
            console.error('Erro ao carregar avatar:', imageUrl, e);
          }}
        />
      ) : (
        <span className="text-xs text-zinc-400 font-bold">{getInitials(nickname)}</span>
      )}
    </div>
  )
}

function AvatarMenu({ nickname }: { nickname: string }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/70 px-2 py-1 hover:border-brand transition-colors"
      >
        <AvatarDisplay nickname={nickname} />
        
        
        <svg className={cx('w-4 h-4 text-zinc-400 transition-transform', open && 'rotate-180')} viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 10.94l3.71-3.71a.75.75 0 1 1 1.06 1.06l-4.24 4.24a.75.75 0 0 1-1.06 0L5.21 8.29a.75.75 0 0 1 .02-1.08z" clipRule="evenodd" />
        </svg>
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-56 rounded-xl border border-zinc-800 bg-zinc-900/95 shadow-xl backdrop-blur">
          <div className="py-2 text-sm">
            <Link href="/gallery" className="block px-4 py-2 hover:bg-zinc-800">Sua Galeria</Link>
            <Link href="/settings?tab=perfil" className="block px-4 py-2 hover:bg-zinc-800">Editar Perfil</Link>
            <Link href="/planos" className="block px-4 py-2 hover:bg-zinc-800">Adquirir Tokens</Link>
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
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="font-semibold text-lg tracking-tight">Fagulha<span className="text-brand">.</span></Link>
          <Link href="/" className="hover:text-brand">Início</Link>
          <Link href="/explorar" className="hover:text-brand">Explorar</Link>
          <Link href="/generate" className="hover:text-brand">Criação</Link>
        </div>
        <div className="flex items-center gap-3">
          <CreditsBadge />
          <span className="text-sm text-zinc-200">{nickname || 'Seu perfil'}</span>
          <AvatarMenu nickname={nickname} />
        </div>
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
  const [avatarLoaded, setAvatarLoaded] = useState(false)

  // Carregamento inicial (executa apenas uma vez)
  useEffect(() => {
    let mounted = true
    async function loadInitial() {
      try {
        const { data: s } = await supabase.auth.getSession()
        const user = s?.session?.user
        if (!user) { router.replace('/auth/login'); return }

        const { data: profile } = await supabase.from('profiles').select('nickname, avatar_url').eq('id', user.id).maybeSingle()
        const nick = (profile?.nickname) || (user.user_metadata?.nickname) || (user.email?.split('@')[0] ?? 'Você')
        if (mounted) {
          setNickname(nick)
          if (profile?.avatar_url && !avatarLoaded) {
            setAvatarUrl(profile.avatar_url)
            setAvatarLoaded(true)
            console.log('Dashboard - Avatar loaded:', profile.avatar_url)
          }
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
        if (mounted) {
          setLoading(false)
        }
      }
    }

    loadInitial()

    return () => { mounted = false }
  }, [router])

  // Escuta eventos de atualização de avatar
  useEffect(() => {
    const handler = (e: CustomEvent) => {
      const detail = e.detail as any
      const newUrl = detail?.url as string | undefined

      if (newUrl) {
        setAvatarUrl(newUrl)
        setAvatarLoaded(true)
      }
    }
    window.addEventListener('avatar:updated', handler as any)

    return () => {
      window.removeEventListener('avatar:updated', handler as any)
    }
  }, [])


  return (
    <div className="min-h-screen bg-background text-gray-200 relative">
      {/* Hero BG */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-1/3 left-1/2 -translate-x-1/2 w-[1200px] h-[1200px] rounded-full blur-3xl opacity-20"
             style={{background: 'radial-gradient(closest-side, #ff7a18, transparent 70%)'}} />
      </div>

  <TopNav nickname={nickname} />

      <main className="max-w-7xl mx-auto px-4 py-10 space-y-10">
        {/* Header row */}
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">Bem-vindo, <span className="text-brand">{nickname}</span></h1>
            <p className="text-zinc-400 mt-2">Acompanhe suas compras, consumo de tokens e últimas criações.</p>
          </div>
          <div className="hidden md:flex gap-3">
            <Link href="/generate" className="rounded-xl bg-orange-600 hover:bg-orange-500 px-4 py-2 font-medium">Criar agora</Link>
            <Link href="/planos" className="rounded-xl border border-zinc-700 hover:border-brand px-4 py-2">Adquirir Tokens</Link>
          </div>
        </header>

        {/* 3-column grid */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Compras */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.02)]">
            <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
              <h2 className="font-semibold">Histórico de compras</h2>
              <div className="text-xs text-zinc-400">últimas 10</div>
            </div>
            <div className="p-4 space-y-3">
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
          </div>

          {/* Gastos */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.02)]">
            <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
              <h2 className="font-semibold">Gastos de tokens</h2>
              <div className="text-xs text-zinc-400">últimos 10</div>
            </div>
            <div className="p-4 space-y-3">
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
          </div>

          {/* Últimas gerações */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.02)]">
            <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
              <h2 className="font-semibold">Últimas gerações</h2>
              <div className="text-xs text-zinc-400">4 mais recentes</div>
            </div>
            <div className="p-4 grid grid-cols-2 gap-3">
              {loading && <div className="col-span-2 text-zinc-400 text-sm">Carregando…</div>}
              {!loading && gens.length === 0 && <div className="col-span-2 text-zinc-400 text-sm">Nenhuma geração encontrado.</div>}
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