'use client'
import { useEffect, useMemo, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { publicAvatarUrl } from '@/lib/utils/avatar'

export default function AvatarImg({ src, size=32, alt='Avatar', className }:{src?:string,size?:number,alt?:string,className?:string}){
  const supabase = createClientComponentClient()
  const [ver, setVer] = useState<string>('')
  const [tick, setTick] = useState<number>(Date.now())
  const [forceRefresh, setForceRefresh] = useState(0)
  
  useEffect(()=>{
    let mounted=true
    
    // Escuta evento customizado de atualização (simplificado)
    const handler = () => {
      if(!mounted) return
      setTick(Date.now())
    }
    window.addEventListener('avatar:updated', handler as any)
    
    return ()=>{ 
      window.removeEventListener('avatar:updated', handler as any)
      mounted = false
    }
  },[])
  
  const url = useMemo(()=>{
    const built = publicAvatarUrl(src, { cb: tick })
    if (built) return built
    return `/avatar-placeholder.png?cb=${tick}`
  },[src,tick])
  
  return (
    <img 
      key={`avatar-img-${tick}`}
      src={url} 
      alt={alt} 
      width={size} 
      height={size} 
      className={className||'rounded-full object-cover'} 
    />
  )
}
