import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { PostCard } from "@/components/social/post-card"
import { Bookmark } from "lucide-react"

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
      *,
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

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="flex items-center gap-3 mb-8">
          <Bookmark className="w-8 h-8 text-fagulha-primary" />
          <h1 className="text-3xl font-bold text-gradient-fagulha">Bookmarks</h1>
        </div>

        <div className="space-y-6">
          {bookmarks && bookmarks.length > 0 ? (
            bookmarks.map((bookmark) => <PostCard key={bookmark.id} post={bookmark.posts} currentUserId={user.id} />)
          ) : (
            <Card className="glass">
              <CardContent className="p-8 text-center">
                <Bookmark className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground mb-2">No bookmarks yet</p>
                <p className="text-sm text-muted-foreground">
                  Bookmark posts to save them for later by clicking the bookmark icon
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
