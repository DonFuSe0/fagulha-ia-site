BEGIN;
CREATE INDEX IF NOT EXISTS generations_user_created_idx ON public.generations (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS generations_public_since_idx ON public.generations (is_public, public_since DESC);
COMMIT;
