// app/api/auth/signup/route.ts
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import crypto from 'crypto'

export const dynamic = 'force-dynamic'
export const revalidate = 0
export const runtime = 'nodejs'

type Payload = { email?: string; password?: string; nickname?: string | null }

async function readPayload(req: Request): Promise<Payload> {
  const ct = req.headers.get('content-type') || ''
  if (ct.includes('application/json')) {
    return await req.json().catch(() => ({}))
  }
  const fd = await req.formData().catch(() => null)
  if (!fd) return {}
  const email = (fd.get('email') as string | null) ?? undefined
  const password = (fd.get('password') as string | null) ?? undefined
  const nickname = (fd.get('nickname') as string | null) ?? null
  return { email, password, nickname }
}

function bad(message: string, status = 400) {
  return NextResponse.json({ ok: false, error: message }, { status })
}

export async function POST(req: Request) {
  try {
    const supabase = createRouteHandlerClient<any>({ cookies })

    const { data: session } = await supabase.auth.getSession()
    if (session.session) {
      // já logado — redireciona ao dashboard
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }

    const body = await readPayload(req)
    const email = (body.email || '').trim().toLowerCase()
    const password = (body.password || '').trim()
    const nickname = (body.nickname || null)

    if (!email || !password) return bad('missing_credentials', 400)
    if (password.length < 8) return bad('weak_password', 400)

    // 1) Bloqueio 30d por exclusão anterior
    const emailHash = crypto.createHash('sha256').update(email).digest('hex')
    const { data: del } = await supabase
      .from('account_deletions')
      .select('id, ban_until')
      .eq('email_hash', emailHash)
      .gt('ban_until', new Date().toISOString())
      .limit(1)
      .maybeSingle()

    if (del) {
      return bad('signup_blocked_30d', 403)
    }

    // 2) signUp normal (envia email de confirmação se o projeto estiver configurado assim)
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: new URL('/auth/callback', req.url).toString(),
        data: nickname ? { nickname } : undefined,
      }
    })

    if (error) {
      // devolve o erro do supabase de forma clara
      return bad(`supabase_signup_error:${error.message}`, 400)
    }

    // 3) se quiser, já crie o profile "placeholder" (RLS deve permitir insert do próprio user através do trigger/policy)
    // Não faremos insert direto aqui para evitar colisões com triggers já existentes no seu schema.

    // 4) redireciona para tela de confirmação
    return NextResponse.redirect(new URL('/auth/confirmar-email', req.url))
  } catch (e: any) {
    console.error('signup_500', e?.stack || e?.message || e)
    return bad('internal_error', 500)
  }
}
