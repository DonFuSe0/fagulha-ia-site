import { createServerClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { imageId } = await request.json()

    if (!imageId) {
      return NextResponse.json({ error: "Image ID required" }, { status: 400 })
    }

    // Usar a função do banco para tornar a imagem pública
    const { data, error } = await supabase.rpc("make_image_public", {
      image_id: imageId,
      user_id: user.id,
    })

    if (error) {
      console.error("Error making image public:", error)
      return NextResponse.json({ error: "Failed to make image public" }, { status: 500 })
    }

    if (!data) {
      return NextResponse.json({ error: "Image not found or unauthorized" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in make-public API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
