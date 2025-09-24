"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { UserPlus, UserMinus } from "lucide-react"
import Link from "next/link"

interface UserCardProps {
  user: any
  currentUserId: string
}

export function UserCard({ user, currentUserId }: UserCardProps) {
  const [isFollowing, setIsFollowing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [followersCount, setFollowersCount] = useState(0)

  useEffect(() => {
    checkFollowStatus()
    getFollowersCount()
  }, [user.id, currentUserId])

  const checkFollowStatus = async () => {
    if (user.id === currentUserId) return

    const supabase = createClient()
    const { data } = await supabase
      .from("follows")
      .select("id")
      .eq("follower_id", currentUserId)
      .eq("following_id", user.id)
      .single()

    setIsFollowing(!!data)
  }

  const getFollowersCount = async () => {
    const supabase = createClient()
    const { count } = await supabase
      .from("follows")
      .select("*", { count: "exact", head: true })
      .eq("following_id", user.id)

    setFollowersCount(count || 0)
  }

  const handleFollow = async () => {
    if (user.id === currentUserId) return

    setIsLoading(true)
    const supabase = createClient()

    try {
      if (isFollowing) {
        // Unfollow
        const { error } = await supabase
          .from("follows")
          .delete()
          .eq("follower_id", currentUserId)
          .eq("following_id", user.id)

        if (!error) {
          setIsFollowing(false)
          setFollowersCount((prev) => prev - 1)
        }
      } else {
        // Follow
        const { error } = await supabase.from("follows").insert({
          follower_id: currentUserId,
          following_id: user.id,
        })

        if (!error) {
          setIsFollowing(true)
          setFollowersCount((prev) => prev + 1)
        }
      }
    } catch (error) {
      console.error("Error following/unfollowing:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const isOwnProfile = user.id === currentUserId

  return (
    <div className="flex items-center justify-between p-4 rounded-lg glass hover:glow-fagulha-sm transition-all duration-300">
      <div className="flex items-center gap-4">
        <Link href={`/social/profile/${user.username}`}>
          <Avatar className="w-12 h-12">
            <AvatarImage src={user.avatar_url || user.profiles?.avatar_url} />
            <AvatarFallback className="bg-gradient-fagulha text-white">
              {user.display_name?.charAt(0) || user.username?.charAt(0)}
            </AvatarFallback>
          </Avatar>
        </Link>

        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Link href={`/social/profile/${user.username}`} className="font-semibold hover:underline">
              {user.display_name}
            </Link>
            {user.verified && <Badge className="bg-gradient-fagulha text-white text-xs">Verified</Badge>}
          </div>
          <p className="text-muted-foreground text-sm">@{user.username}</p>
          {user.bio && <p className="text-sm mt-1 line-clamp-2">{user.bio}</p>}
          <p className="text-xs text-muted-foreground mt-1">{followersCount} followers</p>
        </div>
      </div>

      {!isOwnProfile && (
        <Button
          onClick={handleFollow}
          disabled={isLoading}
          variant={isFollowing ? "outline" : "default"}
          size="sm"
          className={isFollowing ? "" : "bg-gradient-fagulha"}
        >
          {isLoading ? (
            "Loading..."
          ) : isFollowing ? (
            <>
              <UserMinus className="w-4 h-4 mr-2" />
              Unfollow
            </>
          ) : (
            <>
              <UserPlus className="w-4 h-4 mr-2" />
              Follow
            </>
          )}
        </Button>
      )}
    </div>
  )
}
