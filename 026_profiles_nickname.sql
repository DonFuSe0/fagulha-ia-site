-- 026_profiles_nickname.sql
-- Adiciona a coluna nickname e cria índice único (case-insensitive)

alter table public.profiles
  add column if not exists nickname text;

-- índice único em lower(nickname) apenas quando nickname não é nulo
create unique index if not exists profiles_nickname_lower_unique
on public.profiles (lower(nickname))
where nickname is not null;
