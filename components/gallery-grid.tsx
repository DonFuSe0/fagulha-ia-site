"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Download, RotateCcw, Eye, Clock, Globe, Heart } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface ImageData {
  id: string
  prompt: string
  image_url: string
  model: string
  style: string
  resolution: string
  is_public: boolean
  created_at: string
  public_expires_at?: string
  views_count: number
  likes_count: number
  generation_params: any
}

interface GalleryGridProps {
  images: ImageData[]
  isPublic: boolean
}

export function GalleryGrid({ images, isPublic }: GalleryGridProps) {
  const [loading, setLoading] = useState<string | null>(null)
  const router = useRouter()

  const handleDownload = async (image: ImageData) => {
    try {
      const response = await fetch(image.image_url)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `fagulha-${image.id}.png`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      toast.success("Imagem baixada com sucesso!")
    } catch (error) {
      toast.error("Erro ao baixar imagem")
    }
  }

  const handleMakePublic = async (imageId: string) => {
    setLoading(imageId)
    try {
      const response = await fetch("/api/images/make-public", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageId }),
      })

      if (response.ok) {
        toast.success("Imagem tornada pública!")
        router.refresh()
      } else {
        toast.error("Erro ao tornar imagem pública")
      }
    } catch (error) {
      toast.error("Erro ao tornar imagem pública")
    } finally {
      setLoading(null)
    }
  }

  const handleReuse = (image: ImageData) => {
    // Redirecionar para página de geração com parâmetros
    const params = new URLSearchParams({
      prompt: image.prompt,
      model: image.model,
      style: image.style,
      resolution: image.resolution,
      ...image.generation_params,
    })
    router.push(`/generate?${params.toString()}`)
  }

  const getTimeRemaining = (createdAt: string, isPublic: boolean, publicExpiresAt?: string) => {
    const created = new Date(createdAt)
    const now = new Date()

    if (isPublic && publicExpiresAt) {
      const expires = new Date(publicExpiresAt)
      const remaining = expires.getTime() - now.getTime()
      const hours = Math.floor(remaining / (1000 * 60 * 60))
      return hours > 0 ? `${hours}h restantes` : "Expirando em breve"
    } else {
      const expires = new Date(created.getTime() + 24 * 60 * 60 * 1000)
      const remaining = expires.getTime() - now.getTime()
      const hours = Math.floor(remaining / (1000 * 60 * 60))
      return hours > 0 ? `${hours}h restantes` : "Expirando em breve"
    }
  }

  if (images.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
          <Eye className="h-12 w-12 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">
          {isPublic ? "Nenhuma imagem pública ainda" : "Sua galeria está vazia"}
        </h3>
        <p className="text-muted-foreground mb-4">
          {isPublic
            ? "Seja o primeiro a compartilhar uma criação incrível!"
            : "Comece criando sua primeira imagem com IA"}
        </p>
        {!isPublic && <Button onClick={() => router.push("/generate")}>Criar Primeira Imagem</Button>}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {images.map((image) => (
        <Card
          key={image.id}
          className="group overflow-hidden border-border/40 hover:border-primary/20 transition-all duration-300"
        >
          <div className="relative aspect-square overflow-hidden">
            <Image
              src={image.image_url || "/placeholder.svg"}
              alt={image.prompt}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />

            {/* Overlay com informações */}
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-4">
              <div className="flex justify-between items-start">
                <div className="flex flex-col gap-1">
                  <Badge variant="secondary" className="text-xs w-fit">
                    {image.model}
                  </Badge>
                  <Badge variant="outline" className="text-xs w-fit">
                    {image.style}
                  </Badge>
                </div>

                {isPublic && (
                  <div className="flex items-center gap-2 text-white text-xs">
                    <Eye className="h-3 w-3" />
                    {image.views_count}
                    <Heart className="h-3 w-3" />
                    {image.likes_count}
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Button size="sm" variant="secondary" onClick={() => handleDownload(image)} className="flex-1">
                  <Download className="h-3 w-3" />
                </Button>

                {!isPublic && (
                  <>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleMakePublic(image.id)}
                      disabled={loading === image.id}
                      className="flex-1"
                    >
                      <Globe className="h-3 w-3" />
                    </Button>

                    <Button size="sm" variant="secondary" onClick={() => handleReuse(image)} className="flex-1">
                      <RotateCcw className="h-3 w-3" />
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Informações da imagem */}
          <div className="p-4">
            <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{image.prompt}</p>

            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{image.resolution}</span>
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {getTimeRemaining(image.created_at, image.is_public, image.public_expires_at)}
              </div>
            </div>

            {image.is_public && (
              <Badge variant="default" className="mt-2 text-xs">
                <Globe className="h-3 w-3 mr-1" />
                Público
              </Badge>
            )}
          </div>
        </Card>
      ))}
    </div>
  )
}
