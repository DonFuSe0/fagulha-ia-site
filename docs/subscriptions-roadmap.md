# Roadmap de Assinaturas (Subscriptions)

Este documento descreve a evolução planejada para suportar assinaturas recorrentes (mensal / anual) sobre a base atual de planos avulsos (one‑off) e ledger de tokens.

## Objetivos
- Introduzir assinaturas recorrentes com billing mensal/anual.
- Renovação automática de créditos (tokens) no ciclo.
- Pausar/cancelar mantendo histórico.
- Suporte a trial e gift codes futuros.
- Abstração para múltiplos gateways (Mercado Pago inicialmente / Stripe futuro).

## Situação Atual
- Tabela `plans` representa ofertas one‑off (créditos fixos).
- Tabela `purchases` registra transações discretas (status flow). 
- Ledger de créditos via tabela `tokens` (idempotente).

## Extensão Planejada
Duas abordagens: (A) Reusar `plans` para também conter metadados de assinatura ou (B) Nova tabela `subscription_plans` específica. Optaremos por (A) para reduzir duplicação, adicionando colunas opcionais.

### Novas Colunas em `plans`
- `billing_interval text null`  -- valores: `month`, `year` (null => plano avulso).
- `billing_interval_count int default 1`  -- permite intervalos customizados (ex: 3 meses). 
- `is_subscription boolean generated (billing_interval is not null)` (opcional como coluna gerada).
- `tokens_per_interval int`  -- se omitido, usar `tokens` existente como tokens por ciclo.
- `trial_days int` (opcional) -- período trial antes da primeira cobrança.

Nenhum breaking change: planos existentes continuam com `billing_interval = null`.

### Novas Tabelas
```
subscriptions (
  id uuid pk default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  plan_code text not null references plans(code),
  status text not null check (status in ('active','past_due','canceled','paused','incomplete','trialing')),
  current_period_start timestamptz not null,
  current_period_end timestamptz not null,
  cancel_at_period_end boolean not null default false,
  canceled_at timestamptz,
  trial_end timestamptz,
  gateway text not null default 'mercadopago',
  gateway_subscription_id text unique,
  gateway_customer_id text,
  latest_invoice_id uuid null references subscription_invoices(id),
  metadata jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

subscription_invoices (
  id uuid pk default gen_random_uuid(),
  subscription_id uuid not null references subscriptions(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  plan_code text not null,
  period_start timestamptz not null,
  period_end timestamptz not null,
  amount_cents int not null,
  currency text not null default 'BRL',
  status text not null check (status in ('open','paid','failed','void','refunded')),
  gateway text not null default 'mercadopago',
  gateway_invoice_id text,
  external_reference text,
  raw_payload jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

### Relação com `tokens`
- Ao virar o ciclo (cron / webhook de pagamento aprovado da fatura), inserir linha em `tokens` com descrição `Assinatura {plan_code} período YYYY-MM` e amount = `tokens_per_interval`.
- Idempotência: combinar `subscription_id + period_start` como chave lógica; antes de inserir conferir se já existe lançamento tokens com descrição padrão ou referência na invoice.

### Webhooks
- Mercado Pago para assinaturas usa endpoints específicos de preapproval/payment. Precisaremos de:
  - /api/payments/subscriptions/webhook (novo)
  - Mapeamento de eventos: `authorized`, `paused`, `cancelled`, `charged_back`.

### Fluxo de Criação
1. Usuário escolhe plano com `billing_interval` definido.
2. Criar registro `subscriptions` em status `incomplete`.
3. Gerar preference / preapproval (Mercado Pago) para início (trial ou primeira fatura).
4. Ao webhook de aprovação: atualizar status para `active`, gerar primeira invoice `paid`, disparar crédito tokens.

### Renovação
- Timer (cron) diário: encontrar assinaturas `active` onde `current_period_end < now()`.
- Pré-gerar invoice `open` + iniciar cobrança (gateway) -> esperar webhook para marcar `paid`.
- Em caso de ausência de pagamento após grace period (ex 3 dias), mudar para `past_due` e suspender créditos futuros.

### Cancelamento
- Usuário marca cancel_at_period_end = true.
- Cron ou webhook ao final do período muda status para `canceled`.
- Cancelamento imediato: set status `canceled`, remove créditos futuros (não remove tokens já lançados).

### Pausa
- Status `paused`: mantém registro; não gera invoices novas até `resume_at` (campo futuro se necessário).

### Migração / Backfill
- Adicionar colunas novas em `plans` com valores null para todos.
- Criar migrations 032 / 033 para: (1) add columns, (2) create tables RLS.

### RLS Proposto
```
alter table subscriptions enable row level security;
create policy "sub_select_owner" on subscriptions for select using (auth.uid() = user_id);
create policy "sub_invoice_select_owner" on subscription_invoices for select using (auth.uid() = user_id);
-- Modificações só via service role (similar purchases)
create policy "sub_mod_service_role" on subscriptions for all using (false) with check (false);
create policy "sub_invoice_mod_service_role" on subscription_invoices for all using (false) with check (false);
```

### Índices
- `subscriptions(user_id, status)`
- `subscription_invoices(subscription_id, status)`
- `subscription_invoices(external_reference)` (unique opcional)

### Métricas / Observabilidade
- Contadores: `subscriptions.created`, `subscriptions.renewed`, `subscriptions.canceled`, `subscriptions.past_due`.
- Logs estruturados em criação/renovação/cancelamento.

### Tarefas Cron
- `cron/subscriptions-renew` (verifica renovações).
- `cron/subscriptions-past-due` (move para past_due após grace period).

### Evoluções Futuras
- Cupom/discount table.
- Upgrade/downgrade (proration): gerar invoice de ajuste e tokens diferenciais (pode exigir coluna `prorated_from_subscription_id`).
- Agrupamento multi-produto (subscription_items) se um plano passar a ter combos.

### API Planejada
- `POST /api/subscriptions` cria assinatura (ou retorna existente ativa).
- `POST /api/subscriptions/{id}/cancel` (opção immediate ou period_end).
- `GET /api/subscriptions/current` retorna assinatura ativa do usuário.

### Open Questions
- Necessidade de hard cap de créditos acumulados? (Evitar “banking” excessivo) -> possível coluna `max_rollover_tokens`.
- Tratamento de alteração de preço: grandfathering via coluna `locked_price_cents` em `subscriptions`.

### Passos de Implementação (Sequência Sugerida)
1. Migration colunas `plans` (billing_interval, tokens_per_interval...).
2. Tabelas `subscriptions` e `subscription_invoices` + RLS.
3. Adapter Mercado Pago para criar preapproval.
4. Endpoint criação + webhook atualização.
5. Cron de renovação.
6. Créditos por ciclo (idempotente).
7. Cancelamento e pausa.
8. Observabilidade e dashboards básicos.

---
Este roadmap pode ser refinado à medida que definirmos pricing e comportamento de rollover.