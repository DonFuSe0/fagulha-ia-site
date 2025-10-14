import AppHeader from '../_components/AppHeader'
import { SparklesIcon, FireIcon, RocketLaunchIcon } from '@heroicons/react/24/solid'

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function PlanosPage() {
  return (
    <>
      <AppHeader />
      <section className="relative bg-gradient-to-br from-black via-zinc-900 to-emerald-950 min-h-[100vh] pb-16 overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10 animate-gradient-move">
          <div className="absolute left-1/2 top-0 -translate-x-1/2 w-[1200px] h-[1200px] rounded-full blur-3xl opacity-20 animate-pulse"
            style={{background: 'radial-gradient(ellipse at 60% 40%, #ff7a18 0%, #ffb347 40%, #ff7a18 70%, transparent 100%)'}} />
          <div className="absolute bottom-0 right-0 w-[700px] h-[700px] rounded-full blur-2xl opacity-20 animate-spin-slow"
            style={{background: 'radial-gradient(ellipse at 80% 80%, #34d399 0%, #0f172a 70%)'}} />
        </div>
        <div className="mx-auto max-w-4xl px-4 pt-10 pb-4 text-center">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white drop-shadow-lg flex items-center justify-center gap-2 animate-text-glow"> <SparklesIcon className="w-8 h-8 text-amber-300 animate-pulse" /> Planos de Tokens </h1>
          <p className="mt-4 text-lg text-zinc-200 max-w-2xl mx-auto drop-shadow-[0_2px_8px_rgba(0,0,0,0.18)]">Escolha o plano ideal para liberar sua criatividade e gerar imagens incríveis com a Fagulha IA!</p>
        </div>
        <div className="mx-auto max-w-5xl px-4 grid gap-8 sm:grid-cols-3 mt-10">
          {/* Fagulha Semente */}
          <div className="group relative rounded-3xl border border-amber-400 bg-gradient-to-b from-yellow-900/40 to-black/70 p-8 flex flex-col items-center shadow-lg hover:scale-105 transition-transform duration-300 animate-card-float">
            <FireIcon className="w-10 h-10 text-amber-300 mb-2 animate-bounce" />
            <div className="text-xl font-bold text-amber-200 mb-1 tracking-wide">Fagulha Semente</div>
            <div className="text-4xl font-extrabold text-white mb-2">R$ 9,99</div>
            <div className="text-base text-white/80 mb-4">50 tokens</div>
            <ul className="text-sm text-amber-100/90 mb-6 space-y-1">
              <li>Ideal para experimentar</li>
              <li>Validade: 30 dias</li>
              <li>Suporte básico</li>
            </ul>
            <button className="mt-auto rounded-xl border border-amber-400 bg-amber-500/20 px-6 py-2 text-amber-100 hover:bg-amber-500/40 font-semibold shadow transition shadow-amber-400/10 hover:scale-105">Selecionar</button>
          </div>
          {/* Fagulha Impulso (destaque) */}
          <div className="group relative rounded-3xl border-2 border-emerald-400 bg-gradient-to-b from-emerald-900/80 to-black/80 p-10 flex flex-col items-center shadow-2xl scale-105 hover:scale-110 transition-transform duration-300 animate-card-float">
            <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-xs px-4 py-1 rounded-full font-bold shadow-lg tracking-wide animate-bounce-slow">Mais popular</div>
            <RocketLaunchIcon className="w-12 h-12 text-emerald-300 mb-2 animate-pulse" />
            <div className="text-2xl font-extrabold text-emerald-200 mb-1 tracking-wide">Fagulha Impulso</div>
            <div className="text-5xl font-extrabold text-white mb-2">R$ 29,99</div>
            <div className="text-lg text-white/80 mb-4">150 tokens</div>
            <ul className="text-base text-emerald-100/90 mb-6 space-y-1">
              <li>Perfeito para criar séries</li>
              <li>Validade: 60 dias</li>
              <li>Suporte prioritário</li>
            </ul>
            <button className="mt-auto rounded-xl border border-emerald-400 bg-emerald-500/20 px-8 py-3 text-emerald-100 hover:bg-emerald-500/40 font-bold shadow-lg text-lg transition shadow-emerald-400/10 hover:scale-105">Selecionar</button>
          </div>
          {/* Fagulha Explosão */}
          <div className="group relative rounded-3xl border border-pink-400 bg-gradient-to-b from-pink-900/40 to-black/70 p-8 flex flex-col items-center shadow-lg hover:scale-105 transition-transform duration-300 animate-card-float">
            <SparklesIcon className="w-10 h-10 text-pink-300 mb-2 animate-spin" />
            <div className="text-xl font-bold text-pink-200 mb-1 tracking-wide">Fagulha Explosão</div>
            <div className="text-4xl font-extrabold text-white mb-2">R$ 49,99</div>
            <div className="text-base text-white/80 mb-4">300 tokens</div>
            <ul className="text-sm text-pink-100/90 mb-6 space-y-1">
              <li>Para quem quer ir longe</li>
              <li>Validade: 90 dias</li>
              <li>Suporte premium</li>
            </ul>
            <button className="mt-auto rounded-xl border border-pink-400 bg-pink-500/20 px-6 py-2 text-pink-100 hover:bg-pink-500/40 font-semibold shadow transition shadow-pink-400/10 hover:scale-105">Selecionar</button>
          </div>
        </div>
        {/* Animations CSS */}
        <style jsx global>{`
          @keyframes gradient-move {
            0% { transform: translateY(0) scale(1); }
            50% { transform: translateY(-20px) scale(1.03); }
            100% { transform: translateY(0) scale(1); }
          }
          .animate-gradient-move > div:first-child {
            animation: gradient-move 8s ease-in-out infinite;
          }
          @keyframes spin-slow {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          .animate-spin-slow {
            animation: spin-slow 24s linear infinite;
          }
          @keyframes text-glow {
            0%, 100% { text-shadow: 0 0 8px #ff7a18, 0 0 24px #ffb347; }
            50% { text-shadow: 0 0 24px #ffb347, 0 0 48px #ff7a18; }
          }
          .animate-text-glow {
            animation: text-glow 2.5s ease-in-out infinite;
          }
          @keyframes card-float {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-8px); }
          }
          .animate-card-float {
            animation: card-float 3.5s ease-in-out infinite;
          }
          @keyframes bounce-slow {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-8px); }
          }
          .animate-bounce-slow {
            animation: bounce-slow 2.2s infinite;
          }
        `}</style>
      </section>
    </>
  );
}
