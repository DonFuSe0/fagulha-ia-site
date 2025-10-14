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

    // Localiza purchase: primeiro por gateway_payment_id, senão por external_reference
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
        return NextResponse.json({ ignored: 'purchase_not_found', ref: info.external_reference })
      }
      existing = byRef
      // Preencher gateway_payment_id se ainda vazio
      if (!existing.gateway_payment_id) {
        await supabase
          .from('purchases')
          .update({ gateway_payment_id: info.gateway_payment_id })
          .eq('id', existing.id)
        existing.gateway_payment_id = info.gateway_payment_id
      }
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
