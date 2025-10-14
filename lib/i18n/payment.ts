export const paymentMessages = {
  success_title: 'Pagamento confirmado!',
  processing_title: 'Pagamento em processamento',
  reference_label: 'Referência',
  processing_desc: (state: string) => `Estamos confirmando seu pagamento (estado: ${state}). Atualizamos a cada 2s.`,
  processing_wait_long: 'Ainda processando... Alguns meios de pagamento (ex: Pix em baixa latência ou boleto) podem levar alguns minutos.',
  tokens_added: 'Créditos adicionados com sucesso.',
  more_tokens: (n: number) => `+${n} tokens`,
  error_status: 'Erro ao consultar status.',
  go_dashboard: 'Ir para Dashboard',
  view_plans: 'Ver outros planos',
  copy_ref: 'Copiar ref',
  copied: 'Copiado!',
  cancelled_title: 'Pagamento não concluído',
  cancelled_hint: 'O pagamento foi cancelado ou ainda não foi aprovado. Você pode tentar novamente escolhendo um plano.',
  back_plans: 'Voltar aos planos'
}

export type PaymentMessages = typeof paymentMessages