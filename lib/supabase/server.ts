// app/lib/supabase/server.ts
// Fix: remove 'use server' so this helper is NOT treated as a Server Action.
// It can be sync; Next 14 only requires async when it's a Server Action.
import { cookies } from 'next/headers'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'

export function getServerClient() {
  const cookieStore = cookies()
  return createServerComponentClient<any>({ cookies: () => cookieStore })
}
