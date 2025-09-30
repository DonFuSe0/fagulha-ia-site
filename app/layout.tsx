import '@/app/globals.css';
import Header from '@/components/Header';

export const metadata = {
  title: 'Fagulha IA',
  description: 'Descubra e gere imagens criativas com inteligência artificial.',
};

/**
 * The root layout for the app. It wraps all pages with the global CSS and
 * provides a shared header on every page. This file must be a Server
 * Component because it includes the Header which relies on server-side data.
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen">
        <Header />
        <main className="container mx-auto px-4 py-8">{children}</main>
      </body>
    </html>
  );
}