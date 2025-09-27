// app/auth/callback/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");

  const supabase = await createClient();

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      const url = new URL("/auth/login", request.url);
      url.searchParams.set("error", error.message);
      return NextResponse.redirect(url);
    }
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.redirect(new URL("/auth/login", request.url));
}
