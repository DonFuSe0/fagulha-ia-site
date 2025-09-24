import type React from "react"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { SocialSidebar } from "@/components/social/social-sidebar"

export default async function SocialLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        <SocialSidebar />
        <main className="flex-1">{children}</main>
      </div>
    </div>
  )
}
