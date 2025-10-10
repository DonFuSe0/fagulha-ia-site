-- 028_profile_credits_sync.sql
-- Mantém profiles.credits sincronizado com a soma de tokens.amount

create or replace function public._recompute_profile_credits(p_user_id uuid)
returns void language plpgsql security definer as $$
begin
  update public.profiles p
  set credits = coalesce(t.total, 0)
  from (
    select user_id, sum(amount)::numeric as total
    from public.tokens
    where user_id = p_user_id
    group by user_id
  ) t
  where p.id = p_user_id;
  -- se não houver linhas em tokens, seta 0
  update public.profiles set credits = 0 where id = p_user_id and credits is null;
end;
$$;

drop trigger if exists trg_tokens_sync_credits_ins on public.tokens;
drop trigger if exists trg_tokens_sync_credits_upd on public.tokens;
drop trigger if exists trg_tokens_sync_credits_del on public.tokens;

create trigger trg_tokens_sync_credits_ins
after insert on public.tokens
for each row execute procedure public._recompute_profile_credits(new.user_id);

create trigger trg_tokens_sync_credits_upd
after update on public.tokens
for each row execute procedure public._recompute_profile_credits(coalesce(new.user_id, old.user_id));

create trigger trg_tokens_sync_credits_del
after delete on public.tokens
for each row execute procedure public._recompute_profile_credits(old.user_id);

-- Backfill inicial
update public.profiles p
set credits = coalesce(t.total, 0)
from (
  select user_id, sum(amount)::numeric as total
  from public.tokens
  group by user_id
) t
where p.id = t.user_id;

update public.profiles set credits = coalesce(credits, 0);
