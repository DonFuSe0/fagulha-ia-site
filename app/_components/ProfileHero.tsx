// app/_components/ProfileHero.tsx
// Server wrapper que busca avatar_url DIRETO do DB e passa para o client.
// Evita depender de user_metadata antigo na sessão.

import { createClient } from '@/lib/supabase/server'
import ProfileHeroClient from './ProfileHeroClient'

export default async function ProfileHero() {
  const supabase = createClient()

  const [{ data: { user } }, { data: profile }] = await Promise.all([
    supabase.auth.getUser(),
    supabase.from('profiles').select('full_name, username, avatar_url').maybeSingle(),
  ])

  const displayName =
    profile?.full_name ||
    profile?.username ||
    user?.email?.split('@')[0] ||
    'Meu perfil'

  // Preferimos SEMPRE o profiles.avatar_url (já vem com ?v=timestamp)
  const avatarUrl = profile?.avatar_url || (user?.user_metadata as any)?.avatar_url || null

  return <ProfileHeroClient name={displayName} avatarUrl={avatarUrl} />
}
