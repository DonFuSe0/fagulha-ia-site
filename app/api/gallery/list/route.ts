// app/api/gallery/list/route.ts
import { NextResponse } from 'next/server'
import routeClient from '@/lib/supabase/routeClient'

export async function GET() {
  const supabase = routeClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) return NextResponse.json({ error: 'not_authenticated' }, { status: 401 })

  const BUCKET = 'gen-private'
  const PREFIX = user.id

  const { data: list, error: listErr } = await supabase.storage
    .from(BUCKET)
    .list(PREFIX, { limit: 60, sortBy: { column: 'created_at', order: 'desc' } })

  if (listErr) {
    return NextResponse.json({ error: 'list_failed', details: listErr.message }, { status: 400 })
  }

  const items: any[] = []
  for (const obj of list || []) {
    if (!obj.name) continue
    const path = `${PREFIX}/${obj.name}`
    const { data: signed, error: signErr } = await supabase.storage.from(BUCKET).createSignedUrl(path, 60 * 60)
    if (signErr) continue
    items.push({ name: obj.name, path, url: signed?.signedUrl ?? null, created_at: obj.created_at })
  }

  return NextResponse.json({ items })
}
