import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "nodejs";

function redirectTo(req: Request, path: string) {
  return new Response(null, { status: 302, headers: { Location: new URL(path, req.url).toString() } });
}

export async function POST(req: Request) {
  const supa = createRouteHandlerClient<any>({ cookies });
  const { data: { user } } = await supa.auth.getUser();
  if (!user) return redirectTo(req, "/auth/login");

  const form = await req.formData();
  const nickname = ((form.get("nickname") as string | null) || "").trim();

  if (!nickname || nickname.length < 3 || nickname.length > 20 || !/^[A-Za-z0-9_]+$/.test(nickname)) {
    return redirectTo(req, "/settings?tab=perfil&toast=nick_fail");
  }

  const { error } = await supa.from("profiles").update({ nickname }).eq("id", user.id);
  if (error) {
    if ((error as any).code === "23505") {
      return redirectTo(req, "/settings?tab=perfil&toast=nick_dup");
    }
    return redirectTo(req, "/settings?tab=perfil&toast=nick_fail");
  }
  return redirectTo(req, "/settings?tab=perfil&toast=perfil_ok");
}
