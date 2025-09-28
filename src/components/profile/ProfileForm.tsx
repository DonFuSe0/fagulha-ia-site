"use client";
import { useState } from 'react';
import { supabaseBrowser } from '@/lib/supabase/client';

interface Profile {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
}

export default function ProfileForm({ profile }: { profile: Profile }) {
  const [displayName, setDisplayName] = useState(profile.display_name ?? '');
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url ?? '');
  const [bio, setBio] = useState(profile.bio ?? '');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setLoading(true);
    const supabase = supabaseBrowser();
    const { error } = await supabase
      .from('profiles')
      .update({ display_name: displayName, avatar_url: avatarUrl, bio })
      .eq('id', profile.id);
    setLoading(false);
    if (error) {
      setMessage(error.message);
    } else {
      setMessage('Perfil atualizado com sucesso');
    }
  };
  return (
    <form onSubmit={handleSave} className="space-y-4">
      <div>
        <label className="block mb-1" htmlFor="displayName">Nome de exibição</label>
        <input
          id="displayName"
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          className="w-full bg-surface border border-border rounded-md p-2 text-text"
        />
      </div>
      <div>
        <label className="block mb-1" htmlFor="avatar">URL do avatar</label>
        <input
          id="avatar"
          type="url"
          value={avatarUrl}
          onChange={(e) => setAvatarUrl(e.target.value)}
          className="w-full bg-surface border border-border rounded-md p-2 text-text"
        />
      </div>
      <div>
        <label className="block mb-1" htmlFor="bio">Bio</label>
        <textarea
          id="bio"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          className="w-full bg-surface border border-border rounded-md p-2 text-text"
          rows={3}
        />
      </div>
      {message && <p className="text-sm text-primary">{message}</p>}
      <button type="submit" className="btn-primary" disabled={loading}>
        {loading ? 'Salvando...' : 'Salvar alterações'}
      </button>
    </form>
  );
}