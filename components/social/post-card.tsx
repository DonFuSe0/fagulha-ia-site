"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Heart, MessageCircle, Repeat2, Bookmark, Share, MoreHorizontal } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface PostCardProps {
  post: any
  currentUserId: string
}

export function PostCard({ post, currentUserId }: PostCardProps) {
  const [isLiked, setIsLiked] = useState(post.likes?.some((like: any) => like.user_id === currentUserId))
  const [isBookmarked, setIsBookmarked] = useState(
    post.bookmarks?.some((bookmark: any) => bookmark.user_id === currentUserId),
  )
  const [likesCount, setLikesCount] = useState(post.likes?.length || 0)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleLike = async () => {
    setIsLoading(true)
    const supabase = createClient()

    try {
      if (isLiked) {
        // Unlike
        const { error } = await supabase.from("likes").delete().eq("post_id", post.id).eq("user_id", currentUserId)

        if (!error) {
          setIsLiked(false)
          setLikesCount((prev) => prev - 1)
        }
      } else {
        // Like
        const { error } = await supabase.from("likes").insert({
          post_id: post.id,
          user_id: currentUserId,
        })

        if (!error) {
          setIsLiked(true)
          setLikesCount((prev) => prev + 1)
        }
      }
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
        const { error } = await supabase.from("bookmarks").delete().eq("post_id", post.id).eq("user_id", currentUserId)

        if (!error) {
          setIsBookmarked(false)
        }
      } else {
        // Add bookmark
        const { error } = await supabase.from("bookmarks").insert({
          post_id: post.id,
          user_id: currentUserId,
        })

        if (!error) {
          setIsBookmarked(true)
        }
      }
    } catch (error) {
      console.error("Error bookmarking post:", error)
    }
  }

  const isOwnPost = post.author_id === currentUserId

  return (
    <Card className="glass hover:glow-fagulha-sm transition-all duration-300">
      <CardContent className="p-6">
        <div className="flex gap-4">
          <Link href={`/social/profile/${post.users?.username}`}>
            <Avatar className="w-12 h-12">
              <AvatarImage src={post.users?.avatar_url || post.profiles?.avatar_url} />
              <AvatarFallback className="bg-gradient-fagulha text-white">
                {post.users?.display_name?.charAt(0) || post.users?.username?.charAt(0)}
              </AvatarFallback>
            </Avatar>
          </Link>

          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Link href={`/social/profile/${post.users?.username}`} className="font-semibold hover:underline">
                  {post.users?.display_name}
                </Link>
                <span className="text-muted-foreground">@{post.users?.username}</span>
                <span className="text-muted-foreground">·</span>
                <span className="text-muted-foreground text-sm">{new Date(post.created_at).toLocaleDateString()}</span>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="glass">
                  {isOwnPost ? (
                    <>
                      <DropdownMenuItem>Edit Post</DropdownMenuItem>
                      <DropdownMenuItem className="text-red-500">Delete Post</DropdownMenuItem>
                    </>
                  ) : (
                    <>
                      <DropdownMenuItem>Report Post</DropdownMenuItem>
                      <DropdownMenuItem>Block User</DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="mb-4">
              <p className="text-lg leading-relaxed">{post.content}</p>
              {post.image_url && (
                <div className="mt-4 rounded-lg overflow-hidden">
                  <img
                    src={post.image_url || "/placeholder.svg"}
                    alt={post.image_alt || ""}
                    className="w-full h-auto"
                  />
                </div>
              )}
            </div>

            <div className="flex items-center justify-between max-w-md">
              <Button
                variant="ghost"
                size="sm"
                asChild
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
              >
                <Link href={`/social/post/${post.id}`}>
                  <MessageCircle className="w-5 h-5" />
                  <span>{post.comments?.length || 0}</span>
                </Link>
              </Button>

              <Button variant="ghost" size="sm" className="flex items-center gap-2 text-muted-foreground">
                <Repeat2 className="w-5 h-5" />
                <span>0</span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleLike}
                disabled={isLoading}
                className={`flex items-center gap-2 ${
                  isLiked ? "text-red-500" : "text-muted-foreground"
                } hover:text-red-500`}
              >
                <Heart className={`w-5 h-5 ${isLiked ? "fill-current" : ""}`} />
                <span>{likesCount}</span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleBookmark}
                className={`flex items-center gap-2 ${
                  isBookmarked ? "text-fagulha-primary" : "text-muted-foreground"
                } hover:text-fagulha-primary`}
              >
                <Bookmark className={`w-5 h-5 ${isBookmarked ? "fill-current" : ""}`} />
              </Button>

              <Button variant="ghost" size="sm" className="flex items-center gap-2 text-muted-foreground">
                <Share className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
