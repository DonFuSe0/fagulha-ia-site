"use client"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Heart, MessageCircle, MoreHorizontal } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { CreateCommentForm } from "./create-comment-form"
import Link from "next/link"

interface CommentsListProps {
  comments: any[]
  currentUserId: string
  postId: string
}

export function CommentsList({ comments, currentUserId, postId }: CommentsListProps) {
  return (
    <div className="space-y-6">
      {comments.map((comment) => (
        <CommentItem key={comment.id} comment={comment} currentUserId={currentUserId} postId={postId} />
      ))}
    </div>
  )
}

interface CommentItemProps {
  comment: any
  currentUserId: string
  postId: string
}

function CommentItem({ comment, currentUserId, postId }: CommentItemProps) {
  const [showReplyForm, setShowReplyForm] = useState(false)
  const [isLiked, setIsLiked] = useState(false) // TODO: Implement comment likes
  const [likesCount, setLikesCount] = useState(0)

  const isOwnComment = comment.user_id === currentUserId

  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <Link href={`/social/profile/${comment.users?.username}`}>
          <Avatar className="w-10 h-10">
            <AvatarImage src={comment.users?.avatar_url || comment.profiles?.avatar_url} />
            <AvatarFallback className="bg-gradient-fagulha text-white">
              {comment.users?.display_name?.charAt(0) || comment.users?.username?.charAt(0)}
            </AvatarFallback>
          </Avatar>
        </Link>

        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Link href={`/social/profile/${comment.users?.username}`} className="font-semibold hover:underline">
                {comment.users?.display_name}
              </Link>
              <span className="text-muted-foreground">@{comment.users?.username}</span>
              <span className="text-muted-foreground">·</span>
              <span className="text-muted-foreground text-sm">{new Date(comment.created_at).toLocaleDateString()}</span>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="glass">
                {isOwnComment ? (
                  <>
                    <DropdownMenuItem>Edit Comment</DropdownMenuItem>
                    <DropdownMenuItem className="text-red-500">Delete Comment</DropdownMenuItem>
                  </>
                ) : (
                  <>
                    <DropdownMenuItem>Report Comment</DropdownMenuItem>
                    <DropdownMenuItem>Block User</DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <p className="mb-3 leading-relaxed">{comment.content}</p>

          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowReplyForm(!showReplyForm)}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Reply</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className={`flex items-center gap-2 ${
                isLiked ? "text-red-500" : "text-muted-foreground"
              } hover:text-red-500`}
            >
              <Heart className={`w-4 h-4 ${isLiked ? "fill-current" : ""}`} />
              <span>{likesCount}</span>
            </Button>
          </div>

          {showReplyForm && (
            <div className="mt-4">
              <CreateCommentForm
                postId={postId}
                replyTo={comment.id}
                onCancel={() => setShowReplyForm(false)}
                placeholder={`Reply to @${comment.users?.username}...`}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
