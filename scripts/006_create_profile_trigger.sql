-- Creating trigger to auto-create profile on user signup
-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
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
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'display_name', 'Usuário'),
    COALESCE(NEW.raw_user_meta_data ->> 'nickname', '@usuario'),
    COALESCE((NEW.raw_user_meta_data ->> 'birth_date')::date, '1990-01-01'::date),
    COALESCE((NEW.raw_user_meta_data ->> 'signup_ip')::inet, '127.0.0.1'::inet),
    COALESCE((NEW.raw_user_meta_data ->> 'initial_tokens')::integer, 20),
    NEW.raw_user_meta_data ->> 'avatar_url',
    NEW.raw_user_meta_data ->> 'bio',
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;

  -- Add initial token transaction
  INSERT INTO public.token_transactions (
    id,
    user_id,
    type,
    amount,
    description,
    metadata,
    created_at
  )
  VALUES (
    gen_random_uuid(),
    NEW.id,
    'initial',
    COALESCE((NEW.raw_user_meta_data ->> 'initial_tokens')::integer, 20),
    'Tokens iniciais gratuitos',
    jsonb_build_object('source', 'signup'),
    NOW()
  )
  ON CONFLICT DO NOTHING;

  -- Add IP registration if provided
  IF NEW.raw_user_meta_data ->> 'signup_ip' IS NOT NULL THEN
    INSERT INTO public.ip_registrations (
      id,
      ip_address,
      user_id,
      created_at
    )
    VALUES (
      gen_random_uuid(),
      (NEW.raw_user_meta_data ->> 'signup_ip')::inet,
      NEW.id,
      NOW()
    )
    ON CONFLICT DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
