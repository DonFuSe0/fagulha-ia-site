"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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

  const supabase = createClient()

  const handleLike = async () => {
    if (isLoading) return
    setIsLoading(true)

    try {
      if (isLiked) {
        // Unlike
        await supabase.from("likes").delete().eq("post_id", post.id).eq("user_id", currentUserId)
        setLikesCount((prev) => prev - 1)
      } else {
        // Like
        await supabase.from("likes").insert({
          post_id: post.id,
          user_id: currentUserId,
        })
        setLikesCount((prev) => prev + 1)
      }
      setIsLiked(!isLiked)
    } catch (error) {
      console.error("Error liking post:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleBookmark = async () => {
    if (isLoading) return
    setIsLoading(true)

    try {
      if (isBookmarked) {
        // Remove bookmark
        await supabase.from("bookmarks").delete().eq("post_id", post.id).eq("user_id", currentUserId)
      } else {
        // Add bookmark
        await supabase.from("bookmarks").insert({
          post_id: post.id,
          user_id: currentUserId,
        })
      }
      setIsBookmarked(!isBookmarked)
    } catch (error) {
      console.error("Error bookmarking post:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="glass hover:glow-fagulha-sm transition-all duration-300">
      <CardContent className="p-6">
        {/* Post Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <Link href={`/social/profile/${post.users.username}`}>
              <Avatar className="w-12 h-12 hover:ring-2 hover:ring-fagulha-primary/50 transition-all">
                <AvatarImage src={post.users.avatar_url || post.profiles?.avatar_url} />
                <AvatarFallback className="bg-gradient-fagulha text-white">
                  {post.users.display_name?.charAt(0) || post.users.username?.charAt(0)}
                </AvatarFallback>
              </Avatar>
            </Link>

            <div>
              <Link
                href={`/social/profile/${post.users.username}`}
                className="font-semibold hover:text-fagulha-primary transition-colors"
              >
                {post.users.display_name}
              </Link>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>@{post.users.username}</span>
                <span>•</span>
                <Link href={`/social/post/${post.id}`} className="hover:text-foreground transition-colors">
                  {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                </Link>
              </div>
            </div>
          </div>

          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </div>

        {/* Post Content */}
        <div className="mb-4">
          <p className="text-lg leading-relaxed whitespace-pre-wrap">{post.content}</p>

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
        <div className="flex items-center justify-between pt-4 border-t border-border/50">
          <div className="flex items-center gap-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              disabled={isLoading}
              className={`flex items-center gap-2 hover:text-red-500 transition-colors ${
                isLiked ? "text-red-500" : "text-muted-foreground"
              }`}
            >
              <Heart className={`w-5 h-5 ${isLiked ? "fill-current" : ""}`} />
              <span>{likesCount}</span>
            </Button>

            <Link href={`/social/post/${post.id}`}>
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center gap-2 text-muted-foreground hover:text-blue-500 transition-colors"
              >
                <MessageCircle className="w-5 h-5" />
                <span>{post.comments?.length || 0}</span>
              </Button>
            </Link>

            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-green-500 transition-colors">
              <Share className="w-5 h-5" />
            </Button>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleBookmark}
            disabled={isLoading}
            className={`hover:text-yellow-500 transition-colors ${
              isBookmarked ? "text-yellow-500" : "text-muted-foreground"
            }`}
          >
            <Bookmark className={`w-5 h-5 ${isBookmarked ? "fill-current" : ""}`} />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
