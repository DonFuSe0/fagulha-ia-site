"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Users, MessageCircle } from "lucide-react"
import Link from "next/link"

interface UserCardProps {
  profile: {
    id: string
    nickname: string
    display_name: string
    avatar_url?: string
    bio?: string
    followers_count?: number
    posts_count?: number
  }
  showFollowButton?: boolean
  isFollowing?: boolean
  onFollowToggle?: () => void
}

export function UserCard({ profile, showFollowButton = false, isFollowing = false, onFollowToggle }: UserCardProps) {
  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm hover:bg-card/70 transition-colors">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <Link href={`/user/${profile.nickname}`}>
            <Avatar className="h-16 w-16 border-2 border-fagulha/20">
              <AvatarImage src={profile.avatar_url || ""} alt={profile.display_name || ""} />
              <AvatarFallback className="bg-fagulha/10 text-fagulha text-xl font-semibold">
                {profile.display_name?.charAt(0) || profile.nickname?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
          </Link>

          <div className="flex-1 min-w-0">
            <Link href={`/user/${profile.nickname}`} className="block">
              <h3 className="font-semibold text-lg truncate hover:text-fagulha transition-colors">
                {profile.display_name}
              </h3>
              <p className="text-muted-foreground text-sm">@{profile.nickname}</p>
            </Link>

            {profile.bio && <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{profile.bio}</p>}

            <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                {profile.followers_count || 0} seguidores
              </div>
              <div className="flex items-center gap-1">
                <MessageCircle className="h-4 w-4" />
                {profile.posts_count || 0} posts
              </div>
            </div>
          </div>

          {showFollowButton && (
            <Button
              size="sm"
              className={isFollowing ? "bg-muted hover:bg-muted/80" : "bg-gradient-fagulha hover:opacity-90"}
              variant={isFollowing ? "secondary" : "default"}
              onClick={onFollowToggle}
            >
              {isFollowing ? "Seguindo" : "Seguir"}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
