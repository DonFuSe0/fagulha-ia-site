// app/layout.tsx
import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import Link from 'next/link'
import './globals.css'

// 👉 Nav bar client-side (mostra Entrar/Explorar/Planos quando deslogado
// e, quando logado, mostra Explorar/Planos + Dropdown "Perfil")
import NavBarClient from './_components/NavBarClient'

export const metadata: Metadata = {
  title: 'Fagulha IA',
  description: 'Gerador e galeria – Fagulha IA',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen flex flex-col bg-black text-white antialiased">
        {/* Header fixo no topo com os menus à direita (não mexe no login/cadastro) */}
        <header className="w-full">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 flex items-center">
            {/* Esquerda: logo / marca (ajuste se você tiver imagem) */}
            <div className="mr-auto">
              <Link
                href="/"
                className="text-lg font-semibold tracking-wide hover:opacity-80 transition"
                prefetch
              >
                Fagulha<span className="text-orange-400">IA</span>
              </Link>
            </div>

            {/* Direita: menus (client) */}
            <NavBarClient />
          </div>
        </header>

        {/* Conteúdo das páginas */}
        <main className="flex-1">
          {children}
        </main>

        {/* Rodapé simples (opcional) – pode remover se não usa */}
        <footer className="w-full py-6 text-center text-xs text-white/60">
          © {new Date().getFullYear()} Fagulha IA
        </footer>
      </body>
    </html>
  )
}
