// app/dashboard/page.tsx
import { redirect } from 'next/navigation'
import ProfileCard from '../components/profile/ProfileCard'
import { cookies } from 'next/headers'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'

export const dynamic = 'force-dynamic'
export const revalidate = 0

type Gen = { id: string; image_url: string; thumb_url?: string | null; is_public: boolean; created_at: string }
type Move = { id: string; amount: number; description: string; created_at: string }
type Profile = { id: string; avatar_url: string | null; credits: number | null; nickname: string | null; email: string | null }

function formatPt(dateISO: string) {
  const d = new Date(dateISO)
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth()+1).padStart(2, '0')
  const yyyy = d.getFullYear()
  const hh = String(d.getHours()).padStart(2, '0')
  const mi = String(d.getMinutes()).padStart(2, '0')
  const ss = String(d.getSeconds()).padStart(2, '0')
  return `${dd}/${mm}/${yyyy} - ${hh}:${mi}:${ss}`
}

export default async function DashboardPage() {
  const supabase = createServerComponentClient<any>({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, avatar_url, credits, nickname, email')
    .eq('id', user.id)
    .single<Profile>()

  const credits = profile?.credits ?? 0

  const { data: gens } = await supabase
    .from('generations')
    .select('id, image_url, thumb_url, is_public, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(8)
    .returns<Gen[]>()

  const { data: moves } = await supabase
    .from('tokens')
    .select('id, amount, description, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(10)
    .returns<Move[]>()

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-10">
      <ProfileCard
        userId={user.id}
        email={user.email ?? ''}
        nickname={profile?.nickname ?? null}
        avatarUrl={profile?.avatar_url ?? null}
        credits={credits}
      />

      <section>
        <div className="flex items-end justify-between mb-3">
          <h2 className="text-white/90 font-semibold">Minhas criações recentes</h2>
          <a href="/gallery" className="text-sm text-white/70 hover:text-white">ver todas</a>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {gens?.map((g: Gen) => (
            <div key={g.id} className="group relative aspect-square rounded-xl overflow-hidden bg-neutral-900/40 border border-neutral-800">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={g.thumb_url || g.image_url} alt="" className="w-full h-full object-cover transition group-hover:scale-[1.02]" />
              <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition" />
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
              {moves?.map((m: Move) => (
                <tr key={m.id} className="text-neutral-200">
                  <td className="p-3">{formatPt(m.created_at)}</td>
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
