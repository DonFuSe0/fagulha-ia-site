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

// GET: lista planos (inclusive inativos) somente admin
export async function GET(){
  const cookieStore = cookies()
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
  const { data: { user } } = await supabase.auth.getUser()
  try { assertAdmin(user) } catch(e:any){
    return NextResponse.json({ error: 'forbidden' }, { status: 403 })
  }
  const admin = getServiceClient() || supabase
  const { data, error } = await admin.from('plans').select('*').order('sort_order', { ascending: true })
  if(error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true, plans: data })
}

interface CreateBody { code?: string; name?: string; tokens?: number; price_cents?: number; currency?: string; active?: boolean; sort_order?: number; }

export async function POST(req: Request){
  const cookieStore = cookies()
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
  const { data: { user } } = await supabase.auth.getUser()
  try { assertAdmin(user) } catch(e:any){
    return NextResponse.json({ error: 'forbidden' }, { status: 403 })
  }
  const body = await req.json().catch(() => ({})) as CreateBody
  if(!body.code || !body.name || !body.tokens || !body.price_cents){
    return NextResponse.json({ error: 'missing_fields' }, { status: 400 })
  }
  if(body.tokens! <= 0 || body.price_cents! <= 0){
    return NextResponse.json({ error: 'invalid_values' }, { status: 400 })
  }
  const record = {
    code: body.code.trim(),
    name: body.name.trim(),
    tokens: body.tokens,
    price_cents: body.price_cents,
    currency: body.currency || 'BRL',
    active: body.active !== false,
    sort_order: body.sort_order ?? 100
  }
  const admin = getServiceClient() || supabase
  const { data, error } = await admin.from('plans').insert(record).select('*').single()
  if(error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true, plan: data })
}
