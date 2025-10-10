'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import AvatarCropper from './AvatarCropper'

type SettingsPageProps = {
  searchParams: { tab?: string }
}

type ProfileData = {
  credits?: number
  nickname?: string
  avatar_url?: string | null
}

function Banner({ kind, children }: { kind: 'success' | 'error'; children: React.ReactNode }) {
  const base = 'mt-3 text-sm rounded-md border px-3 py-2'
  const ok = 'border-green-500 text-green-400 bg-green-500/10'
  const bad = 'border-red-500 text-red-400 bg-red-500/10'
  return <div className={`${base} ${kind === 'success' ? ok : bad}`}>{children}</div>
}

export default function SettingsPage({ searchParams }: SettingsPageProps) {
  const router = useRouter()
  const params = useSearchParams()
  const tab = (searchParams?.tab || 'perfil') as 'perfil' | 'seguranca'

  const [profile, setProfile] = useState<ProfileData>({})
  const [loadingProfile, setLoadingProfile] = useState(true)

  // feedback banner
  const [banner, setBanner] = useState<{ kind: 'success' | 'error'; msg: string } | null>(null)

  useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        const res = await fetch('/api/profile/credits', { cache: 'no-store' })
        const data = await res.json()
        if (!alive) return
        setProfile({ credits: data?.credits, nickname: data?.nickname, avatar_url: data?.avatar_url })
      } catch {
        // ignore
      } finally {
        if (alive) setLoadingProfile(false)
      }
    })()
    return () => { alive = false }
  }, [])

  // pwd feedback via query params
  useEffect(() => {
    const pwd = params.get('pwd')
    const perr = params.get('pwd_error')
    if (tab === 'seguranca') {
      if (pwd === 'ok') {
        setBanner({ kind: 'success', msg: 'Senha atualizada com sucesso.' })
        router.replace('/settings?tab=seguranca')
      } else if (perr) {
        const msg =
          perr === 'invalid' ? 'Dados inválidos para alterar a senha.' :
          perr === 'method_not_allowed' ? 'Método não permitido.' :
          'Não foi possível atualizar a senha.'
        setBanner({ kind: 'error', msg })
        router.replace('/settings?tab=seguranca')
      }
    }
  }, [params, tab, router])

  // nickname
  const [nickname, setNickname] = useState('')
  useEffect(() => {
    if (profile.nickname) setNickname(profile.nickname)
  }, [profile.nickname])

  async function saveNickname() {
    try {
      const res = await fetch('/api/profile/nickname', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nickname })
      })
      if (res.ok) {
        setBanner({ kind: 'success', msg: 'Apelido atualizado com sucesso.' })
        setProfile(p => ({ ...p, nickname }))
      } else {
        setBanner({ kind: 'error', msg: 'Não foi possível atualizar o apelido.' })
      }
    } catch {
      setBanner({ kind: 'error', msg: 'Não foi possível atualizar o apelido.' })
    }
  }

  // avatar
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [selectedUrl, setSelectedUrl] = useState<string | null>(null)
  const [croppedBlob, setCroppedBlob] = useState<Blob | null>(null)
  const [croppedUrl, setCroppedUrl] = useState<string | null>(null)

  function onFilePick(file: File | null) {
    setSelectedFile(file)
    setCroppedBlob(null)
    if (selectedUrl) URL.revokeObjectURL(selectedUrl)
    setSelectedUrl(file ? URL.createObjectURL(file) : null)
    if (croppedUrl) URL.revokeObjectURL(croppedUrl)
    setCroppedUrl(null)
  }

  function onCropped(blob: Blob) {
    setCroppedBlob(blob)
    if (croppedUrl) URL.revokeObjectURL(croppedUrl)
    setCroppedUrl(URL.createObjectURL(blob))
  }

  async function saveAvatar() {
    try {
      const fd = new FormData()
      if (croppedBlob) {
        fd.append('file', croppedBlob, 'avatar.jpg')
      } else if (selectedFile) {
        fd.append('file', selectedFile, selectedFile.name)
      } else {
        setBanner({ kind: 'error', msg: 'Selecione uma imagem primeiro.' })
        return
      }
      const res = await fetch('/api/profile/avatar', { method: 'POST', body: fd })
      const data = await res.json().catch(() => ({}))
      if (res.ok) {
        const newUrl: string | null = data?.avatar_url ?? null
        setBanner({ kind: 'success', msg: 'Avatar atualizado com sucesso.' })
        setProfile(p => ({ ...p, avatar_url: newUrl }))
        if (selectedUrl) { URL.revokeObjectURL(selectedUrl); setSelectedUrl(null) }
      } else {
        setBanner({ kind: 'error', msg: 'Não foi possível atualizar o avatar.' })
      }
    } catch {
      setBanner({ kind: 'error', msg: 'Não foi possível atualizar o avatar.' })
    }
  }

  const miniPreview = croppedUrl || selectedUrl || profile.avatar_url || null

  return (
    <main className="max-w-5xl mx-auto px-4 py-6">
      <div className="flex items-center gap-4 border-b border-white/10 pb-3">
        <Link href="/settings?tab=perfil" className={tab === 'perfil' ? 'text-white' : 'text-white/60 hover:text-white'}>Perfil</Link>
        <Link href="/settings?tab=seguranca" className={tab === 'seguranca' ? 'text-white' : 'text-white/60 hover:text-white'}>Segurança</Link>
      </div>

      {banner && <Banner kind={banner.kind}>{banner.msg}</Banner>}

      {tab === 'perfil' && (
        <section className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-lg font-semibold text-white">Avatar</h2>
            <p className="text-sm text-white/60">Envie uma imagem e recorte como preferir.</p>

            <div className="mt-4">
              <AvatarCropper onFilePick={onFilePick} onCropped={onCropped} selectedUrl={selectedUrl} />
            </div>

            <div className="mt-4 flex items-center gap-4">
              <div className="w-16 h-16 rounded-full overflow-hidden bg-white/5 flex items-center justify-center">
                {miniPreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={miniPreview} alt="avatar preview" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xs text-white/40">sem foto</span>
                )}
              </div>
              <button onClick={saveAvatar} className="rounded-md bg-white/10 px-3 py-2 text-sm hover:bg-white/20">
                Salvar avatar
              </button>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-white">Apelido</h2>
            <p className="text-sm text-white/60">Como seu nome será exibido.</p>

            <div className="mt-4 flex items-center gap-3">
              <input
                value={nickname}
                onChange={e => setNickname(e.target.value)}
                placeholder="Seu apelido"
                className="w-full rounded-md bg-white/5 px-3 py-2 text-sm text-white outline-none focus:ring-1 focus:ring-white/20"
              />
              <button onClick={saveNickname} className="rounded-md bg-white/10 px-3 py-2 text-sm hover:bg-white/20">
                Salvar
              </button>
            </div>
          </div>
        </section>
      )}

      {tab === 'seguranca' && (
        <section className="mt-6">
          <h2 className="text-lg font-semibold text-white">Segurança</h2>
          <p className="text-sm text-white/60">Altere sua senha atual.</p>
          {/* A tela de senha original pode viver aqui; o handler já é /api/profile/password */}
        </section>
      )}
    </main>
  )
}
