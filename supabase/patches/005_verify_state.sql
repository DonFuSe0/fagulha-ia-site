-- 005_verify_state.sql
-- Execute após aplicar os patches para conferir o estado final.

-- 1) Coluna ip_hash em profiles
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema='public' AND table_name='profiles' AND column_name='ip_hash';

-- 2) RLS habilitado nas tabelas de guarda/webhooks
SELECT relname as table, relrowsecurity as rls
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname='public' AND c.relname IN ('signup_attempts','signup_guards','webhook_events')
ORDER BY relname;

-- 3) Índices por ip_hash
SELECT schemaname, tablename, indexname
FROM pg_indexes
WHERE schemaname='public' AND tablename IN ('profiles','signup_attempts','signup_guards')
ORDER BY tablename, indexname;
