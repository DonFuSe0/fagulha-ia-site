'use client'

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Database } from '@/types/supabase' // keep if you have types; otherwise remove this import

// Single instance per module load; auth-helpers manage cookies for us
export const supabase = createClientComponentClient<Database>()
export default supabase