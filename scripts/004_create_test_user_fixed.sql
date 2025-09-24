-- Creating test user with proper profile data
-- Create test user profile (auth user should be created via Supabase Auth UI)
INSERT INTO public.profiles (
  id,
  display_name,
  nickname,
  birth_date,
  signup_ip,
  tokens,
  avatar_url,
  bio,
  created_at,
  updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000001'::uuid,
  'Usuário Teste',
  '@teste',
  '1990-01-01',
  '127.0.0.1'::inet,
  100,
  null,
  'Conta de teste para desenvolvimento',
  now(),
  now()
) ON CONFLICT (id) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  nickname = EXCLUDED.nickname,
  tokens = EXCLUDED.tokens,
  updated_at = now();

-- Add some test token transactions
INSERT INTO public.token_transactions (
  id,
  user_id,
  type,
  amount,
  description,
  metadata,
  created_at
) VALUES 
(
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000001'::uuid,
  'initial',
  20,
  'Tokens iniciais gratuitos',
  '{"source": "signup"}'::jsonb,
  now()
),
(
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000001'::uuid,
  'purchase',
  80,
  'Compra de tokens de teste',
  '{"source": "test_purchase", "plan": "basic"}'::jsonb,
  now()
) ON CONFLICT DO NOTHING;

-- Add IP registration for test user
INSERT INTO public.ip_registrations (
  id,
  ip_address,
  user_id,
  created_at
) VALUES (
  gen_random_uuid(),
  '127.0.0.1'::inet,
  '00000000-0000-0000-0000-000000000001'::uuid,
  now()
) ON CONFLICT DO NOTHING;
