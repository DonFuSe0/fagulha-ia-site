import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/middleware'; // Vamos criar este arquivo já já

export async function middleware(request: NextRequest) {
  try {
    const { supabase, response } = createClient(request);

    // Atualiza a sessão do usuário baseada no cookie da requisição.
    await supabase.auth.getSession();

    return response;
  } catch (e) {
    // Se ocorrer um erro, retorna uma resposta simples.
    return NextResponse.next({
      request: {
        headers: request.headers,
      },
    });
  }
}

export const config = {
  matcher: [
    /*
     * Corresponde a todas as rotas de requisição, exceto as seguintes:
     * - _next/static (arquivos estáticos)
     * - _next/image (arquivos de otimização de imagem)
     * - favicon.ico (ícone de favoritos)
     * Sinta-se à vontade para modificar isso para atender às suas necessidades.
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
