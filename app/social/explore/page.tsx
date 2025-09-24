import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { FollowButton } from "@/components/social/follow-button"
import Link from "next/link"

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
      profiles (*),
      followers:follows!follows_following_id_fkey (follower_id),
      following:follows!follows_follower_id_fkey (following_id)
    `)
    .neq("id", user.id)
    .limit(10)

  // Filter out users already followed
  const { data: currentFollows } = await supabase.from("follows").select("following_id").eq("follower_id", user.id)

  const followedIds = new Set(currentFollows?.map((f) => f.following_id) || [])
  const usersToSuggest = suggestedUsers?.filter((u) => !followedIds.has(u.id)) || []

  // Get trending posts
  const { data: trendingPosts } = await supabase
    .from("posts")
    .select(`
      *,
      users!posts_author_id_fkey (username, display_name, avatar_url),
      profiles!posts_author_id_fkey (avatar_url),
      likes (id),
      comments (id)
    `)
    .order("created_at", { ascending: false })
    .limit(5)

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-3xl font-bold mb-8">Explore</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Trending Posts */}
            <Card className="glass">
              <CardHeader>
                <CardTitle>Trending Posts</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {trendingPosts && trendingPosts.length > 0 ? (
                  trendingPosts.map((post) => (
                    <div key={post.id} className="border-b border-border/50 last:border-0 pb-4 last:pb-0">
                      <div className="flex items-center gap-3 mb-2">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={post.users.avatar_url || post.profiles?.avatar_url} />
                          <AvatarFallback className="bg-gradient-fagulha text-white text-xs">
                            {post.users.display_name?.charAt(0) || post.users.username?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <Link
                          href={`/social/profile/${post.users.username}`}
                          className="font-semibold text-sm hover:text-fagulha-primary transition-colors"
                        >
                          {post.users.display_name}
                        </Link>
                      </div>
                      <Link href={`/social/post/${post.id}`} className="block">
                        <p className="text-sm text-muted-foreground line-clamp-2 hover:text-foreground transition-colors">
                          {post.content}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          <span>{post.likes?.length || 0} likes</span>
                          <span>{post.comments?.length || 0} comments</span>
                        </div>
                      </Link>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-center py-8">No trending posts yet</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Who to Follow */}
            <Card className="glass">
              <CardHeader>
                <CardTitle>Who to Follow</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {usersToSuggest.length > 0 ? (
                  usersToSuggest.slice(0, 5).map((suggestedUser) => (
                    <div key={suggestedUser.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Link href={`/social/profile/${suggestedUser.username}`}>
                          <Avatar className="w-10 h-10">
                            <AvatarImage src={suggestedUser.avatar_url || suggestedUser.profiles?.avatar_url} />
                            <AvatarFallback className="bg-gradient-fagulha text-white">
                              {suggestedUser.display_name?.charAt(0) || suggestedUser.username?.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                        </Link>
                        <div>
                          <Link
                            href={`/social/profile/${suggestedUser.username}`}
                            className="font-semibold text-sm hover:text-fagulha-primary transition-colors"
                          >
                            {suggestedUser.display_name}
                          </Link>
                          <p className="text-xs text-muted-foreground">@{suggestedUser.username}</p>
                          <p className="text-xs text-muted-foreground">
                            {suggestedUser.followers?.length || 0} followers
                          </p>
                        </div>
                      </div>
                      <FollowButton targetUserId={suggestedUser.id} isFollowing={false} />
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-center py-4">No suggestions available</p>
                )}
              </CardContent>
            </Card>

            {/* Trending Topics */}
            <Card className="glass">
              <CardHeader>
                <CardTitle>Trending Topics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <Badge variant="secondary" className="text-xs">
                    #AIArt
                  </Badge>
                  <p className="text-xs text-muted-foreground">1.2K posts</p>
                </div>
                <div className="space-y-2">
                  <Badge variant="secondary" className="text-xs">
                    #DigitalCreativity
                  </Badge>
                  <p className="text-xs text-muted-foreground">856 posts</p>
                </div>
                <div className="space-y-2">
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
