-- 032_signup_guards_fix.sql
-- Corrige tabela signup_guards quando já existe sem a coluna blocked_until
-- e também trata o caso de tabela criada com nome errado (signup_guars).

do $$ begin
  if to_regclass('public.signup_guars') is not null and to_regclass('public.signup_guards') is null then
    alter table public.signup_guars rename to signup_guards;
  end if;
end $$;

create table if not exists public.signup_guards (
  id uuid primary key default gen_random_uuid(),
  ip_hash text not null unique,
  blocked_until timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

do $$ begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema='public' and table_name='signup_guards' and column_name='ip_hash'
  ) then
    alter table public.signup_guards add column ip_hash text;
  end if;

  if not exists (
    select 1 from information_schema.columns
    where table_schema='public' and table_name='signup_guards' and column_name='blocked_until'
  ) then
    alter table public.signup_guards add column blocked_until timestamptz not null default now();
  end if;

  if not exists (
    select 1 from information_schema.columns
    where table_schema='public' and table_name='signup_guards' and column_name='created_at'
  ) then
    alter table public.signup_guards add column created_at timestamptz not null default now();
  end if;

  if not exists (
    select 1 from information_schema.columns
    where table_schema='public' and table_name='signup_guards' and column_name='updated_at'
  ) then
    alter table public.signup_guards add column updated_at timestamptz not null default now();
  end if;
end $$;

do $$ begin
  if not exists (select 1 from pg_indexes where schemaname='public' and indexname='idx_signup_guards_ip_hash_unique') then
    create unique index idx_signup_guards_ip_hash_unique on public.signup_guards (ip_hash);
  end if;
end $$;

do $$ begin
  if not exists (select 1 from pg_indexes where schemaname='public' and indexname='idx_signup_guards_blocked_until') then
    create index idx_signup_guards_blocked_until on public.signup_guards (blocked_until);
  end if;
end $$;

alter table public.signup_guards enable row level security;

do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='signup_guards' and policyname='read_all'
  ) then
    create policy "read_all" on public.signup_guards for select using (true);
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='signup_guards' and policyname='write_auth'
  ) then
    create policy "write_auth" on public.signup_guards for insert with check (auth.role() = 'authenticated');
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='signup_guards' and policyname='update_auth'
  ) then
    create policy "update_auth" on public.signup_guards for update using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
  end if;
end $$;

-- Verificação
-- select * from public.signup_guards limit 10;
