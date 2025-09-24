"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { createClient } from "@/lib/supabase/client"
import { Loader2, X } from "lucide-react"

interface CreatePostModalProps {
  isOpen: boolean
  onClose: () => void
  imageUrl?: string
  userProfile: {
    id: string
    nickname: string
    display_name: string
    avatar_url?: string
  }
  onPostCreated?: () => void
}

export function CreatePostModal({ isOpen, onClose, imageUrl, userProfile, onPostCreated }: CreatePostModalProps) {
  const [caption, setCaption] = useState("")
  const [isPosting, setIsPosting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handlePost = async () => {
    if (!caption.trim() && !imageUrl) {
      setError("Adicione uma legenda ou imagem")
      return
    }

    setIsPosting(true)
    setError(null)

    try {
      const supabase = createClient()

      const { error: postError } = await supabase.from("posts").insert({
        author_id: userProfile.id,
        caption: caption.trim() || null,
        image_url: imageUrl || null,
        visibility: "public",
      })

      if (postError) throw postError

      setCaption("")
      onPostCreated?.()
      onClose()
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Erro ao criar post")
    } finally {
      setIsPosting(false)
    }
  }

  const handleClose = () => {
    if (!isPosting) {
      setCaption("")
      setError(null)
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Criar Post</DialogTitle>
            <Button variant="ghost" size="sm" onClick={handleClose} disabled={isPosting}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {/* User Info */}
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 border-2 border-fagulha/20">
              <AvatarImage src={userProfile.avatar_url || ""} alt={userProfile.display_name} />
              <AvatarFallback className="bg-fagulha/10 text-fagulha font-semibold">
                {userProfile.display_name?.charAt(0) || userProfile.nickname?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold text-sm">{userProfile.display_name}</p>
              <p className="text-muted-foreground text-xs">@{userProfile.nickname}</p>
            </div>
          </div>

          {/* Image Preview */}
          {imageUrl && (
            <div className="aspect-square rounded-lg overflow-hidden border border-border/50">
              <img src={imageUrl || "/placeholder.svg"} alt="Post" className="w-full h-full object-cover" />
            </div>
          )}

          {/* Caption */}
          <Textarea
            placeholder="Escreva uma legenda..."
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            className="min-h-[100px] resize-none"
            maxLength={2000}
            disabled={isPosting}
          />
          <div className="text-xs text-muted-foreground text-right">{caption.length}/2000</div>

          {error && (
            <div className="text-sm text-red-500 bg-red-500/10 border border-red-500/20 rounded-md p-3">{error}</div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleClose} disabled={isPosting}>
              Cancelar
            </Button>
            <Button
              onClick={handlePost}
              disabled={isPosting || (!caption.trim() && !imageUrl)}
              className="bg-fagulha hover:bg-fagulha/90"
            >
              {isPosting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Postando...
                </>
              ) : (
                "Postar"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
