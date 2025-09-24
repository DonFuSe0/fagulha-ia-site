"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MessageCircle, Heart, Reply } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import Link from "next/link"

interface CommentSectionProps {
  postId: string
  currentUserId: string
}

interface Comment {
  id: string
  content: string
  created_at: string
  user_id: string
  reply_to: string | null
  users: {
    username: string
    display_name: string
    avatar_url: string | null
  }
  profiles: {
    avatar_url: string | null
  }
  likes: { id: string; user_id: string }[]
}

export function CommentSection({ postId, currentUserId }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [replyTo, setReplyTo] = useState<string | null>(null)

  useEffect(() => {
    fetchComments()
  }, [postId])

  const fetchComments = async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from("comments")
      .select(`
        *,
        users!comments_user_id_fkey (username, display_name, avatar_url),
        profiles!comments_user_id_fkey (avatar_url),
        likes (id, user_id)
      `)
      .eq("post_id", postId)
      .order("created_at", { ascending: true })

    if (data) {
      setComments(data as Comment[])
    }
  }

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim()) return

    setIsLoading(true)
    const supabase = createClient()

    try {
      const { error } = await supabase.from("comments").insert({
        content: newComment.trim(),
        post_id: postId,
        user_id: currentUserId,
        reply_to: replyTo,
      })

      if (error) throw error

      setNewComment("")
      setReplyTo(null)
      fetchComments()
    } catch (error) {
      console.error("Error posting comment:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLikeComment = async (commentId: string, isLiked: boolean) => {
    const supabase = createClient()

    try {
      if (isLiked) {
        await supabase.from("likes").delete().eq("user_id", currentUserId).eq("comment_id", commentId)
      } else {
        await supabase.from("likes").insert({
          user_id: currentUserId,
          comment_id: commentId,
        })
      }
      fetchComments()
    } catch (error) {
      console.error("Error liking comment:", error)
    }
  }

  const topLevelComments = comments.filter((comment) => !comment.reply_to)
  const getReplies = (commentId: string) => comments.filter((comment) => comment.reply_to === commentId)

  return (
    <Card className="glass mt-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5" />
          Comments ({comments.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Comment Form */}
        <form onSubmit={handleSubmitComment} className="space-y-4">
          <div className="flex gap-3">
            <Avatar className="w-10 h-10">
              <AvatarImage src="/placeholder.svg" />
              <AvatarFallback className="bg-gradient-fagulha text-white">U</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <Textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder={replyTo ? "Write a reply..." : "Write a comment..."}
                className="min-h-[80px] resize-none"
                maxLength={280}
              />
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-2">
                  {replyTo && (
                    <Button type="button" variant="ghost" size="sm" onClick={() => setReplyTo(null)}>
                      Cancel Reply
                    </Button>
                  )}
                  <span className="text-sm text-muted-foreground">{newComment.length}/280</span>
                </div>
                <Button
                  type="submit"
                  disabled={!newComment.trim() || isLoading}
                  size="sm"
                  className="bg-gradient-fagulha"
                >
                  {isLoading ? "Posting..." : replyTo ? "Reply" : "Comment"}
                </Button>
              </div>
            </div>
          </div>
        </form>

        {/* Comments List */}
        <div className="space-y-4">
          {topLevelComments.map((comment) => (
            <div key={comment.id} className="space-y-3">
              <CommentItem
                comment={comment}
                currentUserId={currentUserId}
                onLike={handleLikeComment}
                onReply={setReplyTo}
              />
              {/* Replies */}
              {getReplies(comment.id).map((reply) => (
                <div key={reply.id} className="ml-12">
                  <CommentItem
                    comment={reply}
                    currentUserId={currentUserId}
                    onLike={handleLikeComment}
                    onReply={setReplyTo}
                    isReply
                  />
                </div>
              ))}
            </div>
          ))}
        </div>

        {comments.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No comments yet. Be the first to comment!</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

interface CommentItemProps {
  comment: Comment
  currentUserId: string
  onLike: (commentId: string, isLiked: boolean) => void
  onReply: (commentId: string) => void
  isReply?: boolean
}

function CommentItem({ comment, currentUserId, onLike, onReply, isReply = false }: CommentItemProps) {
  const isLiked = comment.likes?.some((like) => like.user_id === currentUserId) || false
  const likesCount = comment.likes?.length || 0

  return (
    <div className={`flex gap-3 ${isReply ? "border-l-2 border-border/50 pl-4" : ""}`}>
      <Link href={`/social/profile/${comment.users.username}`}>
        <Avatar className="w-10 h-10 hover:ring-2 hover:ring-fagulha-primary/50 transition-all">
          <AvatarImage src={comment.users.avatar_url || comment.profiles?.avatar_url} />
          <AvatarFallback className="bg-gradient-fagulha text-white">
            {comment.users.display_name?.charAt(0) || comment.users.username?.charAt(0)}
          </AvatarFallback>
        </Avatar>
      </Link>

      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <Link
            href={`/social/profile/${comment.users.username}`}
            className="font-semibold hover:text-fagulha-primary transition-colors"
          >
            {comment.users.display_name}
          </Link>
          <span className="text-muted-foreground text-sm">@{comment.users.username}</span>
          <span className="text-muted-foreground">·</span>
          <span className="text-muted-foreground text-sm">
            {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
          </span>
        </div>

        <p className="text-foreground mb-2 leading-relaxed">{comment.content}</p>

        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onLike(comment.id, isLiked)}
            className={`text-muted-foreground hover:text-red-500 ${isLiked ? "text-red-500" : ""}`}
          >
            <Heart className={`w-4 h-4 mr-1 ${isLiked ? "fill-current" : ""}`} />
            {likesCount}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => onReply(comment.id)}
            className="text-muted-foreground hover:text-fagulha-primary"
          >
            <Reply className="w-4 h-4 mr-1" />
            Reply
          </Button>
        </div>
      </div>
    </div>
  )
}
