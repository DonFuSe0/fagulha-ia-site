'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import AvatarCropper from './AvatarCropper'

import SettingsNotifier from './SettingsNotifier'
type SettingsPageProps = {
  searchParams: { tab?: string }
}

type ProfileData = {
  credits?: number
  nickname?: string
  avatar_url?: string | null
}

export default function SettingsPage({ searchParams }: SettingsPageProps) {
  const tab = useMemo<"perfil" | "seguranca">(() => {
    return (searchParams?.tab === 'seguranca') ? 'seguranca' : 'perfil'
  }, [searchParams?.tab])

  const [profile, setProfile] = useState<ProfileData>({})
  const [loadingProfile, setLoadingProfile] = useState(true)

  useEffect(() => {
    let isMounted = true
    const fetchProfile = async () => {
      try {
        const res = await fetch('/api/profile/credits', { cache: 'no-store' })
        const data = await res.json()
        if (!isMounted) return
        setProfile({ credits: data?.credits, nickname: data?.nickname, avatar_url: data?.avatar_url })
      } catch {
      } finally { if (isMounted) setLoadingProfile(false) }
    }
    fetchProfile()
    return () => { isMounted = false }
  }, [])

  const [nickname, setNickname] = useState<string>('')
  useEffect(() => {
    setNickname(profile?.nickname ?? '')
  }, [profile?.nickname])

  const [savingNick, setSavingNick] = useState(false)
  const saveNickname = async () => {
    if (!nickname || nickname.trim().length < 2) return
    setSavingNick(true)
    try {
      const res = await fetch('/api/profile/nickname', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nickname }),
      })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        throw new Error(j?.error || 'Falha ao salvar apelido')
      }
      // opcional: feedback visual
      window.dispatchEvent(new CustomEvent('notify', { detail: { kind: 'success', message: 'Apelido atualizado com sucesso.' } }))
    } catch (e) {
      console.error(e)
      window.dispatchEvent(new CustomEvent('notify', { detail: { kind: 'error', message: 'Não foi possível atualizar o apelido.' } }))
    } finally {
      setSavingNick(false)
    }
  }

  // ---- Avatar ----
  const [selectedUrl, setSelectedUrl] = useState<string | null>(null) // arquivo escolhido (prévia)
  const [croppedBlob, setCroppedBlob] = useState<Blob | null>(null)     // blob recortado pronto para upload
  const [croppedPreviewUrl, setCroppedPreviewUrl] = useState<string | null>(null) // preview local do recorte
  const [uploading, setUploading] = useState(false)

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    const url = URL.createObjectURL(f)
    setSelectedUrl(url)
    setCroppedBlob(null)
    setCroppedPreviewUrl(null)
  }

  // receber blob do cropper e gerar preview imediato
  const onCropped = (blob: Blob) => {
    setCroppedBlob(blob)
    try {
      const url = URL.createObjectURL(blob)
      setCroppedPreviewUrl(url)
    } catch {}
  }

  const uploadAvatar = async () => {
    if (!croppedBlob) {
      window.dispatchEvent(new CustomEvent('notify', { detail: { kind: 'error', message: 'Clique em “Aplicar recorte” antes de salvar.' } }))
      return
    }
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', croppedBlob, 'avatar.jpg')
      const res = await fetch('/api/profile/avatar', { method: 'POST', body: fd })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        throw new Error(j?.error || 'Falha ao enviar avatar')
      }
      const j = await res.json()
      const newAvatarUrl = j?.avatar_url
      
      // Atualiza avatar atual imediatamente com o retornado pela API
      setProfile(p => ({ ...p, avatar_url: newAvatarUrl ?? p?.avatar_url }))
      
      // limpa estados locais
      setSelectedUrl(null)
      setCroppedBlob(null)
      setCroppedPreviewUrl(null)
      
      // Dispara evento customizado com delay para evitar conflitos
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('avatar:updated', { 
          detail: { url: newAvatarUrl } 
        }))
      }, 100)
      
      window.dispatchEvent(new CustomEvent('notify', { detail: { kind: 'success', message: 'Avatar atualizado com sucesso.' } }))
    } catch (e) {
      console.error(e)
      window.dispatchEvent(new CustomEvent('notify', { detail: { kind: 'error', message: 'Não foi possível atualizar o avatar.' } }))
    } finally {
      setUploading(false)
    }
  }

  // fonte do preview pequeno (miniatura):
  // 1) se já existe recorte, usa-o;
  // 2) senão, se há arquivo selecionado, usa-o;
  // 3) senão, usa avatar atual do perfil;
  const smallPreviewSrc = croppedPreviewUrl || selectedUrl || profile?.avatar_url || null

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
        <SettingsNotifier />

      <main className="max-w-5xl mx-auto px-4 py-6 space-y-8">
        {tab === 'perfil' && (
          <section className="space-y-6">
            <h1 className="text-xl font-semibold">Editar Perfil</h1>

            <div className="rounded-xl border border-white/10 bg-black/40 p-4">
              <label className="block text-sm text-zinc-300 mb-1">Apelido (nickname)</label>
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  className="bg-zinc-900 border border-white/10 rounded px-3 py-2 text-sm flex-1"
                  placeholder="Seu apelido"
                />
                <button
                  type="button"
                  onClick={saveNickname}
                  disabled={savingNick}
                  className="px-3 py-2 rounded bg-white/10 hover:bg-white/15 border border-white/10 text-sm disabled:opacity-50"
                >
                  {savingNick ? 'Salvando…' : 'Salvar'}
                </button>
              </div>
              <p className="text-xs text-zinc-400 mt-2">Esse apelido aparece ao lado do seu avatar.</p>
            </div>

            <div className="rounded-xl border border-white/10 bg-black/40 p-4 space-y-3">
              <label className="block text-sm text-zinc-300">Avatar</label>
              <div className="flex items-center gap-4">
                {smallPreviewSrc ? (
                  <img 
                    key={`preview-${smallPreviewSrc}`}
                    src={smallPreviewSrc} 
                    alt="Prévia" 
                    className="h-16 w-16 rounded-full object-cover border border-white/10" 
                  />
                ) : (
                  <div className="h-16 w-16 rounded-full bg-zinc-800 border border-white/10" />
                )}
                <input type="file" accept="image/*" onChange={onFileChange} className="text-sm text-zinc-300" />
              </div>

              {selectedUrl && (
                <AvatarCropper
                  src={selectedUrl}
                  onCropped={onCropped}
                  size={384}
                  className="mt-2"
                />
              )}

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={uploadAvatar}
                  disabled={uploading || !croppedBlob}
                  className="px-3 py-2 rounded bg-white/10 hover:bg-white/15 border border-white/10 text-sm disabled:opacity-50"
                >
                  {uploading ? 'Enviando…' : 'Salvar avatar'}
                </button>
                {selectedUrl && (
                  <button
                    type="button"
                    onClick={() => { setSelectedUrl(null); setCroppedBlob(null); setCroppedPreviewUrl(null); }}
                    className="px-3 py-2 rounded bg-zinc-800 hover:bg-zinc-700 border border-white/10 text-sm"
                  >
                    Cancelar
                  </button>
                )}
              </div>
              <p className="text-xs text-zinc-400">Ajuste o zoom entre 0.5× e 3.0× antes de salvar.</p>
            </div>
          </section>
        )}

        {tab === 'seguranca' && (
          <section className="space-y-4">
            <h1 className="text-xl font-semibold">Segurança</h1>
            <div className="rounded-xl border border-white/10 bg-black/40 p-4 text-zinc-300 space-y-3">
              <form method="post" action="/api/profile/password" className="space-y-3">
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
