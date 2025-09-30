-- supabase/schema.sql (updated) — idempotente
create extension if not exists pgcrypto;

-- Limpeza segura
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user();
drop trigger if exists on_auth_user_confirmed on auth.users;
drop function if exists public.handle_email_confirm();

-- Perfis (saldo inicial 0; créditos após confirmação)
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

-- Anti-abuso: 1 conta por IP por 30 dias
create table if not exists public.signup_guards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  ip_hash text,
  email_domain text,
  user_agent text,
  created_at timestamp with time zone default now()
);

-- Tokens (histórico)
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
  created
