'use server'
import { cookies } from 'next/headers'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
export function getServerClient() {
  const cookieStore = cookies()
  return createServerComponentClient<any>({ cookies: () => cookieStore })
}
