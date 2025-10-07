'use client'

import React, { useMemo, useRef, useState } from 'react'

/**
 * UploadAvatarForm
 * - Pré-visualização com corte central em formato quadrado
 * - Slider de zoom (1x a 3x)
 * - No envio, gera uma imagem quadrada (512x512) via <canvas> respeitando o zoom escolhido
 * - Mantém o endpoint e a chave 'file' no FormData (não quebra o backend que já está funcionando)
 */
export default function UploadAvatarForm() {
  const [file, setFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)
  const [scale, setScale] = useState<number>(1) // 1x..3x
  const imgRef = useRef<HTMLImageElement | null>(null)

  const previewUrl = useMemo(() => (file ? URL.createObjectURL(file) : null), [file])

  // Revoke preview URL para evitar memory leaks
  React.useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  function onPick(f: File | null) {
    setError(null); setSuccess(null)
    setFile(f)
    setScale(1)
  }

  async function toCroppedBlob(original: File, zoom: number): Promise<Blob> {
    // Lê a imagem original em um elemento <img> para obter dimensões
    const dataUrl = await fileToDataURL(original)
    const image = await loadImage(dataUrl)

    // Define tamanho final do avatar
    const OUT = 512 // px
    const canvas = document.createElement('canvas')
    canvas.width = OUT
    canvas.height = OUT
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('Canvas indisponível')

    // Toma o menor lado como base para um recorte quadrado central
    const minSide = Math.min(image.width, image.height)
    // Quanto maior o zoom, menor a área de recorte (aproxima)
    // Ex.: zoom=1 => recorte = minSide
    //      zoom=2 => recorte = minSide/2 (aproxima 2x no centro)
    const cropSize = Math.max(1, minSide / Math.max(1, zoom))

    const sx = Math.max(0, (image.width - cropSize) / 2)
    const sy = Math.max(0, (image.height - cropSize) / 2)
    const sWidth = Math.min(cropSize, image.width - sx)
    const sHeight = Math.min(cropSize, image.height - sy)

    ctx.clearRect(0, 0, OUT, OUT)
    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = 'high'
    ctx.drawImage(image, sx, sy, sWidth, sHeight, 0, 0, OUT, OUT)

    // Usa PNG por padrão (sem perda); você pode trocar para 'image/jpeg' com quality se quiser
    const type = 'image/png'
    return await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((b) => {
        if (b) resolve(b)
        else reject(new Error('Falha ao gerar imagem do avatar'))
      }, type, 0.95)
    })
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null); setSuccess(null)

    if (!file) {
      setError('Selecione um arquivo.')
      return
    }

    try {
      setSaving(true)

      // Gera uma imagem quadrada 512x512 respeitando o zoom
      let blob: Blob
      try {
        blob = await toCroppedBlob(file, scale)
      } catch (cropErr) {
        // Fallback: se der algum erro no crop, envia o arquivo original para não quebrar a UX
        blob = file
      }

      // Constrói um File a partir do blob para manter nome/extensão
      const ext = (file.name.split('.').pop() || 'png').toLowerCase()
      const filename = `avatar.${ext === 'jpg' ? 'jpg' : ext}`
      const uploadFile = new File([blob], filename, { type: (blob as any).type || file.type || 'image/png' })

      const fd = new FormData()
      // Nome do campo PRECISA permanecer 'file' para bater com o endpoint
      fd.append('file', uploadFile)

      const res = await fetch('/api/profile/avatar', {
        method: 'POST',
        body: fd,
        credentials: 'include',
      })

      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(data?.details || data?.error || 'Falha ao enviar avatar.')
      }

      setSuccess('Avatar atualizado com sucesso!')
    } catch (err: any) {
      setError(err?.message || 'Falha ao enviar avatar.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="space-y-2">
        <label htmlFor="avatar" className="text-sm text-zinc-300">Selecione seu avatar</label>
        <input
          id="avatar"
          name="avatar"
          type="file"
          accept="image/*"
          onChange={(e) => onPick(e.target.files?.[0] || null)}
          className="block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-orange-600 file:text-white hover:file:bg-orange-500"
          required
        />
      </div>

      {/* Prévia com “corte” quadrado + zoom */}
      {previewUrl && (
        <div className="flex items-center gap-6">
          <div className="relative w-40 h-40 rounded-full overflow-hidden border border-zinc-800 bg-zinc-900/40">
            <img
              ref={imgRef}
              src={previewUrl}
              alt="Preview do avatar"
              className="w-full h-full object-cover transition-transform duration-150 ease-out"
              style={{ transform: `scale(${scale})` }}
            />
            {/* máscara circular já dada pelo rounded-full + overflow-hidden */}
          </div>

          {/* Slider de zoom */}
          <div className="flex-1 min-w-[220px]">
            <label htmlFor="zoom" className="block text-sm text-zinc-300 mb-2">Zoom</label>
            <input
              id="zoom"
              name="zoom"
              type="range"
              min={1}
              max={3}
              step={0.01}
              value={scale}
              onChange={(e) => setScale(parseFloat(e.target.value))}
              className="w-full accent-orange-600"
            />
            <div className="text-xs text-zinc-400 mt-1">Zoom: {scale.toFixed(2)}x</div>
          </div>
        </div>
      )}

      <button
        type="submit"
        disabled={saving}
        className="rounded-lg bg-orange-600 hover:bg-orange-500 px-4 py-2 font-medium disabled:opacity-60"
      >
        {saving ? 'Salvando...' : 'Salvar avatar'}
      </button>

      {error && <p className="text-sm text-red-400">{error}</p>}
      {success && <p className="text-sm text-emerald-400">{success}</p>}
    </form>
  )
}

/** Utils **/
function fileToDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}
