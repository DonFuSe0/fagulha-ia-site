import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { ProfileEditForm } from "@/components/social/profile-edit-form"

export default async function EditProfilePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  // Get user profile data
  const { data: profile } = await supabase
    .from("users")
    .select(`
      *,
      profiles (*)
    `)
    .eq("id", user.id)
    .single()

  if (!profile) {
    redirect("/social")
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <h1 className="text-3xl font-bold mb-8">Edit Profile</h1>
        <ProfileEditForm profile={profile} />
      </div>
    </div>
  )
}
