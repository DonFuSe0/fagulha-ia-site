import { createServerClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient()
    const { paymentId, status } = await request.json()

    if (!paymentId || !status) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    if (status === "approved" || status === "completed") {
      // Processar pagamento aprovado
      const { data: success, error } = await supabase.rpc("process_payment_success", {
        payment_uuid: paymentId,
      })

      if (error) {
        console.error("Error processing payment:", error)
        return NextResponse.json({ error: "Failed to process payment" }, { status: 500 })
      }

      if (success) {
        return NextResponse.json({ message: "Payment processed successfully" })
      } else {
        return NextResponse.json({ error: "Payment not found" }, { status: 404 })
      }
    } else if (status === "cancelled" || status === "failed") {
      // Atualizar status para cancelado/falhou
      await supabase
        .from("payments")
        .update({
          payment_status: status,
          updated_at: new Date().toISOString(),
        })
        .eq("id", paymentId)

      return NextResponse.json({ message: "Payment status updated" })
    }

    return NextResponse.json({ message: "Status not handled" })
  } catch (error) {
    console.error("Error in payment webhook:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
