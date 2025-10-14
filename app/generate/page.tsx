import { redirect } from 'next/navigation';
import { supabaseServer } from '@/lib/supabase/serverClient';
import GenerateAnimations from './GenerateAnimations';

/**
 * Página de geração. Nesta primeira versão é apenas um placeholder para a
 * funcionalidade de geração de imagens. Apenas usuários autenticados
 * conseguem acessar.
 */
export default async function GeneratePage() {
  const supabase = supabaseServer();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) {
    redirect('/auth/login');
  }
  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      {/* Gradiente animado de fundo */}
      <div className="pointer-events-none absolute inset-0 -z-10 animate-gradient-move">
        <div className="absolute left-1/2 top-0 -translate-x-1/2 w-[900px] h-[900px] rounded-full blur-3xl opacity-30 animate-pulse"
          style={{background: 'radial-gradient(ellipse at 60% 40%, #818cf8 0%, #34d399 60%, transparent 100%)'}} />
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] rounded-full blur-2xl opacity-20 animate-spin-slow"
          style={{background: 'radial-gradient(ellipse at 80% 80%, #ff7a18 0%, #0f172a 70%)'}} />
      </div>
      <div className="w-full max-w-xl space-y-4 bg-zinc-900/70 p-8 rounded-2xl border border-zinc-800 shadow-xl shadow-black/30 backdrop-blur">
  <h1 className="text-3xl font-bold text-white drop-shadow-[0_2px_16px_rgba(129,140,248,0.18)]">Gerar Imagem</h1>
        <p className="text-gray-300 drop-shadow-[0_2px_8px_rgba(0,0,0,0.18)]">
          Aqui futuramente você poderá gerar imagens com IA. Por enquanto,
          esta página é um espaço reservado para o recurso de geração.
        </p>
      </div>
      
      {/* Animations CSS */}
      <GenerateAnimations />
    </div>
  );
}