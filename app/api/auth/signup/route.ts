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
    // Provide more specific error messages
    let errorMessage = error.message
    if (error.message.includes('User already registered')) {
      errorMessage = 'User already registered'
    } else if (error.message.includes('Password should be at least')) {
      errorMessage = 'Password should be at least 6 characters'
    } else if (error.message.includes('Unable to validate email address')) {
      errorMessage = 'Unable to validate email address'
    }
    return NextResponse.json({ ok: false, error: errorMessage }, { status: 400 })
  }

  return NextResponse.json({ ok: true, needs_email_confirmation: true })
}
