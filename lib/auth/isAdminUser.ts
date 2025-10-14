import { User } from '@supabase/supabase-js'

// Lista de emails admin separados por vírgula em ADMIN_EMAILS
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || '')
  .split(',')
  .map(e => e.trim().toLowerCase())
  .filter(Boolean)

export function isAdminUser(user: Pick<User, 'email'> | null | undefined): boolean {
  if (!user?.email) return false
  if (!ADMIN_EMAILS.length) return false
  return ADMIN_EMAILS.includes(user.email.toLowerCase())
}

export function assertAdmin(user: Pick<User, 'email'> | null | undefined) {
  if (!isAdminUser(user)) {
    const err: any = new Error('forbidden_admin_only')
    err.status = 403
    throw err
  }
}

export default isAdminUser