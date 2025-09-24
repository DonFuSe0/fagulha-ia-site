-- Setting up Row Level Security policies for all tables
-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.token_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ip_registrations ENABLE ROW LEVEL SECURITY;

-- Profiles policies
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_delete_own" ON public.profiles;

CREATE POLICY "profiles_select_own"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "profiles_insert_own"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "profiles_delete_own"
  ON public.profiles FOR DELETE
  USING (auth.uid() = id);

-- Images policies
DROP POLICY IF EXISTS "images_select_own" ON public.images;
DROP POLICY IF EXISTS "images_select_public" ON public.images;
DROP POLICY IF EXISTS "images_insert_own" ON public.images;
DROP POLICY IF EXISTS "images_update_own" ON public.images;
DROP POLICY IF EXISTS "images_delete_own" ON public.images;

CREATE POLICY "images_select_own"
  ON public.images FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "images_select_public"
  ON public.images FOR SELECT
  USING (is_public = true);

CREATE POLICY "images_insert_own"
  ON public.images FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "images_update_own"
  ON public.images FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "images_delete_own"
  ON public.images FOR DELETE
  USING (auth.uid() = user_id);

-- Token transactions policies
DROP POLICY IF EXISTS "token_transactions_select_own" ON public.token_transactions;
DROP POLICY IF EXISTS "token_transactions_insert_own" ON public.token_transactions;

CREATE POLICY "token_transactions_select_own"
  ON public.token_transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "token_transactions_insert_own"
  ON public.token_transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Payments policies
DROP POLICY IF EXISTS "payments_select_own" ON public.payments;
DROP POLICY IF EXISTS "payments_insert_own" ON public.payments;
DROP POLICY IF EXISTS "payments_update_own" ON public.payments;

CREATE POLICY "payments_select_own"
  ON public.payments FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "payments_insert_own"
  ON public.payments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "payments_update_own"
  ON public.payments FOR UPDATE
  USING (auth.uid() = user_id);

-- IP registrations policies (more restrictive)
DROP POLICY IF EXISTS "ip_registrations_select_own" ON public.ip_registrations;
DROP POLICY IF EXISTS "ip_registrations_insert_own" ON public.ip_registrations;

CREATE POLICY "ip_registrations_select_own"
  ON public.ip_registrations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "ip_registrations_insert_own"
  ON public.ip_registrations FOR INSERT
  WITH CHECK (auth.uid() = user_id);
