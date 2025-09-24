"use client"

import { createClient } from "@/lib/supabase/client"
import { LogOut } from "lucide-react"
import { useRouter } from "next/navigation"

export function SignOutButton() {
  const router = useRouter()

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/")
    router.refresh()
  }

  return (
    <button onClick={handleSignOut} className="flex items-center gap-2 w-full px-2 py-1.5 text-sm">
      <LogOut className="w-4 h-4" />
      Sign Out
    </button>
  )
}
