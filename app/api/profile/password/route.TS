import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function POST(req: Request) {
  const supabase = createRouteHandlerClient<any>({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.redirect(new URL('/auth/login', req.url))

  const form = await req.formData()
  const password = (form.get('password') as string || '').trim()
  if (password.length < 8) return NextResponse.redirect(new URL('/settings?tab=seguranca', req.url))

  await supabase.auth.updateUser({ password })
  return NextResponse.redirect(new URL('/settings?tab=seguranca', req.url))
}
