"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { FagulhaLogo } from "@/components/fagulha-logo"
import { Home, User, Search, Bell, Bookmark, Settings, LogOut } from "lucide-react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"

export function SocialSidebar() {
  const [user, setUser] = useState<any>(null)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const getUser = async () => {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase.from("users").select("*, profiles(*)").eq("id", user.id).single()
        setUser(profile)
      }
    }
    getUser()
  }, [])

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/")
  }

  const navItems = [
    { icon: Home, label: "Feed", href: "/social" },
    { icon: Search, label: "Explore", href: "/social/explore" },
    { icon: Bell, label: "Notifications", href: "/social/notifications" },
    { icon: Bookmark, label: "Bookmarks", href: "/social/bookmarks" },
    { icon: User, label: "Profile", href: `/social/profile/${user?.username}` },
    { icon: Settings, label: "Settings", href: "/social/settings" },
  ]

  return (
    <div className="w-64 h-screen glass border-r border-border/50 p-6 flex flex-col">
      {/* Logo */}
      <div className="mb-8">
        <Link href="/">
          <FagulhaLogo size="md" />
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          return (
            <Button
              key={item.href}
              variant={isActive ? "secondary" : "ghost"}
              className={`w-full justify-start text-left ${
                isActive ? "bg-fagulha-primary/10 text-fagulha-primary" : ""
              }`}
              asChild
            >
              <Link href={item.href}>
                <Icon className="w-5 h-5 mr-3" />
                {item.label}
              </Link>
            </Button>
          )
        })}
      </nav>

      {/* User Profile */}
      {user && (
        <div className="border-t border-border/50 pt-4">
          <div className="flex items-center gap-3 mb-4">
            <Avatar className="w-10 h-10">
              <AvatarImage src={user.avatar_url || user.profiles?.avatar_url} />
              <AvatarFallback className="bg-gradient-fagulha text-white">
                {user.display_name?.charAt(0) || user.username?.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{user.display_name}</p>
              <p className="text-sm text-muted-foreground truncate">@{user.username}</p>
            </div>
          </div>
          <Button variant="ghost" onClick={handleSignOut} className="w-full justify-start text-red-500">
            <LogOut className="w-4 h-4 mr-3" />
            Sign Out
          </Button>
        </div>
      )}
    </div>
  )
}
