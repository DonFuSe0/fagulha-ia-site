export default function PagamentoSucessoPage({ searchParams }: { searchParams: { ref?: string } }) {
  const ref = searchParams.ref
  return (
    <main className="max-w-xl mx-auto px-6 py-16">
      <h1 className="text-2xl font-bold mb-4">Pagamento em processamento</h1>
      {ref && <p className="text-sm text-zinc-400">Referência: {ref}</p>}
      <p className="mt-4 text-zinc-300">Estamos confirmando seu pagamento. Esta página atualizará automaticamente.</p>
      <p className="mt-6 text-xs text-zinc-500">Você pode navegar para o dashboard; seu saldo será atualizado quando o pagamento for aprovado.</p>
    </main>
  )
}
