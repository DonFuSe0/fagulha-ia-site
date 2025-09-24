import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { SocialHeader } from "@/components/social/social-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { UserCard } from "@/components/social/user-card"
import { PostCard } from "@/components/social/post-card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default async function ExplorePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  // Get suggested users (users not followed by current user)
  const { data: suggestedUsers } = await supabase
    .from("users")
    .select(`
      *,
      profiles (avatar_url)
    `)
    .neq("id", user.id)
    .limit(10)

  // Get trending posts (posts with most likes in last 7 days)
  const { data: trendingPosts } = await supabase
    .from("posts")
    .select(`
      *,
      users!posts_author_id_fkey (username, display_name, avatar_url),
      profiles!posts_author_id_fkey (avatar_url),
      likes (id, user_id),
      comments (id),
      bookmarks (id, user_id)
    `)
    .gte("created_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
    .order("created_at", { ascending: false })
    .limit(10)

  return (
    <div className="min-h-screen bg-background">
      <SocialHeader />

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <h1 className="text-3xl font-bold mb-8">Explore</h1>

        <Tabs defaultValue="posts" className="w-full">
          <TabsList className="grid w-full grid-cols-2 glass">
            <TabsTrigger value="posts">Trending Posts</TabsTrigger>
            <TabsTrigger value="people">Suggested People</TabsTrigger>
          </TabsList>

          <TabsContent value="posts" className="space-y-6 mt-8">
            {trendingPosts && trendingPosts.length > 0 ? (
              trendingPosts.map((post) => <PostCard key={post.id} post={post} currentUserId={user.id} />)
            ) : (
              <Card className="glass">
                <CardContent className="p-12 text-center">
                  <p className="text-muted-foreground">No trending posts found.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="people" className="mt-8">
            <Card className="glass">
              <CardHeader>
                <CardTitle>Suggested People</CardTitle>
              </CardHeader>
              <CardContent>
                {suggestedUsers && suggestedUsers.length > 0 ? (
                  <div className="space-y-4">
                    {suggestedUsers.map((suggestedUser) => (
                      <UserCard key={suggestedUser.id} user={suggestedUser} currentUserId={user.id} />
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">No suggestions available.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
