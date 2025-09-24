"use client";

import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* Glow extra no topo */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -top-40 h-80 opacity-60"
        style={{ background: "var(--gradient-primary)" }}
      />
      <div className="container pt-16 pb-10 fade-in-up">
        <div className="mx-auto max-w-3xl text-center space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 bg-[#131325] text-sm text-[var(--color-muted)] shadow-[inset_0_0_0_1px_var(--color-border)]">
            <Sparkles className="size-4 text-[var(--color-primary)]" />
            <span>Geração de imagens com IA — rápido e intuitivo</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-[1.05]">
            Dê vida às suas ideias com a{" "}
            <span className="bg-clip-text text-transparent" style={{ backgroundImage: "var(--gradient-primary)" }}>
              Fagulha.ia
            </span>
          </h1>

          <p className="text-lg md:text-xl text-[var(--color-muted)]">
            Uma plataforma moderna para criar imagens impressionantes. Interface
            simples, tema escuro e performance real — feita para criadores.
          </p>

          <div className="flex items-center justify-center gap-3 pt-2">
            <Link href="/generate" className="btn-primary">
              Começar agora
              <ArrowRight className="size-4" />
            </Link>
            <Link href="/explore" className="btn-ghost">
              Ver galeria pública
            </Link>
          </div>

          {/* Mini métricas (exemplo simples) */}
          <div className="grid grid-cols-3 gap-3 pt-8 text-sm text-[var(--color-muted)]">
            <div className="card text-center py-4">
              <div className="text-2xl font-bold text-white">24h</div>
              <div>expiração automática</div>
            </div>
            <div className="card text-center py-4">
              <div className="text-2xl font-bold text-white">Roxo+Preto</div>
              <div>tema premium</div>
            </div>
            <div className="card text-center py-4">
              <div className="text-2xl font-bold text-white">Tokens</div>
              <div>uso transparente</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
