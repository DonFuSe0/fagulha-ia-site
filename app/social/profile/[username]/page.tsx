import { createClient } from "@/lib/supabase/server"
import { notFound, redirect } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CalendarDays, MapPin, LinkIcon } from "lucide-react"
import Link from "next/link"
import { FollowButton } from "@/components/social/follow-button"
import { PostCard } from "@/components/social/post-card"

interface ProfilePageProps {
  params: Promise<{ username: string }>
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { username } = await params
  const supabase = await createClient()

  // Get current user
  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser()
  if (!currentUser) {
    redirect("/auth/login")
  }

  // Get profile data
  const { data: profile, error } = await supabase
    .from("users")
    .select(`
      *,
      profiles (*)
    `)
    .eq("username", username)
    .single()

  if (error || !profile) {
    notFound()
  }

  // Get follow counts
  const { count: followersCount } = await supabase
    .from("follows")
    .select("*", { count: "exact", head: true })
    .eq("following_id", profile.id)

  const { count: followingCount } = await supabase
    .from("follows")
    .select("*", { count: "exact", head: true })
    .eq("follower_id", profile.id)

  // Check if current user follows this profile
  const { data: isFollowing } = await supabase
    .from("follows")
    .select("id")
    .eq("follower_id", currentUser.id)
    .eq("following_id", profile.id)
    .single()

  // Get user's posts
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
    .eq("author_id", profile.id)
    .order("created_at", { ascending: false })

  const isOwnProfile = currentUser.id === profile.id

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Profile Header */}
        <Card className="glass mb-8">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row gap-6">
              <Avatar className="w-32 h-32 mx-auto md:mx-0">
                <AvatarImage src={profile.avatar_url || profile.profiles?.avatar_url} />
                <AvatarFallback className="text-2xl bg-gradient-fagulha text-white">
                  {profile.display_name?.charAt(0) || profile.username?.charAt(0)}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 text-center md:text-left">
                <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
                  <div>
                    <h1 className="text-3xl font-bold">{profile.display_name}</h1>
                    <p className="text-muted-foreground">@{profile.username}</p>
                  </div>

                  {!isOwnProfile && (
                    <FollowButton userId={profile.id} isFollowing={!!isFollowing} className="md:ml-auto" />
                  )}

                  {isOwnProfile && (
                    <Button variant="outline" asChild className="md:ml-auto bg-transparent">
                      <Link href="/social/profile/edit">Edit Profile</Link>
                    </Button>
                  )}
                </div>

                {profile.bio && <p className="text-muted-foreground mb-4 leading-relaxed">{profile.bio}</p>}

                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
                  {profile.location && (
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {profile.location}
                    </div>
                  )}
                  {profile.website && (
                    <div className="flex items-center gap-1">
                      <LinkIcon className="w-4 h-4" />
                      <a
                        href={profile.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-fagulha-primary hover:underline"
                      >
                        {profile.website.replace(/^https?:\/\//, "")}
                      </a>
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <CalendarDays className="w-4 h-4" />
                    Joined{" "}
                    {new Date(profile.created_at).toLocaleDateString("en-US", {
                      month: "long",
                      year: "numeric",
                    })}
                  </div>
                </div>

                <div className="flex gap-6 text-sm">
                  <Link
                    href={`/social/profile/${username}/following`}
                    className="flex items-center gap-1 hover:text-fagulha-primary transition-colors"
                  >
                    <span className="font-semibold">{followingCount || 0}</span>
                    <span className="text-muted-foreground">Following</span>
                  </Link>
                  <Link
                    href={`/social/profile/${username}/followers`}
                    className="flex items-center gap-1 hover:text-fagulha-primary transition-colors"
                  >
                    <span className="font-semibold">{followersCount || 0}</span>
                    <span className="text-muted-foreground">Followers</span>
                  </Link>
                </div>

                {profile.verified && <Badge className="mt-4 bg-gradient-fagulha">Verified Artist</Badge>}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profile Content */}
        <Tabs defaultValue="posts" className="w-full">
          <TabsList className="grid w-full grid-cols-3 glass">
            <TabsTrigger value="posts">Posts</TabsTrigger>
            <TabsTrigger value="media">Media</TabsTrigger>
            <TabsTrigger value="likes">Likes</TabsTrigger>
          </TabsList>

          <TabsContent value="posts" className="space-y-6 mt-6">
            {posts && posts.length > 0 ? (
              posts.map((post) => <PostCard key={post.id} post={post} currentUserId={currentUser.id} />)
            ) : (
              <Card className="glass">
                <CardContent className="p-8 text-center">
                  <p className="text-muted-foreground">No posts yet</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="media" className="mt-6">
            <Card className="glass">
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground">Media posts coming soon</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="likes" className="mt-6">
            <Card className="glass">
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground">Liked posts coming soon</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
