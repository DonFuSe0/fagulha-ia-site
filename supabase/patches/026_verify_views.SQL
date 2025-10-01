-- 1) Campos em generations
select column_name, data_type from information_schema.columns
where table_schema='public' and table_name='generations'
  and column_name in ('params','storage_path','thumb_url','public_since','deleted_at','image_deleted');

-- 2) Índices
select schemaname, tablename, indexname from pg_indexes
where tablename in ('generations','profiles');

-- 3) Buckets
select id, public from storage.buckets where id in ('avatars','gen-private','gen-public');
