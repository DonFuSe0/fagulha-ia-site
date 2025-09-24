import { createClient } from "@/lib/supabase/server"
import { notFound, redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { FollowButton } from "@/components/social/follow-button"
import { Users } from "lucide-react"
import Link from "next/link"

interface FollowersPageProps {
  params: Promise<{ username: string }>
}

export default async function FollowersPage({ params }: FollowersPageProps) {
  const { username } = await params
  const supabase = await createClient()

  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser()
  if (!currentUser) {
    redirect("/auth/login")
  }

  // Get profile data
  const { data: profile, error } = await supabase.from("users").select("*").eq("username", username).single()

  if (error || !profile) {
    notFound()
  }

  // Get followers
  const { data: followers } = await supabase
    .from("follows")
    .select(`
      follower_id,
      users!follows_follower_id_fkey (
        id,
        username,
        display_name,
        avatar_url,
        bio,
        verified,
        profiles (avatar_url)
      )
    `)
    .eq("following_id", profile.id)

  // Get current user's follows to show follow status
  const { data: currentFollows } = await supabase
    .from("follows")
    .select("following_id")
    .eq("follower_id", currentUser.id)

  const followedIds = currentFollows?.map((f) => f.following_id) || []

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Card className="glass">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              {profile.display_name}'s Followers ({followers?.length || 0})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {followers && followers.length > 0 ? (
              followers.map((follow) => {
                const follower = follow.users
                const isFollowing = followedIds.includes(follower.id)
                const isOwnProfile = currentUser.id === follower.id

                return (
                  <div key={follower.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50">
                    <Link href={`/social/profile/${follower.username}`}>
                      <Avatar className="w-12 h-12 hover:ring-2 hover:ring-fagulha-primary/50 transition-all">
                        <AvatarImage src={follower.avatar_url || follower.profiles?.avatar_url} />
                        <AvatarFallback className="bg-gradient-fagulha text-white">
                          {follower.display_name?.charAt(0) || follower.username?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                    </Link>

                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/social/profile/${follower.username}`}
                          className="font-semibold hover:text-fagulha-primary transition-colors"
                        >
                          {follower.display_name}
                        </Link>
                      </div>
                      <p className="text-muted-foreground text-sm">@{follower.username}</p>
                      {follower.bio && (
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{follower.bio}</p>
                      )}
                    </div>

                    {!isOwnProfile && <FollowButton userId={follower.id} isFollowing={isFollowing} />}
                  </div>
                )
              })
            ) : (
              <p className="text-muted-foreground text-center py-8">No followers yet</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
