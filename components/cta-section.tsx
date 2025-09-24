"use client";

import Link from "next/link";

export default function CtaSection() {
  return (
    <section className="container py-14">
      <div className="card flex flex-col items-center gap-5 md:flex-row md:justify-between">
        <div>
          <h3 className="text-2xl md:text-3xl font-bold">Pronto para criar algo incrível?</h3>
          <p className="text-[var(--color-muted)]">
            Comece agora e publique suas melhores criações na galeria pública.
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/generate" className="btn-primary">Gerar imagem</Link>
          <Link href="/pricing" className="btn-ghost">Ver planos</Link>
        </div>
      </div>
    </section>
  );
}
