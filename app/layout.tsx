import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Suspense } from "react"
import "./globals.css"

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
})

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
})

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
    <html lang="pt-BR" className={`dark ${geistSans.variable} ${geistMono.variable} antialiased`}>
      <body className="font-sans">
        <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
      </body>
    </html>
  )
}
