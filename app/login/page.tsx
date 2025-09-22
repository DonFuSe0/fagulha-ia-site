'use client'; // Importante: indica que este é um componente de cliente

import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const handleLoginWithGoogle = async () => {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${location.origin}/auth/callback`, // Redireciona de volta para o site após o login
      },
    });
  };

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      height: '100vh', 
      backgroundColor: '#111', 
      color: 'white' 
    }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '2rem', color: '#9333ea' }}>Login - Fagulha.ia</h1>
      <button 
        onClick={handleLoginWithGoogle}
        style={{
          backgroundColor: '#9333ea',
          color: 'white',
          padding: '10px 20px',
          border: 'none',
          borderRadius: '5px',
          fontSize: '1rem',
          cursor: 'pointer'
        }}
      >
        Entrar com Google
      </button>
    </div>
  );
}
