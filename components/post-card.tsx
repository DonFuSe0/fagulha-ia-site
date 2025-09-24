"use client"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Heart, MessageCircle, Share, MoreHorizontal, Bookmark } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"

interface PostCardProps {
  post: {
    id: string
    caption?: string
    image_url?: string
    created_at: string
    likes_count: number
    comments_count: number
    reposts_count: number
    author_id: string
    profiles: {
      nickname: string
      display_name: string
      avatar_url?: string
    }
  }
  currentUserId?: string
  showActions?: boolean
  onLike?: () => void
  onComment?: () => void
  onShare?: () => void
}

export function PostCard({ post, currentUserId, showActions = true, onLike, onComment, onShare }: PostCardProps) {
  const [isLiked, setIsLiked] = useState(false)
  const [likesCount, setLikesCount] = useState(post.likes_count)
  const [isLiking, setIsLiking] = useState(false)

  const handleLike = async () => {
    if (!currentUserId || isLiking) return

    setIsLiking(true)
    const supabase = createClient()

    try {
      if (isLiked) {
        // Unlike
        await supabase.from("likes").delete().eq("post_id", post.id).eq("user_id", currentUserId)
        setIsLiked(false)
        setLikesCount((prev) => prev - 1)
      } else {
        // Like
        await supabase.from("likes").insert({
          post_id: post.id,
          user_id: currentUserId,
        })
        setIsLiked(true)
        setLikesCount((prev) => prev + 1)
      }
      onLike?.()
    } catch (error) {
      console.error("Error toggling like:", error)
    } finally {
      setIsLiking(false)
    }
  }

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm hover:bg-card/70 transition-colors">
      <CardContent className="p-0">
        {/* Header */}
        <div className="flex items-center justify-between p-4 pb-3">
          <Link href={`/user/${post.profiles.nickname}`} className="flex items-center gap-3 hover:opacity-80">
            <Avatar className="h-10 w-10 border-2 border-fagulha/20">
              <AvatarImage src={post.profiles.avatar_url || ""} alt={post.profiles.display_name} />
              <AvatarFallback className="bg-fagulha/10 text-fagulha font-semibold">
                {post.profiles.display_name?.charAt(0) || post.profiles.nickname?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold text-sm">{post.profiles.display_name}</p>
              <p className="text-muted-foreground text-xs">@{post.profiles.nickname}</p>
            </div>
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground text-xs">
              {formatDistanceToNow(new Date(post.created_at), { addSuffix: true, locale: ptBR })}
            </span>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Image */}
        {post.image_url && (
          <div className="aspect-square relative overflow-hidden">
            <img
              src={post.image_url || "/placeholder.svg"}
              alt={post.caption || "Post"}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            />
          </div>
        )}

        {/* Actions */}
        {showActions && (
          <div className="flex items-center justify-between p-4 pt-3">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                className={`h-8 p-0 hover:bg-transparent ${isLiked ? "text-red-500" : ""}`}
                onClick={handleLike}
                disabled={isLiking}
              >
                <Heart className={`h-5 w-5 mr-1 ${isLiked ? "fill-current" : ""}`} />
                <span className="text-sm">{likesCount}</span>
              </Button>
              <Button variant="ghost" size="sm" className="h-8 p-0 hover:bg-transparent" onClick={onComment}>
                <MessageCircle className="h-5 w-5 mr-1" />
                <span className="text-sm">{post.comments_count}</span>
              </Button>
              <Button variant="ghost" size="sm" className="h-8 p-0 hover:bg-transparent" onClick={onShare}>
                <Share className="h-5 w-5 mr-1" />
                <span className="text-sm">{post.reposts_count}</span>
              </Button>
            </div>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <Bookmark className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Caption */}
        {post.caption && (
          <div className="px-4 pb-4">
            <p className="text-sm leading-relaxed">
              <Link href={`/user/${post.profiles.nickname}`} className="font-semibold hover:underline">
                {post.profiles.nickname}
              </Link>{" "}
              {post.caption}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
