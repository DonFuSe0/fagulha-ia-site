
import AppHeader from '../_components/AppHeader'
import PlanosAnimations from './PlanosAnimations'
import { SparklesIcon, FireIcon, RocketLaunchIcon } from '@heroicons/react/24/solid'
import { useState } from 'react'


export const dynamic = "force-dynamic";
export const revalidate = 0;


const planos = [
  {
    code: 'semente',
    name: 'Fagulha Semente',
    price: 'R$ 9,99',
    tokens: 50,
    desc: ['Ideal para experimentar', 'Validade: 30 dias', 'Suporte básico'],
    border: 'border-amber-400',
    bg: 'bg-gradient-to-b from-yellow-900/40 to-black/70',
    text: 'text-amber-200',
    icon: <FireIcon className="w-10 h-10 text-amber-300 mb-2 animate-bounce" />,
    btn: 'text-amber-100 border-amber-400 bg-amber-500/20 hover:bg-amber-500/40',
    highlight: false
  },
  {
    code: 'impulso',
    name: 'Fagulha Impulso',
    price: 'R$ 29,99',
    tokens: 150,
    desc: ['Perfeito para criar séries', 'Validade: 60 dias', 'Suporte prioritário'],
    border: 'border-emerald-400 border-2',
    bg: 'bg-gradient-to-b from-emerald-900/80 to-black/80',
    text: 'text-emerald-200',
    icon: <RocketLaunchIcon className="w-12 h-12 text-emerald-300 mb-2 animate-pulse" />,
    btn: 'text-emerald-100 border-emerald-400 bg-emerald-500/20 hover:bg-emerald-500/40',
    highlight: true
  },
  {
    code: 'explosao',
    name: 'Fagulha Explosão',
    price: 'R$ 49,99',
    tokens: 300,
    desc: ['Para quem quer ir longe', 'Validade: 90 dias', 'Suporte premium'],
    border: 'border-pink-400',
    bg: 'bg-gradient-to-b from-pink-900/40 to-black/70',
    text: 'text-pink-200',
    icon: <SparklesIcon className="w-10 h-10 text-pink-300 mb-2 animate-spin" />,
    btn: 'text-pink-100 border-pink-400 bg-pink-500/20 hover:bg-pink-500/40',
    highlight: false
  }
]

export default function PlanosPage() {
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function adquirirPlano(code: string) {
    setLoading(code); setError(null)
    try {
      const res = await fetch('/api/payments/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan_code: code })
      })
      const j = await res.json()
      if (!res.ok || !j.url) throw new Error(j.error || 'Erro ao iniciar pagamento')
      window.location.href = j.url
    } catch (e: any) {
      setError(e.message)
      setLoading(null)
    }
  }

  return (
    <>
      <AppHeader />
      <section className="relative bg-gradient-to-br from-black via-zinc-900 to-emerald-950 min-h-[100vh] pb-16 overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10 animate-gradient-move">
          <div className="absolute left-1/2 top-0 -translate-x-1/2 w-[1200px] h-[1200px] rounded-full blur-3xl opacity-20 animate-pulse"
            style={{ background: 'radial-gradient(ellipse at 60% 40%, #ff7a18 0%, #ffb347 40%, #ff7a18 70%, transparent 100%)' }} />
          <div className="absolute bottom-0 right-0 w-[700px] h-[700px] rounded-full blur-2xl opacity-20 animate-spin-slow"
            style={{ background: 'radial-gradient(ellipse at 80% 80%, #34d399 0%, #0f172a 70%)' }} />
        </div>
        <div className="mx-auto max-w-4xl px-4 pt-10 pb-4 text-center">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white flex items-center justify-center gap-2"> <SparklesIcon className="w-8 h-8 text-amber-300 animate-pulse" /> Planos de Tokens </h1>
          <p className="mt-4 text-lg text-zinc-200 max-w-2xl mx-auto">Escolha o plano ideal para liberar sua criatividade e gerar imagens incríveis com a Fagulha IA!</p>
        </div>
        {error && <div className="mx-auto max-w-xl text-center text-red-400 font-medium py-2">{error}</div>}
        <div className="mx-auto max-w-5xl px-4 grid gap-8 sm:grid-cols-3 mt-10">
          {planos.map((p, i) => (
            <div key={p.code} className={`group relative rounded-3xl ${p.border} ${p.bg} p-8 flex flex-col items-center shadow-lg hover:scale-105 transition-transform duration-300 animate-card-float ${p.highlight ? 'border-2 scale-105 hover:scale-110 p-10 shadow-2xl' : ''}`}>
              {p.highlight && <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-xs px-4 py-1 rounded-full font-bold shadow-lg tracking-wide animate-bounce-slow">Mais popular</div>}
              {p.icon}
              <div className={`text-xl font-bold mb-1 tracking-wide ${p.text}`}>{p.name}</div>
              <div className={`text-4xl font-extrabold text-white mb-2`}>{p.price}</div>
              <div className={`text-base text-white/80 mb-4`}>{p.tokens} tokens</div>
              <ul className={`text-sm mb-6 space-y-1 ${p.text}/90`}>
                {p.desc.map((d, idx) => <li key={idx}>{d}</li>)}
              </ul>
              <button
                className={`mt-auto rounded-xl border px-6 py-2 font-semibold shadow transition hover:scale-105 ${p.btn} ${loading === p.code ? 'opacity-60 pointer-events-none' : ''}`}
                onClick={() => adquirirPlano(p.code)}
                disabled={!!loading}
              >
                {loading === p.code ? 'Redirecionando...' : 'Selecionar'}
              </button>
            </div>
          ))}
        </div>
        <PlanosAnimations />
      </section>
    </>
  )
}
