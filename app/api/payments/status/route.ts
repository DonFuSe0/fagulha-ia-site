import { NextResponse } from 'next/server'
import getRouteClient from '@/lib/supabase/routeClient'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const ref = searchParams.get('ref')
  if (!ref) return NextResponse.json({ error: 'ref_required' }, { status: 400 })
  const supabase = getRouteClient()
  const { data: purchase, error } = await supabase
    .from('purchases')
    .select('status, tokens_snapshot, credited_at')
    .eq('external_reference', ref)
    .maybeSingle()
  if (error || !purchase) return NextResponse.json({ error: 'not_found' }, { status: 404 })
  return NextResponse.json({
    status: purchase.status,
    credited: purchase.status === 'credited',
    tokens: purchase.tokens_snapshot,
    credited_at: purchase.credited_at
  })
}
