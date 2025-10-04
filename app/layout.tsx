export const dynamic = 'force-dynamic';
export const revalidate = 0;

import './globals.css';
import type { Metadata } from 'next';
import React from 'react';
import AppHeader from '@/app/_components/AppHeader';

export const metadata: Metadata = {
  title: 'Fagulha IA',
  description: 'Gere imagens com IA — rápido e simples.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        {/* Meta tags for better compatibility */}
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="min-h-screen bg-gray-950 text-gray-200">
        <AppHeader />
        <main className="mx-auto max-w-6xl px-4 py-10">{children}</main>
      </body>
    </html>
  );
}
