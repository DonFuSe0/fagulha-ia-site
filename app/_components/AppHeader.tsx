'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function AppHeader() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  // Fecha dropdown quando rota mudar
  useEffect(() => {
    setOpen(false)
  }, [pathname])

  const onSelect = () => setOpen(false)

  const onBlurMenu: React.FocusEventHandler<HTMLDivElement> = (e) => {
    requestAnimationFrame(() => {
      if (!e.currentTarget.contains(document.activeElement)) {
        setOpen(false)
      }
    })
  }

  return (
    <header className="flex items-center justify-between p-4 border-b border-white/10">
      <Link href="/" className="font-bold">Fagulha</Link>

      <div className="relative" onBlur={onBlurMenu}>
        <button
          aria-expanded={open}
          onClick={() => setOpen(o => !o)}
          className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 transition"
        >
          Menu
        </button>

        {open && (
          <div className="absolute right-0 mt-2 w-56 rounded-xl bg-black/90 backdrop-blur border border-white/10 shadow-lg p-2" tabIndex={-1}>
            <Link href="/entrar" onClick={onSelect} className="block px-3 py-2 rounded hover:bg-white/10">Entrar</Link>
            <Link href="/explorar" onClick={onSelect} className="block px-3 py-2 rounded hover:bg-white/10">Explorar</Link>
            <Link href="/gallery" onClick={onSelect} className="block px-3 py-2 rounded hover:bg-white/10">Minha galeria</Link>
            <Link href="/dashboard" onClick={onSelect} className="block px-3 py-2 rounded hover:bg-white/10">Perfil</Link>
            <Link href="/settings?tab=perfil" onClick={onSelect} className="block px-3 py-2 rounded hover:bg-white/10">Editar perfil</Link>
            <Link href="/settings?tab=seguranca" onClick={onSelect} className="block px-3 py-2 rounded hover:bg-white/10">Alterar senha</Link>
            <Link href="/planos" onClick={onSelect} className="block px-3 py-2 rounded hover:bg-white/10">Adquirir tokens</Link>
            <Link href="/auth/logout" onClick={onSelect} className="block px-3 py-2 rounded hover:bg-white/10">Sair</Link>
          </div>
        )}
      </div>
    </header>
  )
}
