import { paymentMessages as m } from '@/lib/i18n/payment'

export default function PagamentoCanceladoPage({ searchParams }: { searchParams: { ref?: string } }) {
  const ref = searchParams.ref
  return (
    <main className="max-w-xl mx-auto px-6 py-16">
      <h1 className="text-2xl font-bold mb-4">{m.cancelled_title}</h1>
      {ref && <p className="text-sm text-zinc-400">{m.reference_label}: {ref}</p>}
      <p className="mt-4 text-zinc-300">{m.cancelled_hint}</p>
      <a href="/planos" className="mt-8 inline-block rounded bg-orange-600 hover:bg-orange-500 px-5 py-2 font-medium">{m.back_plans}</a>
    </main>
  )
}
