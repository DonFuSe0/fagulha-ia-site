// app/api/dev/diag-signup/route.ts
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'

export const dynamic = 'force-dynamic'
export const revalidate = 0
export const runtime = 'nodejs'

export async function GET() {
  try {
    const env = {
      NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      CRON_SECRET: !!process.env.CRON_SECRET,
    }
    const supabase = createRouteHandlerClient<any>({ cookies })

    // Tabela account_deletions existe?
    const { data: regclass, error: regErr } = await supabase.rpc('pg_catalog.to_regclass', { relname: 'public.account_deletions' } as any)
    const tableExists = !!regclass || !regErr

    // Teste de select simples (sem expor dados sensíveis)
    const { error: testErr } = await supabase.from('profiles').select('id').limit(1)

    return NextResponse.json({
      ok: true,
      env,
      account_deletions_exists: tableExists,
      profiles_select_ok: !testErr,
      profiles_error: testErr?.message || null,
    })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || String(e) }, { status: 500 })
  }
}
