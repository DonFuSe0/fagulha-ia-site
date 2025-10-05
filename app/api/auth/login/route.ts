// caminho: app/api/auth/login/route.ts (ou seu equivalente backend)
import { NextResponse } from "next/server"

// … outras importações …

export async function POST(req: Request) {
  const { email, password /*, captcha */ } = await req.json()

  // Remover ou comentar a verificação do captcha:
  // if (!captcha) {
  //   return NextResponse.json({ error: "Captcha necessário" }, { status: 400 })
  // }
  // Código de verificação do token Turnstile removido

  // Continua lógica normal de login
  // ...
}
