-- Tabela de bloqueio por e-mail (30 dias após exclusão)
create table if not exists public.account_deletions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  email_hash text not null,
  ban_until timestamptz not null,
  created_at timestamptz not null default now()
);

-- Indexes
create index if not exists idx_account_deletions_email_hash on public.account_deletions (email_hash);
create index if not exists idx_account_deletions_ban_until on public.account_deletions (ban_until);

-- RLS
alter table public.account_deletions enable row level security;

-- Política simples: qualquer um pode checar se um e-mail está banido (só hash), apenas leitura
do $$ begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='account_deletions' and policyname='read_by_all') then
    create policy "read_by_all" on public.account_deletions for select using (true);
  end if;
end $$;

-- Escrita apenas por usuários autenticados (ou via service role)
do $$ begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='account_deletions' and policyname='ins_by_auth') then
    create policy "ins_by_auth" on public.account_deletions for insert with check (auth.role() = 'authenticated');
  end if;
end $$;
