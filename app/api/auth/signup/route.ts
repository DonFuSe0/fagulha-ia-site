import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import crypto from "crypto";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "nodejs";

type Payload = { email?: string; password?: string; nickname?: string | null };

function getMinLen() {
  // você pode definir MIN_PASSWORD_LENGTH ou NEXT_PUBLIC_MIN_PASSWORD_LENGTH
  const envMin = parseInt(
    process.env.MIN_PASSWORD_LENGTH ||
      process.env.NEXT_PUBLIC_MIN_PASSWORD_LENGTH ||
      "6",
    10
  );
  return Number.isFinite(envMin) && envMin > 0 ? envMin : 6;
}

async function readPayload(req: Request): Promise<Payload> {
  const ct = req.headers.get("content-type") || "";
  if (ct.includes("application/json")) {
    try {
      return await req.json();
    } catch {
      return {};
    }
  }
  try {
    const fd = await req.formData();
    return {
      email: (fd.get("email") as string | null) || undefined,
      password: (fd.get("password") as string | null) || undefined,
      nickname: (fd.get("nickname") as string | null) || null,
    };
  } catch {
    return {};
  }
}

function jerr(message: string, status = 400) {
  return NextResponse.json({ ok: false, error: message }, { status });
}

export async function POST(req: Request) {
  const supabase = createRouteHandlerClient<any>({ cookies });

  try {
    const body = await readPayload(req);
    const email = (body.email || "").trim().toLowerCase();
    const password = (body.password || "").trim();
    const nickname = (body.nickname || null);
    if (!email || !password) return jerr("missing_credentials", 400);

    const minLen = getMinLen();
    if (password.length < minLen) return jerr("weak_password", 400);

    // bloqueio 30 dias por exclusão anterior
    const emailHash = crypto.createHash("sha256").update(email).digest("hex");
    const { data: del } = await supabase
      .from("account_deletions")
      .select("id, ban_until")
      .eq("email_hash", emailHash)
      .gt("ban_until", new Date().toISOString())
      .limit(1)
      .maybeSingle();
    if (del) return jerr("signup_blocked_30d", 403);

    const callbackUrl = new URL("/auth/callback", req.url).toString();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: callbackUrl,
        data: nickname ? { nickname } : undefined,
      },
    });

    if (error) {
      const m = error.message?.toLowerCase() || "";
      if (m.includes("already") && m.includes("registered"))
        return jerr("email_already_registered", 409);
      return jerr("supabase_signup_error:" + error.message, 400);
    }

    const ct = req.headers.get("content-type") || "";
    if (ct.includes("application/json")) {
      return NextResponse.json({ ok: true, id: data.user?.id ?? null });
    }
    return NextResponse.redirect(new URL("/auth/confirmar-email", req.url));
  } catch (e: any) {
    console.error("signup_error", e?.stack || e?.message || e);
    return jerr("internal_error", 500);
  }
}
