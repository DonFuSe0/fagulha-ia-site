// middleware.ts
import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export function middleware(request: NextRequest) {
  return updateSession(request);
}

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
