// app/api/gallery/download/route.ts
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const name = url.searchParams.get('name') // object name inside gen-private/<user.id>/
    if (!name) {
      return NextResponse.json({ error: 'Missing name' }, { status: 400 })
    }

    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    const { data: { user }, error: userErr } = await supabase.auth.getUser()
    if (userErr || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Build object path and create a short-lived signed URL
    const objectPath = `${user.id}/${name}`

    const { data: signed, error: signErr } = await supabase
      .storage
      .from('gen-private')
      .createSignedUrl(objectPath, 60) // 60s is enough

    if (signErr || !signed?.signedUrl) {
      return NextResponse.json({ error: signErr?.message || 'Failed to sign URL' }, { status: 500 })
    }

    // Fetch the file bytes from Supabase using the signed URL
    const fileRes = await fetch(signed.signedUrl)
    if (!fileRes.ok) {
      return NextResponse.json({ error: 'Upstream fetch failed' }, { status: 502 })
    }

    // Derive a filename
    const safeName = name.includes('.') ? name : `${name}.jpg`

    // Stream back to the browser with attachment header
    const headers = new Headers(fileRes.headers)
    headers.set('Content-Disposition', `attachment; filename="${safeName}"`)
    headers.set('Content-Type', fileRes.headers.get('Content-Type') || 'application/octet-stream')
    return new Response(fileRes.body, { status: 200, headers })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Unexpected error' }, { status: 500 })
  }
}
