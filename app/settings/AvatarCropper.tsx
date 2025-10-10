// app/settings/AvatarCropper.tsx
'use client'

import React, { useEffect, useImperativeHandle, useMemo, useRef, useState, forwardRef } from 'react'

export type AvatarCropperHandle = {
  getCroppedBlob: () => Promise<Blob | null>
}

type Props = {
  file?: File | null
  currentUrl?: string | null
  initialZoom?: number
  size?: number
  onPreviewChange?: (dataUrl: string) => void
}

const AvatarCropper = forwardRef<AvatarCropperHandle, Props>(function AvatarCropper(
  { file, currentUrl, initialZoom = 1, size = 256, onPreviewChange },
  ref
) {
  const [zoom, setZoom] = useState(initialZoom)
  const [imageUrl, setImageUrl] = useState<string | null>(currentUrl ?? null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  // Track current object URL to revoke later
  const objectUrl = useMemo(() => (file ? URL.createObjectURL(file) : null), [file])

  useEffect(() => {
    if (objectUrl) setImageUrl(objectUrl)
    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [objectUrl])

  useEffect(() => {
    // also reflect server avatar if there is no selected file
    if (!file && currentUrl) setImageUrl(currentUrl)
  }, [file, currentUrl])

  // Re-render hidden canvas and emit preview when zoom or image changes
  useEffect(() => {
    if (!imageUrl) return
    const dataUrl = renderToCanvas(imageUrl, zoom, size, canvasRef)
    if (dataUrl && onPreviewChange) onPreviewChange(dataUrl)
  }, [imageUrl, zoom, size, onPreviewChange])

  useImperativeHandle(ref, () => ({
    async getCroppedBlob() {
      if (!imageUrl) return null
      const dataUrl = renderToCanvas(imageUrl, zoom, size, canvasRef)
      if (!dataUrl) return null
      const res = await fetch(dataUrl)
      return await res.blob()
    }
  }), [imageUrl, zoom, size])

  return (
    <div className="space-y-3">
      <div className="w-full flex items-center justify-center">
        {imageUrl ? (
          <div className="relative rounded-full overflow-hidden border" style={{ width: size, height: size }}>
            <img
              src={imageUrl}
              alt="Prévia do avatar"
              className="object-cover w-full h-full"
              style={{ transform: `scale(${zoom})` }}
            />
          </div>
        ) : (
          <div className="text-sm text-muted-foreground">Selecione uma imagem para pré-visualizar</div>
        )}
      </div>

      <div className="flex items-center gap-3">
        <span className="text-xs opacity-70">Zoom</span>
        <input
          type="range"
          min={0.5}
          max={3}
          step={0.01}
          value={zoom}
          onChange={(e) => setZoom(parseFloat(e.target.value))}
          className="w-full"
          aria-label="Zoom do avatar"
        />
        <span className="text-xs w-12 text-right">{zoom.toFixed(2)}x</span>
      </div>

      <canvas ref={canvasRef} className="hidden" width={size} height={size} />
    </div>
  )
})

export default AvatarCropper

function renderToCanvas(src: string, zoom: number, size: number, canvasRef: React.RefObject<HTMLCanvasElement>) {
  const canvas = canvasRef.current
  if (!canvas) return null
  const ctx = canvas.getContext('2d')
  if (!ctx) return null

  const img = new Image()
  img.crossOrigin = 'anonymous'
  img.src = src

  let dataUrl: string | null = null

  const draw = () => {
    ctx.clearRect(0, 0, size, size)
    const iw = img.width
    const ih = img.height
    const baseScale = Math.max(size / iw, size / ih)
    const scale = zoom * baseScale
    const dw = iw * scale
    const dh = ih * scale
    const dx = (size - dw) / 2
    const dy = (size - dh) / 2
    ctx.drawImage(img, dx, dy, dw, dh)
    dataUrl = canvas.toDataURL('image/jpeg', 0.9)
  }

  if (img.complete && img.naturalWidth > 0) {
    draw()
    return dataUrl
  } else {
    img.onload = () => draw()
    return null
  }
}
