// app/settings/page.tsx
'use client'

import React from 'react'
import { useSearchParams } from 'next/navigation'
import TokensPanel from '@/app/settings/_panels/TokensPanel'
import SecurityPanel from '@/app/settings/_panels/SecurityPanel'
import UploadAvatarForm from '@/app/settings/UploadAvatarForm'

export default function SettingsPage() {
  const search = useSearchParams()
  const tab = (search.get('tab') || 'perfil').toLowerCase()

  function renderTab() {
    switch (tab) {
      case 'perfil':
        return (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold">Perfil</h2>
            <UploadAvatarForm />
          </div>
        )
      case 'tokens':
        return <TokensPanel />
      case 'segurança':
      case 'seguranca':
        return <SecurityPanel />
      default:
        return <div className="text-zinc-400">Aba não encontrada.</div>
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 text-sm">
        <a href="/settings?tab=perfil" className={`px-3 py-1.5 rounded-md border ${tab==='perfil'?'border-zinc-700 bg-zinc-900':'border-zinc-900 hover:bg-zinc-900'}`}>Perfil</a>
        <a href="/settings?tab=tokens" className={`px-3 py-1.5 rounded-md border ${tab==='tokens'?'border-zinc-700 bg-zinc-900':'border-zinc-900 hover:bg-zinc-900'}`}>Tokens</a>
        <a href="/settings?tab=segurança" className={`px-3 py-1.5 rounded-md border ${tab==='segurança' || tab==='seguranca' ?'border-zinc-700 bg-zinc-900':'border-zinc-900 hover:bg-zinc-900'}`}>Segurança</a>
      </div>
      {renderTab()}
    </div>
  )
}
