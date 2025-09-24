import { NextResponse, type NextRequest } from "next/server";
import { createMiddlewareClient } from "@supabase/ssr";

/**
 * Middleware seguro para Edge:
 * - Só roda em rotas protegidas (config do matcher no middleware.ts)
 * - Não quebra em produção: fallback NextResponse.next() em qualquer erro
 */
export async function updateSession(request: NextRequest) {
  const response = NextResponse.next();

  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    // Se as envs não estiverem configuradas, não tentamos autenticar
    if (!url || !key) {
      return response;
    }

    const supabase = createMiddlewareClient(
      { req: request, res: response },
      { supabaseUrl: url, supabaseKey: key }
    );

    // Mantém sessão atualizada
    await supabase.auth.getSession();

    // Checa login apenas se a rota for realmente protegida (matcher filtra)
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Se quiser bloquear sem user aqui, você pode redirecionar.
    // Como o matcher só inclui rotas privadas, bloqueamos:
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = "/auth/login";
      url.searchParams.set("redirectedFrom", request.nextUrl.pathname);
      return NextResponse.redirect(url);
    }

    return response;
  } catch {
    // Nunca quebre o site por erro no middleware
    return response;
  }
}
