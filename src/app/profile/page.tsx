'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabaseClient } from '@/lib/supabase/client';

type Profile = {
  nickname: string | null;
  display_name: string | null;
  avatar_url: string | null;
};

export default function ProfilePage() {
  const supabase = supabaseClient();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<Profile>({
    nickname: '',
    display_name: '',
    avatar_url: null
  });

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.replace('/auth/login');
        return;
      }
      const { data } = await supabase
        .from('profiles')
        .select('nickname, display_name, avatar_url')
        .eq('id', user.id)
        .single();
      setProfile({
        nickname: data?.nickname ?? '',
        display_name: data?.display_name ?? '',
        avatar_url: data?.avatar_url ?? null
      });
      setLoading(false);
    })();
  }, [router, supabase]);

  async function handleAvatar(file: File) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const ext = file.name.split('.').pop();
    const path = `${user.id}/${Date.now()}.${ext || 'png'}`;

    const { error: upErr } = await supabase.storage
      .from('avatars')
      .upload(path, file, { upsert: true });
    if (upErr) {
      alert('Falha no upload do avatar');
      return;
    }

    const { data: pub } = supabase.storage.from('avatars').getPublicUrl(path);

    const { error: updErr } = await supabase
      .from('profiles')
      .update({ avatar_url: pub.publicUrl })
      .eq('id', user.id);
    if (updErr) {
      alert('Falha ao atualizar avatar');
      return;
    }
    setProfile((p) => ({ ...p, avatar_url: pub.publicUrl }));
  }

  async function saveProfile() {
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('profiles')
      .update({
        nickname: profile.nickname,
        display_name: profile.display_name
      })
      .eq('id', user.id);
    setSaving(false);
    if (error) {
      alert('Erro ao salvar perfil');
    } else {
      alert('Perfil atualizado!');
    }
  }

  if (loading) return <p>Carregando...</p>;

  return (
    <div className="max-w-xl mx-auto space-y-4">
      <h1 className="text-2xl font-semibold">Perfil</h1>
      <div className="flex items-center gap-4">
        <img
          src={profile.avatar_url ?? '/avatar-placeholder.png'}
          alt="Avatar"
          className="h-16 w-16 rounded-full object-cover border border-border"
        />
        <label className="btn-secondary cursor-pointer">
          Enviar avatar
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleAvatar(f);
            }}
          />
        </label>
      </div>

      <div className="space-y-2">
        <label className="block text-sm">Apelido</label>
        <input
          className="w-full rounded-xl bg-surface border border-border px-3 py-2"
          value={profile.nickname ?? ''}
          onChange={(e) => setProfile((p) => ({ ...p, nickname: e.target.value }))}
        />
      </div>
      <div className="space-y-2">
        <label className="block text-sm">Nome de exibição</label>
        <input
          className="w-full rounded-xl bg-surface border border-border px-3 py-2"
          value={profile.display_name ?? ''}
          onChange={(e) => setProfile((p) => ({ ...p, display_name: e.target.value }))}
        />
      </div>

      <button onClick={saveProfile} disabled={saving} className="btn-primary">
        {saving ? 'Salvando...' : 'Salvar'}
      </button>
    </div>
  );
}
