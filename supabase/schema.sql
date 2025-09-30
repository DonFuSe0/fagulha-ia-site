-- supabase/schema.sql (idempotente e alinhado ao anti-abuso + créditos pós-confirmação)

-- Extensões utilitárias
create extension if not exists pgcrypto;

-- Garanta que antigos objetos não causem erro ao reexecutar
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user();
drop trigger if exists on_auth_user_confirmed on auth.users;
drop function if exists public.handle_email_confirm();

-- Perfis (saldo inicial 0; créditos dados após confirmação)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text,
  credits integer not null default 0,
  created_at timestamp with time zone default now()
);

-- Anti-abuso: tentativas (rate limit por IP/24h)
create table if not exists public.signup_attempts (
  id uuid primary key default gen_random_uuid(),
  ip_hash text,
  email_domain text,
  created_at timestamp with time zone default now()
);

-- Anti-abuso: guarda 1 conta/IP/30d
create table if not exists public.signup_guards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  ip_hash text,
  email_domain text,
  user_agent text,
  created_at timestamp with time zone default now()
);

-- Tokens (histórico de créditos/débitos)
create table if not exists public.tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  amount integer not null,
  description text,
  created_at timestamp with time zone default now()
);

-- Gerações
create table if not exists public.generations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  prompt text not null,
  image_url text,
  is_public boolean not null default false,
  created_at timestamp with time zone default now()
);

-- Webhook events (opcional)
create table if not exists public.webhook_events (
  id uuid primary key default gen_random_uuid(),
  event_type text not null,
  payload jsonb,
  created_at timestamp with time zone default now()
);

-- Trigger: cria perfil com 0 créditos ao criar usuário
create or replace function public.handle_new_user()
returns trigger as
$$
begin
  insert into public.profiles (id, credits)
  values (new.id, 0);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Trigger: ao confirmar e-mail, concede créditos de boas-vindas
create or replace function public.handle_email_confirm()
returns trigger as
$$
begin
  if (old.email_confirmed_at is null and new.email_confirmed_at is not null) then
    perform public.grant_welcome_credits(new.id);
  end if;
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_confirmed
  after update on auth.users
  for each row execute procedure public.handle_email_confirm();

-- RLS e políticas
alter table public.profiles   enable row level security;
alter table public.tokens     enable row level security;
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
