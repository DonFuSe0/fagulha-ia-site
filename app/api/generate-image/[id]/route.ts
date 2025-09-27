// app/api/generate-image/[id]/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * GET /api/generate-image/:id
 * Retorna os dados da imagem (se existir) para o ID informado.
 *
 * Observação importante:
 * - No Next.js (App Router), a assinatura correta da rota dinâmica é:
 *   export async function GET(request: Request, context: { params: { id: string } })
 * - Evite tipar com NextRequest aqui; use `Request`.
 */
export async function GET(
  _request: Request,
  context: { params: { id: string } }
) {
  const { id } = context.params;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("images")
    .select(
      "id, user_id, prompt, negative_prompt, model, style, resolution, steps, seed, cfg_scale, image_url, thumbnail_url, status, is_public, tokens_used, generation_time, error_message, metadata, expires_at, created_at, updated_at"
    )
    .eq("id", id)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  if (!data) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Se a imagem não for pública e o usuário não for o dono, retorna 403
  if (!data.is_public) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user || user.id !== data.user_id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  return NextResponse.json(data);
}
