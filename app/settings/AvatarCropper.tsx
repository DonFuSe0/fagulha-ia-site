// app/settings/AvatarCropper.tsx
'use client'

import React, { useEffect, useRef, useState } from 'react'

type Props = {
  file?: File | null
  currentUrl?: string | null
  initialZoom?: number
  onPreviewChange?: (dataUrl: string) => void
  onCropped?: (blob: Blob, dataUrl: string) => void
  size?: number
}

export default function AvatarCropper({
  file,
  currentUrl,
  initialZoom = 1,
  onPreviewChange,
  onCropped,
  size = 256,
}: Props) {
  const [zoom, setZoom] = useState(initialZoom)
  const [imageUrl, setImageUrl] = useState<string | null>(currentUrl ?? null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    if (!file) return
    const url = URL.createObjectURL(file)
    setImageUrl(url)
    queueMicrotask(() => {
      const dataUrl = renderPreview(url, zoom, size, canvasRef)
      if (dataUrl && onPreviewChange) onPreviewChange(dataUrl)
    })
    return () => URL.revokeObjectURL(url)
  }, [file])

  useEffect(() => {
    if (!imageUrl) return
    const dataUrl = renderPreview(imageUrl, zoom, size, canvasRef)
    if (dataUrl && onPreviewChange) onPreviewChange(dataUrl)
  }, [zoom, imageUrl, size, onPreviewChange])

  function handleConfirm() {
    if (!imageUrl) return
    const dataUrl = renderPreview(imageUrl, zoom, size, canvasRef)
    if (!dataUrl) return
    fetch(dataUrl).then(r => r.blob()).then(blob => onCropped?.(blob, dataUrl))
  }

  return (
    <div className="space-y-3">
      <div className="w-full flex items-center justify-center">
        {imageUrl ? (
          <div className="relative rounded-full overflow-hidden" style={{ width: size, height: size }}>
            <img src={imageUrl} alt="Prévia do avatar" className="object-cover w-full h-full" style={{ transform: \`scale(\${zoom})\` }} />
          </div>
        ) : (
          <div className="text-sm text-muted-foreground">Selecione uma imagem para pré-visualizar</div>
        )}
      </div>

      <div className="flex items-center gap-3">
        <span className="text-xs opacity-70">Zoom</span>
        <input type="range" min={0.5} max={3} step={0.01} value={zoom} onChange={(e) => setZoom(parseFloat(e.target.value))} className="w-full" aria-label="Zoom do avatar" />
        <span className="text-xs w-10 text-right">{zoom.toFixed(2)}x</span>
      </div>

      <div className="flex justify-end gap-2">
        <button type="button" onClick={handleConfirm} className="px-3 py-2 rounded-md bg-primary text-primary-foreground hover:opacity-90">
          Confirmar recorte
        </button>
      </div>

      <canvas ref={canvasRef} className="hidden" width={size} height={size} />
    </div>
  )
}

function renderPreview(src: string, zoom: number, size: number, canvasRef: React.RefObject<HTMLCanvasElement>) {
  const canvas = canvasRef.current
  if (!canvas) return null
  const ctx = canvas.getContext('2d')
  if (!ctx) return null

  const img = new Image()
  img.crossOrigin = 'anonymous'
  img.src = src

  ;(renderPreview as any)._lastDataUrl = (renderPreview as any)._lastDataUrl || null

  try {
    img.onload = () => {
      ctx.clearRect(0, 0, size, size)
      const iw = img.width
      const ih = img.height
      const scale = zoom * Math.max(size / iw, size / ih)
      const dw = iw * scale
      const dh = ih * scale
      const dx = (size - dw) / 2
      const dy = (size - dh) / 2
      ctx.drawImage(img, dx, dy, dw, dh)
      ;(renderPreview as any)._lastDataUrl = canvas.toDataURL('image/jpeg', 0.9)
    }
    if (img.complete && img.naturalWidth > 0) {
      img.onload!(null as any)
    }
  } catch {}

  return (renderPreview as any)._lastDataUrl
}
