// app/page.tsx
import Link from 'next/link'

export default function HomePage() {
  return (
    <main className="max-w-6xl mx-auto px-4 py-12 space-y-8">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Fagulha</h1>
        <nav className="flex items-center gap-4 text-sm text-zinc-300">
          <Link href="/gallery" className="hover:text-white">Sua Galeria</Link>
          <Link href="/explore" className="hover:text-white">Explorar</Link>
          <Link href="/planos" className="hover:text-white">Adquirir Tokens</Link>
          <Link href="/auth/login" className="hover:text-white">Entrar</Link>
        </nav>
      </header>

      <section className="space-y-4">
        <h2 className="text-xl font-medium">Bem-vindo</h2>
        <p className="text-zinc-400">Use os botões acima para navegar. “Explorar” direciona para a galeria pública.</p>
        <div className="flex gap-3">
          <Link href="/explore" className="px-4 py-2 rounded bg-white/10 hover:bg-white/20">Explorar</Link>
          <Link href="/gallery" className="px-4 py-2 rounded bg-white/10 hover:bg-white/20">Sua Galeria</Link>
        </div>
      </section>
    </main>
  )
}
