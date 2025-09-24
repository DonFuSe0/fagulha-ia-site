import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

// Encaminha para o helper (refresh de sessão + proteção de rotas)
export function middleware(request: NextRequest) {
  return updateSession(request);
}

/**
 * Ajuste aqui o que é público vs protegido:
 * - Mantemos /auth, /api/public e assets como públicos
 * - Todo o resto passa pelo middleware (e será bloqueado se precisar login)
 */
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|auth|api/public).*)",
  ],
};
