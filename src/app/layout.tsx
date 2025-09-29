import './globals.css';
import type { Metadata } from 'next';
import Header from '@/components/header';

export const metadata: Metadata = {
  title: 'Fagulha',
  description: 'Gere imagens com UX premium.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="bg-[var(--bg)] text-[var(--text)]">
        {/* Header sempre visível */}
        {/* Server Component: lê sessão via cookies e mostra menu correto */}
        {/* Se você já tinha um Header, troque a importação para este componente */}
        <Header />
        <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
      </body>
    </html>
  );
}
