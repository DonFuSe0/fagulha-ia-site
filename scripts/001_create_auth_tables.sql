-- Create profiles table for user management
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  nickname TEXT UNIQUE NOT NULL,
  birth_date DATE,
  avatar_url TEXT,
  bio TEXT,
  signup_ip INET,
  tokens INTEGER DEFAULT 20,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "profiles_insert_own" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "profiles_delete_own" ON public.profiles
  FOR DELETE USING (auth.uid() = id);

-- Create function to handle new user signup
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
    tokens
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'display_name', 'Usuário'),
    COALESCE(NEW.raw_user_meta_data ->> 'nickname', 'user_' || substr(NEW.id::text, 1, 8)),
    COALESCE((NEW.raw_user_meta_data ->> 'birth_date')::date, NULL),
    COALESCE((NEW.raw_user_meta_data ->> 'signup_ip')::inet, NULL),
    COALESCE((NEW.raw_user_meta_data ->> 'initial_tokens')::integer, 20)
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- Create trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Create table to track IP addresses for anti-multiple accounts
CREATE TABLE IF NOT EXISTS public.ip_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address INET NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for IP registrations
ALTER TABLE public.ip_registrations ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to see only their own IP records
CREATE POLICY "ip_registrations_select_own" ON public.ip_registrations
  FOR SELECT USING (auth.uid() = user_id);

-- Create function to check for multiple accounts from same IP
CREATE OR REPLACE FUNCTION public.check_ip_limit()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  ip_count INTEGER;
  user_ip INET;
BEGIN
  -- Get the IP from user metadata
  user_ip := (NEW.raw_user_meta_data ->> 'signup_ip')::inet;
  
  IF user_ip IS NOT NULL THEN
    -- Count existing registrations from this IP
    SELECT COUNT(*) INTO ip_count
    FROM public.ip_registrations
    WHERE ip_address = user_ip;
    
    -- Allow up to 3 accounts per IP (configurable)
    IF ip_count >= 3 THEN
      RAISE EXCEPTION 'Limite de contas por IP atingido. Entre em contato com o suporte.';
    END IF;
    
    -- Record this IP registration
    INSERT INTO public.ip_registrations (ip_address, user_id)
    VALUES (user_ip, NEW.id);
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger to check IP limit on user creation
DROP TRIGGER IF EXISTS check_ip_limit_trigger ON auth.users;
CREATE TRIGGER check_ip_limit_trigger
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.check_ip_limit();

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Create trigger for profiles updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
