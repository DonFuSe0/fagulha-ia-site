'use client'

import { useEffect, useMemo, useRef, useState } from 'react'

type Props = {
  src: string | null
  onCropped?: (blob: Blob) => void
  size?: number // output square size (px)
  className?: string
}

export default function AvatarCropper({ src, onCropped, size = 384, className }: Props) {
  const imgRef = useRef<HTMLImageElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  const [zoom, setZoom] = useState(1.0)
  const min = 0.5
  const max = 3.0
  const step = 0.01
  const canCrop = !!src

  // sempre que trocar a imagem, reseta o zoom
  useEffect(() => {
    setZoom(1.0)
  }, [src])

  const handleCrop = () => {
    if (!src) return
    const img = imgRef.current
    const canvas = canvasRef.current
    if (!img || !canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = size
    canvas.height = size
    ctx.clearRect(0, 0, size, size)

    const iw = img.naturalWidth
    const ih = img.naturalHeight
    if (!iw || !ih) return

    // escala base para preencher o quadrado em zoom=1
    const baseScale = Math.max(size / iw, size / ih)
    const s = baseScale * zoom

    const drawW = iw * s
    const drawH = ih * s

    // centraliza a imagem recortada
    const dx = (size - drawW) / 2
    const dy = (size - drawH) / 2

    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = 'high'
    ctx.drawImage(img, dx, dy, drawW, drawH)

    canvas.toBlob((blob) => {
      if (blob && onCropped) onCropped(blob)
    }, 'image/jpeg', 0.92)
  }

  return (
    <div className={"rounded-xl border border-white/10 bg-black/30 p-3 " + (className ?? '')}>
      <div className="grid gap-3">
        <div className="flex items-center gap-6">
          {/* Preview com zoom ao vivo via CSS transform */}
          <div className="h-40 w-40 rounded-full overflow-hidden bg-black/40 border border-white/10 flex items-center justify-center">
            {src ? (
              <img
                ref={imgRef}
                src={src}
                alt="Prévia do avatar"
                className="h-full w-full object-cover"
                style={{ transform: `scale(${zoom})`, transformOrigin: 'center' }}
              />
            ) : (
              <span className="text-xs text-zinc-400">Selecione uma imagem…</span>
            )}
          </div>
          <div className="flex-1">
            <label className="block text-xs text-zinc-400 mb-1">Zoom ({min}x – {max}x)</label>
            <input
              aria-label="Ajustar zoom do avatar"
              type="range"
              min={min}
              max={max}
              step={step}
              value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              className="w-full"
            />
            <div className="mt-2 text-xs text-zinc-400">Zoom atual: {zoom.toFixed(2)}x</div>
            <button
              type="button"
              onClick={handleCrop}
              disabled={!canCrop}
              className="mt-3 px-3 py-1.5 rounded bg-white/10 hover:bg-white/15 border border-white/10 text-sm disabled:opacity-50"
            >
              Aplicar recorte
            </button>
          </div>
        </div>
        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  )
}
