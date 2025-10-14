export default function PagamentoCanceladoPage({ searchParams }: { searchParams: { ref?: string } }) {
  const ref = searchParams.ref
  return (
    <main className="max-w-xl mx-auto px-6 py-16">
      <h1 className="text-2xl font-bold mb-4">Pagamento não concluído</h1>
      {ref && <p className="text-sm text-zinc-400">Referência: {ref}</p>}
      <p className="mt-4 text-zinc-300">O pagamento foi cancelado ou ainda não foi aprovado. Você pode tentar novamente escolhendo um plano.</p>
      <a href="/planos" className="mt-8 inline-block rounded bg-orange-600 hover:bg-orange-500 px-5 py-2 font-medium">Voltar aos planos</a>
    </main>
  )
}
