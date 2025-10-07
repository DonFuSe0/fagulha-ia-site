// app/gallery/page.tsx
'use client'

import Link from 'next/link'
import React from 'react'

export default function PrivateGalleryPage() {
  // Placeholder mínimo para evitar erro de Server Components.
  // Se você já tiver um componente de galeria, pode importar aqui ou navegar para a rota interna correta.
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold">Sua Galeria</h1>
        <Link href="/dashboard" className="text-sm text-zinc-400 hover:text-zinc-200">Voltar ao dashboard</Link>
      </div>
      <p className="text-zinc-400">Aqui aparecerão suas imagens privadas. (Página base criada para corrigir a navegação.)</p>
    </div>
  )
}
