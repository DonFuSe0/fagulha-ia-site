// app/settings/page.tsx
'use client'

import React, { useCallback, useEffect, useState } from 'react'
import AvatarCropper from './AvatarCropper'

type Tab = 'perfil' | 'seguranca'

function InlineNotice({ kind = 'success', children }: { kind?: 'success'|'error'|'info', children: React.ReactNode }) {
  const colors = kind === 'success'
    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
    : kind === 'error'
    ? 'bg-red-50 text-red-800 border-red-200'
    : 'bg-blue-50 text-blue-800 border-blue-200'
  return (
    <div className={`border rounded-md px-3 py-2 text-sm ${colors}`}>
      {children}
    </div>
  )
}

export default function SettingsPage() {
  const [tab, setTab] = useState<Tab>('perfil')

  // ----- PERFIL -----
  const [nickname, setNickname] = useState('')
  const [savingNick, setSavingNick] = useState(false)
  const [nickOk, setNickOk] = useState<string | null>(null)
  const [nickErr, setNickErr] = useState<string | null>(null)

  const [currentAvatarUrl, setCurrentAvatarUrl] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [topPreviewUrl, setTopPreviewUrl] = useState<string | null>(null)
  const [croppedBlob, setCroppedBlob] = useState<Blob | null>(null)
  const [savingAvatar, setSavingAvatar] = useState(false)
  const [avatarOk, setAvatarOk] = useState<string | null>(null)
  const [avatarErr, setAvatarErr] = useState<string | null>(null)

  // ----- SEGURANCA -----
  const [passOld, setPassOld] = useState('')
  const [passNew, setPassNew] = useState('')
  const [passConfirm, setPassConfirm] = useState('')
  const [savingPass, setSavingPass] = useState(false)
  const [passOk, setPassOk] = useState<string | null>(null)
  const [passErr, setPassErr] = useState<string | null>(null)

  useEffect(() => {
    // TODO: carregar nickname e avatar_url atuais do Supabase (se necessário)
  }, [])

  function onPickFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] || null
    setSelectedFile(f)
    setCroppedBlob(null)
    if (f) {
      const url = URL.createObjectURL(f)
      setTopPreviewUrl(url)
    }
  }

  const handlePreviewChange = useCallback((dataUrl: string) => {
    setTopPreviewUrl(dataUrl)
  }, [])

  const handleCropReady = useCallback((blob: Blob, dataUrl: string) => {
    setCroppedBlob(blob)
    setTopPreviewUrl(dataUrl) // sincroniza prévia fixa
  }, [])

  async function saveNickname() {
    try {
      setNickOk(null); setNickErr(null); setSavingNick(true)
      const res = await fetch('/api/profile/nickname', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nickname }),
      })
      if (!res.ok) {
        const j = await res.json().catch(() => ({} as any))
        throw new Error(j?.error || 'profile_update_failed')
      }
      setNickOk('Apelido atualizado com sucesso!')
      setTimeout(() => setNickOk(null), 3000)
    } catch (e: any) {
      console.error(e)
      setNickErr('Falha ao salvar apelido.')
      setTimeout(() => setNickErr(null), 4000)
    } finally {
      setSavingNick(false)
    }
  }

  async function saveAvatar() {
    if (!croppedBlob) return
    try {
      setAvatarOk(null); setAvatarErr(null); setSavingAvatar(true)
      const form = new FormData()
      form.append('file', croppedBlob, `avatar_${Date.now()}.jpg`)
      const res = await fetch('/api/profile/avatar', { method: 'POST', body: form })
      if (!res.ok) {
        const j = await res.json().catch(() => ({} as any))
        throw new Error(j?.error || 'profile_update_failed')
      }
      let publicUrl: string | null = null
      try {
        const j = await res.json()
        publicUrl = (j as any)?.publicUrl || null
      } catch {}
      if (publicUrl) {
        setCurrentAvatarUrl(publicUrl)
        setTopPreviewUrl(publicUrl)
      }
      setAvatarOk('Avatar atualizado com sucesso!')
      setTimeout(() => setAvatarOk(null), 3000)
      setCroppedBlob(null)
      setSelectedFile(null)
    } catch (e: any) {
      console.error(e)
      setAvatarErr('Falha ao enviar avatar.')
      setTimeout(() => setAvatarErr(null), 4000)
    } finally {
      setSavingAvatar(false)
    }
  }

  async function savePassword() {
    try {
      setPassOk(null); setPassErr(null); setSavingPass(true)
      if (passNew !== passConfirm) {
        throw new Error('Nova senha e confirmação não conferem.')
      }
      const res = await fetch('/api/profile/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: passOld, newPassword: passNew }),
      })
      if (!res.ok) {
        const j = await res.json().catch(() => ({} as any))
        throw new Error(j?.error || 'password_update_failed')
      }
      setPassOk('Senha atualizada com sucesso!')
      setTimeout(() => setPassOk(null), 3000)
      setPassOld(''); setPassNew(''); setPassConfirm('')
    } catch (e: any) {
      console.error(e)
      setPassErr(e?.message === 'Nova senha e confirmação não conferem.' ? e.message : 'Falha ao alterar senha.')
      setTimeout(() => setPassErr(null), 4000)
    } finally {
      setSavingPass(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      {/* Tabs */}
      <nav className="mb-6 flex gap-3">
        <button
          className={`px-3 py-1 rounded ${tab==='perfil' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}
          onClick={() => setTab('perfil')}
        >
          Perfil
        </button>
        <button
          className={`px-3 py-1 rounded ${tab==='seguranca' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}
          onClick={() => setTab('seguranca')}
        >
          Segurança
        </button>
      </nav>

      {tab === 'perfil' && (
        <div className="space-y-8">
          {/* Pré-visualização fixa */}
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
              <div className="text-xs text-muted-foreground">
                Atualiza ao escolher/cortar a imagem.
              </div>
            </div>
          </div>

          {/* Nickname */}
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
            {nickOk && <InlineNotice kind="success">{nickOk}</InlineNotice>}
            {nickErr && <InlineNotice kind="error">{nickErr}</InlineNotice>}
          </div>

          {/* Avatar */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Avatar</label>
            <input type="file" accept="image/*" onChange={onPickFile} />
            <AvatarCropper
              file={selectedFile || undefined}
              currentUrl={currentAvatarUrl ?? undefined}
              initialZoom={1}
              size={256}
              onPreviewChange={handlePreviewChange}
              onCropReady={handleCropReady}
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={saveAvatar}
                disabled={!croppedBlob || savingAvatar}
                className="px-3 py-2 rounded-md bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50"
              >
                {savingAvatar ? 'Enviando...' : 'Salvar avatar'}
              </button>
            </div>
            {avatarOk && <InlineNotice kind="success">{avatarOk}</InlineNotice>}
            {avatarErr && <InlineNotice kind="error">{avatarErr}</InlineNotice>}
          </div>
        </div>
      )}

      {tab === 'seguranca' && (
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Senha atual</label>
            <input
              type="password"
              value={passOld}
              onChange={(e) => setPassOld(e.target.value)}
              className="w-full px-3 py-2 rounded border bg-background"
              placeholder="Sua senha atual"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Nova senha</label>
            <input
              type="password"
              value={passNew}
              onChange={(e) => setPassNew(e.target.value)}
              className="w-full px-3 py-2 rounded border bg-background"
              placeholder="Nova senha"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Confirmar nova senha</label>
            <input
              type="password"
              value={passConfirm}
              onChange={(e) => setPassConfirm(e.target.value)}
              className="w-full px-3 py-2 rounded border bg-background"
              placeholder="Confirme a nova senha"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={savePassword}
              disabled={savingPass}
              className="px-3 py-2 rounded-md bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50"
            >
              {savingPass ? 'Salvando...' : 'Alterar senha'}
            </button>
          </div>
          {passOk && <InlineNotice kind="success">{passOk}</InlineNotice>}
          {passErr && <InlineNotice kind="error">{passErr}</InlineNotice>}
        </div>
      )}
    </div>
  )
}
