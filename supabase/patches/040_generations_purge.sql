-- 040_generations_purge.sql
-- Índices úteis e função de limpeza opcional (execução manual ou via pg_cron, se habilitado)

-- Índices (se ainda não tiver)
create index if not exists idx_generations_is_public_created_at
  on public.generations (is_public, created_at desc);

create index if not exists idx_generations_is_public_public_at
  on public.generations (is_public, public_at desc);

-- Função helper: apaga e retorna contagens
create or replace function public.purge_expired_generations()
returns table (deleted_private int, deleted_public int)
language plpgsql
security definer
as $$
declare
  v_private int := 0;
  v_public int := 0;
begin
  -- privados: 24h após created_at
  with del as (
    delete from public.generations
    where is_public = false
      and created_at < now() - interval '24 hours'
    returning 1
  )
  select count(*) into v_private from del;

  -- públicos: 4d após public_at
  with delp as (
    delete from public.generations
    where is_public = true
      and public_at is not null
      and public_at < now() - interval '4 days'
    returning 1
  )
  select count(*) into v_public from delp;

  return query select v_private, v_public;
end $$;

-- Opcional: se quiser agendar no banco (pg_cron precisa estar habilitada no projeto)
-- select cron.schedule('purge_generations_hourly', '0 * * * *', $$
--   select * from public.purge_expired_generations();
-- $$);
