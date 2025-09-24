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

  // Get follower/following counts
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
            <div className="flex flex-col md:flex-row gap-8">
              <div className="flex flex-col items-center md:items-start">
                <Avatar className="w-32 h-32 mb-4">
                  <AvatarImage src={profile.avatar_url || profile.profiles?.avatar_url} />
                  <AvatarFallback className="text-2xl bg-gradient-fagulha text-white">
                    {profile.display_name?.charAt(0) || profile.username?.charAt(0)}
                  </AvatarFallback>
                </Avatar>

                {!isOwnProfile && (
                  <FollowButton targetUserId={profile.id} isFollowing={!!isFollowing} className="w-full md:w-auto" />
                )}

                {isOwnProfile && (
                  <Button variant="outline" asChild className="w-full md:w-auto bg-transparent">
                    <Link href="/social/profile/edit">Edit Profile</Link>
                  </Button>
                )}
              </div>

              <div className="flex-1">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-4">
                  <div>
                    <h1 className="text-3xl font-bold mb-2">{profile.display_name}</h1>
                    <p className="text-muted-foreground mb-4">@{profile.username}</p>
                  </div>

                  {profile.verified && <Badge className="bg-gradient-fagulha text-white">Verified</Badge>}
                </div>

                {profile.bio && <p className="text-lg mb-6 leading-relaxed">{profile.bio}</p>}

                <div className="flex flex-wrap gap-4 mb-6 text-muted-foreground">
                  {profile.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      <span>{profile.location}</span>
                    </div>
                  )}

                  {profile.website && (
                    <div className="flex items-center gap-2">
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

                  <div className="flex items-center gap-2">
                    <CalendarDays className="w-4 h-4" />
                    <span>
                      Joined{" "}
                      {new Date(profile.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                    </span>
                  </div>
                </div>

                <div className="flex gap-6">
                  <Link href={`/social/profile/${username}/following`} className="hover:underline">
                    <span className="font-bold">{followingCount || 0}</span>
                    <span className="text-muted-foreground ml-1">Following</span>
                  </Link>
                  <Link href={`/social/profile/${username}/followers`} className="hover:underline">
                    <span className="font-bold">{followersCount || 0}</span>
                    <span className="text-muted-foreground ml-1">Followers</span>
                  </Link>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profile Tabs */}
        <Tabs defaultValue="posts" className="w-full">
          <TabsList className="grid w-full grid-cols-3 glass">
            <TabsTrigger value="posts">Posts</TabsTrigger>
            <TabsTrigger value="media">Media</TabsTrigger>
            {isOwnProfile && <TabsTrigger value="bookmarks">Bookmarks</TabsTrigger>}
            {!isOwnProfile && <TabsTrigger value="likes">Likes</TabsTrigger>}
          </TabsList>

          <TabsContent value="posts" className="space-y-6 mt-8">
            {posts && posts.length > 0 ? (
              posts.map((post) => <PostCard key={post.id} post={post} currentUserId={currentUser.id} />)
            ) : (
              <Card className="glass">
                <CardContent className="p-12 text-center">
                  <p className="text-muted-foreground">No posts yet</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="media" className="mt-8">
            <Card className="glass">
              <CardContent className="p-12 text-center">
                <p className="text-muted-foreground">Media posts will appear here</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bookmarks" className="mt-8">
            <Card className="glass">
              <CardContent className="p-12 text-center">
                <p className="text-muted-foreground">Bookmarked posts will appear here</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="likes" className="mt-8">
            <Card className="glass">
              <CardContent className="p-12 text-center">
                <p className="text-muted-foreground">Liked posts will appear here</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
