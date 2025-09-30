-- supabase/rpc.sql (updated)

create or replace function public.grant_welcome_credits(p_user uuid, p_amount integer default 20)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.profiles
  set credits = coalesce(credits,0) + p_amount
  where id = p_user;

  insert into public.tokens (user_id, amount, description)
  values (p_user, p_amount, 'Crédito de boas-vindas');
end;
$$;

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
