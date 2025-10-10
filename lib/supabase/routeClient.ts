// lib/supabase/routeClient.ts
import { cookies } from 'next/headers'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
// import type { Database } from '@/lib/supabase/types'

export default function getRouteClient() {
  // return createRouteHandlerClient<Database>({ cookies })
  return createRouteHandlerClient({ cookies })
}
