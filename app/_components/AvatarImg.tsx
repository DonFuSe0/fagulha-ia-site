// app/_components/AvatarImg.tsx
'use client'
import Image from 'next/image'
import { useEffect, useMemo, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

type Props = {
  src?: string
  size?: number
  alt?: string
  className?: string
}

export default function AvatarImg({ src, size=32, alt='Avatar', className }: Props) {
  const supabase = createClientComponentClient()
  const [ver, setVer] = useState<string>('')

  useEffect(() => {
    let mounted = true
    supabase.auth.getUser().then(({ data }) => {
      if (!mounted) return
      const v = (data.user?.user_metadata as any)?.avatar_ver
      if (v) setVer(String(v))
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      const v = (s?.user?.user_metadata as any)?.avatar_ver
      if (v) setVer(String(v))
    })
    return () => { mounted = false; sub.subscription.unsubscribe() }
  }, [supabase])

  const url = useMemo(() => {
    const base = src || '/avatar-placeholder.png'
    const sep = base.includes('?') ? '&' : '?'
    return ver ? `${base}${sep}v=${encodeURIComponent(ver)}` : base
  }, [src, ver])

  return (
    <Image
      key={ver || url}
      src={url}
      alt={alt}
      width={size}
      height={size}
      className={className || 'rounded-full object-cover'}
    />
  )
}
