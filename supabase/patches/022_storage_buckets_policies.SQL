-- 022_storage_buckets_policies.sql (corrigido: sem IF NOT EXISTS nas policies)
insert into storage.buckets (id, name, public) values ('avatars','avatars', true) on conflict (id) do nothing;
insert into storage.buckets (id, name, public) values ('gen-private','gen-private', false) on conflict (id) do nothing;
insert into storage.buckets (id, name, public) values ('gen-public','gen-public', true) on conflict (id) do nothing;

drop policy if exists "avatars read public" on storage.objects;
drop policy if exists "avatars write owner" on storage.objects;
drop policy if exists "avatars update owner" on storage.objects;
drop policy if exists "gen-private read owner" on storage.objects;
drop policy if exists "gen-private write owner" on storage.objects;
drop policy if exists "gen-private update owner" on storage.objects;
drop policy if exists "gen-public read all" on storage.objects;
drop policy if exists "gen-public write owner" on storage.objects;

create policy "avatars read public"
  on storage.objects for select to public
  using (bucket_id = 'avatars');

create policy "avatars write owner"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "avatars update owner"
  on storage.objects for update to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "gen-private read owner"
  on storage.objects for select to authenticated
  using (bucket_id = 'gen-private' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "gen-private write owner"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'gen-private' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "gen-private update owner"
  on storage.objects for update to authenticated
  using (bucket_id = 'gen-private' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "gen-public read all"
  on storage.objects for select to public
  using (bucket_id = 'gen-public');

create policy "gen-public write owner"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'gen-public' and (storage.foldername(name))[1] = auth.uid()::text);
