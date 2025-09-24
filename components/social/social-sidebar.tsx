import { createClient } from "@/lib/supabase/server"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { FagulhaLogo } from "@/components/fagulha-logo"
import { Home, User, Search, Bell, Bookmark, Settings, LogOut } from "lucide-react"
import Link from "next/link"

export async function SocialSidebar() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data: profile } = await supabase.from("users").select("*, profiles (*)").eq("id", user.id).single()

  const navItems = [
    { icon: Home, label: "Home", href: "/social" },
    { icon: Search, label: "Explore", href: "/social/explore" },
    { icon: Bell, label: "Notifications", href: "/social/notifications" },
    { icon: Bookmark, label: "Bookmarks", href: "/social/bookmarks" },
    { icon: User, label: "Profile", href: `/social/profile/${profile?.username}` },
    { icon: Settings, label: "Settings", href: "/social/settings" },
  ]

  return (
    <aside className="w-80 min-h-screen border-r border-border/50 p-6">
      <div className="space-y-6">
        {/* Logo */}
        <div className="px-4">
          <Link href="/">
            <FagulhaLogo size="md" />
          </Link>
        </div>

        {/* Navigation */}
        <nav className="space-y-2">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <Button variant="ghost" className="w-full justify-start text-lg py-6 hover:bg-fagulha-primary/10">
                <item.icon className="w-6 h-6 mr-4" />
                {item.label}
              </Button>
            </Link>
          ))}
        </nav>

        {/* User Profile Card */}
        {profile && (
          <Card className="glass">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={profile.avatar_url || profile.profiles?.avatar_url} />
                  <AvatarFallback className="bg-gradient-fagulha text-white">
                    {profile.display_name?.charAt(0) || profile.username?.charAt(0)}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate">{profile.display_name}</p>
                  <p className="text-sm text-muted-foreground truncate">@{profile.username}</p>
                </div>

                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </aside>
  )
}
