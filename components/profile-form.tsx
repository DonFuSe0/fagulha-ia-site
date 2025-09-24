"use client"

import type React from "react"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useRouter } from "next/navigation"
import { User, Calendar, AtSign, FileText, Upload, Loader2 } from "lucide-react"
import type { User as SupabaseUser } from "@supabase/supabase-js"

interface ProfileFormProps {
  user: SupabaseUser
  profile: any
}

export function ProfileForm({ user, profile }: ProfileFormProps) {
  const [formData, setFormData] = useState({
    display_name: profile?.display_name || "",
    nickname: profile?.nickname || "",
    birth_date: profile?.birth_date || "",
    bio: profile?.bio || "",
  })
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        // 2MB limit
        setError("A imagem deve ter no máximo 2MB")
        return
      }

      setAvatarFile(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setAvatarPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const uploadAvatar = async (file: File): Promise<string | null> => {
    const supabase = createClient()
    const fileExt = file.name.split(".").pop()
    const fileName = `${user.id}-${Math.random()}.${fileExt}`
    const filePath = `avatars/${fileName}`

    const { error: uploadError } = await supabase.storage.from("avatars").upload(filePath, file)

    if (uploadError) {
      console.error("Error uploading avatar:", uploadError)
      return null
    }

    const { data } = supabase.storage.from("avatars").getPublicUrl(filePath)

    return data.publicUrl
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const supabase = createClient()
      let avatarUrl = profile?.avatar_url

      // Upload new avatar if selected
      if (avatarFile) {
        const uploadedUrl = await uploadAvatar(avatarFile)
        if (uploadedUrl) {
          avatarUrl = uploadedUrl
        } else {
          throw new Error("Erro ao fazer upload da imagem")
        }
      }

      // Update profile
      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          display_name: formData.display_name,
          nickname: formData.nickname,
          birth_date: formData.birth_date || null,
          bio: formData.bio || null,
          avatar_url: avatarUrl,
        })
        .eq("id", user.id)

      if (updateError) throw updateError

      setSuccess(true)
      router.refresh()
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Erro ao atualizar perfil")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Avatar Upload */}
      <div className="flex items-center gap-6">
        <Avatar className="h-20 w-20 border-2 border-fagulha/20">
          <AvatarImage src={avatarPreview || profile?.avatar_url || ""} alt={formData.display_name || ""} />
          <AvatarFallback className="bg-fagulha/10 text-fagulha text-xl font-semibold">
            {formData.display_name?.charAt(0) || user.email?.charAt(0) || "U"}
          </AvatarFallback>
        </Avatar>
        <div>
          <Label htmlFor="avatar" className="cursor-pointer">
            <div className="flex items-center gap-2 text-sm text-fagulha hover:text-fagulha/80">
              <Upload className="h-4 w-4" />
              Alterar foto
            </div>
          </Label>
          <Input id="avatar" type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
          <p className="text-xs text-muted-foreground mt-1">JPG, PNG ou GIF. Máximo 2MB.</p>
        </div>
      </div>

      {/* Form Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="display_name">Nome completo</Label>
          <div className="relative">
            <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="display_name"
              type="text"
              placeholder="Seu nome completo"
              required
              value={formData.display_name}
              onChange={(e) => handleInputChange("display_name", e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="nickname">Apelido</Label>
          <div className="relative">
            <AtSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="nickname"
              type="text"
              placeholder="seu_apelido"
              required
              value={formData.nickname}
              onChange={(e) => handleInputChange("nickname", e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="birth_date">Data de nascimento</Label>
        <div className="relative">
          <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            id="birth_date"
            type="date"
            value={formData.birth_date}
            onChange={(e) => handleInputChange("birth_date", e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="bio">Bio</Label>
        <div className="relative">
          <FileText className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Textarea
            id="bio"
            placeholder="Conte um pouco sobre você..."
            value={formData.bio}
            onChange={(e) => handleInputChange("bio", e.target.value)}
            className="pl-10 min-h-[100px]"
            maxLength={500}
          />
        </div>
        <p className="text-xs text-muted-foreground">{formData.bio.length}/500 caracteres</p>
      </div>

      {error && (
        <div className="p-3 text-sm text-red-500 bg-red-500/10 border border-red-500/20 rounded-md">{error}</div>
      )}

      {success && (
        <div className="p-3 text-sm text-green-500 bg-green-500/10 border border-green-500/20 rounded-md">
          Perfil atualizado com sucesso!
        </div>
      )}

      <Button type="submit" className="w-full bg-fagulha hover:bg-fagulha/90" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Salvando...
          </>
        ) : (
          "Salvar Alterações"
        )}
      </Button>
    </form>
  )
}
