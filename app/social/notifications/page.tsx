import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Heart, MessageCircle, UserPlus, Repeat } from "lucide-react"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"

export default async function NotificationsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  // Get notifications
  const { data: notifications } = await supabase
    .from("notifications")
    .select(`
      *,
      actor:users!notifications_actor_id_fkey (username, display_name, avatar_url),
      post:posts (id, content)
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50)

  // Mark notifications as read
  await supabase.from("notifications").update({ read: true }).eq("user_id", user.id).eq("read", false)

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "like":
        return <Heart className="w-5 h-5 text-red-500" />
      case "comment":
        return <MessageCircle className="w-5 h-5 text-blue-500" />
      case "follow":
        return <UserPlus className="w-5 h-5 text-green-500" />
      case "repost":
        return <Repeat className="w-5 h-5 text-purple-500" />
      default:
        return <Heart className="w-5 h-5 text-muted-foreground" />
    }
  }

  const getNotificationText = (notification: any) => {
    switch (notification.type) {
      case "like":
        return "liked your post"
      case "comment":
        return "commented on your post"
      case "follow":
        return "started following you"
      case "repost":
        return "reposted your post"
      default:
        return "interacted with your content"
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <h1 className="text-3xl font-bold mb-8">Notifications</h1>

        <Card className="glass">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {notifications && notifications.length > 0 ? (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`flex items-start gap-4 p-4 rounded-lg transition-colors ${
                    !notification.read ? "bg-fagulha-primary/5" : "hover:bg-muted/20"
                  }`}
                >
                  <div className="flex-shrink-0">{getNotificationIcon(notification.type)}</div>

                  <div className="flex items-center gap-3 flex-1">
                    <Link href={`/social/profile/${notification.actor.username}`}>
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={notification.actor.avatar_url || "/placeholder.svg"} />
                        <AvatarFallback className="bg-gradient-fagulha text-white">
                          {notification.actor.display_name?.charAt(0) || notification.actor.username?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                    </Link>

                    <div className="flex-1">
                      <p className="text-sm">
                        <Link
                          href={`/social/profile/${notification.actor.username}`}
                          className="font-semibold hover:text-fagulha-primary transition-colors"
                        >
                          {notification.actor.display_name}
                        </Link>{" "}
                        {getNotificationText(notification)}
                      </p>

                      {notification.post && (
                        <Link
                          href={`/social/post/${notification.post.id}`}
                          className="text-xs text-muted-foreground hover:text-foreground transition-colors line-clamp-1 mt-1"
                        >
                          "{notification.post.content}"
                        </Link>
                      )}

                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                      </p>
                    </div>
                  </div>

                  {!notification.read && <Badge className="bg-fagulha-primary text-white">New</Badge>}
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No notifications yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
