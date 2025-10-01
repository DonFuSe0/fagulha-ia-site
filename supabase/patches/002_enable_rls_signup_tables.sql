-- 002_enable_rls_signup_tables.sql
BEGIN;

ALTER TABLE public.signup_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.signup_guards   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_events  ENABLE ROW LEVEL SECURITY;

COMMIT;
