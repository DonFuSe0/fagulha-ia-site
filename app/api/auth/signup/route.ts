// ... já deve existir o supabase client server-side
const email = body.email?.trim().toLowerCase()

// 1) checa banimento de 30 dias por e-mail
const banned = await supabase.rpc('is_email_banned', { p_email: email })
if (banned.error) {
  // opcional: log/telemetria
}
if (banned.data === true) {
  return NextResponse.json(
    { error: 'Este e-mail está temporariamente bloqueado por 30 dias após exclusão de conta.' },
    { status: 429 }
  )
}

// 2) segue fluxo normal de validação/denylist/turnstile...
// 3) cria usuário no auth
