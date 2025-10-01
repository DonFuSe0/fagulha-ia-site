-- docs/sql/signup-guard.sql
-- Cria tabela de guarda de cadastro por IP
create table if not exists public.signup_guard (
  id uuid primary key default gen_random_uuid(),
  ip_hash text not null,
  created_at timestamptz not null default now()
);

create index if not exists signup_guard_ip_hash_idx on public.signup_guard (ip_hash);
create index if not exists signup_guard_created_at_idx on public.signup_guard (created_at);

alter table public.signup_guard enable row level security;
-- (Sem políticas — acessamos com Service Role a partir do backend)
