-- 001_add_ip_hash_to_profiles.sql
BEGIN;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS ip_hash text;

COMMENT ON COLUMN public.profiles.ip_hash IS 'HMAC do IP para guarda anti-abuso (opcional).';

CREATE INDEX IF NOT EXISTS profiles_ip_hash_idx ON public.profiles (ip_hash);

COMMIT;
