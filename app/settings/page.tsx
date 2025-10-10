// app/settings/page.tsx
'use client'

import React, { useCallback, useEffect, useState } from 'react'
import AvatarCropper from './AvatarCropper'

type Tab = 'perfil' | 'seguranca'

export default function SettingsPage() {
  const [tab, setTab] = useState<Tab>('perfil')

  const [nickname, setNickname] = useState('')
  const [savingNick, setSavingNick] = useState(false)
  const [nickOk, setNickOk] = useState<string | null>(null)

  const [currentAvatarUrl, setCurrentAvatarUrl] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [topPreviewUrl, setTopPreviewUrl] = useState<string | null>(null)
  const [savingAvatar, setSavingAvatar] = useState(false)
  const [avatarOk, setAvatarOk] = useState<string | null>(null)

  useEffect(() => {
    // TODO: carregar nickname/avatar_url reais do Supabase
  }, [])

  function onPickFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] || null
    setSelectedFile(f)
    if (f) {
      const url = URL.createObjectURL(f)
      setTopPreviewUrl(url)
    }
  }

  const handlePreviewChange = useCallback((dataUrl: string) => {
    setTopPreviewUrl(dataUrl)
  }, [])

  async function saveNickname() {
    try {
      setSavingNick(true)
      setNickOk(null)
      const res = await fetch('/api/profile/nickname', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nickname }),
      })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        throw new Error(j?.error || 'profile_update_failed')
      }
      setNickOk('Apelido atualizado com sucesso!')
      setTimeout(() => setNickOk(null), 3000)
    } catch (e) {
      console.error(e)
      alert('Falha ao salvar apelido.')
    } finally {
      setSavingNick(false)
    }
  }

  async function saveAvatar(blob: Blob) {
    try {
      setSavingAvatar(true)
      setAvatarOk(null)

      const form = new FormData()
      form.append('file', blob, `avatar_${Date.now()}.jpg`)

      const res = await fetch('/api/profile/avatar', { method: 'POST', body: form })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        throw new Error(j?.error || 'profile_update_failed')
      }

      setAvatarOk('Avatar atualizado com sucesso!')
      setTimeout(() => setAvatarOk(null), 3000)
      try {
        const j = await res.json()
        if (j?.publicUrl) {
          setCurrentAvatarUrl(j.publicUrl)
          setTopPreviewUrl(j.publicUrl)
        }
      } catch {}
    } catch (e) {
      console.error(e)
      alert('Falha ao enviar avatar.')
    } finally {
      setSavingAvatar(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <nav className="mb-6 flex gap-3">
        <button className={\`px-3 py-1 rounded \${tab==='perfil' ? 'bg-primary text-primary-foreground' : 'bg-muted'}\`} onClick={() => setTab('perfil')}>Perfil</button>
        <button className={\`px-3 py-1 rounded \${tab==='seguranca' ? 'bg-primary text-primary-foreground' : 'bg-muted'}\`} onClick={() => setTab('seguranca')}>Segurança</button>
      </nav>

      {tab === 'perfil' && (
        <div className="space-y-8">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full overflow-hidden border">
              <img
                src={topPreviewUrl || currentAvatarUrl || '/avatar-placeholder.png'}
                alt="Avatar atual"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <div className="text-sm opacity-70">Pré-visualização</div>
              <div className="text-xs text-muted-foreground">Atualiza ao escolher/cortar a imagem.</div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Apelido</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                className="flex-1 px-3 py-2 rounded border bg-background"
                placeholder="Seu apelido"
              />
              <button
                onClick={saveNickname}
                disabled={savingNick}
                className="px-3 py-2 rounded-md bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50"
              >
                {savingNick ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
            {nickOk && <div className="text-green-600 text-sm">{nickOk}</div>}
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium">Avatar</label>
            <input type="file" accept="image/*" onChange={onPickFile} />
            <AvatarCropper
              file={selectedFile || undefined}
              currentUrl={currentAvatarUrl ?? undefined}
              initialZoom={1}
              onPreviewChange={(d) => handlePreviewChange(d)}
              onCropped={(blob) => saveAvatar(blob)}
              size={256}
            />
            {avatarOk && <div className="text-green-600 text-sm">{avatarOk}</div>}
          </div>
        </div>
      )}

      {tab === 'seguranca' && <div>… conteúdo de segurança …</div>}
    </div>
  )
}
