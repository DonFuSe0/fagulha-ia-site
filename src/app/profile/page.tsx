// Caminho: src/app/profile/page.tsx
'use client';

import { useEffect, useState } from 'react';
import supabaseClient from '@/lib/supabase/client';

type Profile = {
  display_name: string | null;
  nickname: string | null;
  avatar_url: string | null;
};

export default function ProfilePage() {
  const supabase = supabaseClient();

  const [loading, setLoading] = useState(true);
  const [errorMsg, setError] = useState<string>();
  const [okMsg, setOk] = useState<string>();
  const [displayName, setDisplayName] = useState('');
  const [nickname, setNickname] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>();

  useEffect(() => {
    (async () => {
      setError(undefined);
      setOk(undefined);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError('Você precisa estar logado.');
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('display_name,nickname,avatar_url')
        .eq('id', user.id)
        .maybeSingle<Profile>();

      if (error) {
        setError(error.message);
      } else if (data) {
        setDisplayName(data.display_name || '');
        setNickname(data.nickname || '');
        setAvatarUrl(data.avatar_url || undefined);
      }
      setLoading(false);
    })();
  }, [supabase]);

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    setError(undefined);
    setOk(undefined);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return setError('Sessão expirada.');

    const { error } = await supabase
      .from('profiles')
      .update({ display_name: displayName, nickname })
      .eq('id', user.id);

    if (error) setError(error.message);
    else setOk('Perfil atualizado!');
  }

  async function onAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(undefined);
    setOk(undefined);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return setError('Sessão expirada.');

    const path = `avatars/${user.id}/${Date.now()}_${file.name}`;

    const { error: upErr } = await supabase.storage.from('avatars').upload(path, file, {
      cacheControl: '3600',
      upsert: true,
    });
    if (upErr) return setError(upErr.message);

    const { data: publicUrl } = supabase.storage.from('avatars').getPublicUrl(path);
    const newUrl = publicUrl.publicUrl;

    const { error: updErr } = await supabase
      .from('profiles')
      .update({ avatar_url: newUrl })
      .eq('id', user.id);

    if (updErr) setError(updErr.message);
    else {
      setAvatarUrl(newUrl);
      setOk('Avatar atualizado!');
    }
  }

  if (loading) return <p className="p-4 text-[var(--text)]">Carregando...</p>;

  return (
    <div className="mx-auto max-w-xl p-4 text-[var(--text)]">
      <h1 className="mb-4 text-xl font-semibold">Perfil</h1>

      {errorMsg && <p className="mb-3 text-[var(--danger)]">{errorMsg}</p>}
      {okMsg && <p className="mb-3 text-[var(--success)]">{okMsg}</p>}

      <form onSubmit={saveProfile} className="space-y-3">
        <label className="block">
          <span className="mb-1 block text-sm">Nome de exibição</span>
          <input
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="w-full rounded border border-[var(--border)] bg-[var(--surface)] p-2"
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-sm">Apelido</span>
          <input
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            className="w-full rounded border border-[var(--border)] bg-[var(--surface)] p-2"
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-sm">Avatar</span>
          <input type="file" accept="image/*" onChange={onAvatarChange} />
        </label>

        <button className="rounded bg-[var(--primary)] px-4 py-2 text-white">
          Salvar
        </button>
      </form>

      {avatarUrl && (
        <div className="mt-6">
          <p className="mb-2 text-sm">Prévia do avatar</p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={avatarUrl} alt="Avatar" className="h-20 w-20 rounded-full object-cover" />
        </div>
      )}
    </div>
  );
}
