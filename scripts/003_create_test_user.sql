-- Create test user for verification
-- Insert test user data directly into profiles table
INSERT INTO public.profiles (
  id,
  display_name,
  nickname,
  birth_date,
  signup_ip,
  tokens,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'Usuário Teste',
  'teste_fagulha',
  '1990-01-01',
  '127.0.0.1'::inet,
  50, -- Extra tokens for testing
  NOW(),
  NOW()
) ON CONFLICT (nickname) DO NOTHING;

-- Create corresponding auth user (this would normally be handled by Supabase Auth)
-- Note: This is just for reference - actual auth users are created through Supabase Auth API
