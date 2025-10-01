export function defaultAvatarFor(userId: string) {
  let h = 0
  for (let i = 0; i < userId.length; i++) h = ((h<<5)-h)+userId.charCodeAt(i)|0
  const idx = Math.abs(h) % 4
  return `/avatars/fire-${idx+1}.png`
}
