'use client';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
export default function UserMenu() {
  const router = useRouter();
  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
  };
  return (
    <div className="relative">
      <div className="w-10 h-10 bg-purple-500 rounded-full cursor-pointer"></div>
      <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-md shadow-lg py-1 z-50">
        <a href="/gallery" className="block px-4 py-2 text-sm text-gray-300 hover:bg-purple-600">Minha Galeria</a>
        <a href="/tokens" className="block px-4 py-2 text-sm text-gray-300 hover:bg-purple-600">Comprar Tokens</a>
        <button onClick={handleSignOut} className="w-full text-left block px-4 py-2 text-sm text-gray-300 hover:bg-purple-600">Sair</button>
      </div>
    </div>
  );
}
