import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { CreatePostForm } from "@/components/social/create-post-form"
import { PostCard } from "@/components/social/post-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, Users, Heart } from "lucide-react"

export default async function SocialPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  // Get posts from followed users and own posts
  const { data: followedUsers } = await supabase.from("follows").select("following_id").eq("follower_id", user.id)

  const followedIds = followedUsers?.map((f) => f.following_id) || []
  const userIds = [user.id, ...followedIds]

  const { data: posts } = await supabase
    .from("posts")
    .select(`
      *,
      users!posts_author_id_fkey (username, display_name, avatar_url),
      profiles!posts_author_id_fkey (avatar_url),
      likes (id, user_id),
      comments (id),
      bookmarks (id, user_id)
    `)
    .in("author_id", userIds)
    .order("created_at", { ascending: false })
    .limit(20)

  // Get user stats for dashboard
  const [{ count: totalPosts }, { count: totalFollowers }, { count: totalLikes }] = await Promise.all([
    supabase.from("posts").select("*", { count: "exact", head: true }).eq("author_id", user.id),
    supabase.from("follows").select("*", { count: "exact", head: true }).eq("following_id", user.id),
    supabase
      .from("likes")
      .select("*", { count: "exact", head: true })
      .in("post_id", supabase.from("posts").select("id").eq("author_id", user.id)),
  ])

  // Get suggested users
  const { data: suggestedUsers } = await supabase
    .from("users")
    .select("id, username, display_name, avatar_url, profiles (avatar_url)")
    .neq("id", user.id)
    .not("id", "in", `(${followedIds.join(",") || "null"})`)
    .limit(3)

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Feed */}
          <div className="lg:col-span-3 space-y-8">
            {/* Dashboard Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="glass">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-gradient-fagulha flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gradient-fagulha">{totalPosts || 0}</p>
                      <p className="text-sm text-muted-foreground">Total Posts</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-gradient-fagulha flex items-center justify-center">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gradient-fagulha">{totalFollowers || 0}</p>
                      <p className="text-sm text-muted-foreground">Followers</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-gradient-fagulha flex items-center justify-center">
                      <Heart className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gradient-fagulha">{totalLikes || 0}</p>
                      <p className="text-sm text-muted-foreground">Total Likes</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Create Post */}
            <Card className="glass">
              <CardContent className="p-6">
                <CreatePostForm />
              </CardContent>
            </Card>

            {/* Feed */}
            <div className="space-y-6">
              {posts && posts.length > 0 ? (
                posts.map((post) => <PostCard key={post.id} post={post} currentUserId={user.id} />)
              ) : (
                <Card className="glass">
                  <CardContent className="p-12 text-center">
                    <p className="text-muted-foreground">No posts to show. Follow some users to see their posts!</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Who to Follow */}
            <Card className="glass">
              <CardHeader>
                <CardTitle>Who to Follow</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {suggestedUsers && suggestedUsers.length > 0 ? (
                  suggestedUsers.map((suggestedUser) => (
                    <div key={suggestedUser.id} className="flex items-center gap-3">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={suggestedUser.avatar_url || suggestedUser.profiles?.avatar_url} />
                        <AvatarFallback className="bg-gradient-fagulha text-white">
                          {suggestedUser.display_name?.charAt(0) || suggestedUser.username?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-semibold text-sm">{suggestedUser.display_name}</p>
                        <p className="text-xs text-muted-foreground">@{suggestedUser.username}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-sm">No suggestions available</p>
                )}
              </CardContent>
            </Card>

            {/* Trending Topics */}
            <Card className="glass">
              <CardHeader>
                <CardTitle>Trending</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-1">
                  <Badge variant="secondary" className="text-xs">
                    #AIArt
                  </Badge>
                  <p className="text-xs text-muted-foreground">1.2K posts</p>
                </div>
                <div className="space-y-1">
                  <Badge variant="secondary" className="text-xs">
                    #DigitalCreativity
                  </Badge>
                  <p className="text-xs text-muted-foreground">856 posts</p>
                </div>
                <div className="space-y-1">
                  <Badge variant="secondary" className="text-xs">
                    #Fagulha
                  </Badge>
                  <p className="text-xs text-muted-foreground">432 posts</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
