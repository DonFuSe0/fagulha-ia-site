import Header from "@/components/Header"

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function PlanosPage() {
  return (
    <Header />
    <div className="mx-auto max-w-3xl space-y-4 px-4 py-6">
      <h1 className="text-2xl font-semibold text-white">Adquirir tokens</h1>
      <p className="text-white/80">Escolha um plano para continuar. (Em breve: checkout integrado)</p>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="text-white">Starter</div>
          <div className="text-3xl font-semibold text-white">R$ 9</div>
          <div className="text-sm text-white/60">100 tokens</div>
          <button className="mt-3 rounded-lg border border-white/15 bg-white/10 px-3 py-2 text-white hover:bg-white/15">Selecionar</button>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="text-white">Pro</div>
          <div className="text-3xl font-semibold text-white">R$ 19</div>
          <div className="text-sm text-white/60">250 tokens</div>
          <button className="mt-3 rounded-lg border border-white/15 bg-white/10 px-3 py-2 text-white hover:bg-white/15">Selecionar</button>
        </div>
      </div>
    </div>
  );
}