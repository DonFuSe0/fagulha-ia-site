import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user's current token balance
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("tokens")
      .eq("id", user.id)
      .single()

    if (profileError) {
      return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 })
    }

    // Get recent transactions
    const { data: transactions, error: transactionsError } = await supabase
      .from("token_transactions")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(10)

    if (transactionsError) {
      return NextResponse.json({ error: "Failed to fetch transactions" }, { status: 500 })
    }

    return NextResponse.json({
      balance: profile.tokens,
      transactions: transactions || [],
    })
  } catch (error) {
    console.error("Error fetching token data:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

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
    const { amount, type, description, metadata = {} } = body

    // Validate input
    if (!amount || !type || !description) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Call the database function to update tokens
    const { data, error } = await supabase.rpc("update_user_tokens", {
      p_user_id: user.id,
      p_amount: amount,
      p_type: type,
      p_description: description,
      p_metadata: metadata,
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    // Get updated balance
    const { data: profile } = await supabase.from("profiles").select("tokens").eq("id", user.id).single()

    return NextResponse.json({
      success: true,
      balance: profile?.tokens || 0,
    })
  } catch (error) {
    console.error("Error updating tokens:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
