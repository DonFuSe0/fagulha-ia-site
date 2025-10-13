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
    
    // Carrega versão inicial
    supabase.auth.getUser().then(({data})=>{ 
      if(!mounted) return
      const v=(data.user?.user_metadata as any)?.avatar_ver
      if(v) setVer(String(v))
    })
    
    // Escuta mudanças na sessão
    const { data: sub } = supabase.auth.onAuthStateChange((_e,s)=>{ 
      if(!mounted) return
      const v=(s?.user?.user_metadata as any)?.avatar_ver
      if(v) setVer(String(v))
    })
    
    // Escuta evento customizado de atualização
    const handler = () => {
      if(!mounted) return
      setTick(Date.now())
      setForceRefresh(prev => prev + 1)
    }
    window.addEventListener('avatar:updated', handler as any)
    
    return ()=>{ 
      try{sub.subscription.unsubscribe()}catch{}
      window.removeEventListener('avatar:updated', handler as any)
      mounted = false
    }
  },[supabase])
  
  const url = useMemo(()=>{
    const base = src || '/avatar-placeholder.png'
    const sep = base.includes('?') ? '&' : '?'
    
    // Cache busting equilibrado
    const cacheParam = `cb=${tick}`
    
    // Se temos uma URL do src (do banco), prioriza ela
    if (src && src !== '/avatar-placeholder.png') {
      return ver ? `${base}${sep}v=${encodeURIComponent(ver)}&${cacheParam}` : `${base}${sep}${cacheParam}`
    }
    
    // Senão, usa placeholder com timestamp
    return `/avatar-placeholder.png?${cacheParam}`
  },[src,ver,tick])
  
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
