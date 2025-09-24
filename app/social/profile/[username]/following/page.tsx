import { createClient } from "@/lib/supabase/server"
import { notFound, redirect } from "next/navigation"
import { SocialHeader } from "@/components/social/social-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { UserCard } from "@/components/social/user-card"

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
        bio,
        verified
      ),
      profiles!follows_following_id_fkey (
        avatar_url
      )
    `)
    .eq("follower_id", profile.id)

  return (
    <div className="min-h-screen bg-background">
      <SocialHeader />

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Card className="glass">
          <CardHeader>
            <CardTitle>Following by @{profile.username}</CardTitle>
          </CardHeader>
          <CardContent>
            {following && following.length > 0 ? (
              <div className="space-y-4">
                {following.map((follow) => (
                  <UserCard key={follow.following_id} user={follow.users} currentUserId={currentUser.id} />
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">Not following anyone yet.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
