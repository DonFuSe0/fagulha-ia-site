import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { PostCard } from "@/components/social/post-card"

export default async function BookmarksPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  // Get bookmarked posts
  const { data: bookmarks } = await supabase
    .from("bookmarks")
    .select(`
      post_id,
      posts (
        *,
        users!posts_author_id_fkey (username, display_name, avatar_url),
        profiles!posts_author_id_fkey (avatar_url),
        likes (id, user_id),
        comments (id),
        bookmarks (id, user_id)
      )
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  const bookmarkedPosts = bookmarks?.map((bookmark) => bookmark.posts).filter(Boolean) || []

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <h1 className="text-3xl font-bold mb-8">Bookmarks</h1>

        {bookmarkedPosts.length > 0 ? (
          <div className="space-y-6">
            {bookmarkedPosts.map((post) => (
              <PostCard key={post.id} post={post} currentUserId={user.id} />
            ))}
          </div>
        ) : (
          <Card className="glass">
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground">No bookmarked posts yet</p>
              <p className="text-sm text-muted-foreground mt-2">
                Bookmark posts by clicking the bookmark icon to save them for later
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
