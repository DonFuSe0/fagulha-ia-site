import { createClient } from "@/lib/supabase/server"
import { notFound, redirect } from "next/navigation"
import { PostCard } from "@/components/social/post-card"
import { CommentSection } from "@/components/social/comment-section"

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

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Post */}
        <PostCard post={post} currentUserId={user.id} />

        {/* Comments */}
        <CommentSection postId={id} currentUserId={user.id} />
      </div>
    </div>
  )
}
