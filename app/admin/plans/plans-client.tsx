'use client'
import { useState } from 'react'

interface Plan { id: string; code: string; name: string; tokens: number; price_cents: number; currency: string; active: boolean; sort_order: number; }

export default function PlansAdminClient({ initialPlans }: { initialPlans: Plan[] }){
  const [plans, setPlans] = useState<Plan[]>(initialPlans || [])
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ code:'', name:'', tokens:'', price_cents:'', currency:'BRL', sort_order:'100' })
  const [msg, setMsg] = useState<string | null>(null)

  async function refresh(){
    const res = await fetch('/api/admin/plans', { cache: 'no-store' })
    if(res.ok){ const j = await res.json(); setPlans(j.plans || []) }
  }

  async function createPlan(e: React.FormEvent){
    e.preventDefault()
    setLoading(true); setMsg(null)
    try {
      const payload = {
        code: form.code.trim(),
        name: form.name.trim(),
        tokens: Number(form.tokens),
        price_cents: Number(form.price_cents),
        currency: form.currency,
        sort_order: Number(form.sort_order)
      }
      const res = await fetch('/api/admin/plans', { method:'POST', headers:{ 'Content-Type':'application/json' }, body: JSON.stringify(payload) })
      const j = await res.json()
      if(!res.ok) throw new Error(j.error || 'erro')
      setMsg('Plano criado')
      setForm({ code:'', name:'', tokens:'', price_cents:'', currency:'BRL', sort_order:'100' })
      await refresh()
    } catch(e:any){ setMsg(e.message) } finally { setLoading(false) }
  }

  async function toggle(code: string){
    setLoading(true); setMsg(null)
    try {
      const res = await fetch(`/api/admin/plans/${encodeURIComponent(code)}`, { method:'POST', headers:{ 'Content-Type':'application/json' }, body: JSON.stringify({ toggle: true }) })
      const j = await res.json(); if(!res.ok) throw new Error(j.error || 'erro')
      setPlans(plans.map(p => p.code === code ? j.plan : p))
    } catch(e:any){ setMsg(e.message) } finally { setLoading(false) }
  }

  return <div className='p-6 space-y-6'>
    <h1 className='text-xl font-semibold'>Admin - Planos</h1>
    {msg && <div className='text-sm text-blue-600'>{msg}</div>}
    <form onSubmit={createPlan} className='grid gap-2 max-w-md bg-neutral-900/40 p-4 rounded'>
      <div className='font-medium mb-1'>Criar novo plano</div>
      <input required placeholder='code' value={form.code} onChange={e=>setForm(f=>({...f, code:e.target.value}))} className='px-2 py-1 bg-neutral-800 rounded text-sm' />
      <input required placeholder='nome' value={form.name} onChange={e=>setForm(f=>({...f, name:e.target.value}))} className='px-2 py-1 bg-neutral-800 rounded text-sm' />
      <input required placeholder='tokens' type='number' value={form.tokens} onChange={e=>setForm(f=>({...f, tokens:e.target.value}))} className='px-2 py-1 bg-neutral-800 rounded text-sm' />
      <input required placeholder='preço (centavos)' type='number' value={form.price_cents} onChange={e=>setForm(f=>({...f, price_cents:e.target.value}))} className='px-2 py-1 bg-neutral-800 rounded text-sm' />
      <div className='flex gap-2'>
        <input placeholder='moeda' value={form.currency} onChange={e=>setForm(f=>({...f, currency:e.target.value}))} className='px-2 py-1 bg-neutral-800 rounded text-sm w-24' />
        <input placeholder='ordem' value={form.sort_order} onChange={e=>setForm(f=>({...f, sort_order:e.target.value}))} className='px-2 py-1 bg-neutral-800 rounded text-sm w-24' />
      </div>
      <button disabled={loading} className='bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm px-3 py-1 rounded'>Salvar</button>
    </form>
    <div className='space-y-2'>
      <h2 className='text-lg font-medium'>Lista</h2>
      <table className='w-full text-sm border-collapse'>
        <thead>
          <tr className='text-left border-b border-neutral-700'>
            <th className='py-1 pr-2'>Code</th>
            <th className='py-1 pr-2'>Nome</th>
            <th className='py-1 pr-2'>Tokens</th>
            <th className='py-1 pr-2'>Preço (R$)</th>
            <th className='py-1 pr-2'>Ativo</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {plans.map(p => <tr key={p.id} className='border-b border-neutral-800 hover:bg-neutral-800/50'>
            <td className='py-1 pr-2 font-mono'>{p.code}</td>
            <td className='py-1 pr-2'>{p.name}</td>
            <td className='py-1 pr-2'>{p.tokens}</td>
            <td className='py-1 pr-2'>{(p.price_cents/100).toFixed(2)}</td>
            <td className='py-1 pr-2'>{p.active ? 'Sim' : 'Não'}</td>
            <td className='py-1 pr-2'>
              <button onClick={() => toggle(p.code)} disabled={loading} className='text-xs px-2 py-1 rounded bg-neutral-700 hover:bg-neutral-600 disabled:opacity-50'>{p.active ? 'Desativar' : 'Ativar'}</button>
            </td>
          </tr>)}
          {plans.length === 0 && <tr><td colSpan={6} className='py-4 text-center text-neutral-500'>Nenhum plano</td></tr>}
        </tbody>
      </table>
    </div>
  </div>
}
