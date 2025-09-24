import { NextResponse, type NextRequest } from "next/server";
import { createServerClient as createSupabaseServerClient } from "@supabase/ssr";

export async function updateSession(request: NextRequest) {
  const response = NextResponse.next();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  const supabase = createSupabaseServerClient(url, anon, {
    cookies: {
      get: (name) => request.cookies.get(name)?.value,
      set: (name, value, options) => response.cookies.set(name, value, options),
      remove: (name, options) => response.cookies.set(name, "", { ...options, maxAge: 0 }),
    },
  });

  // força refresh da sessão (evita sessão "morta")
  await supabase.auth.getUser();

  // Rotas que exigem login — ajuste conforme seu app
  const protectedPrefixes = ["/dashboard", "/generate", "/my-gallery", "/checkout", "/profile"];
  const needsAuth = protectedPrefixes.some((p) => request.nextUrl.pathname.startsWith(p));

  if (needsAuth) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user && !request.nextUrl.pathname.startsWith("/auth")) {
      const url = request.nextUrl.clone();
      url.pathname = "/auth/login";
      url.searchParams.set("redirectedFrom", request.nextUrl.pathname);
      return NextResponse.redirect(url);
    }
  }

  return response;
}
