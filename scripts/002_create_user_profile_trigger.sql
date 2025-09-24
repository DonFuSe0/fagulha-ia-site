-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY definer
SET search_path = public
AS $$
BEGIN
  -- Create profile entry
  INSERT INTO public.profiles (id, display_name, nickname, tokens)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1)),
    COALESCE(new.raw_user_meta_data ->> 'nickname', split_part(new.email, '@', 1)),
    20 -- Free tokens
  )
  ON CONFLICT (id) DO NOTHING;

  -- Create users entry
  INSERT INTO public.users (id, username, display_name)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data ->> 'username', split_part(new.email, '@', 1)),
    COALESCE(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1))
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN new;
END;
$$;

-- Trigger for new user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
