import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "nodejs";

function j(body: any, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

export async function GET(req: Request) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return j({ ok: false, error: "missing_supabase_env" }, 500);

  const secret = req.headers.get("x-cron-secret");
  if (!secret || secret !== process.env.CRON_SECRET) {
    return j({ ok: false, error: "unauthorized" }, 401);
  }

  const supa = createClient(url, key);

  // NOTE: Para manter simples e estável, retornamos OK aqui.
  // Seu purge real pode rodar deletes em generations/storage conforme sua regra.
  // Exemplo de no-op seguro:
  return j({ ok: true, message: "purge noop (compile-safe)" }, 200);
}
