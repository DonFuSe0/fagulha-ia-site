import AppHeader from '../_components/AppHeader'
import { SparklesIcon, FireIcon, RocketLaunchIcon } from '@heroicons/react/24/solid'

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function PlanosPage() {
  return (
    <>
      <AppHeader />
      <section className="relative bg-gradient-to-br from-black via-zinc-900 to-emerald-950 min-h-[100vh] pb-16">
        <div className="mx-auto max-w-4xl px-4 pt-10 pb-4 text-center">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white drop-shadow-lg flex items-center justify-center gap-2">
            <SparklesIcon className="w-8 h-8 text-amber-300 animate-pulse" />
            Planos de Tokens
          </h1>
          <p className="mt-4 text-lg text-zinc-200 max-w-2xl mx-auto">Escolha o plano ideal para liberar sua criatividade e gerar imagens incríveis com a Fagulha IA!</p>
        </div>
        <div className="mx-auto max-w-5xl px-4 grid gap-8 sm:grid-cols-3 mt-10">
          {/* Fagulha Semente */}
          <div className="group relative rounded-3xl border border-amber-400 bg-gradient-to-b from-yellow-900/40 to-black/70 p-8 flex flex-col items-center shadow-lg hover:scale-105 transition-transform duration-300">
            <FireIcon className="w-10 h-10 text-amber-300 mb-2 animate-bounce" />
            <div className="text-xl font-bold text-amber-200 mb-1 tracking-wide">Fagulha Semente</div>
            <div className="text-4xl font-extrabold text-white mb-2">R$ 9,99</div>
            <div className="text-base text-white/80 mb-4">50 tokens</div>
            <ul className="text-sm text-amber-100/90 mb-6 space-y-1">
              <li>Ideal para experimentar</li>
              <li>Validade: 30 dias</li>
              <li>Suporte básico</li>
            </ul>
            <button className="mt-auto rounded-xl border border-amber-400 bg-amber-500/20 px-6 py-2 text-amber-100 hover:bg-amber-500/40 font-semibold shadow transition">Selecionar</button>
          </div>
          {/* Fagulha Impulso (destaque) */}
          <div className="group relative rounded-3xl border-2 border-emerald-400 bg-gradient-to-b from-emerald-900/80 to-black/80 p-10 flex flex-col items-center shadow-2xl scale-105 hover:scale-110 transition-transform duration-300">
            <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-xs px-4 py-1 rounded-full font-bold shadow-lg tracking-wide">Mais popular</div>
            <RocketLaunchIcon className="w-12 h-12 text-emerald-300 mb-2 animate-pulse" />
            <div className="text-2xl font-extrabold text-emerald-200 mb-1 tracking-wide">Fagulha Impulso</div>
            <div className="text-5xl font-extrabold text-white mb-2">R$ 29,99</div>
            <div className="text-lg text-white/80 mb-4">150 tokens</div>
            <ul className="text-base text-emerald-100/90 mb-6 space-y-1">
              <li>Perfeito para criar séries</li>
              <li>Validade: 60 dias</li>
              <li>Suporte prioritário</li>
            </ul>
            <button className="mt-auto rounded-xl border border-emerald-400 bg-emerald-500/20 px-8 py-3 text-emerald-100 hover:bg-emerald-500/40 font-bold shadow-lg text-lg transition">Selecionar</button>
          </div>
          {/* Fagulha Explosão */}
          <div className="group relative rounded-3xl border border-pink-400 bg-gradient-to-b from-pink-900/40 to-black/70 p-8 flex flex-col items-center shadow-lg hover:scale-105 transition-transform duration-300">
            <SparklesIcon className="w-10 h-10 text-pink-300 mb-2 animate-spin" />
            <div className="text-xl font-bold text-pink-200 mb-1 tracking-wide">Fagulha Explosão</div>
            <div className="text-4xl font-extrabold text-white mb-2">R$ 49,99</div>
            <div className="text-base text-white/80 mb-4">300 tokens</div>
            <ul className="text-sm text-pink-100/90 mb-6 space-y-1">
              <li>Para quem quer ir longe</li>
              <li>Validade: 90 dias</li>
              <li>Suporte premium</li>
            </ul>
            <button className="mt-auto rounded-xl border border-pink-400 bg-pink-500/20 px-6 py-2 text-pink-100 hover:bg-pink-500/40 font-semibold shadow transition">Selecionar</button>
          </div>
        </div>
      </section>
    </>
  );
}
