
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function PlanosPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-4 px-4 py-6">
      <h1 className="text-2xl font-semibold text-white">Adquirir tokens</h1>
      <p className="text-white/80">Escolha um plano para turbinar sua criatividade!</p>
      <div className="grid gap-6 sm:grid-cols-3">
        {/* Fagulha Semente */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 flex flex-col items-center">
          <div className="text-lg font-bold text-amber-300 mb-1">Fagulha Semente</div>
          <div className="text-3xl font-semibold text-white">R$ 9,99</div>
          <div className="text-sm text-white/60 mb-2">50 tokens</div>
          <button className="mt-auto rounded-lg border border-white/15 bg-white/10 px-4 py-2 text-white hover:bg-white/15 transition">Selecionar</button>
        </div>
        {/* Fagulha Impulso (destaque) */}
        <div className="relative rounded-2xl border-2 border-emerald-400 bg-gradient-to-b from-emerald-900/60 to-black/60 p-6 flex flex-col items-center shadow-lg scale-105">
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-xs px-3 py-1 rounded-full font-semibold shadow">Mais popular</div>
          <div className="text-lg font-bold text-emerald-300 mb-1">Fagulha Impulso</div>
          <div className="text-3xl font-semibold text-white">R$ 29,99</div>
          <div className="text-sm text-white/60 mb-2">150 tokens</div>
          <button className="mt-auto rounded-lg border border-emerald-400 bg-emerald-500/20 px-4 py-2 text-emerald-100 hover:bg-emerald-500/30 transition font-semibold">Selecionar</button>
        </div>
        {/* Fagulha Explosão */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 flex flex-col items-center">
          <div className="text-lg font-bold text-pink-300 mb-1">Fagulha Explosão</div>
          <div className="text-3xl font-semibold text-white">R$ 49,99</div>
          <div className="text-sm text-white/60 mb-2">300 tokens</div>
          <button className="mt-auto rounded-lg border border-white/15 bg-white/10 px-4 py-2 text-white hover:bg-white/15 transition">Selecionar</button>
        </div>
      </div>
    </div>
  );
}
