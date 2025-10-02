// app/api/auth/signup/route.ts
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import crypto from 'crypto'

export const dynamic = 'force-dynamic'
export const revalidate = 0
export const runtime = 'nodejs'

type Payload = { email?: string; password?: string; nickname?: string | null }

function minPasswordLength() {
  const v = parseInt(process.env.MIN_PASSWORD_LENGTH || '', 10)
  return Number.isFinite(v) && v > 0 ? v : 8
}

async function readPayload(req: Request): Promise<Payload> {
  const ct = req.headers.get('content-type') || ''
  if (ct.includes('application/json')) {
    try { return await req.json() } catch { return {} }
  }
  try {
    const fd = await req.formData()
    const email = (fd.get('email') as string | null) ?? undefined
    const password = (fd.get('password') as string | null) ?? undefined
    const nickname = (fd.get('nickname') as string | null) ?? null
    return { email, password, nickname }
  } catch { return {} }
}

function errorJson(message: string, status = 400) {
  return NextResponse.json({ ok: false, error: message }, { status })
}

export async function POST(req: Request) {
  const supabase = createRouteHandlerClient<any>({ cookies })
  try {
    const { data: session } = await supabase.auth.getSession()
    if (session.session) {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }

    const body = await readPayload(req)
    const email = (body.email || '').trim().toLowerCase()
    const password = (body.password || '').trim()
    const nickname = (body.nickname || null)

    if (!email || !password) return errorJson('missing_credentials', 400)
    const minLen = minPasswordLength()
    if (password.length < minLen) return errorJson('weak_password', 400)

    // bloqueio de 30 dias por exclusão anterior
    const emailHash = crypto.createHash('sha256').update(email).digest('hex')
    const { data: del } = await supabase
      .from('account_deletions')
      .select('id, ban_until')
      .eq('email_hash', emailHash)
      .gt('ban_until', new Date().toISOString())
      .limit(1)
      .maybeSingle()

    if (del) return errorJson('signup_blocked_30d', 403)

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: new URL('/auth/callback', req.url).toString(),
        data: nickname ? { nickname } : undefined,
      }
    })

    if (error) {
      const msg = error.message?.toLowerCase() || ''
      if (msg.includes('already registered') || msg.includes('user already')) {
        return errorJson('email_already_registered', 409)
      }
      return errorJson('supabase_signup_error:' + error.message, 400)
    }

    // form → redirect; json → json
    const ct = req.headers.get('content-type') || ''
    if (ct.includes('application/json')) {
      return NextResponse.json({ ok: true, id: data.user?.id ?? null })
    }
    return NextResponse.redirect(new URL('/auth/confirmar-email', req.url))

  } catch (e: any) {
    console.error('signup_error', e?.stack || e?.message || e)
    return errorJson('internal_error', 500)
  }
}
