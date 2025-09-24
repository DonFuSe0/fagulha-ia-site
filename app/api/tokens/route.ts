import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/tokens  -> saldo + últimas transações
export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: balanceRow, error: balErr } = await supabase
    .from("user_balances")
    .select("tokens")
    .eq("user_id", user.id)
    .maybeSingle();

  if (balErr) return NextResponse.json({ error: balErr.message }, { status: 400 });

  const { data: txs, error: txErr } = await supabase
    .from("token_transactions")
    .select("id, delta, reason, meta, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(20);

  if (txErr) return NextResponse.json({ error: txErr.message }, { status: 400 });

  return NextResponse.json({
    balance: balanceRow?.tokens ?? 0,
    transactions: txs ?? [],
  });
}

// POST /api/tokens -> { action: "credit"|"debit", amount: number, reason?, meta? }
export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let payload: { action?: string; amount?: number; reason?: string; meta?: any };
  try { payload = await req.json(); }
  catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  const { action, amount, reason, meta } = payload ?? {};
  if (!action || !["credit", "debit"].includes(action) || !Number.isFinite(amount!) || amount! <= 0) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const fn = action === "credit" ? "credit_tokens" : "debit_tokens";
  const { error } = await supabase.rpc(fn, {
    p_amount: Math.trunc(amount!),
    p_reason: reason ?? null,
    p_meta: meta ?? {},
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  const { data: balanceRow } = await supabase
    .from("user_balances")
    .select("tokens")
    .eq("user_id", user.id)
    .maybeSingle();

  return NextResponse.json({ ok: true, balance: balanceRow?.tokens ?? 0 });
}
