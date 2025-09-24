import { createServerClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { planName, amount, tokens, paymentMethod } = await request.json()

    if (!planName || !amount || !tokens) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Criar pagamento no banco
    const { data: paymentId, error } = await supabase.rpc("create_payment", {
      plan_name: planName,
      amount_brl: amount,
      tokens_purchased: tokens,
    })

    if (error) {
      console.error("Error creating payment:", error)
      return NextResponse.json({ error: "Failed to create payment" }, { status: 500 })
    }

    // Simular geração de PIX (em produção, integrar com gateway real)
    const pixKey = `fagulha.${paymentId}.${Date.now()}`
    const qrCode = `data:image/svg+xml;base64,${Buffer.from(`
      <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
        <rect width="200" height="200" fill="white"/>
        <text x="100" y="100" textAnchor="middle" fontFamily="Arial" fontSize="12">
          QR Code PIX
        </text>
        <text x="100" y="120" textAnchor="middle" fontFamily="Arial" fontSize="8">
          R$ ${amount.toFixed(2)}
        </text>
      </svg>
    `).toString("base64")}`

    // Atualizar pagamento com dados do PIX
    await supabase
      .from("payments")
      .update({
        payment_id: pixKey,
        payment_url: qrCode,
      })
      .eq("id", paymentId)

    return NextResponse.json({
      paymentId,
      qrCode,
      pixKey,
      expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
    })
  } catch (error) {
    console.error("Error in create payment API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
