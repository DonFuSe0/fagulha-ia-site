export function hoursLeftFrom(dateIso: string, hours: number) {
  const end = new Date(new Date(dateIso).getTime() + hours*3600_000)
  const diffMs = end.getTime() - Date.now()
  return Math.max(0, Math.ceil(diffMs/3_600_000))
}
