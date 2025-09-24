import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { PostCard } from "@/components/post-card"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { FagulhaLogo } from "@/components/fagulha-logo"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

interface PostPageProps {
  params: {
    id: string
  }
}

export default async function PostPage({ params }: PostPageProps) {
  const supabase = await createClient()

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Get post with author info
  const { data: post, error } = await supabase
    .from("posts")
    .select(`
      *,
      profiles:author_id (
        nickname,
        display_name,
        avatar_url
      )
    `)
    .eq("id", params.id)
    .single()

  if (error || !post) {
    notFound()
  }

  // Get comments
  const { data: comments } = await supabase
    .from("comments")
    .select(`
      *,
      profiles:user_id (
        nickname,
        display_name,
        avatar_url
      )
    `)
    .eq("post_id", params.id)
    .order("created_at", { ascending: true })

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/dashboard">
                  <ArrowLeft className="h-4 w-4" />
                </Link>
              </Button>
              <FagulhaLogo size="md" />
            </div>
            <h1 className="text-xl font-semibold">Post</h1>
            <div></div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Main Post */}
        <div className="mb-8">
          <PostCard
            post={{
              ...post,
              profiles: post.profiles,
            }}
            currentUserId={user?.id}
            showActions={true}
          />
        </div>

        {/* Comments Section */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">Comentários</h2>

          {comments && comments.length > 0 ? (
            <div className="space-y-4">
              {comments.map((comment) => (
                <Card key={comment.id} className="border-border/50 bg-card/50 backdrop-blur-sm">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Link href={`/user/${comment.profiles.nickname}`}>
                        <img
                          src={comment.profiles.avatar_url || "/placeholder-user.jpg"}
                          alt={comment.profiles.display_name}
                          className="w-8 h-8 rounded-full border border-fagulha/20"
                        />
                      </Link>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Link
                            href={`/user/${comment.profiles.nickname}`}
                            className="font-semibold text-sm hover:underline"
                          >
                            {comment.profiles.display_name}
                          </Link>
                          <span className="text-muted-foreground text-xs">@{comment.profiles.nickname}</span>
                          <span className="text-muted-foreground text-xs">
                            {new Date(comment.created_at).toLocaleDateString("pt-BR")}
                          </span>
                        </div>
                        <p className="text-sm leading-relaxed">{comment.content}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground">Nenhum comentário ainda. Seja o primeiro a comentar!</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
