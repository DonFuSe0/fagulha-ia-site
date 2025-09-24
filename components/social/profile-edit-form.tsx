"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Upload } from "lucide-react"

interface ProfileEditFormProps {
  profile: any
}

export function ProfileEditForm({ profile }: ProfileEditFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    display_name: profile.display_name || "",
    username: profile.username || "",
    bio: profile.bio || "",
    website: profile.website || "",
    location: profile.location || "",
  })

  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      // Update users table
      const { error: userError } = await supabase
        .from("users")
        .update({
          display_name: formData.display_name,
          username: formData.username,
          bio: formData.bio,
          website: formData.website,
          location: formData.location,
        })
        .eq("id", profile.id)

      if (userError) throw userError

      // Update profiles table
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          display_name: formData.display_name,
          nickname: formData.username,
          bio: formData.bio,
        })
        .eq("id", profile.id)

      if (profileError) throw profileError

      router.push(`/social/profile/${formData.username}`)
      router.refresh()
    } catch (error: any) {
      setError(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="glass">
      <CardHeader>
        <CardTitle>Profile Information</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Avatar Section */}
          <div className="flex items-center gap-6">
            <Avatar className="w-24 h-24">
              <AvatarImage src={profile.avatar_url || profile.profiles?.avatar_url} />
              <AvatarFallback className="text-xl bg-gradient-fagulha text-white">
                {formData.display_name?.charAt(0) || formData.username?.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <Button type="button" variant="outline" className="flex items-center gap-2 bg-transparent">
              <Upload className="w-4 h-4" />
              Change Photo
            </Button>
          </div>

          {/* Form Fields */}
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="display_name">Display Name</Label>
              <Input
                id="display_name"
                value={formData.display_name}
                onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                placeholder="Your display name"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                placeholder="@username"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Tell us about yourself..."
                rows={4}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                type="url"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                placeholder="https://yourwebsite.com"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="City, Country"
              />
            </div>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="flex gap-4">
            <Button type="submit" disabled={isLoading} className="bg-gradient-fagulha hover:opacity-90">
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
