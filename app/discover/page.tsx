import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { UserCard } from "@/components/user-card"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { FagulhaLogo } from "@/components/fagulha-logo"
import { ArrowLeft, Search, TrendingUp, Sparkles } from "lucide-react"
import Link from "next/link"

export default async function DiscoverPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    redirect("/auth/login")
  }

  // Get suggested users (users with most followers that current user doesn't follow)
  const { data: suggestedUsers } = await supabase
    .from("profiles")
    .select(`
      *,
      followers:follows!follows_following_id_fkey(count),
      posts(count)
    `)
    .neq("id", user.id)
    .limit(6)

  // Get trending users (most active recently)
  const { data: trendingUsers } = await supabase
    .from("profiles")
    .select(`
      *,
      followers:follows!follows_following_id_fkey(count),
      posts(count)
    `)
    .neq("id", user.id)
    .limit(6)

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/dashboard">
                  <ArrowLeft className="h-4 w-4" />
                </Link>
              </Button>
              <FagulhaLogo size="md" />
            </div>
            <h1 className="text-xl font-semibold">Descobrir</h1>
            <div></div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Search */}
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm mb-8">
          <CardContent className="p-6">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Buscar usuários..." className="pl-10 glass" />
            </div>
          </CardContent>
        </Card>

        {/* Suggested Users */}
        <section className="mb-12">
          <div className="flex items-center gap-2 mb-6">
            <Sparkles className="h-5 w-5 text-fagulha" />
            <h2 className="text-2xl font-bold">Sugestões para você</h2>
          </div>

          {suggestedUsers && suggestedUsers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {suggestedUsers.map((profile) => (
                <UserCard
                  key={profile.id}
                  profile={{
                    ...profile,
                    followers_count: profile.followers?.[0]?.count || 0,
                    posts_count: profile.posts?.[0]?.count || 0,
                  }}
                  showFollowButton={true}
                />
              ))}
            </div>
          ) : (
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground">Nenhuma sugestão disponível no momento.</p>
              </CardContent>
            </Card>
          )}
        </section>

        {/* Trending Users */}
        <section>
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="h-5 w-5 text-fagulha" />
            <h2 className="text-2xl font-bold">Em alta</h2>
          </div>

          {trendingUsers && trendingUsers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {trendingUsers.map((profile) => (
                <UserCard
                  key={profile.id}
                  profile={{
                    ...profile,
                    followers_count: profile.followers?.[0]?.count || 0,
                    posts_count: profile.posts?.[0]?.count || 0,
                  }}
                  showFollowButton={true}
                />
              ))}
            </div>
          ) : (
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground">Nenhum usuário em alta no momento.</p>
              </CardContent>
            </Card>
          )}
        </section>
      </div>
    </div>
  )
}
