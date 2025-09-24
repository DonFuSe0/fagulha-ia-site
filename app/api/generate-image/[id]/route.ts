import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = await createClient()

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get image record
    const { data: image, error: imageError } = await supabase
      .from("images")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single()

    if (imageError || !image) {
      return NextResponse.json({ error: "Image not found" }, { status: 404 })
    }

    // Calculate progress based on status
    let progress = 0
    switch (image.status) {
      case "pending":
        progress = 10
        break
      case "processing":
        progress = 50
        break
      case "completed":
        progress = 100
        break
      case "failed":
        progress = 0
        break
    }

    return NextResponse.json({
      id: image.id,
      status: image.status,
      progress,
      image_url: image.image_url,
      thumbnail_url: image.thumbnail_url,
      error_message: image.error_message,
      generation_time: image.generation_time,
    })
  } catch (error) {
    console.error("Error fetching image status:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
