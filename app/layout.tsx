// Caminho: app/layout.tsx
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Toaster } from "sonner";
import { TurnstileFixed } from "./components/TurnstileFixed";
import "./globals.css";

export const metadata = {
  title: "Fagulha IA",
  description: "Automação inteligente para o seu negócio",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-br">
      <body>
        {children}
        <Toaster richColors />
        <Analytics />
        <SpeedInsights />
        {/* O Turnstile é carregado uma vez aqui para todo o site */}
        <TurnstileFixed />
      </body>
    </html>
  );
}
