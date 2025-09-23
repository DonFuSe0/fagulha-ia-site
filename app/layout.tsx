import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from 'react-hot-toast';
import Header from "@/components/Header";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Fagulha.ia - Geração de Imagens com IA",
  description: "Crie imagens incríveis com inteligência artificial.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      {/* A LINHA CRÍTICA QUE ESTAVA FALTANDO */}
      <body className={`${inter.className} bg-background text-text-main`}>
        <Toaster 
          position="top-center"
          toastOptions={{
            style: {
              background: '#181622',
              color: '#E0E0E0',
              border: '1px solid #8A2BE233',
            },
          }}
        />
        {/* EFEITO DE GRADIENTE SUTIL NO FUNDO */}
        <div className="absolute top-0 left-0 -z-10 h-full w-full bg-background">
          <div className="absolute bottom-0 left-0 right-0 top-0 bg-[radial-gradient(circle_500px_at_50%_200px,#3e228a4d,transparent)]"></div>
        </div>
        
        <Header />
        
        {children}
      </body>
    </html>
  );
}
