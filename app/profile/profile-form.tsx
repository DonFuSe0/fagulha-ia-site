'use client';

import { useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import { Database } from '@/lib/database.types';
import { User } from '@supabase/supabase-js';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Image from 'next/image';

type Profile = Database['public']['Tables']['profiles']['Row'];

export default function ProfileForm({ profile, user }: { profile: Profile; user: User }) {
  const supabase = createClientComponentClient<Database>();
  const router = useRouter();
  const [fullName, setFullName] = useState(profile.full_name || '');
  const [username, setUsername] = useState(profile.username || '');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: fullName,
        username: username,
      })
      .eq('id', user.id);

    if (error) {
      setMessage(`Erro ao atualizar: ${error.message}`);
    } else {
      setMessage('Perfil atualizado com sucesso!');
      // Força a atualização do Header e outras partes do site que usam esses dados.
      router.refresh();
    }
    setLoading(false);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      <div className="md:col-span-1 flex flex-col items-center">
        <Image
          src={profile.avatar_url || `https://api.dicebear.com/8.x/bottts/svg?seed=${user.id}`}
          alt="Avatar"
          width={150}
          height={150}
          className="rounded-full border-4 border-purple-500 mb-4"
        />
        <h2 className="text-xl font-bold">{profile.username}</h2>
        <p className="text-sm text-gray-400">{user.email}</p>
        {/* O botão de upload de avatar será adicionado aqui no futuro */}
      </div>

      <div className="md:col-span-2">
        <form onSubmit={handleUpdateProfile} className="space-y-6 bg-gray-800/50 p-6 rounded-lg">
          <div>
            <Label htmlFor="email">E-mail</Label>
            <Input id="email" type="email" value={user.email} disabled className="bg-gray-700 border-gray-600" />
            <p className="text-xs text-gray-400 mt-1">O e-mail não pode ser alterado.</p>
          </div>
          <div>
            <Label htmlFor="fullName">Nome Completo</Label>
            <Input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e ) => setFullName(e.target.value)}
              className="bg-gray-900 border-gray-600"
            />
          </div>
          <div>
            <Label htmlFor="username">Nick (Apelido)</Label>
            <Input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="bg-gray-900 border-gray-600"
            />
          </div>
          <div>
            <Button type="submit" disabled={loading} className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700">
              {loading ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </div>
          {message && <p className="text-center mt-4">{message}</p>}
        </form>
      </div>
    </div>
  );
}
