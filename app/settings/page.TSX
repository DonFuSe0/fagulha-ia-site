// app/settings/page.tsx
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function SettingsPage({ searchParams }: { searchParams: { tab?: string } }) {
  const supabase = createServerComponentClient<any>({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const tab = (searchParams.tab || 'perfil') as 'perfil' | 'seguranca' | 'tokens'

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, nickname, avatar_url, credits, email')
    .eq('id', user.id)
    .single()

  const { data: moves } = await supabase
    .from('tokens')
    .select('id, amount, description, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(20)

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-semibold text-white">Configurações</h1>
      <nav className="flex gap-2">
        <a href="/settings?tab=perfil" className={"px-3 py-2 rounded-lg border " + (tab==='perfil'?'bg-white/10 border-white/20 text-white':'bg-transparent border-white/10 text-white/70 hover:text-white')}>Perfil</a>
        <a href="/settings?tab=seguranca" className={"px-3 py-2 rounded-lg border " + (tab==='seguranca'?'bg-white/10 border-white/20 text-white':'bg-transparent border-white/10 text-white/70 hover:text-white')}>Segurança</a>
        <a href="/settings?tab=tokens" className={"px-3 py-2 rounded-lg border " + (tab==='tokens'?'bg-white/10 border-white/20 text-white':'bg-transparent border-white/10 text-white/70 hover:text-white')}>Tokens</a>
      </nav>

      {tab === 'perfil' && (
        <section className="space-y-4">
          <h2 className="text-white/90 font-semibold">Perfil</h2>
          <form action="/api/profile/update" method="POST" className="grid gap-3">
            <div>
              <label className="block text-sm text-neutral-400 mb-1">Apelido (único)</label>
              <input name="nickname" defaultValue={profile?.nickname ?? ''} minLength={3} maxLength={20} pattern="[A-Za-z0-9_]+" className="w-full px-3 py-2 rounded-lg bg-neutral-900/50 border border-neutral-800 text-white" />
              <p className="text-xs text-neutral-500 mt-1">3–20 caracteres • letras/números/underline</p>
            </div>
            <button className="self-start px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white hover:bg-white/15">Salvar apelido</button>
          </form>

          <div className="h-px bg-neutral-800" />

          <form action="/api/profile/avatar" method="POST" encType="multipart/form-data" className="grid gap-3">
            <div>
              <label className="block text-sm text-neutral-400 mb-1">Avatar (PNG/JPG até 2MB)</label>
              <input type="file" name="avatar" accept="image/png,image/jpeg" required className="text-white" />
            </div>
            <button className="self-start px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white hover:bg-white/15">Enviar avatar</button>
          </form>
        </section>
      )}

      {tab === 'seguranca' && (
        <section className="space-y-4">
          <h2 className="text-white/90 font-semibold">Segurança</h2>
          <form action="/api/profile/password" method="POST" className="grid gap-3">
            <div>
              <label className="block text-sm text-neutral-400 mb-1">Nova senha</label>
              <input type="password" name="password" minLength={8} required className="w-full px-3 py-2 rounded-lg bg-neutral-900/50 border border-neutral-800 text-white" />
              <p className="text-xs text-neutral-500 mt-1">Mínimo 8 caracteres</p>
            </div>
            <button className="self-start px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white hover:bg-white/15">Alterar senha</button>
          </form>

          <div className="h-px bg-neutral-800" />

          <form action="/api/profile/delete" method="POST" className="grid gap-3">
            <div>
              <label className="block text-sm text-red-300 mb-1">Excluir conta (digite EXCLUIR)</label>
              <input name="confirm" placeholder="EXCLUIR" className="w-full px-3 py-2 rounded-lg bg-neutral-900/50 border border-neutral-800 text-white" />
            </div>
            <button className="self-start px-4 py-2 rounded-lg bg-red-500/20 border border-red-500/50 text-red-200 hover:bg-red-500/30">Excluir conta</button>
          </form>
        </section>
      )}

      {tab === 'tokens' && (
        <section className="space-y-4">
          <h2 className="text-white/90 font-semibold">Tokens</h2>
          <div className="rounded-xl border border-neutral-800 p-4">
            <div className="text-sm text-neutral-400">Saldo atual</div>
            <div className="text-3xl font-semibold text-white">{profile?.credits ?? 0} <span className="text-sm font-normal text-neutral-400">tokens</span></div>
          </div>
          <a href="/checkout" className="inline-block px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white hover:bg-white/15">Comprar tokens</a>

          <div className="rounded-xl overflow-hidden border border-neutral-800">
            <table className="w-full text-sm">
              <thead className="bg-neutral-900/60 text-neutral-300">
                <tr><th className="text-left p-3">Data</th><th className="text-left p-3">Descrição</th><th className="text-right p-3">Valor</th></tr>
              </thead>
              <tbody className="divide-y divide-neutral-800">
                {moves?.map((m: any) => (
                  <tr key={m.id} className="text-neutral-200">
                    <td className="p-3">{new Date(m.created_at).toLocaleString()}</td>
                    <td className="p-3">{m.description}</td>
                    <td className="p-3 text-right">{m.amount}</td>
                  </tr>
                )) || null}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  )
}
