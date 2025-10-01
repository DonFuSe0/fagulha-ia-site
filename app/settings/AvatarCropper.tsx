// app/settings/AvatarCropper.tsx
'use client'
import { useEffect, useRef, useState } from 'react'

type Props = {
  file: File
  onCancel: () => void
  onConfirm: (blob: Blob, mime: string) => void
  outputSize?: number // default 512
  outputMime?: 'image/jpeg' | 'image/png'
  quality?: number // 0..1 (jpg only)
  minSource?: number // minimum shortest side required (default 512)
}

/**
 * AvatarCropper PLUS
 * - Zoom (1x..3x) e PAN (arrastar) com limites (não deixa borda vazia)
 * - Valida resolução mínima da imagem de origem (minSource, default 512)
 * - Saída circular em outputSize (default 512), formato JPG (quality) ou PNG
 */
export default function AvatarCropper({
  file, onCancel, onConfirm, outputSize = 512, outputMime = 'image/jpeg', quality = 0.9, minSource = 512
}: Props) {
  const [zoom, setZoom] = useState(1)
  const [imgUrl, setImgUrl] = useState<string>('')
  const [error, setError] = useState<string | null>(null)
  const [imgW, setImgW] = useState(0)
  const [imgH, setImgH] = useState(0)

  // pan state (em px da imagem fonte)
  const [dx, setDx] = useState(0)
  const [dy, setDy] = useState(0)
  const [drag, setDrag] = useState<{startX:number,startY:number,baseDx:number,baseDy:number}|null>(null)

  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const url = URL.createObjectURL(file)
    setImgUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [file])

  useEffect(() => { drawPreview() }, [imgUrl, zoom, dx, dy])

  function clampPan(nx: number, ny: number, srcBox: number) {
    const half = srcBox/2
    const cxMax = (imgW/2 - half)
    const cyMax = (imgH/2 - half)
    const clampedX = Math.max(-cxMax, Math.min(cxMax, nx))
    const clampedY = Math.max(-cyMax, Math.min(cyMax, ny))
    return { x: clampedX, y: clampedY }
  }

  function startDrag(e: React.MouseEvent) {
    e.preventDefault()
    setDrag({ startX: e.clientX, startY: e.clientY, baseDx: dx, baseDy: dy })
  }
  function onDrag(e: React.MouseEvent) {
    if (!drag || imgW===0 || imgH===0) return
    const minSide = Math.min(imgW, imgH)
    const srcBox = minSide / zoom
    const moveX = (e.clientX - drag.startX) * (srcBox / 320)
    const moveY = (e.clientY - drag.startY) * (srcBox / 320)
    const { x, y } = clampPan(drag.baseDx + moveX, drag.baseDy + moveY, srcBox)
    setDx(x); setDy(y)
  }
  function endDrag() { setDrag(null) }

  function drawPreview() {
    const canvas = canvasRef.current
    if (!canvas || !imgUrl) return
    const ctx = canvas.getContext('2d')!
    const img = new Image()
    img.onload = () => {
      setImgW(img.width); setImgH(img.height)
      if (Math.min(img.width, img.height) < minSource) {
        setError(`Imagem muito pequena. Use pelo menos ${minSource}px no menor lado.`)
      } else {
        setError(null)
      }

      const size = 320
      canvas.width = size
      canvas.height = size

      const minSide = Math.min(img.width, img.height)
      const srcBox = minSide / zoom
      const { x, y } = clampPan(dx, dy, srcBox)

      const sx = (img.width/2 - srcBox/2) + x
      const sy = (img.height/2 - srcBox/2) + y

      ctx.clearRect(0,0,size,size)
      ctx.save()
      ctx.beginPath()
      ctx.arc(size/2, size/2, size/2 - 2, 0, Math.PI*2)
      ctx.clip()
      ctx.drawImage(img, sx, sy, srcBox, srcBox, 0, 0, size, size)
      ctx.restore()

      ctx.strokeStyle = 'rgba(255,255,255,0.35)'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.arc(size/2, size/2, size/2 - 1, 0, Math.PI*2)
      ctx.stroke()
    }
    img.onerror = () => setError('Falha ao carregar a imagem.')
    img.src = imgUrl
  }

  async function confirm() {
    if (error) return
    const out = document.createElement('canvas')
    out.width = outputSize
    out.height = outputSize
    const ctx = out.getContext('2d')!
    const img = new Image()
    img.onload = () => {
      const minSide = Math.min(img.width, img.height)
      const srcBox = minSide / zoom
      const { x, y } = clampPan(dx, dy, srcBox)
      const sx = (img.width/2 - srcBox/2) + x
      const sy = (img.height/2 - srcBox/2) + y

      ctx.clearRect(0,0,out.width,out.height)
      ctx.save()
      ctx.beginPath()
      ctx.arc(out.width/2, out.height/2, out.width/2, 0, Math.PI*2)
      ctx.clip()
      ctx.drawImage(img, sx, sy, srcBox, srcBox, 0, 0, out.width, out.height)
      ctx.restore()

      const mime = outputMime || 'image/jpeg'
      if (mime === 'image/png') {
        out.toBlob((blob) => {
          if (!blob) return setError('Falha ao gerar imagem.')
          onConfirm(blob, 'image/png')
        }, 'image/png')
      } else {
        out.toBlob((blob) => {
          if (!blob) return setError('Falha ao gerar imagem.')
          onConfirm(blob, 'image/jpeg')
        }, 'image/jpeg', quality ?? 0.9)
      }
    }
    img.onerror = () => setError('Falha ao processar recorte.')
    img.src = imgUrl
  }

  return (
    <div className="rounded-xl border border-white/15 bg-neutral-950/80 p-4 select-none">
      <div className="text-white/90 font-medium mb-3">Ajustar avatar</div>
      {error && <div className="mb-3 text-sm text-red-300">{error}</div>}

      <div className="flex items-start gap-5">
        <div
          className="rounded-full bg-black/40 w-[320px] h-[320px] overflow-hidden cursor-grab active:cursor-grabbing"
          onMouseDown={startDrag}
          onMouseMove={onDrag}
          onMouseUp={endDrag}
          onMouseLeave={endDrag}
        >
          <canvas ref={canvasRef} className="w-[320px] h-[320px]" />
        </div>

        <div className="flex-1 space-y-4">
          <label className="block text-sm text-neutral-300">Zoom</label>
          <input
            type="range"
            min={1}
            max={3}
            step={0.01}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="w-full"
          />
          <div className="text-xs text-neutral-400">
            Origem: {imgW}×{imgH}px • Saída: {outputSize}×{outputSize}px
          </div>
          <div className="flex gap-2">
            <button onClick={onCancel} className="px-3 py-2 rounded-lg bg-white/5 border border-white/15 text-white/80 hover:bg-white/10">Cancelar</button>
            <button onClick={confirm} disabled={!!error} className="px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white hover:bg-white/15 disabled:opacity-50 disabled:cursor-not-allowed">Confirmar</button>
          </div>
        </div>
      </div>
    </div>
  )
}
