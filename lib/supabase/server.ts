import { createClient } from "./client"

export function createServerClient() {
  return createClient()
}

export { createClient, createServerClient as createSupabaseClient }
