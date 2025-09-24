"use client"

import type React from "react"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ImageIcon, Sparkles } from "lucide-react"
import { useRouter } from "next/navigation"

export function CreatePostForm() {
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
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")

      const { error } = await supabase.from("posts").insert({
        content: content.trim(),
        author_id: user.id,
        visibility: "public",
      })

      if (error) throw error

      setContent("")
      router.refresh()
    } catch (error: any) {
      setError(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="glass">
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-4">
            <Avatar className="w-12 h-12">
              <AvatarImage src="/placeholder.svg" />
              <AvatarFallback className="bg-gradient-fagulha text-white">U</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="What's on your mind?"
                className="min-h-[100px] resize-none border-0 bg-transparent text-lg placeholder:text-muted-foreground focus-visible:ring-0"
                maxLength={280}
              />
              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center gap-2">
                  <Button type="button" variant="ghost" size="sm" className="text-muted-foreground">
                    <ImageIcon className="w-4 h-4" />
                  </Button>
                  <span className="text-sm text-muted-foreground">{content.length}/280</span>
                </div>
                <Button
                  type="submit"
                  disabled={!content.trim() || isLoading}
                  className="bg-gradient-fagulha hover:opacity-90"
                >
                  {isLoading ? (
                    "Posting..."
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Post
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
          {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
        </form>
      </CardContent>
    </Card>
  )
}
