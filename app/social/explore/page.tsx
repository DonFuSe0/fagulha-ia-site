import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { FollowButton } from "@/components/social/follow-button"
import { Search, TrendingUp, Users } from "lucide-react"
import Link from "next/link"

export default async function ExplorePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  // Get suggested users to follow (users not already followed)
  const { data: suggestedUsers } = await supabase
    .from("users")
    .select(`
      *,
      profiles (*),
      followers:follows!follows_following_id_fkey (id),
      following:follows!follows_follower_id_fkey (id)
    `)
    .neq("id", user.id)
    .limit(10)

  // Filter out users already followed
  const { data: currentFollows } = await supabase.from("follows").select("following_id").eq("follower_id", user.id)

  const followedIds = currentFollows?.map((f) => f.following_id) || []
  const usersToSuggest = suggestedUsers?.filter((u) => !followedIds.includes(u.id)) || []

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
        <div className="flex items-center gap-3 mb-8">
          <Search className="w-8 h-8 text-fagulha-primary" />
          <h1 className="text-3xl font-bold text-gradient-fagulha">Explore</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Suggested Users */}
          <Card className="glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Who to Follow
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {usersToSuggest.length > 0 ? (
                usersToSuggest.map((suggestedUser) => (
                  <div key={suggestedUser.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50">
                    <Link href={`/social/profile/${suggestedUser.username}`}>
                      <Avatar className="w-12 h-12 hover:ring-2 hover:ring-fagulha-primary/50 transition-all">
                        <AvatarImage src={suggestedUser.avatar_url || suggestedUser.profiles?.avatar_url} />
                        <AvatarFallback className="bg-gradient-fagulha text-white">
                          {suggestedUser.display_name?.charAt(0) || suggestedUser.username?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                    </Link>

                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/social/profile/${suggestedUser.username}`}
                          className="font-semibold hover:text-fagulha-primary transition-colors"
                        >
                          {suggestedUser.display_name}
                        </Link>
                        {suggestedUser.verified && <Badge className="bg-gradient-fagulha text-xs">Verified</Badge>}
                      </div>
                      <p className="text-muted-foreground text-sm">@{suggestedUser.username}</p>
                      {suggestedUser.bio && (
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{suggestedUser.bio}</p>
                      )}
                      <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
                        <span>{suggestedUser.followers?.length || 0} followers</span>
                        <span>{suggestedUser.following?.length || 0} following</span>
                      </div>
                    </div>

                    <FollowButton userId={suggestedUser.id} isFollowing={false} />
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-center py-4">No new users to suggest right now</p>
              )}
            </CardContent>
          </Card>

          {/* Trending Posts */}
          <Card className="glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Trending Posts
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {trendingPosts && trendingPosts.length > 0 ? (
                trendingPosts.map((post) => (
                  <Link
                    key={post.id}
                    href={`/social/post/${post.id}`}
                    className="block p-3 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={post.users.avatar_url || post.profiles?.avatar_url} />
                        <AvatarFallback className="bg-gradient-fagulha text-white">
                          {post.users.display_name?.charAt(0) || post.users.username?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-sm">{post.users.display_name}</span>
                          <span className="text-muted-foreground text-xs">@{post.users.username}</span>
                        </div>
                        <p className="text-sm line-clamp-2">{post.content}</p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
                          <span>{post.likes?.length || 0} likes</span>
                          <span>{post.comments?.length || 0} comments</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <p className="text-muted-foreground text-center py-4">No trending posts right now</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
