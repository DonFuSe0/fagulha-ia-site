export const dynamic = 'force-dynamic'
export const revalidate = 0

import { NextResponse } from 'next/server'
import { verifyTurnstileToken } from '@/lib/turnstile/verify'
import { supabaseRoute } from '@/lib/supabase/routeClient'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
const EMAIL_REDIRECT_TO = `${SITE_URL}/auth/callback`

export async function POST(req: Request) {
  let body: any = {}
  try {
    body = await req.json()
  } catch {}

  const { email, password, nickname, turnstileToken } = body ?? {}

  const check = await verifyTurnstileToken(turnstileToken)
  if (!check.ok) {
    return NextResponse.json({ ok: false, error: 'captcha_failed', detail: check.error }, { status: 400 })
  }

  const supabase = supabaseRoute()
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { nickname }, emailRedirectTo: EMAIL_REDIRECT_TO }
  })

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 400 })
  }

  return NextResponse.json({ ok: true, needs_email_confirmation: true })
}
