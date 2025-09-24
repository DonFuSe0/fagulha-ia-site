interface SupabaseClient {
  from: (table: string) => any
  auth: {
    signUp: (credentials: any) => Promise<any>
    signInWithPassword: (credentials: any) => Promise<any>
    signOut: () => Promise<any>
    getUser: () => Promise<any>
  }
  storage: {
    from: (bucket: string) => any
  }
}

class BasicSupabaseClient implements SupabaseClient {
  private url: string
  private key: string

  constructor(url: string, key: string) {
    this.url = url
    this.key = key
  }

  from(table: string) {
    return {
      select: (columns = "*") => ({
        eq: (column: string, value: any) => ({
          gt: (gtColumn: string, gtValue: any) => ({
            order: (orderColumn: string, options?: any) => ({
              limit: (count: number) =>
                this.query(
                  "GET",
                  table,
                  {},
                  {
                    [column]: `eq.${value}`,
                    [gtColumn]: `gt.${gtValue}`,
                    order: `${orderColumn}.${options?.ascending ? "asc" : "desc"}`,
                    limit: count,
                  },
                ),
            }),
          }),
          order: (orderColumn: string, options?: any) => ({
            limit: (count: number) =>
              this.query(
                "GET",
                table,
                {},
                {
                  [column]: `eq.${value}`,
                  order: `${orderColumn}.${options?.ascending ? "asc" : "desc"}`,
                  limit: count,
                },
              ),
          }),
        }),
        order: (column: string, options?: any) => ({
          limit: (count: number) =>
            this.query(
              "GET",
              table,
              {},
              {
                order: `${column}.${options?.ascending ? "asc" : "desc"}`,
                limit: count,
              },
            ),
        }),
        limit: (count: number) => this.query("GET", table, {}, { limit: count }),
      }),
      insert: (data: any) => this.query("POST", table, data),
      update: (data: any) => ({
        eq: (column: string, value: any) => this.query("PATCH", table, data, { [column]: `eq.${value}` }),
      }),
      delete: () => ({
        eq: (column: string, value: any) => this.query("DELETE", table, {}, { [column]: `eq.${value}` }),
      }),
    }
  }

  auth = {
    signUp: async (credentials: any) => {
      return this.authRequest("signup", credentials)
    },
    signInWithPassword: async (credentials: any) => {
      return this.authRequest("token", { ...credentials, grant_type: "password" })
    },
    signOut: async () => {
      return this.authRequest("logout", {})
    },
    getUser: async () => {
      return this.authRequest("user", {})
    },
  }

  storage = {
    from: (bucket: string) => ({
      upload: async (path: string, file: File) => {
        const formData = new FormData()
        formData.append("file", file)

        const response = await fetch(`${this.url}/storage/v1/object/${bucket}/${path}`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${this.key}`,
          },
          body: formData,
        })

        return { data: await response.json(), error: null }
      },
      getPublicUrl: (path: string) => ({
        data: { publicUrl: `${this.url}/storage/v1/object/public/${bucket}/${path}` },
      }),
    }),
  }

  private async query(method: string, table: string, data?: any, params?: any) {
    const url = new URL(`${this.url}/rest/v1/${table}`)
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value as string)
      })
    }

    const response = await fetch(url.toString(), {
      method,
      headers: {
        "Content-Type": "application/json",
        apikey: this.key,
        Authorization: `Bearer ${this.key}`,
      },
      body: data ? JSON.stringify(data) : undefined,
    })

    return { data: await response.json(), error: null }
  }

  private async authRequest(endpoint: string, data: any) {
    const response = await fetch(`${this.url}/auth/v1/${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: this.key,
      },
      body: JSON.stringify(data),
    })

    return { data: await response.json(), error: null }
  }
}

export function createClient(): SupabaseClient {
  return new BasicSupabaseClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
}
