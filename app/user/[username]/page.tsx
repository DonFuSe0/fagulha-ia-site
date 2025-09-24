import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { FagulhaLogo } from "@/components/fagulha-logo"
import { ArrowLeft, Calendar, Heart, MessageCircle } from "lucide-react"
import Link from "next/link"

interface UserProfilePageProps {
  params: {
    username: string
  }
}

export default async function UserProfilePage({ params }: UserProfilePageProps) {
  const supabase = await createClient()

  // Get current user
  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser()

  // Get profile by username
  const { data: profile, error } = await supabase.from("profiles").select("*").eq("nickname", params.username).single()

  if (error || !profile) {
    notFound()
  }

  // Get user's posts count
  const { count: postsCount } = await supabase
    .from("posts")
    .select("*", { count: "exact", head: true })
    .eq("user_id", profile.id)

  // Get followers count
  const { count: followersCount } = await supabase
    .from("follows")
    .select("*", { count: "exact", head: true })
    .eq("following_id", profile.id)

  // Get following count
  const { count: followingCount } = await supabase
    .from("follows")
    .select("*", { count: "exact", head: true })
    .eq("follower_id", profile.id)

  // Check if current user follows this profile
  let isFollowing = false
  if (currentUser) {
    const { data: followData } = await supabase
      .from("follows")
      .select("id")
      .eq("follower_id", currentUser.id)
      .eq("following_id", profile.id)
      .single()

    isFollowing = !!followData
  }

  // Get recent posts
  const { data: posts } = await supabase
    .from("posts")
    .select(`
      *,
      profiles:user_id (
        nickname,
        display_name,
        avatar_url
      )
    `)
    .eq("user_id", profile.id)
    .order("created_at", { ascending: false })
    .limit(6)

  const isOwnProfile = currentUser?.id === profile.id

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
            <h1 className="text-xl font-semibold">@{profile.nickname}</h1>
            <div></div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Profile Header */}
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm mb-8">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Avatar */}
              <Avatar className="h-32 w-32 border-4 border-fagulha/20 mx-auto md:mx-0">
                <AvatarImage src={profile.avatar_url || ""} alt={profile.display_name || ""} />
                <AvatarFallback className="bg-fagulha/10 text-fagulha text-4xl font-semibold">
                  {profile.display_name?.charAt(0) || profile.nickname?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>

              {/* Profile Info */}
              <div className="flex-1 text-center md:text-left">
                <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
                  <div>
                    <h1 className="text-3xl font-bold">{profile.display_name}</h1>
                    <p className="text-muted-foreground text-lg">@{profile.nickname}</p>
                  </div>

                  {!isOwnProfile && currentUser && (
                    <Button
                      className={isFollowing ? "bg-muted hover:bg-muted/80" : "bg-gradient-fagulha hover:opacity-90"}
                      variant={isFollowing ? "secondary" : "default"}
                    >
                      {isFollowing ? "Seguindo" : "Seguir"}
                    </Button>
                  )}

                  {isOwnProfile && (
                    <Button variant="outline" asChild>
                      <Link href="/profile">Editar Perfil</Link>
                    </Button>
                  )}
                </div>

                {/* Stats */}
                <div className="flex justify-center md:justify-start gap-6 mb-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-fagulha">{postsCount || 0}</div>
                    <div className="text-sm text-muted-foreground">Posts</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-fagulha">{followersCount || 0}</div>
                    <div className="text-sm text-muted-foreground">Seguidores</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-fagulha">{followingCount || 0}</div>
                    <div className="text-sm text-muted-foreground">Seguindo</div>
                  </div>
                </div>

                {/* Bio */}
                {profile.bio && <p className="text-muted-foreground mb-4 leading-relaxed">{profile.bio}</p>}

                {/* Additional Info */}
                <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm text-muted-foreground">
                  {profile.birth_date && (
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      Nasceu em {new Date(profile.birth_date).toLocaleDateString("pt-BR")}
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Membro desde {new Date(profile.created_at).toLocaleDateString("pt-BR")}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Posts Grid */}
        <div>
          <h2 className="text-2xl font-bold mb-6">Posts Recentes</h2>
          {posts && posts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post) => (
                <Card
                  key={post.id}
                  className="border-border/50 bg-card/50 backdrop-blur-sm hover:bg-card/70 transition-colors"
                >
                  <CardContent className="p-4">
                    {post.image_url && (
                      <div className="aspect-square rounded-lg overflow-hidden mb-3">
                        <img
                          src={post.image_url || "/placeholder.svg"}
                          alt={post.caption || "Post"}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    {post.caption && <p className="text-sm text-muted-foreground mb-3 line-clamp-3">{post.caption}</p>}
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <Heart className="h-4 w-4" />
                          {post.likes_count || 0}
                        </div>
                        <div className="flex items-center gap-1">
                          <MessageCircle className="h-4 w-4" />
                          {post.comments_count || 0}
                        </div>
                      </div>
                      <span>{new Date(post.created_at).toLocaleDateString("pt-BR")}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground">
                  {isOwnProfile ? "Você ainda não fez nenhum post." : "Este usuário ainda não fez nenhum post."}
                </p>
                {isOwnProfile && (
                  <Button className="mt-4 bg-gradient-fagulha hover:opacity-90" asChild>
                    <Link href="/generate">Criar Primeiro Post</Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
