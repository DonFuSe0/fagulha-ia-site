-- 027_sum_tokens_by_user.sql
create or replace function public.sum_tokens_by_user(p_user_id uuid)
returns table (total numeric)
language sql stable as $$
  select coalesce(sum(amount), 0) as total
  from public.tokens
  where user_id = p_user_id
$$;
