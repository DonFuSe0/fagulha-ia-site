export const dynamic = 'force-dynamic';
import BemvindoAnimations from './BemvindoAnimations';

export default function BemVindoPage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-16 relative overflow-hidden">
      {/* Gradiente animado de fundo */}
      <div className="pointer-events-none absolute inset-0 -z-10 animate-gradient-move">
        <div className="absolute left-1/2 top-0 -translate-x-1/2 w-[700px] h-[700px] rounded-full blur-3xl opacity-30 animate-pulse"
          style={{background: 'radial-gradient(ellipse at 60% 40%, #34d399 0%, #818cf8 60%, transparent 100%)'}} />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full blur-2xl opacity-20 animate-spin-slow"
          style={{background: 'radial-gradient(ellipse at 80% 80%, #ff7a18 0%, #0f172a 70%)'}} />
      </div>
      <h1 className="text-3xl font-bold text-white">🎉 Conta confirmada!</h1>
      <p className="mt-3 text-gray-300 drop-shadow-[0_2px_8px_rgba(0,0,0,0.18)]">
        Sua conta foi confirmada e seus créditos de boas-vindas já foram liberados.
      </p>
      <section className="mt-8 rounded-lg border border-gray-800 bg-[#0b0f14]/80 p-6 shadow-xl shadow-black/20 backdrop-blur">
        <h2 className="text-xl font-semibold text-white">Próximos passos</h2>
        <ul className="mt-3 list-disc space-y-2 pl-6 text-gray-300">
          <li>Acesse o seu <a href="/dashboard" className="text-brand underline">Dashboard</a> para visualizar seus créditos.</li>
          <li>Explore a galeria pública em <a href="/explore" className="text-brand underline">Explorar</a>.</li>
          <li>Experimente a área de <a href="/generate" className="text-brand underline">Geração</a> para ver como tudo funciona.</li>
        </ul>
        <div className="mt-6">
          <a href="/dashboard" className="inline-block rounded bg-brand px-5 py-2 font-medium text-black hover:bg-brand-light shadow-lg shadow-emerald-400/20 transition-transform duration-200 hover:scale-105 animate-bounce-slow">
            Ir para o Dashboard
          </a>
        </div>
      </section>
      <p className="mt-8 text-sm text-gray-500">
        Se não foi você quem solicitou essa ação, recomendamos alterar sua senha imediatamente.
      </p>
      
      {/* Animations CSS */}
      <BemvindoAnimations />
    </main>
  );
}
