import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Settings, Shield, Bell, Eye, Trash2 } from "lucide-react"
import Link from "next/link"

export default async function SettingsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  // Get user profile
  const { data: profile } = await supabase.from("users").select("*").eq("id", user.id).single()

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="flex items-center gap-3 mb-8">
          <Settings className="w-8 h-8 text-fagulha-primary" />
          <h1 className="text-3xl font-bold text-gradient-fagulha">Settings</h1>
        </div>

        <div className="space-y-6">
          {/* Account Settings */}
          <Card className="glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Account Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="private-account">Private Account</Label>
                  <p className="text-sm text-muted-foreground">Only followers can see your posts</p>
                </div>
                <Switch id="private-account" defaultChecked={profile?.private_account || false} />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="verified">Verified Account</Label>
                  <p className="text-sm text-muted-foreground">Show verification badge</p>
                </div>
                <Switch id="verified" defaultChecked={profile?.verified || false} disabled />
              </div>

              <div className="pt-4 border-t border-border/50">
                <Button variant="outline" asChild className="w-full bg-transparent">
                  <Link href="/social/profile/edit">Edit Profile</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card className="glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="like-notifications">Like Notifications</Label>
                  <p className="text-sm text-muted-foreground">Get notified when someone likes your posts</p>
                </div>
                <Switch id="like-notifications" defaultChecked={true} />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="comment-notifications">Comment Notifications</Label>
                  <p className="text-sm text-muted-foreground">Get notified when someone comments on your posts</p>
                </div>
                <Switch id="comment-notifications" defaultChecked={true} />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="follow-notifications">Follow Notifications</Label>
                  <p className="text-sm text-muted-foreground">Get notified when someone follows you</p>
                </div>
                <Switch id="follow-notifications" defaultChecked={true} />
              </div>
            </CardContent>
          </Card>

          {/* Privacy Settings */}
          <Card className="glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5" />
                Privacy
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="show-activity">Show Activity Status</Label>
                  <p className="text-sm text-muted-foreground">Let others see when you're active</p>
                </div>
                <Switch id="show-activity" defaultChecked={true} />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="discoverable">Discoverable Account</Label>
                  <p className="text-sm text-muted-foreground">Allow others to find your account in search</p>
                </div>
                <Switch id="discoverable" defaultChecked={true} />
              </div>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="glass border-red-500/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-500">
                <Trash2 className="w-5 h-5" />
                Danger Zone
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Delete Account</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Permanently delete your account and all associated data. This action cannot be undone.
                </p>
                <Button variant="destructive" size="sm">
                  Delete Account
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
