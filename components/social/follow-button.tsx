"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { UserPlus, UserMinus } from "lucide-react"

interface FollowButtonProps {
  userId: string
  isFollowing: boolean
  className?: string
}

export function FollowButton({ userId, isFollowing: initialIsFollowing, className }: FollowButtonProps) {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing)
  const [isLoading, setIsLoading] = useState(false)

  const handleFollow = async () => {
    setIsLoading(true)
    const supabase = createClient()

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      if (isFollowing) {
        // Unfollow
        await supabase.from("follows").delete().eq("follower_id", user.id).eq("following_id", userId)
      } else {
        // Follow
        await supabase.from("follows").insert({
          follower_id: user.id,
          following_id: userId,
        })
      }

      setIsFollowing(!isFollowing)
    } catch (error) {
      console.error("Error following/unfollowing:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      onClick={handleFollow}
      disabled={isLoading}
      variant={isFollowing ? "outline" : "default"}
      className={`${isFollowing ? "" : "bg-gradient-fagulha"} ${className}`}
    >
      {isFollowing ? (
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
  )
}
