export function defaultAvatarFor(userId: string) {
  let h = 0
  for (let i = 0; i < userId.length; i++) h = ((h<<5)-h)+userId.charCodeAt(i)|0
  const idx = Math.abs(h) % 4
  return `/avatars/fire-${idx+1}.png`
}

// Constrói a URL pública do avatar a partir de um path do Storage (ex.: "userId/file.jpg")
// ou aceita uma URL absoluta já pública. Opcionalmente adiciona um parâmetro de cache-busting.
export function publicAvatarUrl(
  value: string | null | undefined,
  opts?: { cb?: number | string }
): string | null {
  if (!value) return null
  let url = value
  const isAbsolute = /^https?:\/\//i.test(value)
  if (!isAbsolute) {
    const base = process.env.NEXT_PUBLIC_SUPABASE_URL
    if (!base) return null
    url = `${base}/storage/v1/object/public/avatars/${value}`
  }
  if (opts?.cb !== undefined) {
    const sep = url.includes('?') ? '&' : '?'
    url = `${url}${sep}cb=${encodeURIComponent(String(opts.cb))}`
  }
  return url
}
