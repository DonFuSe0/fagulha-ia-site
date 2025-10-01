// app/api/dev/seed-generation/route.ts
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'

export const dynamic = 'force-dynamic'
export const revalidate = 0

// GET ou POST: cria 1 item privado apontando para /seed/fagulha-sample.jpg
export async function GET(req: Request) { return seed(req) }
export async function POST(req: Request) { return seed(req) }

async function seed(req: Request) {
  const supabase = createRouteHandlerClient<any>({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ ok: false, error: 'auth' }, { status: 401 })

  const base = new URL(req.url).origin
  const url = `${base}/seed/fagulha-sample.jpg`
  const { error } = await supabase.from('generations').insert({
    user_id: user.id,
    image_url: url,
    thumb_url: url,
    is_public: false,
    params: {},
  } as any)
  if (error) return NextResponse.json({ ok: false, error: 'db' }, { status: 500 })
  return NextResponse.json({ ok: true, image_url: url })
}
