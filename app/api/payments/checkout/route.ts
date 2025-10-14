import { NextResponse } from 'next/server'
import getRouteClient from '@/lib/supabase/routeClient'
import { createPreference, generateExternalReference } from '@/lib/payments/mercadopago'

// Rate limit simples em memória (não persiste em múltiplas instâncias / serverless) - pode evoluir depois
const rlMap = new Map<string, { count: number; ts: number }>()
const WINDOW_MS = 60_000
const MAX_REQ = 5

export async function POST(req: Request) {
  const supabase = getRouteClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  let body: any
  try { body = await req.json() } catch { return NextResponse.json({ error: 'invalid_json' }, { status: 400 }) }
  const plan_code = body?.plan_code
  if (!plan_code) return NextResponse.json({ error: 'plan_code_required' }, { status: 400 })

  // Rate limit por usuário
  const now = Date.now()
  const r = rlMap.get(user.id)
  if (!r || now - r.ts > WINDOW_MS) {
    rlMap.set(user.id, { count: 1, ts: now })
  } else {
    if (r.count >= MAX_REQ) return NextResponse.json({ error: 'rate_limited' }, { status: 429 })
    r.count++
  }

  // Carrega plano ativo
  const { data: plan, error } = await supabase
    .from('plans')
    .select('*')
    .eq('code', plan_code)
    .eq('active', true)
    .single()
  if (error || !plan) return NextResponse.json({ error: 'plan_not_found' }, { status: 404 })

  const origin = req.headers.get('origin') || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

  try {
    // Gerar external_reference antecipadamente e criar purchase pending
    const external_reference = generateExternalReference(plan.code)
    const { error: perr } = await supabase.from('purchases').insert({
      user_id: user.id,
      plan_code: plan.code,
      tokens_snapshot: plan.tokens,
      amount_cents: plan.price_cents,
      currency: plan.currency,
      status: 'pending',
      external_reference
    })
    if (perr) {
      console.error('purchase_insert_error', perr)
      return NextResponse.json({ error: 'purchase_init_failed' }, { status: 500 })
    }

    const pref = await createPreference({
      code: plan.code,
      name: plan.name,
      tokens: plan.tokens,
      price_cents: plan.price_cents,
      currency: plan.currency,
      gateway_reference: plan.gateway_reference
    }, user.id, origin)

    // (opcional) poderíamos atualizar purchase com preference_id
    await supabase.from('purchases').update({ preference_id: pref.preference_id }).eq('external_reference', external_reference)

    return NextResponse.json({ url: pref.init_point, external_reference, preference_id: pref.preference_id })
  } catch (e: any) {
    console.error('checkout_error', e)
    return NextResponse.json({ error: 'checkout_failed' }, { status: 500 })
  }
}
