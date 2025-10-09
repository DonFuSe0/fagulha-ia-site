// app/api/explore/list/route.ts
import { NextResponse } from 'next/server'
import routeClient from '@/lib/supabase/routeClient'

// "Explorar": lista imagens PÚBLICAS do bucket gen-public (de todos usuários)
export async function GET() {
  const supabase = routeClient()
  const BUCKET = 'gen-public'

  const { data: list, error: listErr } = await supabase.storage
    .from(BUCKET)
    .list('', { limit: 80, sortBy: { column: 'created_at', order: 'desc' } })

  if (listErr) {
    return NextResponse.json({ error: 'list_failed', details: listErr.message }, { status: 400 })
  }

  // URLs públicas
  const items: any[] = []
  for (const obj of list || []) {
    if (!obj.name) continue
    // Se as imagens estiverem em subpastas por usuário, você pode mapear com prefixos.
    const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(obj.name)
    items.push({ name: obj.name, path: obj.name, url: pub?.publicUrl ?? null, created_at: obj.created_at })
  }

  return NextResponse.json({ items })
}
