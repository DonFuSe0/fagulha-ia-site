create extension if not exists pgcrypto; -- para digest()

create table if not exists public.account_deletions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  email_hash text not null,
  created_at timestamptz not null default now(),
  ban_until timestamptz not null
);

create index if not exists account_deletions_email_hash_idx on public.account_deletions(email_hash);

create or replace function public.is_email_banned(p_email text)
returns boolean language sql stable as $$
  select exists (
    select 1 from public.account_deletions
    where email_hash = encode(digest(lower(p_email), 'sha256'), 'hex')
      and now() < ban_until
  );
$$;
