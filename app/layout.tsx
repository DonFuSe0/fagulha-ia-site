import type { Metadata } from "next";
import "./globals.css"; // Vamos criar este arquivo a seguir

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
      <body className="bg-gray-900 text-white">
        {children}
      </body>
    </html>
  );
}
