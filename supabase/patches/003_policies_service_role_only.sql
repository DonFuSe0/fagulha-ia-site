-- 003_policies_service_role_only.sql
BEGIN;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='public' AND tablename='signup_attempts' AND policyname='service_role_full_access'
  ) THEN
    CREATE POLICY "service_role_full_access"
      ON public.signup_attempts
      FOR ALL
      USING (auth.role() = 'service_role')
      WITH CHECK (auth.role() = 'service_role');
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='public' AND tablename='signup_guards' AND policyname='service_role_full_access'
  ) THEN
    CREATE POLICY "service_role_full_access"
      ON public.signup_guards
      FOR ALL
      USING (auth.role() = 'service_role')
      WITH CHECK (auth.role() = 'service_role');
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='public' AND tablename='webhook_events' AND policyname='service_role_full_access'
  ) THEN
    CREATE POLICY "service_role_full_access"
      ON public.webhook_events
      FOR ALL
      USING (auth.role() = 'service_role')
      WITH CHECK (auth.role() = 'service_role');
  END IF;
END$$;

COMMIT;
