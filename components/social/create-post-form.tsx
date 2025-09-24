"use client"

import React from "react"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ImageIcon, Sparkles } from "lucide-react"
import { useRouter } from "next/navigation"

export function CreatePostForm() {
  const [content, setContent] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [user, setUser] = useState<any>(null)

  const router = useRouter()
  const supabase = createClient()

  React.useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase.from("users").select("*, profiles (*)").eq("id", user.id).single()
        setUser(profile)
      }
    }
    getUser()
  }, [supabase])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim()) return

    setIsLoading(true)
    setError(null)

    try {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser()
      if (!authUser) throw new Error("Not authenticated")

      const { error } = await supabase.from("posts").insert({
        content: content.trim(),
        author_id: authUser.id,
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

  if (!user) return null

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex gap-4">
        <Avatar className="w-12 h-12">
          <AvatarImage src={user.avatar_url || user.profiles?.avatar_url} />
          <AvatarFallback className="bg-gradient-fagulha text-white">
            {user.display_name?.charAt(0) || user.username?.charAt(0)}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's on your mind?"
            className="min-h-[120px] resize-none border-0 bg-transparent text-lg placeholder:text-muted-foreground focus-visible:ring-0"
            maxLength={280}
          />

          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-2">
              <Button type="button" variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                <ImageIcon className="w-5 h-5" />
              </Button>
              <Button type="button" variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                <Sparkles className="w-5 h-5" />
              </Button>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">{content.length}/280</span>
              <Button
                type="submit"
                disabled={!content.trim() || isLoading || content.length > 280}
                className="bg-gradient-fagulha hover:opacity-90"
              >
                {isLoading ? "Posting..." : "Post"}
              </Button>
            </div>
          </div>

          {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
        </div>
      </div>
    </form>
  )
}
