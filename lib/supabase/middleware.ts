import { NextResponse, type NextRequest } from "next/server";
import { createMiddlewareClient } from "@supabase/ssr";

export async function updateSession(request: NextRequest) {
  const response = NextResponse.next();

  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) return response;

    const supabase = createMiddlewareClient(
      { req: request, res: response },
      { supabaseUrl: url, supabaseKey: key }
    );

    await supabase.auth.getSession();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = "/auth/login";
      url.searchParams.set("next", request.nextUrl.pathname);
      return NextResponse.redirect(url);
    }

    return response;
  } catch {
    return response;
  }
}
