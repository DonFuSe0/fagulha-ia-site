// Confirmação por e-mail: redireciona para /auth/callback
import { NextResponse } from 'next/server'
import { supabaseRoute } from '@/lib/supabase/routeClient'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
const EMAIL_REDIRECT_TO = `${SITE_URL}/auth/callback`

export async function POST(req: Request) {
  const supabase = supabaseRoute()
  const body = await req.json()
  const { email, password, nickname } = body

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { 
      data: { nickname },
      emailRedirectTo: EMAIL_REDIRECT_TO
    }
  })

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 400 })
  }

  return NextResponse.json({ ok: true, needs_email_confirmation: true })
}
