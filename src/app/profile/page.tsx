'use client';

import { useEffect, useState } from 'react';
import { supabaseClient } from '@/lib/supabase/client';

export default function ProfilePage() {
  const supabase = supabaseClient();
  const [loading, setLoading] = useState(true);
  const [errorMsg, setError] = useState<string>();
  const [okMsg, setOk] = useState<string>();
  const [displayName, setDisplayName] = useState('');
  const [nickname, setNickname] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string|undefined>();

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      const { data } = await supabase
        .from('profiles')
        .select('display_name, nickname, avatar_url')
        .eq('id', user.id)
        .maybeSingle();

      if (data) {
        setDisplayName(data.display_name || '');
        setNickname(data.nickname || '');
        setAvatarUrl(data.avatar_url || undefined);
      }
      setLoading(false);
    })();
  }, [supabase]);

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault(); setError(undefined); setOk(undefined);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('profiles')
      .update({ display_name: displayName, nickname })
      .eq('id', user.id);

    if (error) setError(error.message);
    else setOk('Perfil atualizado com sucesso.');
  }

  async function uploadAvatar(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(undefined); setOk(undefined);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const path = `${user.id}/${Date.now()}_${file.name}`;
    const up = await supabase.storage.from('avatars').upload(path, file, { upsert: true });
    if (up.error) { setError(up.error.message); return; }

    const url = supabase.storage.from('avatars').getPublicUrl(path).data.publicUrl;
    const { error } = await supabase.from('profiles').update({ avatar_url: url }).eq('id', user.id);
    if (error) setError(error.message); else { setAvatarUrl(url); setOk('Avatar atualizado.'); }
  }

  async function changePassword(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setError(undefined); setOk(undefined);
    const form = new FormData(e.currentTarget);
    const pwd = String(form.get('new_password') || '');
    if (pwd.length < 6) { setError('A senha deve ter pelo menos 6 caracteres.'); return; }
    const { error } = await supabase.auth.updateUser({ password: pwd });
    if (error) setError(error.message); else setOk('Senha alterada com sucesso.');
  }

  async function deleteAccount() {
    setError(undefined); setOk(undefined);
    // Nota: exclusão total segura normalmente requer uma função admin (service role) em rota API.
    // Aqui apenas desloga e informa. Implemente a deleção definitiva depois por uma rota protegida.
    await supabase.auth.signOut();
    window.location.href = '/';
  }

  if (loading) return <main className="p-6 text-[var(--text)]">Carregando…</main>;

  return (
    <main className="mx-auto max-w-2xl p-6 text-[var(--text)] space-y-8">
      <h1 className="text-2xl font-semibold">Perfil</h1>

      <section className="space-y-3">
        <h2 className="text-lg font-medium">Avatar</h2>
        <div className="flex items-center gap-3">
          {avatarUrl
            ? <img src={avatarUrl} alt="Avatar" className="h-16 w-16 rounded-full border border-[var(--border)] object-cover" />
            : <div className="h-16 w-16 rounded-full border border-[var(--border)]" />
          }
          <input type="file" accept="image/*" onChange={uploadAvatar} />
        </div>
      </section>

      <form onSubmit={saveProfile} className="space-y-3">
        <h2 className="text-lg font-medium">Informações</h2>
        <input value={displayName} onChange={e=>setDisplayName(e.target.value)} placeholder="Nome de exibição" className="w-full rounded border border-[var(--border)] bg-[var(--surface)] p-2" />
        <input value={nickname} onChange={e=>setNickname(e.target.value)} placeholder="Apelido" className="w-full rounded border border-[var(--border)] bg-[var(--surface)] p-2" />
        <button className="rounded bg-[var(--primary)] px-4 py-2 text-white">Salvar</button>
      </form>

      <form onSubmit={changePassword} className="space-y-3">
        <h2 className="text-lg font-medium">Alterar senha</h2>
        <input name="new_password" type="password" placeholder="Nova senha" className="w-full rounded border border-[var(--border)] bg-[var(--surface)] p-2" />
        <button className="rounded bg-[var(--primary)] px-4 py-2 text-white">Alterar senha</button>
      </form>

      <section className="space-y-3">
        <h2 className="text-lg font-medium">Conta</h2>
        <button onClick={deleteAccount} className="rounded bg-[var(--danger)] px-4 py-2 text-white">Excluir conta</button>
      </section>

      {errorMsg && <p className="text-[var(--danger)]">{errorMsg}</p>}
      {okMsg && <p className="text-[var(--success)]">{okMsg}</p>}
    </main>
  );
}
