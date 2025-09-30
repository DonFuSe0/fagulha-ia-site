-- Script de redefinição completo da base de dados para Fagulha IA
-- Este arquivo remove todas as tabelas, funções, gatilhos e políticas
-- definidas pela aplicação e recria tudo em seguida. Use‑o para voltar ao
-- estado inicial.

-- Dropa o gatilho e funções relacionadas
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user cascade;
drop function if exists public.credit_tokens cascade;
drop function if exists public.spend_tokens cascade;

-- Dropa as tabelas em ordem de dependência reversa
drop table if exists public.webhook_events cascade;
drop table if exists public.generations cascade;
drop table if exists public.tokens cascade;
drop table if exists public.profiles cascade;

-- Recria as tabelas e políticas exatamente como definidas em schema.sql

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text,
  credits integer not null default 0,
  created_at timestamp with time zone default now()
);

create table public.tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  amount integer not null,
  description text,
  created_at timestamp with time zone default now()
);

create table public.generations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  prompt text not null,
  image_url text,
  is_public boolean not null default false,
  created_at timestamp with time zone default now()
);

create table public.webhook_events (
  id uuid primary key default gen_random_uuid(),
  event_type text not null,
  payload jsonb,
  created_at timestamp with time zone default now()
);

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, credits)
  values (new.id, 20);
  insert into public.tokens (user_id, amount, description)
  values (new.id, 20, 'Saldo inicial');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.tokens enable row level security;
alter table public.generations enable row level security;

create policy "Profiles are viewable by owner" on public.profiles
  for select using (auth.uid() = id);
create policy "Profiles are updatable by owner" on public.profiles
  for update using (auth.uid() = id);
create policy "Tokens by owner" on public.tokens
  for select using (auth.uid() = user_id);
create policy "Read own generations" on public.generations
  for select using (auth.uid() = user_id);
create policy "Insert own generations" on public.generations
  for insert with check (auth.uid() = user_id);
create policy "Update own generations" on public.generations
  for update using (auth.uid() = user_id);
create policy "Read public generations" on public.generations
  for select using (is_public = true);

-- Recria as funções RPC credit_tokens e spend_tokens definidas em rpc.sql
create or replace function public.credit_tokens(p_user uuid, p_delta integer)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_delta <= 0 then
    raise exception 'Delta precisa ser positivo';
  end if;
  update public.profiles
  set credits = coalesce(credits, 0) + p_delta
  where id = p_user;
  insert into public.tokens (user_id, amount, description)
  values (p_user, p_delta, 'Crédito manual');
end;
$$;

create or replace function public.spend_tokens(p_user uuid, p_cost integer)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_cost <= 0 then
    raise exception 'Custo precisa ser positivo';
  end if;
  if (select credits from public.profiles where id = p_user) < p_cost then
    raise exception 'Saldo insuficiente';
  end if;
  update public.profiles
  set credits = credits - p_cost
  where id = p_user;
  insert into public.tokens (user_id, amount, description)
  values (p_user, -p_cost, 'Gasto com geração');
end;
$$;