"use client";

import Link from "next/link";
import { Calendar, Eye } from "lucide-react";

type GalleryItem = {
  id: string;
  image_url: string;
  prompt?: string | null;
  created_at?: string | null;
  // Campos extras são ignorados com index signature
  [key: string]: any;
};

export default function GalleryGrid({ items }: { items: GalleryItem[] }) {
  if (!items?.length) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="aspect-square rounded-2xl bg-[#121222] animate-pulse shadow-[0_0_0_1px_var(--color-border)]"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((item) => (
        <article
          key={item.id}
          className="group relative overflow-hidden rounded-2xl shadow-[0_0_0_1px_var(--color-border),0_6px_20px_rgba(0,0,0,.25)]"
        >
          <Link href={`/post/${item.id}`} className="block">
            {/* imagem */}
            {/* Se preferir next/image, você pode trocar por <Image ... unoptimized /> */}
            <img
              src={item.image_url || "https://placehold.co/1024x1024?text=Fagulha"}
              alt={item.prompt ?? "Imagem gerada"}
              className="aspect-square w-full object-cover transition duration-200 group-hover:scale-[1.02]"
              loading="lazy"
            />

            {/* overlay */}
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(0deg,rgba(0,0,0,.55),rgba(0,0,0,0)_35%)] opacity-0 transition-opacity duration-150 group-hover:opacity-100" />

            {/* meta */}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 p-3">
              <div className="flex items-center justify-between gap-2 rounded-xl bg-[rgba(10,10,15,.65)] px-3 py-2 backdrop-blur-md shadow-[0_0_0_1px_var(--color-border)]">
                <p className="line-clamp-1 text-sm text-[var(--color-foreground)]/95">
                  {item.prompt ?? "Sem descrição"}
                </p>
                <span className="inline-flex items-center gap-1 text-xs text-[var(--color-muted)]">
                  <Eye className="size-3.5" />
                  ver
                </span>
              </div>
            </div>
          </Link>

          {/* created_at */}
          {item.created_at ? (
            <div className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-[#131325] px-2.5 py-1 text-xs text-[var(--color-muted)] shadow-[inset_0_0_0_1px_var(--color-border)]">
              <Calendar className="size-3.5 text-[var(--color-primary)]" />
              {new Date(item.created_at).toLocaleDateString("pt-BR")}
            </div>
          ) : null}
        </article>
      ))}
    </div>
  );
}
