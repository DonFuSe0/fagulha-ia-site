import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { createClient as createSupabaseServerClient } from '@supabase/supabase-js'
import { assertAdmin } from '@/lib/auth/isAdminUser'

export const dynamic = 'force-dynamic'

function getServiceClient(){
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if(!url || !key) return null
  return createSupabaseServerClient(url, key, { auth: { persistSession: false } })
}

interface UpdateBody { name?: string; tokens?: number; price_cents?: number; active?: boolean; sort_order?: number; currency?: string }

export async function PATCH(req: Request, ctx: { params: { code: string }}){
  const code = decodeURIComponent(ctx.params.code)
  const cookieStore = cookies()
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
  const { data: { user } } = await supabase.auth.getUser()
  try { assertAdmin(user) } catch { return NextResponse.json({ error: 'forbidden' }, { status: 403 }) }
  const body = await req.json().catch(() => ({})) as UpdateBody
  const patch: any = {}
  if(body.name) patch.name = body.name.trim()
  if(body.tokens !== undefined){ if(body.tokens <= 0) return NextResponse.json({ error: 'invalid_tokens' }, { status: 400 }); patch.tokens = body.tokens }
  if(body.price_cents !== undefined){ if(body.price_cents <= 0) return NextResponse.json({ error: 'invalid_price' }, { status: 400 }); patch.price_cents = body.price_cents }
  if(body.sort_order !== undefined) patch.sort_order = body.sort_order
  if(body.currency) patch.currency = body.currency
  if(body.active !== undefined) patch.active = body.active
  if(Object.keys(patch).length === 0) return NextResponse.json({ error: 'nothing_to_update' }, { status: 400 })
  const admin = getServiceClient() || supabase
  const { data, error } = await admin.from('plans').update(patch).eq('code', code).select('*').single()
  if(error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true, plan: data })
}

export async function POST(req: Request, ctx: { params: { code: string }}){
  // Atalho: POST /api/admin/plans/[code] { toggle: true } para alternar active
  const code = decodeURIComponent(ctx.params.code)
  const cookieStore = cookies()
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
  const { data: { user } } = await supabase.auth.getUser()
  try { assertAdmin(user) } catch { return NextResponse.json({ error: 'forbidden' }, { status: 403 }) }
  const body = await req.json().catch(() => ({})) as any
  if(!body.toggle) return NextResponse.json({ error: 'unsupported' }, { status: 400 })
  const admin = getServiceClient() || supabase
  const { data: existing, error: e1 } = await admin.from('plans').select('active').eq('code', code).single()
  if(e1 || !existing) return NextResponse.json({ error: 'not_found' }, { status: 404 })
  const { data, error } = await admin.from('plans').update({ active: !existing.active }).eq('code', code).select('*').single()
  if(error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true, plan: data })
}
