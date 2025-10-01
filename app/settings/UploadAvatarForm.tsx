// app/settings/UploadAvatarForm.tsx
'use client'
import { useRef, useState } from 'react'
import AvatarCropper from './AvatarCropper'

export default function UploadAvatarForm() {
  const [file, setFile] = useState<File | null>(null)
  const [step, setStep] = useState<'pick'|'crop'|'upload'>('pick')
  const [progress, setProgress] = useState(0)
  const [loading, setLoading] = useState(false)

  const [quality, setQuality] = useState(0.9)
  const [format, setFormat] = useState<'image/jpeg'|'image/png'>('image/jpeg')
  const [size, setSize] = useState(512)
  const inputRef = useRef<HTMLInputElement>(null)

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] || null
    if (!f) return setFile(null)
    if (!['image/png', 'image/jpeg'].includes(f.type)) {
      alert('Formato inválido. Use PNG ou JPG.')
      e.target.value = ''
      return
    }
    if (f.size > 15*1024*1024) {
      alert('Arquivo muito grande (máx. 15MB).')
      e.target.value = ''
      return
    }
    setFile(f)
    setStep('crop')
  }

  function reset() {
    setFile(null)
    setStep('pick')
    setProgress(0)
    setLoading(false)
    if (inputRef.current) inputRef.current.value = ''
  }

  async function onConfirmCrop(blob: Blob, mime: string) {
    setStep('upload')
    await doUpload(blob, mime)
  }

  async function doUpload(payload: Blob, mime: string) {
    setLoading(true)
    setProgress(0)
    const ext = mime === 'image/png' ? 'png' : 'jpg'
    const fileLike = new File([payload], `avatar.${ext}`, { type: mime })
    const form = new FormData()
    form.append('avatar', fileLike)

    const xhr = new XMLHttpRequest()
    xhr.open('POST', '/api/profile/avatar?ajax=1', true)
    xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest')
    xhr.upload.onprogress = (ev) => {
      if (ev.lengthComputable) setProgress(Math.round((ev.loaded/ev.total)*100))
    }
    xhr.onreadystatechange = () => {
      if (xhr.readyState === 4) {
        if (xhr.status >= 200 && xhr.status < 300) {
          window.location.href = '/settings?tab=perfil&toast=avatar_ok'
        } else {
          setLoading(false)
          alert('Falha ao enviar avatar.')
        }
      }
    }
    xhr.onerror = () => { setLoading(false); alert('Falha de rede no upload.') }
    xhr.send(form)
  }

  return (
    <div className="grid gap-4">
      {step === 'pick' && (
        <form onSubmit={(e)=>e.preventDefault()} className="grid gap-3">
          <div>
            <label className="block text-sm text-neutral-400 mb-1">Avatar (PNG/JPG)</label>
            <input ref={inputRef} type="file" name="avatar" accept="image/png,image/jpeg" onChange={onFile} className="text-white" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs text-neutral-400 mb-1">Formato</label>
              <select value={format} onChange={(e)=>setFormat(e.target.value as any)} className="w-full px-2 py-1.5 rounded bg-neutral-900/60 border border-neutral-800 text-white text-sm">
                <option value="image/jpeg">JPEG</option>
                <option value="image/png">PNG</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-neutral-400 mb-1">Qualidade</label>
              <input type="range" min="0.6" max="1" step="0.05" value={quality} onChange={(e)=>setQuality(Number(e.target.value))} className="w-full" disabled={format==='image/png'} />
              <div className="text-[11px] text-neutral-500">{format==='image/png' ? 'sem compressão' : `${Math.round(quality*100)}%`}</div>
            </div>
            <div>
              <label className="block text-xs text-neutral-400 mb-1">Tamanho</label>
              <select value={size} onChange={(e)=>setSize(Number(e.target.value))} className="w-full px-2 py-1.5 rounded bg-neutral-900/60 border border-neutral-800 text-white text-sm">
                <option value={512}>512 × 512</option>
                <option value={768}>768 × 768</option>
                <option value={1024}>1024 × 1024</option>
              </select>
            </div>
          </div>
          <div className="text-xs text-neutral-500">JPEG ~90% costuma equilibrar qualidade e tamanho. PNG mantém qualidade sem compressão.</div>
        </form>
      )}

      {step === 'crop' && file && (
        <AvatarCropper
          file={file}
          onCancel={reset}
          onConfirm={onConfirmCrop}
          outputSize={size}
          outputMime={format}
          quality={quality}
          minSource={size}
        />
      )}

      {step === 'upload' && (
        <div className="flex items-center gap-4">
          <ProgressRing value={progress} />
          <div className="text-white/80">{loading ? `Enviando… ${progress}%` : 'Pronto'}</div>
          <button onClick={reset} className="ml-auto px-3 py-1.5 rounded-lg bg-white/5 border border-white/15 text-white/80 hover:bg-white/10" disabled={loading}>Novo upload</button>
        </div>
      )}
    </div>
  )
}

function ProgressRing({ value }: { value: number }) {
  const r = 18
  const c = 2*Math.PI*r
  const o = c - (value/100)*c
  return (
    <svg width="44" height="44" viewBox="0 0 44 44" className="block">
      <circle cx="22" cy="22" r={r} stroke="rgba(255,255,255,.15)" strokeWidth="4" fill="none" />
      <circle cx="22" cy="22" r={r} stroke="white" strokeWidth="4" fill="none" strokeDasharray={c} strokeDashoffset={o} transform="rotate(-90 22 22)" />
    </svg>
  )
}
