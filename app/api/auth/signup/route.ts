// caminho: app/api/auth/signup/route.ts (ou seu equivalente)
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  const { email, password, confirmPassword /*, captcha */ } = await req.json()

  // Remover checagem do captcha
  // if (!captcha) { ... }

  // Lógica normal de cadastro
  // ...
}
