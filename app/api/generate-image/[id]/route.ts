// app/api/generate-image/[id]/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * GET /api/generate-image/:id
 * Assinatura correta no Next 15 (App Router):
 * export async function GET(request: Request, { params }: { params: { id: string } })
 */
export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;

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

  // Protege itens não públicos
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
