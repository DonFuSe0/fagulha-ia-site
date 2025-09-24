import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { model = "standard", resolution = "512x512", steps = 20, advancedFeatures = {} } = body

    const baseCost = 1
    let resolutionMultiplier = 1.0
    let stepsMultiplier = 1.0
    let modelMultiplier = 1.0

    // Resolution cost multiplier
    switch (resolution) {
      case "512x512":
        resolutionMultiplier = 1.0
        break
      case "768x768":
        resolutionMultiplier = 1.5
        break
      case "1024x1024":
        resolutionMultiplier = 2.0
        break
      case "1024x1536":
      case "1536x1024":
        resolutionMultiplier = 2.5
        break
      default:
        resolutionMultiplier = 1.0
    }

    // Steps multiplier (more steps = higher quality but more cost)
    if (steps > 20) {
      stepsMultiplier = 1.0 + (steps - 20) * 0.05
    }

    // Model multiplier
    switch (model) {
      case "standard":
        modelMultiplier = 1.0
        break
      case "premium":
        modelMultiplier = 1.5
        break
      case "ultra":
        modelMultiplier = 2.0
        break
      default:
        modelMultiplier = 1.0
    }

    // Calculate final cost
    const finalCost = Math.ceil(baseCost * resolutionMultiplier * stepsMultiplier * modelMultiplier)
    const cost = Math.max(finalCost, 1) // Minimum cost is 1 token

    return NextResponse.json({
      cost,
      breakdown: {
        baseCost,
        resolutionMultiplier,
        stepsMultiplier,
        modelMultiplier,
        finalCost: cost,
      },
    })
  } catch (error) {
    console.error("Error calculating cost:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
