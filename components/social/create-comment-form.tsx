"use client"

import type React from "react"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MessageCircle } from "lucide-react"
import { useRouter } from "next/navigation"

interface CreateCommentFormProps {
  postId: string
  replyTo?: string
  onCancel?: () => void
  placeholder?: string
}

export function CreateCommentForm({
  postId,
  replyTo,
  onCancel,
  placeholder = "Write a comment...",
}: CreateCommentFormProps) {
  const [content, setContent] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim()) return

    setIsLoading(true)
    setError(null)

    const supabase = createClient()

    try {
      const { error } = await supabase.from("comments").insert({
        post_id: postId,
        content: content.trim(),
        reply_to: replyTo || null,
      })

      if (error) throw error

      setContent("")
      if (onCancel) onCancel()
      router.refresh()
    } catch (error: any) {
      setError(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="flex gap-4">
        <Avatar className="w-10 h-10">
          <AvatarImage src="/placeholder.svg" />
          <AvatarFallback className="bg-gradient-fagulha text-white">U</AvatarFallback>
        </Avatar>

        <div className="flex-1 space-y-3">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={placeholder}
            className="min-h-[80px] resize-none"
            maxLength={280}
          />

          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">{content.length}/280</span>

            <div className="flex items-center gap-2">
              {onCancel && (
                <Button type="button" variant="ghost" onClick={onCancel}>
                  Cancel
                </Button>
              )}
              <Button
                type="submit"
                disabled={!content.trim() || isLoading}
                size="sm"
                className="bg-gradient-fagulha hover:opacity-90"
              >
                {isLoading ? (
                  "Posting..."
                ) : (
                  <>
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Comment
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </form>
  )
}
