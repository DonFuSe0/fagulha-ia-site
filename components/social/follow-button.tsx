"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { UserPlus, UserMinus } from "lucide-react"

interface FollowButtonProps {
  targetUserId: string
  isFollowing: boolean
  className?: string
}

export function FollowButton({ targetUserId, isFollowing: initialIsFollowing, className }: FollowButtonProps) {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing)
  const [isLoading, setIsLoading] = useState(false)

  const handleFollow = async () => {
    setIsLoading(true)
    const supabase = createClient()

    try {
      if (isFollowing) {
        // Unfollow
        const { error } = await supabase.from("follows").delete().eq("following_id", targetUserId)

        if (!error) {
          setIsFollowing(false)
        }
      } else {
        // Follow
        const { error } = await supabase.from("follows").insert({
          following_id: targetUserId,
        })

        if (!error) {
          setIsFollowing(true)
        }
      }
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
  )
}
