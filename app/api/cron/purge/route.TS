import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies, headers } from 'next/headers'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  const h = headers()
  const token = h.get('x-cron-secret') || h.get('X-CRON-SECRET')
  if (!token || token !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 })
  }

  const supabase = createRouteHandlerClient<any>({ cookies })

  // ... sua lógica de purga (24h privadas, 4 dias públicas, overflow 200)
  return NextResponse.json({ ok: true })
}
