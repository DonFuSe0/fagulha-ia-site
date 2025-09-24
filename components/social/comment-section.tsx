"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { formatDistanceToNow } from "date-fns"
import { Heart, Reply, MoreHorizontal } from "lucide-react"

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
  likes: Array<{ id: string; user_id: string }>
}

export function CommentSection({ postId, currentUserId }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [replyTo, setReplyTo] = useState<string | null>(null)

  const supabase = createClient()

  useEffect(() => {
    fetchComments()
  }, [postId])

  const fetchComments = async () => {
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
    try {
      if (isLiked) {
        await supabase.from("likes").delete().eq("comment_id", commentId).eq("user_id", currentUserId)
      } else {
        await supabase.from("likes").insert({
          comment_id: commentId,
          user_id: currentUserId,
        })
      }
      fetchComments()
    } catch (error) {
      console.error("Error liking comment:", error)
    }
  }

  // Organize comments into threads
  const topLevelComments = comments.filter((comment) => !comment.reply_to)
  const getReplies = (commentId: string) => comments.filter((comment) => comment.reply_to === commentId)

  return (
    <Card className="glass">
      <CardHeader>
        <CardTitle>Comments ({comments.length})</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Comment Form */}
        <form onSubmit={handleSubmitComment} className="space-y-4">
          <Textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder={replyTo ? "Write a reply..." : "Write a comment..."}
            className="min-h-[100px] resize-none"
            maxLength={500}
          />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {replyTo && (
                <Button type="button" variant="outline" size="sm" onClick={() => setReplyTo(null)}>
                  Cancel Reply
                </Button>
              )}
            </div>

            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">{newComment.length}/500</span>
              <Button
                type="submit"
                disabled={!newComment.trim() || isLoading || newComment.length > 500}
                className="bg-gradient-fagulha hover:opacity-90"
              >
                {isLoading ? "Posting..." : replyTo ? "Reply" : "Comment"}
              </Button>
            </div>
          </div>
        </form>

        {/* Comments List */}
        <div className="space-y-6">
          {topLevelComments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              currentUserId={currentUserId}
              onLike={handleLikeComment}
              onReply={setReplyTo}
              replies={getReplies(comment.id)}
            />
          ))}

          {comments.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No comments yet. Be the first to comment!</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

interface CommentItemProps {
  comment: Comment
  currentUserId: string
  onLike: (commentId: string, isLiked: boolean) => void
  onReply: (commentId: string) => void
  replies: Comment[]
}

function CommentItem({ comment, currentUserId, onLike, onReply, replies }: CommentItemProps) {
  const isLiked = comment.likes?.some((like) => like.user_id === currentUserId) || false
  const likesCount = comment.likes?.length || 0

  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <Avatar className="w-10 h-10">
          <AvatarImage src={comment.users.avatar_url || comment.profiles?.avatar_url} />
          <AvatarFallback className="bg-gradient-fagulha text-white text-sm">
            {comment.users.display_name?.charAt(0) || comment.users.username?.charAt(0)}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 space-y-2">
          <div className="bg-muted/30 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <span className="font-semibold text-sm">{comment.users.display_name}</span>
              <span className="text-xs text-muted-foreground">@{comment.users.username}</span>
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
              </span>
            </div>
            <p className="text-sm leading-relaxed">{comment.content}</p>
          </div>

          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onLike(comment.id, isLiked)}
              className={`flex items-center gap-1 text-xs hover:text-red-500 transition-colors ${
                isLiked ? "text-red-500" : "text-muted-foreground"
              }`}
            >
              <Heart className={`w-4 h-4 ${isLiked ? "fill-current" : ""}`} />
              {likesCount > 0 && <span>{likesCount}</span>}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => onReply(comment.id)}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-blue-500 transition-colors"
            >
              <Reply className="w-4 h-4" />
              Reply
            </Button>

            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Replies */}
      {replies.length > 0 && (
        <div className="ml-12 space-y-4 border-l-2 border-border/30 pl-4">
          {replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              currentUserId={currentUserId}
              onLike={onLike}
              onReply={onReply}
              replies={[]}
            />
          ))}
        </div>
      )}
    </div>
  )
}
