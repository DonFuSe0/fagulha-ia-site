import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { createClient } from "@supabase/supabase-js";

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
  const file = form.get("file") as File | null;
  if (!file) return redirectTo(req, "/settings?tab=perfil&toast=avatar_fail");

  const ext = file.type.includes("png") ? "png" : file.type.includes("webp") ? "webp" : "jpg";
  const filename = `${user.id}.${ext}`;

  const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false } });

  // Buffer é mais estável no runtime node
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const { error: upErr } = await admin.storage.from("avatars").upload(filename, buffer, {
    contentType: file.type,
    upsert: true,
  });
  if (upErr) return redirectTo(req, "/settings?tab=perfil&toast=avatar_fail");

  const { data: pub } = admin.storage.from("avatars").getPublicUrl(filename);
  const publicUrl = pub.publicUrl;

  const { error: upProfErr } = await supa.from("profiles").update({ avatar_url: publicUrl }).eq("id", user.id);
  if (upProfErr) return redirectTo(req, "/settings?tab=perfil&toast=avatar_fail");

  return redirectTo(req, "/settings?tab=perfil&toast=avatar_ok");
}
