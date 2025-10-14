import { describe, it, expect, beforeEach, vi } from 'vitest'
import { processPaymentById } from '@/app/api/payments/webhook/route'
import * as mp from '@/lib/payments/mercadopago'

interface PurchaseRow { id: string; user_id: string; plan_code: string; tokens_snapshot: number; amount_cents: number; currency: string; status: string; external_reference: string; gateway_payment_id?: string | null; credited_at?: string | null; raw_payload?: any; }
interface TokenRow { user_id: string; amount: number; description: string }

function createMockSupabase(initial: { purchases?: PurchaseRow[]; tokens?: TokenRow[] }) {
  const purchases = initial.purchases || []
  const tokens = initial.tokens || []
  function from(table: string) {
    return {
      select() { return this },
      eq(col: string, val: any) {
        this._filter = { col, val }; return this
      },
      maybeSingle() {
        const arr = table === 'purchases' ? purchases : []
        const row = arr.find(r => (r as any)[this._filter.col] === this._filter.val)
        return Promise.resolve({ data: row || null })
      },
      update(patch: any) {
        return {
          eq: (col: string, val: any) => {
            const arr = table === 'purchases' ? purchases : []
            const row = arr.find(r => (r as any)[col] === val)
            if (row) Object.assign(row, patch)
            return Promise.resolve({ data: row || null })
          }
        }
      },
      insert(row: any) {
        if (table === 'tokens') tokens.push(row)
        return Promise.resolve({ data: row })
      }
    }
  }
  return { from, _data: { purchases, tokens } }
}

describe('processPaymentById', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('credencia tokens quando aprovado e é idempotente em chamadas subsequentes', async () => {
    // Arrange
    const purchase: PurchaseRow = { id: 'p1', user_id: 'u1', plan_code: 'basic', tokens_snapshot: 100, amount_cents: 1000, currency: 'BRL', status: 'pending', external_reference: 'basic_x', gateway_payment_id: null }
    const supabase = createMockSupabase({ purchases: [purchase] }) as any
    vi.spyOn(mp, 'getPaymentInfo').mockResolvedValue({
      gateway_payment_id: 'gw_123',
      external_reference: 'basic_x',
      status: 'approved',
      raw: { id: 'gw_123', status: 'approved' }
    } as any)

    // Act 1
    const r1 = await processPaymentById(supabase, 'gw_123')
    // Act 2 (idempotente)
    const r2 = await processPaymentById(supabase, 'gw_123')

    // Assert
    expect(r1.credited).toBe(true)
    expect(r2.credited).toBe(false) // segunda não deve creditar novamente
    expect(supabase._data.tokens.length).toBe(1)
    expect(supabase._data.tokens[0].amount).toBe(100)
    expect(purchase.status).toBe('credited')
  })

  it('ignora purchase inexistente', async () => {
    const supabase = createMockSupabase({}) as any
    vi.spyOn(mp, 'getPaymentInfo').mockResolvedValue({
      gateway_payment_id: 'gw_x',
      external_reference: 'ref_x',
      status: 'approved',
      raw: { id: 'gw_x' }
    } as any)
    const r = await processPaymentById(supabase, 'gw_x')
    expect((r as any).ignored).toBe('purchase_not_found')
  })

  it('não credita quando status pendente e credita posteriormente ao aprovar', async () => {
    const purchase: PurchaseRow = { id: 'p2', user_id: 'u2', plan_code: 'pix', tokens_snapshot: 50, amount_cents: 500, currency: 'BRL', status: 'pending', external_reference: 'pix_ref', gateway_payment_id: null }
    const supabase = createMockSupabase({ purchases: [purchase] }) as any
    const spy = vi.spyOn(mp, 'getPaymentInfo')
    spy.mockResolvedValueOnce({ gateway_payment_id: 'gw_pix', external_reference: 'pix_ref', status: 'pending', raw: {} } as any)
      .mockResolvedValueOnce({ gateway_payment_id: 'gw_pix', external_reference: 'pix_ref', status: 'approved', raw: {} } as any)
    const r1 = await processPaymentById(supabase, 'gw_pix')
    expect(r1.credited).toBe(false)
    expect(supabase._data.tokens.length).toBe(0)
    const r2 = await processPaymentById(supabase, 'gw_pix')
    expect(r2.credited).toBe(true)
    expect(supabase._data.tokens.length).toBe(1)
    expect(supabase._data.tokens[0].amount).toBe(50)
  })

  it('não credita quando falha (failed)', async () => {
    const purchase: PurchaseRow = { id: 'p3', user_id: 'u3', plan_code: 'fail', tokens_snapshot: 10, amount_cents: 100, currency: 'BRL', status: 'pending', external_reference: 'fail_ref', gateway_payment_id: null }
    const supabase = createMockSupabase({ purchases: [purchase] }) as any
    vi.spyOn(mp, 'getPaymentInfo').mockResolvedValue({ gateway_payment_id: 'gw_fail', external_reference: 'fail_ref', status: 'failed', raw: {} } as any)
    const r = await processPaymentById(supabase, 'gw_fail')
    expect(r.credited).toBe(false)
    expect(supabase._data.tokens.length).toBe(0)
  })

  it('segunda chamada approved não duplica crédito (idempotência reforçada)', async () => {
    const purchase: PurchaseRow = { id: 'p4', user_id: 'u4', plan_code: 'dup', tokens_snapshot: 30, amount_cents: 300, currency: 'BRL', status: 'pending', external_reference: 'dup_ref', gateway_payment_id: null }
    const supabase = createMockSupabase({ purchases: [purchase] }) as any
    const spy = vi.spyOn(mp, 'getPaymentInfo')
    spy.mockResolvedValue({ gateway_payment_id: 'gw_dup', external_reference: 'dup_ref', status: 'approved', raw: {} } as any)
    const r1 = await processPaymentById(supabase, 'gw_dup')
    const r2 = await processPaymentById(supabase, 'gw_dup')
    expect(r1.credited).toBe(true)
    expect(r2.credited).toBe(false)
    expect(supabase._data.tokens.length).toBe(1)
  })
})
