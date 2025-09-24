-- Update IP limit from 3 to 1 account per IP
-- Drop existing function and recreate with new limit
DROP FUNCTION IF EXISTS public.check_ip_limit() CASCADE;

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
    
    -- Allow only 1 account per IP instead of 3
    IF ip_count >= 1 THEN
      RAISE EXCEPTION 'Apenas uma conta é permitida por endereço IP. Entre em contato com o suporte se precisar de ajuda.';
    END IF;
    
    -- Record this IP registration
    INSERT INTO public.ip_registrations (ip_address, user_id)
    VALUES (user_ip, NEW.id);
  END IF;
  
  RETURN NEW;
END;
$$;

-- Recreate the trigger
DROP TRIGGER IF EXISTS check_ip_limit_trigger ON auth.users;
CREATE TRIGGER check_ip_limit_trigger
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.check_ip_limit();
