export const dynamic = 'force-dynamic';

export default function BemVindoPage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="text-3xl font-bold text-white">🎉 Conta confirmada!</h1>
      <p className="mt-3 text-gray-300">
        Sua conta foi confirmada e seus créditos de boas-vindas já foram liberados.
      </p>

      <section className="mt-8 rounded-lg border border-gray-800 bg-[#0b0f14] p-6">
        <h2 className="text-xl font-semibold text-white">Próximos passos</h2>
        <ul className="mt-3 list-disc space-y-2 pl-6 text-gray-300">
          <li>Acesse o seu <a href="/dashboard" className="text-brand underline">Dashboard</a> para visualizar seus créditos.</li>
          <li>Explore a galeria pública em <a href="/explore" className="text-brand underline">Explorar</a>.</li>
          <li>Experimente a área de <a href="/generate" className="text-brand underline">Geração</a> para ver como tudo funciona.</li>
        </ul>
        <div className="mt-6">
          <a href="/dashboard" className="inline-block rounded bg-brand px-5 py-2 font-medium text-black hover:bg-brand-light">
            Ir para o Dashboard
          </a>
        </div>
      </section>

      <p className="mt-8 text-sm text-gray-500">
        Se não foi você quem solicitou essa ação, recomendamos alterar sua senha imediatamente.
      </p>
    </main>
  );
}
