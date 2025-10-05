export const dynamic = 'force-dynamic'
export const revalidate = 0

import { NextResponse } from 'next/server'
import { verifyTurnstileToken } from '@/lib/turnstile/verify'
import { supabaseRoute } from '@/lib/supabase/routeClient'

export async function POST(req: Request) {
  let body: any = {}
  try {
    body = await req.json()
  } catch {}

  const { email, password, turnstileToken } = body ?? {}

  const check = await verifyTurnstileToken(turnstileToken)
  if (!check.ok) {
    return NextResponse.json({ ok: false, error: 'captcha_failed', detail: check.error }, { status: 400 })
  }

  const supabase = supabaseRoute()
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) {
    // Provide more specific error messages
    let errorMessage = error.message
    if (error.message.includes('Invalid login credentials')) {
      errorMessage = 'Invalid login credentials'
    } else if (error.message.includes('Email not confirmed')) {
      errorMessage = 'Email not confirmed'
    }
    return NextResponse.json({ ok: false, error: errorMessage }, { status: 400 })
  }

  return NextResponse.json({ ok: true })
}
