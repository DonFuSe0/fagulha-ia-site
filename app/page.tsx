// app/page.tsx — Landing com top menu + feed público (sem revalidate e sem @ts-expect-error)
import Link from 'next/link'
import Image from 'next/image'
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
    <div className="min-h-screen bg-background text-gray-200 relative">
      {/* Glow */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-1/3 left-1/2 -translate-x-1/2 w-[1400px] h-[1400px] rounded-full blur-3xl opacity-20"
             style={{background: 'radial-gradient(closest-side, #ff7a18, transparent 70%)'}} />
      </div>

      {/* Top bar */}
      <nav className="w-full bg-black/60 backdrop-blur border-b border-zinc-800 text-zinc-100">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="font-semibold text-lg tracking-tight">Fagulha<span className="text-brand">.</span></Link>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/auth/login" className="hover:text-brand">Entrar</Link>
            <Link href="/explorar" className="hover:text-brand">Explorar</Link>
            <Link href="/planos" className="rounded-xl bg-orange-600 hover:bg-orange-500 px-4 py-2 font-medium">Adquirir Tokens</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <header className="max-w-7xl mx-auto px-4 py-16 md:py-24 relative">
        <div className="max-w-3xl">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight">
            Crie imagens incríveis com <span className="text-brand">IA</span>.
          </h1>
          <p className="text-zinc-400 mt-4 text-lg">
            Gerações rápidas, estilos variados e uma comunidade vibrante.
            Compartilhe suas criações e descubra novas ideias.
          </p>
          <div className="mt-6 flex gap-3">
            <Link href="/generate" className="rounded-xl bg-orange-600 hover:bg-orange-500 px-5 py-3 font-medium">Começar agora</Link>
            <Link href="/gallery" className="rounded-xl border border-zinc-700 hover:border-brand px-5 py-3">Explorar</Link>
          </div>
        </div>
      </header>

      {/* Public feed */}
      <main className="max-w-7xl mx-auto px-4 pb-16">
        <h2 className="text-lg font-semibold">Criações públicas</h2>
        {await PublicFeed()}
      </main>
    </div>
  )
}