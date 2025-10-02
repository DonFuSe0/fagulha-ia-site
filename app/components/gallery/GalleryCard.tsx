"use client";
import { useMemo } from "react";

type Props = {
  id: string;
  imageUrl: string;
  thumbUrl?: string | null;
  isPublic: boolean;
  publicAt?: string | null;
  createdAt: string;
  onToggled?: () => void;
  showPublicTimer?: boolean;
};

function formatBR(dt: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  const d = pad(dt.getDate());
  const m = pad(dt.getMonth() + 1);
  const y = dt.getFullYear();
  const hh = pad(dt.getHours());
  const mm = pad(dt.getMinutes());
  const ss = pad(dt.getSeconds());
  return `${d}/${m}/${y} - ${hh}:${mm}:${ss}`;
}

function remaining(fromIso: string, hours: number) {
  const end = new Date(new Date(fromIso).getTime() + hours * 3600_000);
  const diff = end.getTime() - Date.now();
  const left = Math.max(0, diff);
  const h = Math.floor(left / 3600_000);
  const m = Math.floor((left % 3600_000) / 60000);
  const s = Math.floor((left % 60000) / 1000);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

export default function GalleryCard({
  id, imageUrl, thumbUrl, isPublic, publicAt, createdAt, onToggled, showPublicTimer
}: Props) {

  const createdFmt = useMemo(() => formatBR(new Date(createdAt)), [createdAt]);
  const ttlText = useMemo(() => {
    if (isPublic && publicAt) return remaining(publicAt, 96); // 4 dias
    return remaining(createdAt, 24); // privados 24h para download
  }, [isPublic, publicAt, createdAt]);

  async function toggle() {
    const res = await fetch("/api/generations/toggle-visibility", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, makePublic: !isPublic }),
    });
    if (res.ok) onToggled?.();
  }

  return (
    <div className="group overflow-hidden rounded-xl border border-white/10 bg-black/30">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={thumbUrl || imageUrl} alt="" className="aspect-square w-full object-cover" />
      <div className="flex items-center justify-between p-2 text-xs text-white/80">
        <span>{createdFmt}</span>
        {showPublicTimer && (<span className="rounded bg-white/10 px-2 py-[2px]">{ttlText}</span>)}
      </div>
      <div className="flex items-center gap-2 p-2">
        <button onClick={toggle} className="rounded-md border border-white/15 px-2 py-1 text-xs text-white/90 hover:bg-white/10">
          {isPublic ? "Tornar privada" : "Tornar pública"}
        </button>
        {!isPublic && (
          <a
            href={`/api/generations/download-url?id=${encodeURIComponent(id)}`}
            className="ml-auto rounded-md border border-white/15 px-2 py-1 text-xs text-white/90 hover:bg-white/10"
          >
            Download (24h)
          </a>
        )}
        <a
          href={`/gerar?from=${encodeURIComponent(id)}`}
          className="rounded-md border border-white/15 px-2 py-1 text-xs text-white/90 hover:bg-white/10"
        >
          Reutilizar
        </a>
      </div>
    </div>
  );
}
