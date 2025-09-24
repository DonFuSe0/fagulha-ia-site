import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";

export const metadata: Metadata = {
  title: "Fagulha.ia — Crie imagens com IA",
  description: "Gere imagens incríveis com uma experiência rápida, moderna e intuitiva.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className="min-h-dvh bg-[var(--color-bg)] text-[var(--color-foreground)] antialiased">
        <ThemeProvider>
          <div className="relative">
            {/* Glow suave no topo */}
            <div aria-hidden className="pointer-events-none absolute inset-x-0 -top-10 h-40 opacity-70"
                 style={{ background: "var(--gradient-glow)" }} />
            {children}
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
