-- 029_credits_rpc.sql
create or replace function public.current_user_credits()
returns numeric
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(sum(t.amount), 0)::numeric
  from public.tokens t
  where t.user_id = auth.uid();
$$;

create or replace function public.get_user_credits(p_user_id uuid)
returns numeric
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(sum(t.amount), 0)::numeric
  from public.tokens t
  where t.user_id = p_user_id;
$$;
