import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export function middleware(request: NextRequest) {
  return updateSession(request);
}

/**
 * Protegemos apenas rotas privadas.
 * (Landing, auth e assets ficam fora do fluxo do middleware)
 */
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/generate/:path*",
    "/my-gallery/:path*",
    "/checkout/:path*",
    "/profile/:path*",
    "/social/:path*",
  ],
};
