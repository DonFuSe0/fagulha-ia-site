import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { LogOut, Shield, Bell, Eye, Trash2 } from "lucide-react"

export default async function SettingsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <h1 className="text-3xl font-bold mb-8">Settings</h1>

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
                <Switch id="private-account" />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="verified-badge">Show Verified Badge</Label>
                  <p className="text-sm text-muted-foreground">Display verification status on profile</p>
                </div>
                <Switch id="verified-badge" />
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
                <Switch id="like-notifications" defaultChecked />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="comment-notifications">Comment Notifications</Label>
                  <p className="text-sm text-muted-foreground">Get notified when someone comments on your posts</p>
                </div>
                <Switch id="comment-notifications" defaultChecked />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="follow-notifications">Follow Notifications</Label>
                  <p className="text-sm text-muted-foreground">Get notified when someone follows you</p>
                </div>
                <Switch id="follow-notifications" defaultChecked />
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
                <Switch id="show-activity" defaultChecked />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="discoverable">Discoverable Profile</Label>
                  <p className="text-sm text-muted-foreground">Allow others to find your profile in search</p>
                </div>
                <Switch id="discoverable" defaultChecked />
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
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-red-500">Delete Account</Label>
                  <p className="text-sm text-muted-foreground">Permanently delete your account and all data</p>
                </div>
                <Button variant="destructive" size="sm">
                  Delete Account
                </Button>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-red-500">Sign Out</Label>
                  <p className="text-sm text-muted-foreground">Sign out of your account</p>
                </div>
                <Button variant="outline" size="sm" className="text-red-500 border-red-500/20 bg-transparent">
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
