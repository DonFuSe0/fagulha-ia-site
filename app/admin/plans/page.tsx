import { supabaseServer } from '@/lib/supabase/serverClient'
import isAdminUser from '@/lib/auth/isAdminUser'
import PlansAdminClient from './plans-client'

export const dynamic = 'force-dynamic'

export default async function PlansAdminPage(){
  const supabase = supabaseServer()
  const { data: { user } } = await supabase.auth.getUser()
  if(!isAdminUser(user)){
    return <div className="p-6 text-sm text-red-500">Acesso restrito.</div>
  }
  // Buscar todos os planos (inclusive inativos) usando service role? Aqui basta usar RLS bypass? RLS atual só permite select active=true, então precisamos ignorar RLS.
  // Simples: chamar RPC via service role não disponível aqui. Alternativa rápida: fetch para a API admin.
  const base = process.env.NEXT_PUBLIC_SITE_URL || ''
  let plans: any[] = []
  try {
    const res = await fetch(`${base}/api/admin/plans`, { cache: 'no-store', headers: { 'Cookie': '' } })
    if(res.ok){ const j = await res.json(); plans = j.plans || [] }
  } catch {}
  return <PlansAdminClient initialPlans={plans} />
}