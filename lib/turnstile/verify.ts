export async function verifyTurnstileToken(token?: string) {
  if (!token) return { ok: false, error: 'missing-token' }

  const secret = process.env.TURNSTILE_SECRET_KEY
  if (!secret) return { ok: false, error: 'missing-secret' }

  const resp = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      secret,
      response: token,
    })
  })
  const data = await resp.json() as { success: boolean; ['error-codes']?: string[] }
  return data.success ? { ok: true } : { ok: false, error: data['error-codes']?.join(',') || 'invalid' }
}
