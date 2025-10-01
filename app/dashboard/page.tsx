import { redirect } from 'next/navigation'
import ProfileCard from '@/components/profile/ProfileCard'
import { getServerClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function DashboardPage() {
  const supabase = getServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase.from('profiles')
    .select('id, avatar_url, credits, nickname, email')
    .eq('id', user.id).single()

  const { data: gens } = await supabase.from('generations')
    .select('id, image_url, thumb_url, is_public, created_at')
    .eq('user_id', user.id).order('created_at', { ascending: false }).limit(8)

  const { data: moves } = await supabase.from('tokens')
    .select('id, amount, description, created_at')
    .eq('user_id', user.id).order('created_at', { ascending: false }).limit(10)

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <ProfileCard
        userId={user.id}
        email={user.email ?? ''}
        nickname={(profile as any)?.nickname ?? null}
        avatarUrl={(profile as any)?.avatar_url ?? null}
        credits={(profile as any)?.credits ?? 0}
      />

      <section>
        <h2 className="text-white/90 font-semibold mb-3">Minhas criações recentes</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {gens?.map((g) => (
            <div key={g.id} className="aspect-square rounded-xl overflow-hidden bg-neutral-900/40 border border-neutral-800">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={(g as any).thumb_url || g.image_url} alt="" className="w-full h-full object-cover" />
            </div>
          )) || <div className="text-neutral-400">Nenhuma geração ainda.</div>}
        </div>
      </section>

      <section>
        <h2 className="text-white/90 font-semibold mb-3">Extrato de tokens (10 últimos)</h2>
        <div className="rounded-xl overflow-hidden border border-neutral-800">
          <table className="w-full text-sm">
            <thead className="bg-neutral-900/60 text-neutral-300">
              <tr><th className="text-left p-3">Data</th><th className="text-left p-3">Descrição</th><th className="text-right p-3">Valor</th></tr>
            </thead>
            <tbody className="divide-y divide-neutral-800">
              {moves?.map((m) => (
                <tr key={m.id} className="text-neutral-200">
                  <td className="p-3">{new Date(m.created_at as any).toLocaleString()}</td>
                  <td className="p-3">{m.description}</td>
                  <td className="p-3 text-right">{m.amount}</td>
                </tr>
              )) || null}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
