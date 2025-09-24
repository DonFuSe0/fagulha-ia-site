import { createClient } from "@/lib/supabase/server"
import { notFound, redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { FollowButton } from "@/components/social/follow-button"
import Link from "next/link"

interface FollowingPageProps {
  params: Promise<{ username: string }>
}

export default async function FollowingPage({ params }: FollowingPageProps) {
  const { username } = await params
  const supabase = await createClient()

  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser()
  if (!currentUser) {
    redirect("/auth/login")
  }

  // Get profile data
  const { data: profile, error } = await supabase
    .from("users")
    .select("id, username, display_name")
    .eq("username", username)
    .single()

  if (error || !profile) {
    notFound()
  }

  // Get following
  const { data: following } = await supabase
    .from("follows")
    .select(`
      following_id,
      users!follows_following_id_fkey (
        id,
        username,
        display_name,
        avatar_url,
        profiles (avatar_url)
      )
    `)
    .eq("follower_id", profile.id)

  // Get current user's follows to show follow status
  const { data: currentFollows } = await supabase
    .from("follows")
    .select("following_id")
    .eq("follower_id", currentUser.id)

  const followedIds = new Set(currentFollows?.map((f) => f.following_id) || [])

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="mb-8">
          <Link
            href={`/social/profile/${username}`}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Back to Profile
          </Link>
          <h1 className="text-3xl font-bold mt-4">{profile.display_name} is Following</h1>
        </div>

        <Card className="glass">
          <CardHeader>
            <CardTitle>Following ({following?.length || 0})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {following && following.length > 0 ? (
              following.map((follow) => {
                const followedUser = follow.users
                const isFollowing = followedIds.has(followedUser.id)
                const isOwnProfile = currentUser.id === followedUser.id

                return (
                  <div
                    key={followedUser.id}
                    className="flex items-center justify-between p-4 rounded-lg hover:bg-muted/20 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <Link href={`/social/profile/${followedUser.username}`}>
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={followedUser.avatar_url || followedUser.profiles?.avatar_url} />
                          <AvatarFallback className="bg-gradient-fagulha text-white">
                            {followedUser.display_name?.charAt(0) || followedUser.username?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                      </Link>
                      <div>
                        <Link
                          href={`/social/profile/${followedUser.username}`}
                          className="font-semibold hover:text-fagulha-primary transition-colors"
                        >
                          {followedUser.display_name}
                        </Link>
                        <p className="text-sm text-muted-foreground">@{followedUser.username}</p>
                      </div>
                    </div>

                    {!isOwnProfile && <FollowButton targetUserId={followedUser.id} isFollowing={isFollowing} />}
                  </div>
                )
              })
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Not following anyone yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
