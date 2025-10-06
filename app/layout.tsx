import type { Metadata } from 'next';
import './globals.css';

// Ajuste os metadados como quiser
export const metadata: Metadata = {
  title: 'Fagulha IA',
  description: 'Gere imagens com IA — Fagulha',
  icons: [
    { rel: 'icon', url: '/favicon.ico' }, // opcional, se tiver o favicon
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body>
        {children}
      </body>
    </html>
  );
}
