// Temporary mock implementation until Supabase is properly configured
export function createClient() {
  return {
    auth: {
      signInWithPassword: async (credentials: any) => {
        console.log("[v0] Mock login:", credentials.email)
        return { data: { user: { id: "1", email: credentials.email } }, error: null }
      },
      signUp: async (credentials: any) => {
        console.log("[v0] Mock signup:", credentials.email)
        return { data: { user: { id: "1", email: credentials.email } }, error: null }
      },
      signInWithOAuth: async (options: any) => {
        console.log("[v0] Mock OAuth:", options.provider)
        return { data: null, error: null }
      },
      getUser: async () => {
        return { data: { user: null }, error: null }
      },
      signOut: async () => {
        return { error: null }
      },
    },
    from: (table: string) => ({
      select: (columns: string) => ({
        eq: (column: string, value: any) => ({
          single: async () => ({ data: null, error: null }),
        }),
      }),
    }),
  }
}
