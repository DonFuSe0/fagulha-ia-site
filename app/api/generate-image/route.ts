import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const {
      prompt,
      negativePrompt = "",
      model = "standard",
      style = "realistic",
      resolution = "512x512",
      steps = 20,
      cfgScale = 7.0,
      seed,
    } = body

    // Validate input
    if (!prompt?.trim()) {
      return NextResponse.json({ error: "Prompt é obrigatório" }, { status: 400 })
    }

    // Calculate cost
    const costResponse = await fetch(`${request.nextUrl.origin}/api/calculate-cost`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model, resolution, steps }),
    })

    if (!costResponse.ok) {
      return NextResponse.json({ error: "Erro ao calcular custo" }, { status: 500 })
    }

    const { cost } = await costResponse.json()

    // Check user tokens
    const { data: profile } = await supabase.from("profiles").select("tokens").eq("id", user.id).single()

    if (!profile || profile.tokens < cost) {
      return NextResponse.json(
        { error: `Tokens insuficientes. Necessário: ${cost}, disponível: ${profile?.tokens || 0}` },
        { status: 400 },
      )
    }

    // Create image record
    const { data: imageRecord, error: imageError } = await supabase
      .from("images")
      .insert({
        user_id: user.id,
        prompt,
        negative_prompt: negativePrompt,
        model,
        style,
        resolution,
        steps,
        cfg_scale: cfgScale,
        seed: seed || Math.floor(Math.random() * 1000000),
        tokens_used: cost,
        status: "pending",
      })
      .select()
      .single()

    if (imageError) {
      return NextResponse.json({ error: "Erro ao criar registro da imagem" }, { status: 500 })
    }

    // Deduct tokens
    const { error: tokenError } = await supabase.rpc("update_user_tokens", {
      p_user_id: user.id,
      p_amount: -cost,
      p_type: "usage",
      p_description: `Geração de imagem: ${prompt.substring(0, 50)}...`,
      p_metadata: { image_id: imageRecord.id, model, resolution, steps },
    })

    if (tokenError) {
      // Rollback image record
      await supabase.from("images").delete().eq("id", imageRecord.id)
      return NextResponse.json({ error: "Erro ao processar tokens" }, { status: 500 })
    }

    // Start generation process (async)
    processImageGeneration(imageRecord.id, {
      prompt,
      negativePrompt,
      model,
      style,
      resolution,
      steps,
      cfgScale,
      seed: imageRecord.seed,
    })

    return NextResponse.json({ imageId: imageRecord.id, cost })
  } catch (error) {
    console.error("Error generating image:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

async function processImageGeneration(imageId: string, params: any) {
  const supabase = await createClient()

  try {
    // Update status to processing
    await supabase.from("images").update({ status: "processing" }).eq("id", imageId)

    // Call ComfyUI API
    const comfyResponse = await fetch("http://191.37.41.0:5066/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt: params.prompt,
        negative_prompt: params.negativePrompt,
        model: params.model,
        style: params.style,
        width: Number.parseInt(params.resolution.split("x")[0]),
        height: Number.parseInt(params.resolution.split("x")[1]),
        steps: params.steps,
        cfg_scale: params.cfgScale,
        seed: params.seed,
      }),
    })

    if (!comfyResponse.ok) {
      throw new Error(`ComfyUI API error: ${comfyResponse.statusText}`)
    }

    const result = await comfyResponse.json()

    // For now, we'll simulate the image generation process
    // In a real implementation, you would handle the actual ComfyUI response
    const imageUrl = `/placeholder.svg?height=512&width=512&query=${encodeURIComponent(params.prompt)}`
    const thumbnailUrl = `/placeholder.svg?height=256&width=256&query=${encodeURIComponent(params.prompt)}`

    // Update image record with results
    await supabase
      .from("images")
      .update({
        status: "completed",
        image_url: imageUrl,
        thumbnail_url: thumbnailUrl,
        generation_time: Math.floor(Math.random() * 30) + 10, // Simulate generation time
      })
      .eq("id", imageId)
  } catch (error) {
    console.error("Error processing image generation:", error)

    // Update status to failed
    await supabase
      .from("images")
      .update({
        status: "failed",
        error_message: error instanceof Error ? error.message : "Unknown error",
      })
      .eq("id", imageId)
  }
}
