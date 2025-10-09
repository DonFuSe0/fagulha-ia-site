'use client'

import Link from 'next/link'
import { useMemo } from 'react'

type SettingsPageProps = {
  searchParams: { tab?: string }
}

export default function SettingsPage({ searchParams }: SettingsPageProps) {
  const tab = useMemo<"perfil" | "seguranca">(() => {
    return (searchParams?.tab === 'seguranca') ? 'seguranca' : 'perfil'
  }, [searchParams?.tab])

  return (
    <div className="min-h-[60vh] w-full">
      <nav className="border-b border-white/10 bg-black/50 backdrop-blur">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center gap-4">
          <Link href="/dashboard" className="text-sm text-zinc-300 hover:text-white">← Voltar</Link>
          <div className="flex items-center gap-2 text-sm">
            <Link
              href="/settings?tab=perfil"
              className={"px-3 py-1.5 rounded " + (tab === 'perfil' ? "bg-white/10 text-white" : "text-zinc-300 hover:text-white")}
            >
              Perfil
            </Link>
            <Link
              href="/settings?tab=seguranca"
              className={"px-3 py-1.5 rounded " + (tab === 'seguranca' ? "bg-white/10 text-white" : "text-zinc-300 hover:text-white")}
            >
              Segurança
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-4 py-6">
        {tab === 'perfil' && (
          <section className="space-y-4">
            <h1 className="text-xl font-semibold">Editar Perfil</h1>
            {/* Mantém seu formulário/UX atual de perfil.
               Se você tiver um componente específico (ex: <ProfilePanel />),
               pode trocar o conteúdo abaixo por ele sem mudar a rota. */}
            <div className="rounded-xl border border-white/10 bg-black/40 p-4 text-zinc-300">
              <p>Aqui fica o painel de edição de perfil (avatar, nickname, etc.).</p>
            </div>
          </section>
        )}

        {tab === 'seguranca' && (
          <section className="space-y-4">
            <h1 className="text-xl font-semibold">Segurança</h1>
            <div className="rounded-xl border border-white/10 bg-black/40 p-4 text-zinc-300 space-y-3">
              {/* Apenas alterar senha — "Excluir conta" removido conforme solicitado */}
              <form method="post" action="/api/auth/change-password" className="space-y-3">
                <div className="grid gap-1.5">
                  <label className="text-sm text-zinc-200">Senha atual</label>
                  <input type="password" name="current_password" className="bg-zinc-900 border border-white/10 rounded px-3 py-2 text-sm" required />
                </div>
                <div className="grid gap-1.5">
                  <label className="text-sm text-zinc-200">Nova senha</label>
                  <input type="password" name="new_password" className="bg-zinc-900 border border-white/10 rounded px-3 py-2 text-sm" required />
                </div>
                <button type="submit" className="px-4 py-2 rounded bg-white/10 hover:bg-white/15 border border-white/10 text-sm">
                  Atualizar senha
                </button>
              </form>
            </div>
          </section>
        )}
      </main>
    </div>
  )
}
