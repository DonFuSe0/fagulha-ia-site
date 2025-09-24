import { createClient } from "@/lib/supabase/server"
import { notFound, redirect } from "next/navigation"
import { SocialHeader } from "@/components/social/social-header"
import { PostCard } from "@/components/social/post-card"
import { CommentsList } from "@/components/social/comments-list"
import { CreateCommentForm } from "@/components/social/create-comment-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface PostPageProps {
  params: Promise<{ id: string }>
}

export default async function PostPage({ params }: PostPageProps) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  // Get post data
  const { data: post, error } = await supabase
    .from("posts")
    .select(`
      *,
      users!posts_author_id_fkey (username, display_name, avatar_url),
      profiles!posts_author_id_fkey (avatar_url),
      likes (id, user_id),
      comments (id),
      bookmarks (id, user_id)
    `)
    .eq("id", id)
    .single()

  if (error || !post) {
    notFound()
  }

  // Get comments for this post
  const { data: comments } = await supabase
    .from("comments")
    .select(`
      *,
      users!comments_user_id_fkey (username, display_name, avatar_url),
      profiles!comments_user_id_fkey (avatar_url)
    `)
    .eq("post_id", id)
    .is("reply_to", null)
    .order("created_at", { ascending: true })

  return (
    <div className="min-h-screen bg-background">
      <SocialHeader />

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Main Post */}
        <div className="mb-8">
          <PostCard post={post} currentUserId={user.id} />
        </div>

        {/* Comments Section */}
        <Card className="glass">
          <CardHeader>
            <CardTitle>Comments</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <CreateCommentForm postId={id} />
            {comments && comments.length > 0 ? (
              <CommentsList comments={comments} currentUserId={user.id} postId={id} />
            ) : (
              <p className="text-muted-foreground text-center py-8">No comments yet. Be the first to comment!</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
