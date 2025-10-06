'use client'

import React, { useMemo, useState } from 'react'

export default function UploadAvatarForm() {
  const [file, setFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)

  const previewUrl = useMemo(() => (file ? URL.createObjectURL(file) : null), [file])

  React.useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null); setSuccess(null)
    if (!file) { setError('Selecione um arquivo.'); return }
    try {
      setSaving(true)
      const fd = new FormData()
      fd.append('file', file)

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
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="avatar" className="text-sm text-zinc-300">Selecione seu avatar</label>
        <input
          id="avatar"
          name="avatar"
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-orange-600 file:text-white hover:file:bg-orange-500"
          required
        />
      </div>

      {previewUrl && (
        <div className="mt-2">
          <img
            src={previewUrl}
            alt="Preview do avatar"
            className="w-28 h-28 rounded-full object-cover border border-zinc-800"
          />
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
