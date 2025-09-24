"use client";

import { ImagePlus, ShieldCheck, Zap } from "lucide-react";

const features = [
  {
    icon: Zap,
    title: "Rápido e confiável",
    desc: "Interface responsiva, carregamento otimizado e feedback claro.",
  },
  {
    icon: ImagePlus,
    title: "Foco na criação",
    desc: "Formulário objetivo com presets; gere e publique em poucos cliques.",
  },
  {
    icon: ShieldCheck,
    title: "Seguro por padrão",
    desc: "RLS no banco, contas protegidas e políticas claras de acesso.",
  },
];

export default function FeatureCards() {
  return (
    <section className="container py-12">
      <div className="mx-auto max-w-3xl text-center mb-8">
        <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">Por que usar a Fagulha?</h2>
        <p className="text-[var(--color-muted)] mt-3">
          Um fluxo moderno e direto ao ponto, com visual premium e performance real.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {features.map(({ icon: Icon, title, desc }) => (
          <div key={title} className="card space-y-2">
            <div className="inline-flex size-10 items-center justify-center rounded-xl"
                 style={{ background: "color-mix(in oklab, var(--color-primary) 22%, #131325)" }}>
              <Icon className="size-5 text-white" />
            </div>
            <h3 className="text-lg font-semibold">{title}</h3>
            <p className="text-[var(--color-muted)]">{desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
