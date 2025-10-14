import { NextResponse } from 'next/server'
import getRouteClient from '@/lib/supabase/routeClient'
import { createPreference } from '@/lib/payments/mercadopago'

export async function POST(req: Request) {
  const supabase = getRouteClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  let body: any
  try { body = await req.json() } catch { return NextResponse.json({ error: 'invalid_json' }, { status: 400 }) }
  const plan_code = body?.plan_code
  if (!plan_code) return NextResponse.json({ error: 'plan_code_required' }, { status: 400 })

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
    const pref = await createPreference({
      code: plan.code,
      name: plan.name,
      tokens: plan.tokens,
      price_cents: plan.price_cents,
      currency: plan.currency,
      gateway_reference: plan.gateway_reference
    }, user.id, origin)

    return NextResponse.json({ url: pref.init_point, external_reference: pref.external_reference, preference_id: pref.preference_id })
  } catch (e: any) {
    console.error('checkout_error', e)
    return NextResponse.json({ error: 'checkout_failed' }, { status: 500 })
  }
}
