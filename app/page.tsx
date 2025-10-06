// app/page.tsx
import Link from 'next/link'
import Image from 'next/image'
import { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Fagulha IA — Inspiração & Criação',
  description: 'Explore criações de IA, crie suas imagens e interaja com a comunidade.',
}

type GalleryItem = {
  id: string
  src: string
  alt: string
}

const mockGallery: GalleryItem[] = [
  { id: '1', src: '/gallery/1.jpg', alt: 'Arte 1' },
  { id: '2', src: '/gallery/2.jpg', alt: 'Arte 2' },
  { id: '3', src: '/gallery/3.jpg', alt: 'Arte 3' },
  { id: '4', src: '/gallery/4.jpg', alt: 'Arte 4' },
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col overflow-hidden">
      {/* Herói com galeria */}
      <section className="relative h-screen w-full overflow-hidden">
        <div className="absolute inset-0">
          {mockGallery.map((img, idx) => (
            <div
              key={img.id}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${idx === 0 ? 'opacity-100' : 'opacity-0'} gallery-slide`}
              style={{ zIndex: -idx }}
            >
              <Image
                src={img.src}
                alt={img.alt}
                fill
                className="object-cover"
                priority
              />
            </div>
          ))}
          <div className="absolute inset-0 bg-black/60" />
        </div>
        <div className="relative z-10 flex flex-col justify-center items-center h-full text-center px-6 md:px-12 lg:px-24">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight leading-tight">
            Inspire-se. Crie. Compartilhe.
          </h1>
          <p className="text-lg md:text-xl max-w-3xl mb-10 text-gray-300">
            Descubra visuais gerados pela comunidade. E então crie os seus.
          </p>
          <div className="flex gap-4">
            <Link href="/auth/login">
              <button className="px-7 py-3 bg-orange-500 hover:bg-orange-600 rounded-lg text-white font-semibold transition">
                Entrar
              </button>
            </Link>
            <Link href="/explorar">
              <button className="px-7 py-3 border border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white rounded-lg transition">
                Explorar
              </button>
            </Link>
          </div>
          <div className="mt-6">
            <Link href="/tokens">
              <span className="text-sm text-orange-400 hover:underline">Tokens</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Galeria em destaque */}
      <section className="py-16 bg-gray-800">
        <div className="max-w-6xl mx-auto px-6 md:px-12">
          <h2 className="text-3xl font-bold mb-8 text-center">Criações Recentes</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {mockGallery.map((img) => (
              <div
                key={img.id}
                className="group relative overflow-hidden rounded-2xl cursor-pointer hover:scale-105 transition-transform duration-300"
              >
                <Image
                  src={img.src}
                  alt={img.alt}
                  width={400}
                  height={400}
                  className="object-cover w-full h-full"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Destaques / recursos */}
      <section className="bg-gray-900 py-20">
        <div className="max-w-5xl mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-3 gap-10">
          <FeatureCard
            title="Criação via Prompt"
            description="Gere imagens personalizadas com prompts e estilos únicos."
            icon="🎨"
          />
          <FeatureCard
            title="Explore Galerias"
            description="Navegue pelas criações da comunidade, curta e compartilhe."
            icon="🔍"
          />
          <FeatureCard
            title="Controle de Tokens"
            description="Gerencie, use e monitore seus créditos facilmente."
            icon="💰"
          />
        </div>
      </section>

      <footer className="py-12 text-center text-gray-500 text-sm">
        © {new Date().getFullYear()} Fagulha IA. Todos os direitos reservados.
      </footer>
    </div>
  )
}

function FeatureCard({ title, description, icon }: { title: string; description: string; icon: string }) {
  return (
    <div className="flex flex-col items-center text-center space-y-4 p-8 border border-gray-700 rounded-2xl hover:border-orange-500 transition">
      <div className="text-4xl">{icon}</div>
      <h3 className="text-2xl font-semibold">{title}</h3>
      <p className="text-gray-300">{description}</p>
    </div>
  )
}
