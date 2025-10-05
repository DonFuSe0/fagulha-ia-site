// app/page.tsx
import Link from 'next/link'
import { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Fagulha IA — Início',
  description: 'Fagulha IA — geração de imagens com IA, galerias, tokens',
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      {/* Hero */}
      <section className="relative flex-1 flex flex-col justify-center items-center text-center px-6 md:px-12 lg:px-24">
        <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">
          Desperte sua criatividade com IA
        </h1>
        <p className="text-lg md:text-xl max-w-2xl mb-8 text-gray-300">
          Transforme suas ideias em imagens únicas. Explore, crie e compartilhe com a comunidade.
        </p>
        <div className="flex gap-4">
          <Link href="/auth/login">
            <button className="px-6 py-3 bg-orange-500 hover:bg-orange-600 rounded-lg text-white font-semibold transition">
              Entrar
            </button>
          </Link>
          <Link href="/explorar">
            <button className="px-6 py-3 border border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white rounded-lg transition">
              Explorar
            </button>
          </Link>
        </div>
        {/* Optionally: “Tokens” link */}
        <div className="mt-6">
          <Link href="/tokens">
            <span className="text-sm text-orange-400 hover:underline">Tokens</span>
          </Link>
        </div>
      </section>

      {/* Seção de recursos / destaques */}
      <section className="bg-gray-800 py-16">
        <div className="max-w-5xl mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-3 gap-10">
          <FeatureCard
            title="Gere com IA"
            description="Crie imagens únicas com prompts criativos e controle avançado."
            icon="🖼️"
          />
          <FeatureCard
            title="Explore Galerias"
            description="Veja o que outros criadores estão gerando e se inspire."
            icon="🌐"
          />
          <FeatureCard
            title="Gestão de Tokens"
            description="Use, acompanhe e compre créditos dentro da plataforma."
            icon="💎"
          />
        </div>
      </section>

      {/* Footer simples */}
      <footer className="py-8 text-center text-gray-500 text-sm">
        © {new Date().getFullYear()} Fagulha IA. Todos os direitos reservados.
      </footer>
    </div>
  )
}

// Componente auxiliar (interno)
function FeatureCard({ title, description, icon }: { title: string, description: string, icon: string }) {
  return (
    <div className="bg-gray-700 p-8 rounded-2xl border border-gray-600 hover:border-orange-500 transition">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-2xl font-bold mb-2">{title}</h3>
      <p className="text-gray-300">{description}</p>
    </div>
  )
}
