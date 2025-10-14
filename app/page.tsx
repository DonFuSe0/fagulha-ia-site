// app/page.tsx — Landing com top menu + feed público (sem revalidate e sem @ts-expect-error)
import Link from 'next/link'
import Image from 'next/image'
import HomeCtaSwitch from '@/app/_components/HomeCtaSwitch'
import PageAnimations from '@/app/_components/PageAnimations'
import { createClient } from '@/lib/supabase/server'

async function PublicFeed() {
  const supabase = createClient()
  const { data } = await supabase
    .from('generations')
    .select('id, image_url, thumb_url, prompt')
    .eq('is_public', true)
    .order('created_at', { ascending: false })
    .limit(12)
  const items = data ?? []

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mt-8">
      {items.map((g) => (
        <div key={g.id} className="group relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/60">
          <Image
            src={(g.thumb_url || g.image_url || '/gallery/1.jpg') as string}
            alt={g.prompt || 'Public image'}
            width={600}
            height={600}
            className="w-full h-auto object-cover group-hover:scale-[1.02] transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      ))}
      {items.length === 0 && (
        <div className="col-span-full text-center text-zinc-400">Sem imagens públicas no momento.</div>
      )}
    </div>
  )
}

export default async function Home() {
  return (
    <div className="min-h-screen relative overflow-x-hidden text-gray-200">
      {/* Gradiente animado de fundo */}
      <div className="pointer-events-none absolute inset-0 -z-10 animate-gradient-move">
        <div className="absolute -top-1/3 left-1/2 -translate-x-1/2 w-[1600px] h-[1600px] rounded-full blur-3xl opacity-30 animate-pulse"
          style={{background: 'radial-gradient(ellipse at 60% 40%, #ff7a18 0%, #ffb347 40%, #ff7a18 70%, transparent 100%)'}} />
        <div className="absolute top-1/4 left-1/4 w-[900px] h-[900px] rounded-full blur-2xl opacity-20 animate-spin-slow"
          style={{background: 'radial-gradient(ellipse at 30% 70%, #34d399 0%, #2563eb 60%, transparent 100%)'}} />
        <div className="absolute bottom-0 right-0 w-[700px] h-[700px] rounded-full blur-2xl opacity-20 animate-spin-reverse"
          style={{background: 'radial-gradient(ellipse at 80% 80%, #f472b6 0%, #a21caf 60%, transparent 100%)'}} />
      </div>

      {/* Top bar */}
      <nav className="w-full bg-black/60 backdrop-blur border-b border-zinc-800 text-zinc-100">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="font-semibold text-lg tracking-tight">Fagulha<span className="text-brand">.</span></Link>
          </div>
          <div className="flex items-center gap-4">
            <HomeCtaSwitch className="hover:text-brand" />
            <Link href="/explorar" className="hover:text-brand">Explorar</Link>
            <Link href="/planos" className="rounded-xl bg-orange-600 hover:bg-orange-500 px-4 py-2 font-medium">Adquirir Tokens</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <header className="max-w-7xl mx-auto px-4 py-16 md:py-24 relative">
        <div className="max-w-3xl">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight drop-shadow-[0_2px_16px_rgba(255,122,24,0.25)]">
            Crie imagens incríveis com <span className="text-brand">IA</span>.
          </h1>
          <p className="text-zinc-300 mt-4 text-lg drop-shadow-[0_2px_8px_rgba(0,0,0,0.18)]">
            Gerações rápidas, estilos variados e uma comunidade vibrante.
            Compartilhe suas criações e descubra novas ideias.
          </p>
          <div className="mt-6 flex gap-3">
            <Link href="/generate" className="rounded-xl bg-orange-600 hover:bg-orange-500 px-5 py-3 font-medium shadow-lg shadow-orange-900/20 transition">Começar agora</Link>
            <Link href="/gallery" className="rounded-xl border border-zinc-700 hover:border-brand px-5 py-3 bg-black/30 backdrop-blur">Explorar</Link>
          </div>
        </div>
      </header>

      {/* Public feed */}
      <main className="max-w-7xl mx-auto px-4 pb-16">
        <h2 className="text-lg font-semibold drop-shadow-[0_2px_8px_rgba(0,0,0,0.18)]">Criações públicas</h2>
        {await PublicFeed()}
      </main>
      
      {/* Animations CSS */}
      <PageAnimations />
    </div>
  )
}