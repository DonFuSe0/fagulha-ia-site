create or replace function public.get_private_overflow(p_limit int)
returns table (id uuid, storage_path text)
language sql security definer set search_path = public
as $$
  with ranked as (
    select id, user_id, storage_path,
           row_number() over (partition by user_id order by created_at desc) as rn
    from public.generations
    where is_public = false
  )
  select id, storage_path from ranked where rn > p_limit;
$$;
