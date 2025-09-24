import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Bell, Heart, MessageCircle, UserPlus } from "lucide-react"
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
      actor_profiles:profiles!notifications_actor_id_fkey (avatar_url),
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
        return <Heart className="w-4 h-4 text-red-500" />
      case "comment":
        return <MessageCircle className="w-4 h-4 text-fagulha-primary" />
      case "follow":
        return <UserPlus className="w-4 h-4 text-green-500" />
      default:
        return <Bell className="w-4 h-4" />
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
      default:
        return "interacted with your content"
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="flex items-center gap-3 mb-8">
          <Bell className="w-8 h-8 text-fagulha-primary" />
          <h1 className="text-3xl font-bold text-gradient-fagulha">Notifications</h1>
        </div>

        <Card className="glass">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {notifications && notifications.length > 0 ? (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`flex items-start gap-3 p-3 rounded-lg transition-colors ${
                    !notification.read ? "bg-fagulha-primary/5" : "hover:bg-muted/50"
                  }`}
                >
                  <Link href={`/social/profile/${notification.actor.username}`}>
                    <Avatar className="w-10 h-10 hover:ring-2 hover:ring-fagulha-primary/50 transition-all">
                      <AvatarImage src={notification.actor.avatar_url || notification.actor_profiles?.avatar_url} />
                      <AvatarFallback className="bg-gradient-fagulha text-white">
                        {notification.actor.display_name?.charAt(0) || notification.actor.username?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  </Link>

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {getNotificationIcon(notification.type)}
                      <Link
                        href={`/social/profile/${notification.actor.username}`}
                        className="font-semibold hover:text-fagulha-primary transition-colors"
                      >
                        {notification.actor.display_name}
                      </Link>
                      <span className="text-muted-foreground text-sm">{getNotificationText(notification)}</span>
                      {!notification.read && <Badge className="bg-fagulha-primary text-xs">New</Badge>}
                    </div>

                    {notification.post && (
                      <Link
                        href={`/social/post/${notification.post.id}`}
                        className="block text-sm text-muted-foreground hover:text-foreground transition-colors mt-1 p-2 bg-muted/30 rounded"
                      >
                        {notification.post.content.length > 100
                          ? `${notification.post.content.substring(0, 100)}...`
                          : notification.post.content}
                      </Link>
                    )}

                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Bell className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No notifications yet</p>
                <p className="text-sm">When people interact with your posts, you'll see it here</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
