import { NextResponse } from 'next/server'
import getRouteClient from '@/lib/supabase/routeClient'
import { getPaymentInfo } from '@/lib/payments/mercadopago'
import logger, { inc } from '@/lib/observability/logger'

// Função exportada para testes: processa pagamento e retorna se creditou
export async function processPaymentById(supabase: any, paymentId: string) {
  const info = await getPaymentInfo(paymentId)
  // Localiza purchase
  let { data: existing } = await supabase
    .from('purchases')
    .select('*')
    .eq('gateway_payment_id', info.gateway_payment_id)
    .maybeSingle()
  if (!existing) {
    const { data: byRef } = await supabase
      .from('purchases')
      .select('*')
      .eq('external_reference', info.external_reference)
      .maybeSingle()
    if (!byRef) {
      inc('webhook.purchase_not_found')
      logger.warn('webhook_purchase_not_found', { external_reference: info.external_reference })
      return { ignored: 'purchase_not_found', ref: info.external_reference }
    }
    existing = byRef
    if (!existing.gateway_payment_id) {
      await supabase.from('purchases').update({ gateway_payment_id: info.gateway_payment_id }).eq('id', existing.id)
      existing.gateway_payment_id = info.gateway_payment_id
    }
  }
  let credited = false
  if (existing.status !== 'credited') {
    const newStatus = info.status === 'approved' ? 'approved' : info.status
    if (newStatus !== existing.status) {
      await supabase.from('purchases').update({ status: newStatus, raw_payload: info.raw }).eq('id', existing.id)
      existing.status = newStatus
    }
    if (newStatus === 'approved' && existing.status !== 'credited') {
      const tokensToCredit = existing.tokens_snapshot
      if (tokensToCredit > 0) {
        await supabase.from('tokens').insert({ user_id: existing.user_id, amount: tokensToCredit, description: `Compra ${existing.plan_code}` })
        await supabase.from('purchases').update({ status: 'credited', credited_at: new Date().toISOString() }).eq('id', existing.id)
        inc('webhook.tokens_credited')
        logger.info('webhook_tokens_credited', { purchase_id: existing.id, user: existing.user_id, amount: tokensToCredit })
        credited = true
      }
    }
  }
  return { ok: true, credited }
}

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
    const result = await processPaymentById(supabase, paymentId)
    inc('webhook.processed')
    return NextResponse.json(result)
  } catch (e: any) {
    logger.error('webhook_error', { error: e?.message })
    inc('webhook.error')
    return NextResponse.json({ error: 'webhook_failed' }, { status: 500 })
  }
}
