import { redirect } from 'next/navigation'
import { getServerClient } from '@/lib/supabase/server'
import Image from 'next/image'
import Link from 'next/link'
import { defaultAvatarFor } from '@/lib/utils/avatar'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function SettingsPage({ searchParams }: { searchParams: { tab?: string } }) {
  const supabase = getServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase.from('profiles')
    .select('id, avatar_url, nickname, credits, email').eq('id', user.id).single()

  const tab = searchParams.tab || 'perfil'

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-semibold text-white mb-6">Configurações</h1>

      <div className="flex gap-2 mb-6">
        {['perfil','seguranca','tokens'].map(t => (
          <Link key={t} href={`/settings?tab=${t}`} className={`px-3 py-2 rounded-xl border ${tab===t?'border-white/20 bg-white/10 text-white':'border-white/10 text-neutral-300 hover:text-white'}`}>
            {t === 'perfil' ? 'Perfil' : t === 'seguranca' ? 'Segurança' : 'Tokens'}
          </Link>
        ))}
      </div>

      {tab === 'perfil' && <PerfilTab userId={user.id} email={user.email || ''} avatarUrl={(profile as any)?.avatar_url ?? null} nickname={(profile as any)?.nickname ?? ''} />}
      {tab === 'seguranca' && <SegurancaTab />}
      {tab === 'tokens' && <TokensTab credits={(profile as any)?.credits ?? 0} />}
    </div>
  )
}

function PerfilTab({ userId, email, avatarUrl, nickname }: { userId: string, email: string, avatarUrl: string|null, nickname: string }) {
  const fallback = defaultAvatarFor(userId)
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="relative w-20 h-20 overflow-hidden rounded-full ring-1 ring-white/10">
          <Image src={avatarUrl || fallback} alt="Avatar" fill className="object-cover" />
        </div>
        <form className="flex flex-col gap-2" action="/api/profile/avatar" method="post" encType="multipart/form-data">
          <input type="file" name="file" accept="image/png, image/jpeg" required className="text-neutral-300" />
          <button className="px-4 py-2 rounded-xl bg-white/10 border border-white/20 text-white hover:bg-white/15">Enviar avatar</button>
        </form>
      </div>

      <form className="space-y-2" action="/api/profile/nickname" method="post">
        <label className="block text-neutral-300 text-sm">Apelido</label>
        <input name="nickname" defaultValue={nickname} minLength={3} maxLength={20} pattern="[A-Za-z0-9_]+" className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white" />
        <button className="px-4 py-2 rounded-xl bg-white/10 border border-white/20 text-white hover:bg-white/15">Salvar</button>
      </form>
    </div>
  )
}

function SegurancaTab() {
  return (
    <div className="space-y-6">
      <form className="space-y-2" action="/api/profile/password" method="post">
        <label className="block text-neutral-300 text-sm">Nova senha</label>
        <input name="password" type="password" minLength={8} className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white" required />
        <button className="px-4 py-2 rounded-xl bg-white/10 border border-white/20 text-white hover:bg-white/15">Alterar senha</button>
      </form>

      <form className="space-y-2" action="/api/profile/delete" method="post">
        <label className="block text-neutral-300 text-sm">Confirmação</label>
        <input name="confirm" placeholder="Digite EXCLUIR" className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white" required />
        <button className="px-4 py-2 rounded-xl bg-red-600/80 border border-red-500/50 text-white hover:bg-red-600">Excluir conta</button>
      </form>
    </div>
  )
}

async function TokensTab({ credits }: { credits: number }) {
  const supabase = getServerClient()
  const { data: moves } = await supabase.from('tokens')
    .select('id, amount, description, created_at').order('created_at', { ascending: false }).limit(50)

  return (
    <div className="space-y-4">
      <div className="text-white">Saldo atual: <strong>{credits}</strong> tokens</div>
      <a href="/checkout" className="inline-block px-4 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-500">Comprar tokens</a>

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
    </div>
  )
}
