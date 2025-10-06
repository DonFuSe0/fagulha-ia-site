'use client'
import { useEffect, useState } from 'react'
import Image from 'next/image'
import { supabaseBrowser } from '@/lib/supabase/browserClient'

type Gen = { id: string; thumb_url: string | null; image_url: string | null; created_at: string }

export default function RecentCreations() {
  const [items, setItems] = useState<Gen[]>([])

  useEffect(() => {
    const run = async () => {
      const { data, error } = await supabaseBrowser
        .from('generations')
        .select('id, thumb_url, image_url, created_at')
        .order('created_at', { ascending: false })
        .limit(12)
      if (!error && data) setItems(data as any)
    }
    run()
  }, [])

  if (items.length === 0) return null

  return (
    <section className="mt-8">
      <h3 className="mb-3 font-semibold">Criações recentes</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {items.map((it) => {
          const src = it.thumb_url || it.image_url || ''
          return (
            <div key={it.id} className="group relative overflow-hidden rounded-xl border border-white/10">
              <Image
                src={src}
                alt="Criação"
                width={400}
                height={400}
                className="w-full h-auto transition-transform duration-300 group-hover:scale-105"
              />
            </div>
          )
        })}
      </div>
    </section>
  )
}
