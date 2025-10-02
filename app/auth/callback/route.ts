import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "nodejs";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const code = url.searchParams.get("code");
    const supabase = createRouteHandlerClient<any>({ cookies });

    if (code) {
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (error) {
        console.error("callback_exchange_error", error.message);
        return NextResponse.redirect(new URL("/auth/login?err=callback", req.url));
      }
    }
    return NextResponse.redirect(new URL("/dashboard", req.url));
  } catch (e: any) {
    console.error("callback_500", e?.message || e);
    return NextResponse.redirect(new URL("/auth/login?err=callback500", req.url));
  }
}
