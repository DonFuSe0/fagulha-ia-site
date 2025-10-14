'use client'
import { useEffect, useMemo, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

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
    const base = src || '/avatar-placeholder.png'
    const sep = base.includes('?') ? '&' : '?'
    
    // Cache busting simples
    const cacheParam = `cb=${tick}`
    
    // Se temos uma URL do src (do banco), usa ela
    if (src && src !== '/avatar-placeholder.png') {
      return `${base}${sep}${cacheParam}`
    }
    
    // Senão, usa placeholder
    return `/avatar-placeholder.png?${cacheParam}`
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
