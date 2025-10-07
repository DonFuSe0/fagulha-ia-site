// app/settings/_panels/SecurityPanel.tsx
'use client'

import React from 'react'

export default function SecurityPanel() {
  return (
    <div className="space-y-6 max-w-xl">
      <header>
        <h2 className="text-lg font-semibold">Segurança</h2>
        <p className="text-sm text-zinc-400">Altere sua senha da conta.</p>
      </header>

      <form className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="pwd" className="text-sm text-zinc-300">Nova senha</label>
          <input id="pwd" type="password" className="w-full rounded-md bg-zinc-950 border border-zinc-800 px-3 py-2" />
        </div>
        <div className="space-y-2">
          <label htmlFor="pwd2" className="text-sm text-zinc-300">Confirmar nova senha</label>
          <input id="pwd2" type="password" className="w-full rounded-md bg-zinc-950 border border-zinc-800 px-3 py-2" />
        </div>
        <button type="submit" className="rounded-lg bg-orange-600 hover:bg-orange-500 px-4 py-2 font-medium">
          Atualizar senha
        </button>
      </form>
    </div>
  )
}
