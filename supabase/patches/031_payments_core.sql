-- 031_payments_core.sql
-- Tabelas de planos e compras para sistema de pagamentos (Mercado Pago inicialmente)
-- NÃO alterar tabelas existentes (profiles, tokens). Reaproveitamos tokens como ledger.
-- Executar após patches anteriores; usa extensão pgcrypto/gen_random_uuid presumida existente.

begin;

create table if not exists public.plans (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  tokens integer not null check (tokens > 0),
  price_cents integer not null check (price_cents > 0),
  currency text not null default 'BRL',
  active boolean not null default true,
  sort_order integer not null default 100,
  gateway_reference text, -- opcional: id de item/produto no provedor
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- purchases: status flow => pending -> approved -> credited (ou failed / cancelled / refunded)
create table if not exists public.purchases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  plan_code text not null references public.plans(code),
  tokens_snapshot integer not null check (tokens_snapshot > 0),
  amount_cents integer not null check (amount_cents > 0),
  currency text not null default 'BRL',
  status text not null check (status in ('pending','approved','credited','failed','cancelled','refunded')),
  gateway text not null default 'mercadopago',
  gateway_payment_id text unique,           -- payment id do provedor
  preference_id text,                       -- preference (checkout) id
  external_reference text unique,          -- nosso id correlacionador
  raw_payload jsonb,                        -- último payload de webhook relevante
  credited_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists purchases_user_created_idx on public.purchases(user_id, created_at desc);
create index if not exists purchases_status_created_idx on public.purchases(status, created_at desc);
create index if not exists purchases_plan_code_idx on public.purchases(plan_code);

-- Triggers de updated_at
create or replace function public.touch_updated_at() returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;$$;

create trigger trg_plans_updated_at before update on public.plans
  for each row execute function public.touch_updated_at();
create trigger trg_purchases_updated_at before update on public.purchases
  for each row execute function public.touch_updated_at();

-- RLS
alter table public.plans enable row level security;
alter table public.purchases enable row level security;

-- Políticas: planos públicos somente leitura para todos (ou poderíamos filtrar active=true)
create policy "plans_select_public" on public.plans
  for select using (active = true);
-- Administração (service role) terá bypass via chave secreta; políticas extra poderiam ser adicionadas depois.

-- Purchases: o usuário pode ver apenas as suas
create policy "purchases_select_owner" on public.purchases
  for select using (auth.uid() = user_id);
-- Inserts/updates somente pelo service role (webhook / server)
create policy "purchases_mod_service_role" on public.purchases
  for all using (false) with check (false);

commit;
