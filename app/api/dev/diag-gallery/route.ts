// app/api/dev/diag-gallery/route.ts
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  const supabase = createRouteHandlerClient<any>({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ auth: 'none' }, { status: 401 })

  const { data, error, status } = await supabase
    .from('generations')
    .select('id')
    .eq('user_id', user.id)
    .limit(1)

  return NextResponse.json({ ok: !error, status, error: error?.message, rows: data?.length ?? 0 })
}
