-- Funções RPC para gerenciar créditos de tokens. São definidas com
-- SECURITY DEFINER para que o usuário possa invocar sem privilégios
-- elevados e garantir integridade.

-- Credita tokens para um usuário. Um registro positivo é inserido na
-- tabela de tokens e o saldo é incrementado.
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

-- Debita tokens de um usuário. Um registro negativo é inserido e o saldo é
-- decrementado. Dispara erro caso não haja saldo suficiente.
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
  -- Verifica saldo suficiente
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