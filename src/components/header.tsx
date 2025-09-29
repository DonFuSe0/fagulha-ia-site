'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

const links = [
  { href: '/explore', label: 'Explorar' },
  { href: '/dashboard', label: 'Painel' },
  { href: '/generate', label: 'Gerar' },
  { href: '/my-gallery', label: 'Minha galeria' },
  { href: '/pricing', label: 'Planos' },
  { href: '/profile', label: 'Perfil' },
  // Quando não logado, “Entrar”; se você já tem lógica condicional, pode remover esta linha.
  { href: '/auth/login', label: 'Entrar' },
];

export default function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) =>
    pathname === href ? 'text-[var(--primary)]' : 'text-[var(--text)] hover:text-[var(--primary)]';

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[var(--border)] bg-[var(--surface)]/80 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-6">
        {/* Brand */}
        <Link href="/" className="group flex items-center gap-3">
          <div className="relative h-8 w-8">
            {/* Logo local em /public */}
            <Image
              src="/logo-fagulha.png"
              alt="Fagulha"
              fill
              sizes="32px"
              className="object-contain"
              priority
            />
          </div>
          <span className="text-lg font-semibold tracking-wide text-[var(--text)] group-hover:text-[var(--primary)]">
            FAGULHA
          </span>
        </Link>

        {/* Navegação desktop */}
        <nav className="hidden gap-6 md:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`text-sm transition-colors ${isActive(l.href)}`}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        {/* Botão mobile */}
        <button
          onClick={() => setOpen((v) => !v)}
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--border)] text-[var(--text)] hover:bg-[var(--bg)] md:hidden"
          aria-label="Abrir menu"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3 6h18M3 12h18M3 18h18" />
          </svg>
        </button>
      </div>

      {/* Drawer mobile */}
      {open && (
        <div className="border-t border-[var(--border)] bg-[var(--surface)] md:hidden">
          <nav className="mx-auto flex max-w-7xl flex-col px-4 py-3 md:px-6">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className={`rounded-lg px-2 py-2 text-[var(--text)] transition-colors hover:bg-[var(--bg)] ${pathname === l.href ? 'text-[var(--primary)]' : ''}`}
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
