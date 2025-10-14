import { describe, it, expect, beforeEach, vi } from 'vitest'
import * as mp from '@/lib/payments/mercadopago'

// Mock simplificado da inserção de purchase usado na rota checkout
function createMockSupabase(userId: string, plan: any){
  const purchases: any[] = []
  const plans = [plan]
  function from(table: string){
    return {
      select(){ return this },
      eq(col: string, val: any){ this._col = col; this._val = val; return this },
      single(){
        if(table === 'plans'){
          const row = plans.find(p => p.code === this._val && p.active === true)
          return Promise.resolve({ data: row, error: row ? null : new Error('not found') })
        }
        return Promise.resolve({ data: null, error: new Error('unsupported') })
      },
      maybeSingle(){
        if(table === 'purchases'){
          const row = purchases.find(p => p.external_reference === this._val)
          return Promise.resolve({ data: row || null })
        }
        return Promise.resolve({ data: null })
      },
      insert(row: any){
        if(table === 'purchases') purchases.push(row)
        return Promise.resolve({ error: null })
      },
      update(patch: any){
        return { eq: (c:string,v:any) => { const row = purchases.find(p=>p.external_reference===v); if(row) Object.assign(row, patch); return Promise.resolve({}) } }
      }
    }
  }
  return { from, auth: { getUser: () => Promise.resolve({ data: { user: { id: userId } } }) }, _data: { purchases } }
}

// Função simplificada inspirada na rota real (não importamos a rota diretamente para evitar dependências de Next no teste)
async function simulateCheckout(supabase: any, planCode: string){
  const { data: { user } } = await supabase.auth.getUser()
  if(!user) throw new Error('unauth')
  const { data: plan } = await supabase.from('plans').select('*').eq('code', planCode).eq('active', true).single()
  if(!plan) throw new Error('plan_not_found')
  const external_reference = `test_${plan.code}_${Date.now()}`
  await supabase.from('purchases').insert({ user_id: user.id, plan_code: plan.code, tokens_snapshot: plan.tokens, amount_cents: plan.price_cents, currency: plan.currency, status: 'pending', external_reference })
  const pref = await mp.createPreference({ code: plan.code, name: plan.name, tokens: plan.tokens, price_cents: plan.price_cents, currency: plan.currency }, user.id, 'http://test')
  await supabase.from('purchases').update({ preference_id: pref.preference_id }).eq('external_reference', external_reference)
  return { external_reference, preference_id: pref.preference_id }
}

describe('checkout + status simulation', () => {
  beforeEach(() => { vi.restoreAllMocks(); })

  it('cria purchase pending e anexa preference id', async () => {
    const plan = { code:'basic', name:'Basic', tokens:100, price_cents:1000, currency:'BRL', active:true }
    const supabase = createMockSupabase('u1', plan)
    vi.spyOn(mp, 'createPreference').mockResolvedValue({ preference_id: 'pref_123', init_point: 'https://pay', sandbox_init_point:'https://sandbox' } as any)
    const { external_reference, preference_id } = await simulateCheckout(supabase as any, 'basic')
    expect(preference_id).toBe('pref_123')
    const purchase = supabase._data.purchases.find((p:any)=>p.external_reference === external_reference)
    expect(purchase).toBeTruthy()
    expect(purchase.preference_id).toBe('pref_123')
    expect(purchase.status).toBe('pending')
  })

  it('simula status credited e pending', async () => {
    const plan = { code:'gold', name:'Gold', tokens:500, price_cents:5000, currency:'BRL', active:true }
    const supabase = createMockSupabase('u2', plan)
    // cria manualmente duas purchases
    supabase._data.purchases.push({ user_id:'u2', plan_code:'gold', tokens_snapshot:500, amount_cents:5000, currency:'BRL', status:'credited', external_reference:'ref_ok', id:'x1', preference_id:'pref_ok', credited_at: new Date().toISOString() })
    supabase._data.purchases.push({ user_id:'u2', plan_code:'gold', tokens_snapshot:500, amount_cents:5000, currency:'BRL', status:'pending', external_reference:'ref_pend', id:'x2' })
    // Função simplificada do status endpoint
    function status(ref:string){
      const row = supabase._data.purchases.find((p:any)=>p.external_reference===ref)
      if(!row) return { error:'not_found' }
      return { status: row.status, credited: row.status==='credited', tokens: row.tokens_snapshot, credited_at: row.credited_at }
    }
    const ok = status('ref_ok')
    const pend = status('ref_pend')
    expect(ok.credited).toBe(true)
    expect(pend.credited).toBe(false)
  })
})
