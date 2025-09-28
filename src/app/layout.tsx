import '../app/globals.css';
import Header from '@/components/header';
import Footer from '@/components/footer';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Fagulha – Geração de Imagens via IA',
  description: 'Gere imagens incríveis com inteligência artificial usando Fagulha',
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className="dark">
      <body className="flex flex-col min-h-screen">
        {/* Header is a server component which fetches session */}
        {/* so it must be imported only from server side */}
        {/* We wrap header in a Suspense to avoid streaming issues */}
        <Header />
        <main className="flex-1 container mx-auto px-4 py-6">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}