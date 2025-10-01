// app/_components/ui/Toasts.tsx
'use client'
import { useEffect, useState } from 'react'

type Toast = { id: number; type: 'success'|'error'|'info'; message: string }
export default function Toasts({ initial }: { initial?: Toast | null }) {
  const [list, setList] = useState<Toast[]>(() => initial ? [initial] : [])
  useEffect(() => {
    if (!initial) return
    const timer = setTimeout(() => {
      setList((l) => l.filter(t => t.id !== initial.id))
    }, 3000)
    return () => clearTimeout(timer)
  }, [initial])

  return (
    <div className="fixed top-4 right-4 z-[100] space-y-2">
      {list.map(t => (
        <div key={t.id} className={
          `min-w-[220px] max-w-[320px] rounded-xl border px-3 py-2 text-sm shadow-lg backdrop-blur
           ${t.type==='success' ? 'bg-emerald-500/15 border-emerald-400/30 text-emerald-200' :
              t.type==='error' ? 'bg-red-500/15 border-red-400/30 text-red-200' :
                                 'bg-white/10 border-white/20 text-white/90'}`
        }>
          {t.message}
        </div>
      ))}
    </div>
  )
}
