import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { CreatePostForm } from "@/components/social/create-post-form"
import { PostCard } from "@/components/social/post-card"
import { Card, CardContent } from "@/components/ui/card"

export default async function SocialFeedPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  // Get posts from followed users and own posts
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
    .order("created_at", { ascending: false })
    .limit(20)

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <h1 className="text-3xl font-bold mb-8 text-gradient-fagulha">Social Feed</h1>

        {/* Create Post Form */}
        <CreatePostForm />

        {/* Posts Feed */}
        <div className="space-y-6 mt-8">
          {posts && posts.length > 0 ? (
            posts.map((post) => <PostCard key={post.id} post={post} currentUserId={user.id} />)
          ) : (
            <Card className="glass">
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground">
                  No posts in your feed yet. Follow some users to see their posts!
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
