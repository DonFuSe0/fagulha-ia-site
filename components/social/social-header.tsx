import { createClient } from "@/lib/supabase/server"
import { FagulhaLogo } from "@/components/fagulha-logo"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Home, Search, Bell, User, Settings } from "lucide-react"
import Link from "next/link"
import { SignOutButton } from "./sign-out-button"

export async function SocialHeader() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data: profile } = await supabase
    .from("users")
    .select("username, display_name, avatar_url, profiles(avatar_url)")
    .eq("id", user.id)
    .single()

  return (
    <header className="glass sticky top-0 z-50 border-b border-border/50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/social">
              <FagulhaLogo size="sm" />
            </Link>

            <nav className="hidden md:flex items-center gap-6">
              <Link href="/social" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
                <Home className="w-5 h-5" />
                <span>Home</span>
              </Link>
              <Link
                href="/social/explore"
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
              >
                <Search className="w-5 h-5" />
                <span>Explore</span>
              </Link>
              <Link
                href="/social/notifications"
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
              >
                <Bell className="w-5 h-5" />
                <span>Notifications</span>
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <Button variant="outline" asChild className="bg-transparent">
              <Link href="/">Back to Fagulha</Link>
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={profile?.avatar_url || profile?.profiles?.avatar_url} />
                    <AvatarFallback className="bg-gradient-fagulha text-white">
                      {profile?.display_name?.charAt(0) || profile?.username?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 glass" align="end" forceMount>
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    <p className="font-medium">{profile?.display_name}</p>
                    <p className="text-xs text-muted-foreground">@{profile?.username}</p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href={`/social/profile/${profile?.username}`} className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/social/settings" className="flex items-center gap-2">
                    <Settings className="w-4 h-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <SignOutButton />
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  )
}
