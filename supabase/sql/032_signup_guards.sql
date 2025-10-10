-- Guarda simples por IP
create table if not exists public.signup_guards (
  id uuid primary key default gen_random_uuid(),
  ip_hash text not null unique,
  blocked_until timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_signup_guards_blocked_until on public.signup_guards (blocked_until);

alter table public.signup_guards enable row level security;

-- leitura pública (apenas campos de controle, sem dados sensíveis)
do $$ begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='signup_guards' and policyname='read_all') then
    create policy "read_all" on public.signup_guards for select using (true);
  end if;
end $$;

-- upsert apenas via service role ou usuários autenticados (roteadores server)
do $$ begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='signup_guards' and policyname='write_auth') then
    create policy "write_auth" on public.signup_guards for insert with check (auth.role() = 'authenticated');
  end if;
end $$;
