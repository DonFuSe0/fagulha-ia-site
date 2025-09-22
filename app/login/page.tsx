'use client';
import { createClient } from '@/lib/supabase/client';
export default function LoginPage() {
  const handleLoginWithGoogle = async () => {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${location.origin}/auth/callback` },
    });
  };
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white">
      <h1 className="text-3xl font-bold mb-8 text-purple-400">Login - Fagulha.ia</h1>
      <button onClick={handleLoginWithGoogle} className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-8 rounded-lg transition-colors">
        Entrar com Google
      </button>
    </div>
  );
}
