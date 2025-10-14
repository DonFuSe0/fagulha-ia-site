// app/settings/UploadAvatarForm.tsx (patch: força refresh da UI pós-upload)
'use client'

import React, { useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export default function UploadAvatarForm() {
  const [file, setFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)
  const [scale, setScale] = useState(1)
  const router = useRouter()
  const supabase = createClientComponentClient()

  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const imgRef = useRef<HTMLImageElement | null>(null)

  function onFilePick(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] || null
    setFile(f)
    setError(null)
    setSuccess(null)
  }

  async function toCroppedBlob(original: File, zoom: number): Promise<Blob> {
    const img = document.createElement('img')
    const url = URL.createObjectURL(original)
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve()
      img.onerror = reject
      img.src = url
    })
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')!
    const SIZE = 512
    canvas.width = SIZE
    canvas.height = SIZE

    const iw = img.naturalWidth
    const ih = img.naturalHeight
    const baseScale = Math.min(iw, ih) / Math.max(iw, ih)
    const s = baseScale * zoom

    const drawW = iw * s
    const drawH = ih * s
    const dx = (SIZE - drawW) / 2
    const dy = (SIZE - drawH) / 2

    ctx.fillStyle = '#000'
    ctx.fillRect(0, 0, SIZE, SIZE)
    ctx.drawImage(img, dx, dy, drawW, drawH)

    return new Promise<Blob>((resolve) => {
      canvas.toBlob((b) => resolve(b as Blob), 'image/png', 0.92)
    })
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (!file) {
      setError('Selecione um arquivo.')
      return
    }

    try {
      setSaving(true)

      let blob: Blob
      try { blob = await toCroppedBlob(file, scale) }
      catch { blob = file }

      const ext = (file.name.split('.').pop() || 'png').toLowerCase()
      const filename = `avatar.${ext === 'jpg' ? 'jpg' : ext}`
      const uploadFile = new File([blob], filename, { type: (blob as any).type || file.type || 'image/png' })

      const fd = new FormData()
      fd.append('file', uploadFile)

      const res = await fetch('/api/profile/avatar', {
        method: 'POST',
        body: fd,
        credentials: 'include',
      })
      const data = await res.json().catch(() => ({} as any))
      if (!res.ok) throw new Error(data?.details || data?.error || 'Falha ao enviar avatar.')

      // sucesso
      setSuccess('Avatar atualizado com sucesso!')

      // 1) força a sessão a refletir user_metadata.avatar_ver
      try { await supabase.auth.refreshSession() } catch {}

      // 2) força revalidação dos Server Components (ex.: ProfileHero)
      router.refresh()

      // 3) em último caso, pós-pequeno delay, dá um "ping" visual para re-render do Next/Image
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('avatar:updated', { detail: { url: data?.avatar_url, path: data?.avatar_path, ver: data?.ver } }))
      }, 300)

    } catch (err: any) {
      setError(err?.message || 'Falha ao enviar avatar.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3">
      <input type="file" accept="image/*" onChange={onFilePick} />
      {/* slider de zoom */}
      <label className="text-sm text-white/80">Zoom</label>
      <input type="range" min={1} max={3} step={0.05} value={scale} onChange={e => setScale(parseFloat(e.target.value))} />

      <button type="submit" disabled={saving} className="rounded-lg bg-orange-600 hover:bg-orange-500 px-4 py-2 font-medium disabled:opacity-60">
        {saving ? 'Salvando...' : 'Salvar avatar'}
      </button>

      {error && <p className="text-sm text-red-400">{error}</p>}
      {success && <p className="text-sm text-emerald-400">{success}</p>}
    </form>
  )
}
