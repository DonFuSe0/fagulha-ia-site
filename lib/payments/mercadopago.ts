// lib/payments/mercadopago.ts
// Adapter Mercado Pago - abstrai criação de preferência e consulta de pagamento.
// Usa variáveis de ambiente: MERCADOPAGO_ACCESS_TOKEN, MERCADOPAGO_WEBHOOK_SECRET (opcional)

import crypto from 'crypto'

export interface PlanData {
  code: string
  name: string
  tokens: number
  price_cents: number
  currency: string
  gateway_reference?: string | null
}

export interface CreatePreferenceResult {
  init_point: string
  sandbox_init_point?: string
  preference_id: string
  external_reference: string
}

export interface PaymentInfoResult {
  status: 'pending' | 'approved' | 'cancelled' | 'refunded' | 'failed'
  amount_cents: number
  currency: string
  external_reference: string
  gateway_payment_id: string
  raw: any
}

const API_BASE = 'https://api.mercadopago.com'

function getAccessToken(): string {
  const token = process.env.MERCADOPAGO_ACCESS_TOKEN
  if (!token) throw new Error('MERCADOPAGO_ACCESS_TOKEN não definido')
  return token
}

export function generateExternalReference(prefix = 'purchase'): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2,8)}`
}

export async function createPreference(plan: PlanData, userId: string, baseUrl: string): Promise<CreatePreferenceResult> {
  const external_reference = generateExternalReference(plan.code)
  const body = {
    items: [
      {
        title: plan.name,
        quantity: 1,
        currency_id: plan.currency,
        unit_price: plan.price_cents / 100
      }
    ],
    external_reference,
    metadata: {
      plan_code: plan.code,
      user_id: userId,
      tokens: plan.tokens
    },
    back_urls: {
      success: `${baseUrl}/pagamento/sucesso?ref=${external_reference}`,
      failure: `${baseUrl}/pagamento/cancelado?ref=${external_reference}`,
      pending: `${baseUrl}/pagamento/sucesso?ref=${external_reference}`
    },
    auto_return: 'approved'
  }
  const res = await fetch(`${API_BASE}/checkout/preferences`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getAccessToken()}`
    },
    body: JSON.stringify(body)
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Erro criando preference MP: ${res.status} ${text}`)
  }
  const data = await res.json()
  return {
    init_point: data.init_point,
    sandbox_init_point: data.sandbox_init_point,
    preference_id: data.id,
    external_reference
  }
}

export async function getPaymentInfo(paymentId: string): Promise<PaymentInfoResult> {
  const res = await fetch(`${API_BASE}/v1/payments/${paymentId}`, {
    headers: { Authorization: `Bearer ${getAccessToken()}` }
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Erro consultando pagamento MP: ${res.status} ${text}`)
  }
  const data = await res.json()
  const statusMap: Record<string, PaymentInfoResult['status']> = {
    approved: 'approved',
    pending: 'pending',
    in_process: 'pending',
    rejected: 'failed',
    cancelled: 'cancelled',
    refunded: 'refunded',
    charged_back: 'refunded'
  }
  const mapped = statusMap[data.status] || 'pending'
  return {
    status: mapped,
    amount_cents: Math.round(data.transaction_amount * 100),
    currency: data.currency_id || 'BRL',
    external_reference: data.external_reference,
    gateway_payment_id: data.id?.toString(),
    raw: data
  }
}

// Validação de webhook (placeholder): Mercado Pago pode enviar assinaturas customizadas.
// Dependendo da configuração, você pode receber apenas query params (topic, id) e deve buscar via API.
// Aqui somente preparamos função caso haja header secreto próprio.
export function verifyWebhookSignature(_rawBody: string, _headers: Headers): boolean {
  const secret = process.env.MERCADOPAGO_WEBHOOK_SECRET
  if (!secret) return true // sem secret configurado, aceitar (dependendo da estratégia)
  // Exemplo genérico HMAC (ajustar conforme MP disponibilize):
  const sigHeader = _headers.get('x-signature')
  if (!sigHeader) return false
  const h = crypto.createHmac('sha256', secret).update(_rawBody).digest('hex')
  return h === sigHeader
}
