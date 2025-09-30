import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const code = url.searchParams.get('code')
  const redirectTo = url.searchParams.get('redirect_to') ?? '/dashboard'

  if (!code) {
    // Sem code do OAuth -> volta pro login com erro
    const back = new URL(`/auth/login?error=missing_code`, process.env.NEXT_PUBLIC_SITE_URL!)
    return NextResponse.redirect(back)
  }

  // Prepara a resposta de redirecionamento final desde já
  const finalRedirect = new URL(redirectTo, process.env.NEXT_PUBLIC_SITE_URL!)
  const res = NextResponse.redirect(finalRedirect)

  // Supabase SSR com adaptadores de cookie (Next 15)
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name: string) => req.cookies.get(name)?.value,
        set: (name: string, value: string, options: any) => {
          res.cookies.set({ name, value, ...options })
        },
        remove: (name: string, options: any) => {
          res.cookies.set({ name, value: '', expires: new Date(0), ...options })
        },
      },
    }
  )

  // Troca o code pela sessão e grava os cookies na resposta
  const { error } = await supabase.auth.exchangeCodeForSession(code)
  if (error) {
    const back = new URL(`/auth/login?error=${encodeURIComponent(error.message)}`, process.env.NEXT_PUBLIC_SITE_URL!)
    return NextResponse.redirect(back)
  }

  return res
}
