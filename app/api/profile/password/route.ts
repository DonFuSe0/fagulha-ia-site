import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'

// POST /api/profile/password
// Accepts JSON or FormData, updates the logged-in user's password,
// then redirects back to /settings?tab=seguranca with status flags.
export async function POST(req: Request) {
  try {
    const contentType = req.headers.get('content-type') || ''
    let newPassword: string | null = null

    if (contentType.includes('application/json')) {
      const body = await req.json().catch(() => ({} as any))
      newPassword = body?.newPassword || body?.new_password || body?.password_new || body?.password || null
    } else {
      const form = await req.formData()
      const tryKeys = ['new_password', 'newPassword', 'password_new', 'password']
      for (const k of tryKeys) {
        const v = form.get(k)
        if (typeof v === 'string' && v) { newPassword = v; break }
      }
    }

    const backTo = new URL('/settings', req.url)
    backTo.searchParams.set('tab', 'seguranca')

    // Validate quickly without leaking policy details
    if (!newPassword || typeof newPassword !== 'string' || newPassword.length < 6) {
      backTo.searchParams.set('pwd_error', 'invalid')
      return NextResponse.redirect(backTo, { status: 303 })
    }

    const supabase = createRouteHandlerClient({ cookies })
    const { error } = await supabase.auth.updateUser({ password: newPassword })

    if (error) {
      backTo.searchParams.set('pwd_error', 'update_failed')
      return NextResponse.redirect(backTo, { status: 303 })
    }

    backTo.searchParams.set('pwd', 'ok')
    return NextResponse.redirect(backTo, { status: 303 })
  } catch {
    const backTo = new URL('/settings', req.url)
    backTo.searchParams.set('tab', 'seguranca')
    backTo.searchParams.set('pwd_error', 'unexpected')
    return NextResponse.redirect(backTo, { status: 303 })
  }
}

// Avoid GET rendering a "page"; always bounce back to settings with an error.
export async function GET(req: Request) {
  const backTo = new URL('/settings', req.url)
  backTo.searchParams.set('tab', 'seguranca')
  backTo.searchParams.set('pwd_error', 'method_not_allowed')
  return NextResponse.redirect(backTo, { status: 303 })
}
