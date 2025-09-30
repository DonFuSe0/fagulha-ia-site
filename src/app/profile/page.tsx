'use client';

import { useEffect, useState } from 'react';
import supabaseBrowser from '@/lib/supabase/client';

export default function ProfilePage() {
  const supabase = supabaseBrowser();
  const [loading, setLoading] = useState(true);
  const [displayName, setDisplayName] = useState('');
  const [nickname, setNickname] = useState('');

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      const { data, error } = await supabase
        .from('profiles')
        .select('display_name, nickname')
        .eq('id', user.id)
        .single();

      if (!error && data) {
        setDisplayName(data.display_name ?? '');
        setNickname(data.nickname ?? '');
      }
      setLoading(false);
    })();
  }, [supabase]);

  async function onSave() {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Não autenticado');

      const { error } = await supabase
        .from('profiles')
        .update({
          display_name: displayName,
          nickname,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) throw error;
      alert('Perfil atualizado!');
    } catch (e: any) {
      alert(e?.message ?? 'Falha ao salvar perfil');
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <div className="p-6">Carregando…</div>;

  return (
    <div className="mx-auto mt-6 w-full max-w-xl space-y-6 rounded-2xl border bg-white p-6 shadow">
      <h1 className="text-xl font-semibold">Perfil</h1>
      <div className="space-y-4">
        <div>
          <label className="mb-1 block text-sm">Nome de exibição</label>
          <input
            value={displayName}
            onChange={e => setDisplayName(e.target.value)}
            className="w-full rounded-lg border px-3 py-2 text-sm outline-none"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm">Apelido</label>
          <input
            value={nickname}
            onChange={e => setNickname(e.target.value)}
            className="w-full rounded-lg border px-3 py-2 text-sm outline-none"
          />
        </div>
      </div>
      <button
        onClick={onSave}
        className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-black/85"
      >
        Salvar
      </button>
    </div>
  );
}
