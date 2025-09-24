import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { Suspense } from "react"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Fagulha.ia - Geração de Imagens por IA",
  description:
    "Plataforma avançada de geração de imagens por inteligência artificial. Crie imagens incríveis com tecnologia de ponta.",
  generator: "Fagulha.ia",
  keywords: ["IA", "inteligência artificial", "geração de imagens", "arte digital", "criatividade"],
  authors: [{ name: "Fagulha.ia" }],
  creator: "Fagulha.ia",
  publisher: "Fagulha.ia",
  robots: "index, follow",
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: "https://fagulha.ia",
    title: "Fagulha.ia - Geração de Imagens por IA",
    description: "Plataforma avançada de geração de imagens por inteligência artificial",
    siteName: "Fagulha.ia",
  },
  twitter: {
    card: "summary_large_image",
    title: "Fagulha.ia - Geração de Imagens por IA",
    description: "Plataforma avançada de geração de imagens por inteligência artificial",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" className="dark">
      <body className={`font-sans ${inter.className}`}>
        <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
      </body>
    </html>
  )
}
