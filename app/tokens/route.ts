// app/tokens/route.ts
import { NextResponse } from 'next/server'

export async function GET() {
  // Retorna estrutura mínima para não quebrar a página que consome /tokens
  return NextResponse.json({ ok: true, items: [], total: 0 })
}