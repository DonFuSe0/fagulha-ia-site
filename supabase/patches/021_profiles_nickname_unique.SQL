BEGIN;
CREATE UNIQUE INDEX IF NOT EXISTS profiles_nickname_unique_ci
  ON public.profiles (lower(nickname))
  WHERE nickname IS NOT NULL;
COMMIT;
