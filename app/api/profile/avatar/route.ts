// app/api/profile/avatar/route.ts
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/routeClient'; // usa o helper já existente no projeto

export async function POST(req: Request) {
  try {
    const { data: { user }, error: userErr } = await supabase.auth.getUser();
    if (userErr || !user) {
      return NextResponse.json({ error: 'not_authenticated', details: userErr?.message }, { status: 401 });
    }

    const form = await req.formData();
    const file = form.get('file') as File | null;
    if (!file || file.size === 0) {
      return NextResponse.json({ error: 'no_file' }, { status: 400 });
    }

    const ext = (file.name?.split('.').pop() || 'png').toLowerCase();
    const path = `${user.id}/${Date.now()}.${ext}`;

    const { error: upErr } = await supabase.storage
      .from('avatars')
      .upload(path, file, {
        upsert: true,
        contentType: file.type || 'image/png',
        cacheControl: '3600',
      });

    if (upErr) {
      return NextResponse.json({ error: 'upload_failed', details: upErr.message }, { status: 400 });
    }

    const { data: publicData } = supabase.storage.from('avatars').getPublicUrl(path);
    const publicUrl = publicData?.publicUrl ?? null;

    const { error: upProfileErr } = await supabase
      .from('profiles')
      .update({ avatar_url: publicUrl })
      .eq('id', user.id);

    if (upProfileErr) {
      return NextResponse.json({ error: 'profile_update_failed', details: upProfileErr.message }, { status: 400 });
    }

    return NextResponse.json({ ok: true, url: publicUrl }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: 'unexpected', details: String(e?.message || e) }, { status: 500 });
  }
}