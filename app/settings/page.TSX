// app/settings/page.tsx
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import Toasts from '../_components/ui/Toasts'
import UploadAvatarForm from './UploadAvatarForm'

export const dynamic = 'force-dynamic'
export const revalidate = 0

function toastFrom(code?: string) {
  switch (code) {
    case 'perfil_ok': return { id: Date.now(), type: 'success', message: 'Apelido atualizado!' } as const
    case 'nick_dup': return { id: Date.now(), type: 'error', message: 'Este apelido já existe.' } as const
    case 'avatar_ok': return { id: Date.now(), type: 'success', message: 'Avatar atualizado!' } as const
    case 'avatar_fail': return { id: Date.now(), type: 'error', message: 'Falha ao enviar avatar.' } as const
    case 'senha_ok': return { id: Date.now(), type: 'success', message: 'Senha alterada com sucesso.' } as const
    case 'senha_fail': return { id: Date.now(), type: 'error', message: 'Falha ao alterar senha.' } as const
    default: return null
  }
}

export default async function SettingsPage({ searchParams }: { searchParams: { tab?: string, toast?: string } }) {
  const supabase = createServerComponentClient<any>({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const tab = (searchParams.tab || 'perfil') as 'perfil'|'seguranca'|'tokens'
  const toast = toastFrom(searchParams.toast)

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <Toasts initial={toast as any} />
      <h1 className="text-2xl font-semibold text-white">Configurações</h1>
      <nav className="flex gap-2">
        <a href="/settings?tab=perfil" className={"px-3 py-2 rounded-lg border " + (tab==='perfil'?'bg-white/10 border-white/20 text-white':'bg-transparent border-white/10 text-white/70 hover:text-white')}>Perfil</a>
        <a href="/settings?tab=seguranca" className={"px-3 py-2 rounded-lg border " + (tab==='seguranca'?'bg-white/10 border-white/20 text-white':'bg-transparent border-white/10 text-white/70 hover:text-white')}>Segurança</a>
        <a href="/settings?tab=tokens" className={"px-3 py-2 rounded-lg border " + (tab==='tokens'?'bg-white/10 border-white/20 text-white':'bg-transparent border-white/10 text-white/70 hover:text-white')}>Tokens</a>
      </nav>

      {tab === 'perfil' && (
        <section className="space-y-4">
          <form action="/api/profile/update" method="POST" className="grid gap-3">
            <div>
              <label className="block text-sm text-neutral-400 mb-1">Apelido (único)</label>
              <input name="nickname" minLength={3} maxLength={20} pattern="[A-Za-z0-9_]+" className="w-full px-3 py-2 rounded-lg bg-neutral-900/50 border border-neutral-800 text-white" />
              <p className="text-xs text-neutral-500 mt-1">3–20 caracteres • letras/números/underline</p>
            </div>
            <button className="self-start px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white hover:bg-white/15">Salvar apelido</button>
          </form>
          <div className="h-px bg-neutral-800" />
          <UploadAvatarForm />
        </section>
      )}

      {tab === 'seguranca' && (
        <section className="space-y-4">
          <form action="/api/profile/password" method="POST" className="grid gap-3">
            <div>
              <label className="block text-sm text-neutral-400 mb-1">Nova senha</label>
              <input type="password" name="password" minLength={8} required className="w-full px-3 py-2 rounded-lg bg-neutral-900/50 border border-neutral-800 text-white" />
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
          <div className="rounded-xl border border-neutral-800 p-4">
            <div className="text-sm text-neutral-400">Saldo atual</div>
            <CreditsInline />
          </div>
          <a href="/checkout" className="inline-block px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white hover:bg-white/15">Comprar tokens</a>
        </section>
      )}
    </div>
  )
}

async function CreditsInline() {
  const supabase = createServerComponentClient<any>({ cookies })
  const { data: rpc } = await supabase.rpc('current_user_credits')
  const credits = typeof rpc === 'number' ? rpc : 0
  return <div className="text-3xl font-semibold text-white">{credits} <span className="text-sm font-normal text-neutral-400">tokens</span></div>
}
