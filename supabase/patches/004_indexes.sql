-- 004_indexes.sql
BEGIN;

CREATE INDEX IF NOT EXISTS signup_attempts_ip_hash_idx ON public.signup_attempts (ip_hash);
CREATE INDEX IF NOT EXISTS signup_guards_ip_hash_idx   ON public.signup_guards (ip_hash);

COMMIT;
