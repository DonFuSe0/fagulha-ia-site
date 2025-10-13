'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
export default function AuthButtonSwitch({className,loginHref='/auth/login',profileHref='/dashboard',labelLogin='Entrar',labelProfile='Perfil'}:{className?:string,loginHref?:string,profileHref?:string,labelLogin?:string,labelProfile?:string}){
  const supabase = createClientComponentClient()
  const [isLogged,setIsLogged]=useState<boolean|null>(null)
  useEffect(()=>{
    let mounted=true
    supabase.auth.getSession().then(({data})=>{ if(!mounted) return; setIsLogged(!!data.session?.user)})
    const {data:sub}=supabase.auth.onAuthStateChange((_e,s)=>{ setIsLogged(!!s?.user) })
    return ()=>{ try{sub.subscription.unsubscribe()}catch{} }
  },[supabase])
  if(isLogged===null) return null
  return !isLogged ? <Link href={loginHref} className={className}>{labelLogin}</Link> : <Link href={profileHref} className={className}>{labelProfile}</Link>
}
