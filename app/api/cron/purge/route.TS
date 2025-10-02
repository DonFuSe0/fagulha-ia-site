// app/api/cron/purge/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'
export const revalidate = 0
export const runtime = 'nodejs'

function isoNowMinus(hours: number) {
  return new Date(Date.now() - hours * 3600 * 1000).toISOString()
}

/**
 * Purge policy
 * - Private items: created_at < now() - 24h
 * - Public items:  public_at < now() - 4d
 * Only DB rows are removed here. (Storage cleanup pode ser adicionado depois se necessário.)
 */
export async function GET(req: Request) {
  const secret = req.headers.get('x-cron-secret') || req.headers.get('X-CRON-SECRET')
  if (!secret || secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 })
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!
  const admin = createClient(url, key)

  const privateCutoff = isoNowMinus(24)
  const publicCutoff  = new Date(Date.now() - 4 * 24 * 3600 * 1000).toISOString()

  // Delete PRIVATE expired (is_public = false and created_at older than 24h)
  const delPrivate = await admin
    .from('generations')
    .delete()
    .eq('is_public', false)
    .lt('created_at', privateCutoff)
    .select('id', { count: 'exact' })

  // Delete PUBLIC expired (is_public = true and public_at older than 4 days)
  const delPublic = await admin
    .from('generations')
    .delete()
    .eq('is_public', true)
    .lt('public_at', publicCutoff)
    .select('id', { count: 'exact' })

  const res = {
    ok: !delPrivate.error && !delPublic.error,
    deleted_private: delPrivate.count ?? 0,
    deleted_public: delPublic.count ?? 0,
    errors: {
      private: delPrivate.error?.message || null,
      public: delPublic.error?.message || null,
    },
    cutoffs: { privateCutoff, publicCutoff }
  }

  const status = res.ok ? 200 : 500
  return NextResponse.json(res, { status })
}
