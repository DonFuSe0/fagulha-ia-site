-- Buckets
insert into storage.buckets (id, name, public) values ('avatars','avatars', true) on conflict (id) do nothing;
insert into storage.buckets (id, name, public) values ('gen-private','gen-private', false) on conflict (id) do nothing;
insert into storage.buckets (id, name, public) values ('gen-public','gen-public', true) on conflict (id) do nothing;

-- Policies (storage.objects)
create policy if not exists "avatars read public"
  on storage.objects for select to public
  using (bucket_id = 'avatars');

create policy if not exists "avatars write owner"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

create policy if not exists "avatars update owner"
  on storage.objects for update to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

create policy if not exists "gen-private read owner"
  on storage.objects for select to authenticated
  using (bucket_id = 'gen-private' and (storage.foldername(name))[1] = auth.uid()::text);

create policy if not exists "gen-private write owner"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'gen-private' and (storage.foldername(name))[1] = auth.uid()::text);

create policy if not exists "gen-private update owner"
  on storage.objects for update to authenticated
  using (bucket_id = 'gen-private' and (storage.foldername(name))[1] = auth.uid()::text);

create policy if not exists "gen-public read all"
  on storage.objects for select to public
  using (bucket_id = 'gen-public');

create policy if not exists "gen-public write owner"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'gen-public' and (storage.foldername(name))[1] = auth.uid()::text);
