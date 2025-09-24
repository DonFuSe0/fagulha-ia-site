import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params; // <- sem await
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: image, error } = await supabase
      .from("images")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !image) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const progress =
      image.status === "completed" ? 100 :
      image.status === "failed" ? 0 : 50;

    return NextResponse.json({
      id: image.id,
      status: image.status,
      progress,
      image_url: image.image_url,
      thumbnail_url: image.thumbnail_url,
      error_message: image.error_message,
      generation_time: image.generation_time,
    });
  } catch (e: any) {
    console.error("Error fetching image status:", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
