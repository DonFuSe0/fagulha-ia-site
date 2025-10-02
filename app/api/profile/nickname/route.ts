import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "nodejs";

function r(req: Request, path: string) {
  return new Response(null, { status: 302, headers: { Location: new URL(path, req.url).toString() } });
}

export async function POST(req: Request) {
  const supa = createRouteHandlerClient<any>({ cookies });
  const { data: { user } } = await supa.auth.getUser();
  if (!user) return r(req, "/auth/login");

  const form = await req.formData();
  const raw = ((form.get("nickname") as string | null) || "").trim();
  const nickname = raw;

  if (!nickname || nickname.length < 3 || nickname.length > 20 || !/^[A-Za-z0-9_]+$/.test(nickname)) {
    return r(req, "/settings?tab=perfil&toast=nick_invalid");
  }

  const { error } = await supa.from("profiles").update({ nickname }).eq("id", user.id);
  if (error) {
    const code = (error as any).code || "db_error";
    if (code === "23505") return r(req, "/settings?tab=perfil&toast=nick_dup");
    return r(req, `/settings?tab=perfil&toast=nick_fail_${code}`);
  }
  return r(req, "/settings?tab=perfil&toast=perfil_ok");
}
