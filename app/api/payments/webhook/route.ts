import { NextResponse } from 'next/server'
import getRouteClient from '@/lib/supabase/routeClient'
import { getPaymentInfo } from '@/lib/payments/mercadopago'

// Webhook Mercado Pago
// Recebe query params: topic=payment&id=PAYMENT_ID (padrão MP)
// Para simplificação inicial: não validamos assinatura extra além de possíveis futuras implementações.

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const topic = searchParams.get('topic')
  const paymentId = searchParams.get('id') || searchParams.get('payment_id')
  if (topic !== 'payment' || !paymentId) return NextResponse.json({ ok: true })
  const supabase = getRouteClient()

  try {
    const info = await getPaymentInfo(paymentId)

    // Tenta achar purchase existente
    const { data: existing } = await supabase
      .from('purchases')
      .select('*')
      .eq('gateway_payment_id', info.gateway_payment_id)
      .maybeSingle()

    if (!existing) {
      // Buscar o plano por external_reference (temos plan_code em metadata no MP, mas aqui dependemos do external_reference -> plan_code embed?)
      // Nesta fase inicial assumimos external_reference = prefix_planCode_timestamp_random
      const parts = info.external_reference?.split('_') || []
      const plan_code = parts.length >= 2 ? parts[1] : null
      if (!plan_code) return NextResponse.json({ ignored: 'no_plan_code', ref: info.external_reference })

      // Carrega plano
      const { data: plan } = await supabase
        .from('plans')
        .select('*')
        .eq('code', plan_code)
        .single()
      if (!plan) return NextResponse.json({ ignored: 'plan_not_found' })

      // Carrega user via metadata? Falta user_id - no fluxo ideal usaríamos server-to-server. Necessário fallback:
      // Sem metadata acessível via getPaymentInfo se não configurado; para robustez, poderíamos mapear external_reference->user_id em cache/DB na criação do checkout (TODO).
      // Por agora: aborta se não encontramos purchase pré-criada (futuro: criar purchase ao criar preference no checkout endpoint e armazenar external_reference).
      return NextResponse.json({ ignored: 'no_precreated_purchase' })
    }

    // Atualiza status se mudou
    if (existing.status !== 'credited') {
      const newStatus = info.status === 'approved' ? 'approved' : info.status
      if (newStatus !== existing.status) {
        await supabase
          .from('purchases')
          .update({ status: newStatus, raw_payload: info.raw })
          .eq('id', existing.id)
      }
      // Crédito se aprovado e ainda não credited
      if (newStatus === 'approved') {
        // Verifica se já credited (status pode não ter sido atualizado ainda)
        if (existing.status !== 'credited') {
          // Buscar se já existe entrada de tokens associada? (Simplificação: conferir status novamente após update)
          // Precisamos da snapshot de tokens
          const tokensToCredit = existing.tokens_snapshot
          const userId = existing.user_id
          if (tokensToCredit > 0) {
            // Inserir token
            await supabase.from('tokens').insert({ user_id: userId, amount: tokensToCredit, description: `Compra ${existing.plan_code}` })
            await supabase.from('purchases').update({ status: 'credited', credited_at: new Date().toISOString() }).eq('id', existing.id)
          }
        }
      }
    }

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    console.error('webhook_error', e)
    return NextResponse.json({ error: 'webhook_failed' }, { status: 500 })
  }
}
