'use client'

import React, { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'

// Modos suportados:
// none          -> sem transição
// initial-fade  -> fade apenas no primeiro carregamento (evita flicker em navegações)
// view          -> usa View Transitions API se disponível (experimento), senão fallback para none

type TransitionMode = 'none' | 'initial-fade' | 'view'

const MODE: TransitionMode = (process.env.NEXT_PUBLIC_PAGE_TRANSITION as TransitionMode) || 'none'

export default function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const mountedRef = useRef(false)
  const [initialDone, setInitialDone] = useState(false)

  // Efeito de fade somente na primeira montagem
  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true
      if (MODE === 'initial-fade') {
        const t = setTimeout(() => setInitialDone(true), 180) // duração curta e suave
        return () => clearTimeout(t)
      } else {
        setInitialDone(true)
      }
    }
  }, [])

  // View Transitions API (experimental). Só tenta em mudanças de pathname.
  const previousPath = useRef(pathname)
  useEffect(() => {
    if (MODE !== 'view') return
    if (previousPath.current === pathname) return
    previousPath.current = pathname
    // @ts-ignore experimental
    const doc: any = document
    if (doc.startViewTransition) {
      // Evita piscar: a transição envolve a substituição do container root
      // Aqui assumimos que o layout já trocou (Next fez render). Simplesmente dispara a API.
      doc.startViewTransition(() => Promise.resolve())
    }
  }, [pathname])

  if (MODE === 'none') return <>{children}</>

  if (MODE === 'initial-fade') {
    return (
      <div style={{
        opacity: initialDone ? 1 : 0,
        transition: 'opacity 0.18s ease-out',
        minHeight: '100vh'
      }}>
        {children}
      </div>
    )
  }

  // MODE === 'view' fallback
  return <>{children}</>
}
