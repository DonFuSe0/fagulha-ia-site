-- Torna apelido único (case-insensitive)
do $$ begin
  if not exists (
    select 1 from pg_indexes where schemaname = 'public' and indexname = 'idx_profiles_nickname_lower_unique'
  ) then
    create unique index idx_profiles_nickname_lower_unique on public.profiles (lower(nickname));
  end if;
end $$;
