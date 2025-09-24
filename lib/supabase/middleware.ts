import { NextResponse, type NextRequest } from "next/server";
import { createMiddlewareClient } from "@supabase/ssr";

/**
 * Middleware seguro para Edge Runtime.
 * - Atualiza/renova a sessão (sb- cookies)
 * - Bloqueia rotas privadas se não logado
 */
export async function updateSession(request: NextRequest) {
  const response = NextResponse.next();

  // Cliente próprio para MIDDLEWARE (Edge), sem Node APIs
  const supabase = createMiddlewareClient(
    { req: request, res: response },
    {
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
      supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    }
  );

  // Garante refresh da sessão se necessário
  await supabase.auth.getSession();

  // Liste aqui os prefixos que exigem login
  const protectedPrefixes = ["/dashboard", "/generate", "/my-gallery", "/checkout", "/profile"];
  const needsAuth = protectedPrefixes.some((p) => request.nextUrl.pathname.startsWith(p));

  if (needsAuth) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user && !request.nextUrl.pathname.startsWith("/auth")) {
      const url = request.nextUrl.clone();
      url.pathname = "/auth/login";
      url.searchParams.set("redirectedFrom", request.nextUrl.pathname);
      return NextResponse.redirect(url);
    }
  }

  return response;
}
