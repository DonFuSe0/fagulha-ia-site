-- 030_generations_public_at.sql
-- Adiciona coluna public_at para controlar expiração de itens públicos (4 dias após publicar)

do $$ begin
  alter table public.generations add column if not exists public_at timestamptz;
exception when duplicate_column then null;
end $$;

-- Índice para consultas por visibilidade/tempo
create index if not exists idx_generations_public_at on public.generations(public_at);

-- RLS (ajuste se necessário): o dono pode atualizar is_public/public_at do próprio registro
-- (Pressupõe política de update própria já existente; caso não, um exemplo:)
-- create policy if not exists "generations owner can update vis"
-- on public.generations for update
-- to authenticated
-- using (user_id = auth.uid())
-- with check (user_id = auth.uid());
