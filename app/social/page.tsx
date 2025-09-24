import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { SocialHeader } from "@/components/social/social-header"
import { CreatePostForm } from "@/components/social/create-post-form"
import { PostCard } from "@/components/social/post-card"
import { Card, CardContent } from "@/components/ui/card"

export default async function SocialPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  const { data: followedUserIds } = await supabase.from("follows").select("following_id").eq("follower_id", user.id)

  const followedIds = followedUserIds?.map((f) => f.following_id) || []
  const allUserIds = [user.id, ...followedIds]

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
    .in("author_id", allUserIds)
    .order("created_at", { ascending: false })
    .limit(20)

  return (
    <div className="min-h-screen bg-background">
      <SocialHeader />

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Create Post */}
        <div className="mb-8">
          <CreatePostForm />
        </div>

        {/* Feed */}
        <div className="space-y-6">
          {posts && posts.length > 0 ? (
            posts.map((post) => <PostCard key={post.id} post={post} currentUserId={user.id} />)
          ) : (
            <Card className="glass">
              <CardContent className="p-12 text-center">
                <h3 className="text-xl font-semibold mb-2">Welcome to Fagulha Social!</h3>
                <p className="text-muted-foreground">Start following people to see their posts in your feed.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
