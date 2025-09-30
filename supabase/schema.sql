-- Schema definitions for Fagulha IA
-- Tabelas principais, gatilho de criação de perfil e políticas RLS.

-- Tabela de perfis. Cada usuário autenticado possui um registro nesta tabela.
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text,
  credits integer not null default 0,
  created_at timestamp with time zone default now()
);

-- Tabela de tokens. Registra créditos e débitos de saldo dos usuários.
create table if not exists public.tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  amount integer not null,
  description text,
  created_at timestamp with time zone default now()
);

-- Tabela de gerações de imagens. Armazena o prompt, a URL da imagem e se a
-- geração é pública.
create table if not exists public.generations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  prompt text not null,
  image_url text,
  is_public boolean not null default false,
  created_at timestamp with time zone default now()
);

-- Tabela de eventos de webhook. Pode ser usada para registrar callbacks de
-- processamento assíncrono de gerações ou integrações externas.
create table if not exists public.webhook_events (
  id uuid primary key default gen_random_uuid(),
  event_type text not null,
  payload jsonb,
  created_at timestamp with time zone default now()
);

-- Função que cria automaticamente um perfil e concede saldo inicial quando um
-- novo usuário é registrado no auth.users.
create or replace function public.handle_new_user()
returns trigger as
$$
begin
  -- Cria o perfil do usuário.
  insert into public.profiles (id, credits)
  values (new.id, 20);
  -- Registra o saldo inicial na tabela de tokens.
  insert into public.tokens (user_id, amount, description)
  values (new.id, 20, 'Saldo inicial');
  return new;
end;
$$ language plpgsql security definer;

-- Gatilho que executa a função acima após a criação de um usuário.
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Ativa RLS em todas as tabelas sensíveis.
alter table public.profiles enable row level security;
alter table public.tokens enable row level security;
alter table public.generations enable row level security;

-- Políticas para perfis: o usuário pode visualizar e atualizar apenas seu
-- próprio perfil.
create policy "Profiles are viewable by owner" on public.profiles
  for select using (auth.uid() = id);
create policy "Profiles are updatable by owner" on public.profiles
  for update using (auth.uid() = id);

-- Políticas para tokens: o usuário só pode ver seus próprios créditos.
create policy "Tokens by owner" on public.tokens
  for select using (auth.uid() = user_id);

-- Políticas para gerações: os usuários podem ler suas próprias gerações ou
-- gerações públicas. Podem inserir e atualizar apenas suas próprias linhas.
create policy "Read own generations" on public.generations
  for select using (auth.uid() = user_id);
create policy "Insert own generations" on public.generations
  for insert with check (auth.uid() = user_id);
create policy "Update own generations" on public.generations
  for update using (auth.uid() = user_id);
-- Política adicional: libera leitura pública de imagens com is_public = true.
create policy "Read public generations" on public.generations
  for select using (is_public = true);