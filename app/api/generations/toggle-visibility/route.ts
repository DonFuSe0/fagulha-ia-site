import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "nodejs";

function j(body: any, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

export async function POST(req: Request) {
  const supa = createRouteHandlerClient<any>({ cookies });
  const { data: { user } } = await supa.auth.getUser();
  if (!user) return j({ ok: false, error: "unauthorized" }, 401);

  const { id, makePublic } = await req.json().catch(() => ({}));
  if (!id || typeof makePublic !== "boolean") return j({ ok: false, error: "bad_request" }, 400);

  const nowIso = new Date().toISOString();

  const { data, error } = await supa
    .from("generations")
    .update({
      is_public: makePublic,
      public_at: makePublic ? nowIso : null,
    })
    .eq("id", id)
    .eq("user_id", user.id)
    .select("id, is_public, public_at")
    .single();

  if (error) return j({ ok: false, error: error.message }, 400);

  // Se precisar gerar thumbs/preview, faça isso aqui. 'sharp' pode ser usado opcionalmente:
  // try { const sharp = (await import("sharp")).default; /* ... */ } catch {}

  return j({ ok: true, data });
}
