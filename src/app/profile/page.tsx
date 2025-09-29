'use client';

import { useEffect, useState } from 'react';
import { supabaseBrowser } from '@/lib/supabase/client';

export default function ProfilePage() {
  const supabase = supabaseBrowser();
  const [loading, setLoading] = useState(true);
  const [errorMsg, setError] = useState<string>();
  const [okMsg, setOk] = useState<string>();
  const [displayName, setDisplayName] = useState('');
  const [nickname, setNickname] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>();

  useEffect(() => {
    (async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();
      if (error || !user) {
        setError('Você precisa estar logado.');
        setLoading(false);
        return;
      }
      const { data: profile } = await supabase
        .from('profiles')
        .select('display_name,nickname,avatar_url')
        .eq('id', user.id)
        .maybeSingle();
      setDisplayName(profile?.display_name || '');
      setNickname(profile?.nickname || '');
      setAvatarUrl(profile?.avatar_url || undefined);
      setLoading(false);
    })();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function uploadAvatar(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Não autenticado');
      const filePath = `avatars/${user.id}-${Date.now()}-${file.name}`;
      const { error: upErr } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });
      if (upErr) throw upErr;
      const { data } = await supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);
      setAvatarUrl(data.publicUrl);
      setOk('Avatar atualizado.');
      setError(undefined);
    } catch (err: any) {
      setError(err.message || 'Erro ao enviar avatar');
    }
  }

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Não autenticado');
      const { error } = await supabase
        .from('profiles')
        .update({
          display_name: displayName || null,
          nickname: nickname || null,
          avatar_url: avatarUrl || null,
        })
        .eq('id', user.id);
      if (error) throw error;
      setOk('Perfil salvo com sucesso.');
      setError(undefined);
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar perfil');
    }
  }

  if (loading) return <p>Carregando…</p>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Seu perfil</h1>

      {errorMsg && <p className="text-[var(--danger)]">{errorMsg}</p>}
      {okMsg && <p className="text-[var(--success)]">{okMsg}</p>}

      <section className="space-y-3">
        <h2 className="text-lg font-medium">Avatar</h2>
        <div className="flex items-center gap-3">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt="Avatar"
              className="h-16 w-16 rounded-full border border-[var(--border)] object-cover"
            />
          ) : (
            <div className="h-16 w-16 rounded-full border border-[var(--border)]" />
          )}
          <input type="file" accept="image/*" onChange={uploadAvatar} />
        </div>
      </section>

      <form onSubmit={saveProfile} className="space-y-3">
        <h2 className="text-lg font-medium">Informações</h2>
        <input
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          className="w-full rounded border border-[var(--border)] bg-[var(--surface)] p-2 text-[var(--text)]"
          placeholder="Nome de exibição"
        />
        <input
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          className="w-full rounded border border-[var(--border)] bg-[var(--surface)] p-2 text-[var(--text)]"
          placeholder="Apelido"
        />
        <button className="rounded bg-[var(--primary)] px-4 py-2 text-white">
          Salvar
        </button>
      </form>
    </div>
  );
}
