"use client";
import { useRef, useState, useMemo } from "react";

export default function UploadAvatarForm() {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [zoom, setZoom] = useState(100);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  const previewUrl = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null); setOk(false);
    if (!file) { setError("Selecione uma imagem."); return; }
    if (file.size > 2 * 1024 * 1024) { setError("Máximo 2MB."); return; }
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("zoom", String(zoom));
      const res = await fetch("/api/profile/avatar", { method: "POST", body: fd });
      if (!res.ok) throw new Error("upload_failed");
      setOk(true);
      setTimeout(() => window.location.href = "/settings?tab=perfil&toast=avatar_ok", 300);
    } catch (e:any) {
      setError("Falha ao enviar avatar.");
    } finally { setLoading(false); }
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-3">
      <div className="text-sm text-neutral-400">Avatar</div>

      <div className="flex items-center gap-3">
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="rounded-lg border border-white/20 bg-white/10 px-4 py-2 text-white hover:bg-white/15"
        >
          {file ? "Trocar arquivo" : "Escolher arquivo"}
        </button>
      </div>

      {file && (
        <div className="space-y-2">
          <div className="aspect-square w-48 overflow-hidden rounded-xl border border-white/15 bg-black/40">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewUrl!}
              alt="preview"
              style={{ transform: `scale(${zoom/100})`, transformOrigin: "center center" }}
              className="h-full w-full object-cover"
            />
          </div>

          <label className="grid gap-1">
            <span className="text-sm text-neutral-400">Zoom</span>
            <input type="range" min={80} max={150} step={1} value={zoom}
              onChange={(e)=> setZoom(parseInt(e.target.value))} />
          </label>
        </div>
      )}

      {error && <div className="rounded-lg border border-red-500/30 bg-red-900/20 px-3 py-2 text-sm text-red-200">{error}</div>}
      {ok && <div className="rounded-lg border border-emerald-500/30 bg-emerald-900/20 px-3 py-2 text-sm text-emerald-200">Avatar atualizado!</div>}

      <button disabled={loading} className="self-start rounded-lg border border-white/20 bg-white/10 px-4 py-2 text-white hover:bg-white/15 disabled:opacity-50">
        {loading ? "Enviando..." : "Salvar avatar"}
      </button>
    </form>
  );
}
