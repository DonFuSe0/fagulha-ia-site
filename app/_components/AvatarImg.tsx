// app/_components/AvatarImg.tsx
'use client'
import Image from 'next/image'
import { useMemo } from 'react'

export default function AvatarImg({ src, size=32, alt='Avatar', version }: { src?: string, size?: number, alt?: string, version?: string|number }) {
  const url = useMemo(() => {
    if (!src) return '/avatar-placeholder.png'
    const hasQuery = src.includes('?')
    const v = version ? String(version) : ''
    return v ? (hasQuery ? `${src}&v=${v}` : `${src}?v=${v}`) : src
  }, [src, version])
  return (
    <Image
      src={url}
      alt={alt}
      width={size}
      height={size}
      className="rounded-full object-cover"
    />
  )
}
