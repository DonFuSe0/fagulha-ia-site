
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "nodejs";

function getMinLen() {
  const envMin = parseInt(process.env.MIN_PASSWORD_LENGTH || process.env.NEXT_PUBLIC_MIN_PASSWORD_LENGTH || "6", 10);
  return Number.isFinite(envMin) && envMin > 0 ? envMin : 6;
}

function j(body: any, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
}

function clientIpFrom(req: Request): string {
  const h = (name: string) => req.headers.get(name) || "";
  const chain = (h("x-real-ip") || h("x-forwarded-for") || "").split(",")[0].trim();
  return chain || "0.0.0.0";
}

export async function POST(req: Request) {
  const anon = createRouteHandlerClient<any>({ cookies });
  const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false } });

  try {
    const ct = req.headers.get("content-type") || "";
    let email = "", password = "", nickname: string | null = null;
    if (ct.includes("application/json")) {
      const b = await req.json().catch(()=>({}));
      email = (b.email || "").trim().toLowerCase();
      password = (b.password || "").trim();
      nickname = (b.nickname || null);
    } else {
      const fd = await req.formData();
      email = String(fd.get("email")||"").trim().toLowerCase();
      password = String(fd.get("password")||"").trim();
      nickname = (fd.get("nickname") as string | null) || null;
    }

    if (!email || !password) return j({ ok:false, error:"missing_credentials" }, 400);
    const minLen = getMinLen();
    if (password.length < minLen) return j({ ok:false, error:"weak_password" }, 400);

    const emailHash = crypto.createHash("sha256").update(email).digest("hex");
    const ip = clientIpFrom(req);
    const ipHash = crypto.createHash("sha256").update(ip).digest("hex");

    // Ban por email (30 dias após exclusão)
    const { data: del } = await admin
      .from("account_deletions")
      .select("id, ban_until")
      .eq("email_hash", emailHash)
      .gt("ban_until", new Date().toISOString())
      .limit(1)
      .maybeSingle();
    if (del) return j({ ok:false, error:"signup_blocked_30d" }, 403);

    // Ban por IP (30 dias)
    const nowIso = new Date().toISOString();
    const { data: guard } = await admin
      .from("signup_guards")
      .select("id, blocked_until")
      .eq("ip_hash", ipHash)
      .gt("blocked_until", nowIso)
      .limit(1)
      .maybeSingle();
    if (guard) return j({ ok:false, error:"too_many_signups_from_ip" }, 429);

    // SignUp
    const callbackUrl = new URL("/auth/callback", req.url).toString();
    const { data, error } = await anon.auth.signUp({
      email, password,
      options: { emailRedirectTo: callbackUrl, data: nickname ? { nickname } : undefined }
    });
    if (error) {
      const m = error.message?.toLowerCase() || "";
      if (m.includes("already") && m.includes("registered")) return j({ ok:false, error:"email_already_registered" }, 409);
      return j({ ok:false, error:"supabase_signup_error:"+error.message }, 400);
    }

    const userId = data.user?.id;
    if (userId && nickname && nickname.trim()) {
      const { data: prof } = await admin.from("profiles").select("id, nickname").eq("id", userId).maybeSingle();
      if (!prof || !prof.nickname) {
        await admin.from("profiles").update({ nickname: nickname.trim() }).eq("id", userId);
      }
    }

    // Guarda IP por 30 dias
    const blockForMs = 30 * 24 * 60 * 60 * 1000;
    const blockedUntil = new Date(Date.now() + blockForMs).toISOString();
    await admin.from("signup_guards").upsert({ ip_hash: ipHash, blocked_until: blockedUntil });

    if (ct.includes("application/json")) return j({ ok:true, id: data.user?.id ?? null }, 200);
    return NextResponse.redirect(new URL("/auth/confirmar-email", req.url));
  } catch (e: any) {
    console.error("signup_error", e?.message || e);
    return j({ ok:false, error:"internal_error" }, 500);
  }
}
