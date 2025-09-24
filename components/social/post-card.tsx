"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Heart, MessageCircle, Bookmark, Share, MoreHorizontal } from "lucide-react"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"

interface PostCardProps {
  post: any
  currentUserId: string
}

export function PostCard({ post, currentUserId }: PostCardProps) {
  const [isLiked, setIsLiked] = useState(post.likes?.some((like: any) => like.user_id === currentUserId) || false)
  const [isBookmarked, setIsBookmarked] = useState(
    post.bookmarks?.some((bookmark: any) => bookmark.user_id === currentUserId) || false,
  )
  const [likesCount, setLikesCount] = useState(post.likes?.length || 0)
  const [isLoading, setIsLoading] = useState(false)

  const handleLike = async () => {
    setIsLoading(true)
    const supabase = createClient()

    try {
      if (isLiked) {
        // Unlike
        await supabase.from("likes").delete().eq("user_id", currentUserId).eq("post_id", post.id)
        setLikesCount(likesCount - 1)
      } else {
        // Like
        await supabase.from("likes").insert({
          user_id: currentUserId,
          post_id: post.id,
        })
        setLikesCount(likesCount + 1)
      }
      setIsLiked(!isLiked)
    } catch (error) {
      console.error("Error liking post:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleBookmark = async () => {
    const supabase = createClient()

    try {
      if (isBookmarked) {
        // Remove bookmark
        await supabase.from("bookmarks").delete().eq("user_id", currentUserId).eq("post_id", post.id)
      } else {
        // Add bookmark
        await supabase.from("bookmarks").insert({
          user_id: currentUserId,
          post_id: post.id,
        })
      }
      setIsBookmarked(!isBookmarked)
    } catch (error) {
      console.error("Error bookmarking post:", error)
    }
  }

  return (
    <Card className="glass hover:glow-fagulha-sm transition-all duration-300">
      <CardContent className="p-6">
        {/* Post Header */}
        <div className="flex items-start gap-3 mb-4">
          <Link href={`/social/profile/${post.users.username}`}>
            <Avatar className="w-12 h-12 hover:ring-2 hover:ring-fagulha-primary/50 transition-all">
              <AvatarImage src={post.users.avatar_url || post.profiles?.avatar_url} />
              <AvatarFallback className="bg-gradient-fagulha text-white">
                {post.users.display_name?.charAt(0) || post.users.username?.charAt(0)}
              </AvatarFallback>
            </Avatar>
          </Link>

          <div className="flex-1">
            <div className="flex items-center gap-2">
              <Link
                href={`/social/profile/${post.users.username}`}
                className="font-semibold hover:text-fagulha-primary transition-colors"
              >
                {post.users.display_name}
              </Link>
              <span className="text-muted-foreground">@{post.users.username}</span>
              <span className="text-muted-foreground">·</span>
              <span className="text-muted-foreground text-sm">
                {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
              </span>
            </div>
          </div>

          <Button variant="ghost" size="sm" className="text-muted-foreground">
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </div>

        {/* Post Content */}
        <div className="mb-4">
          <p className="text-foreground leading-relaxed whitespace-pre-wrap">{post.content}</p>
          {post.image_url && (
            <div className="mt-4 rounded-lg overflow-hidden">
              <img
                src={post.image_url || "/placeholder.svg"}
                alt={post.image_alt || "Post image"}
                className="w-full h-auto"
              />
            </div>
          )}
        </div>

        {/* Post Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-border/50">
          <div className="flex items-center gap-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              disabled={isLoading}
              className={`text-muted-foreground hover:text-red-500 ${isLiked ? "text-red-500" : ""}`}
            >
              <Heart className={`w-4 h-4 mr-1 ${isLiked ? "fill-current" : ""}`} />
              {likesCount}
            </Button>

            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-fagulha-primary" asChild>
              <Link href={`/social/post/${post.id}`}>
                <MessageCircle className="w-4 h-4 mr-1" />
                {post.comments?.length || 0}
              </Link>
            </Button>

            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-fagulha-primary">
              <Share className="w-4 h-4" />
            </Button>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleBookmark}
            className={`text-muted-foreground hover:text-fagulha-primary ${isBookmarked ? "text-fagulha-primary" : ""}`}
          >
            <Bookmark className={`w-4 h-4 ${isBookmarked ? "fill-current" : ""}`} />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
