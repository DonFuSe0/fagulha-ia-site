import SuccessStatusClient from './success-client'

export default function PagamentoSucessoPage({ searchParams }: { searchParams: { ref?: string } }) {
  return <SuccessStatusClient refParam={searchParams.ref} />
}
