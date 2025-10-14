'use client'

import React from 'react'

// Transição desativada temporariamente (remoção solicitada)
// import { AnimatePresence, motion } from 'framer-motion'
// import { usePathname } from 'next/navigation'

export default function PageTransition({ children }: { children: React.ReactNode }) {
  // Versão sem animação para evitar flicker / atraso.
  return <>{children}</>
  /* Código anterior preservado:
  const pathname = usePathname()
  return (
    <AnimatePresence>
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -16 }}
        transition={{ duration: 1.2, ease: 'easeInOut' }}
        style={{ minHeight: '100vh' }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
  */
}
