// app/components/gallery/GalleryCard.tsx
'use client'
type Props = {
  id: string
  imageUrl: string
  thumbUrl?: string | null
  isPublic: boolean
  createdAt: string
}
export default function GalleryCard({ imageUrl, thumbUrl }: Props) {
  const src = thumbUrl || imageUrl
  return (
    <div className="group relative aspect-square rounded-xl overflow-hidden bg-neutral-900/40 border border-neutral-800">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt="" className="w-full h-full object-cover transition group-hover:scale-[1.02]" />
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition" />
    </div>
  )
}
