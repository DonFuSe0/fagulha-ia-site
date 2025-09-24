-- Create token transactions table
CREATE TABLE IF NOT EXISTS public.token_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL CHECK (type IN ('purchase', 'usage', 'refund', 'bonus')),
  amount INTEGER NOT NULL, -- Positive for additions, negative for usage
  description TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.token_transactions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for token transactions
CREATE POLICY "token_transactions_select_own" ON public.token_transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "token_transactions_insert_own" ON public.token_transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create function to update user tokens
CREATE OR REPLACE FUNCTION public.update_user_tokens(
  p_user_id UUID,
  p_amount INTEGER,
  p_type VARCHAR(20),
  p_description TEXT,
  p_metadata JSONB DEFAULT '{}'
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_tokens INTEGER;
BEGIN
  -- Get current token balance
  SELECT tokens INTO current_tokens
  FROM public.profiles
  WHERE id = p_user_id;
  
  -- Check if user has enough tokens for usage
  IF p_type = 'usage' AND current_tokens + p_amount < 0 THEN
    RAISE EXCEPTION 'Tokens insuficientes. Saldo atual: %, tentativa de uso: %', current_tokens, ABS(p_amount);
  END IF;
  
  -- Update user tokens
  UPDATE public.profiles
  SET tokens = tokens + p_amount
  WHERE id = p_user_id;
  
  -- Record transaction
  INSERT INTO public.token_transactions (user_id, type, amount, description, metadata)
  VALUES (p_user_id, p_type, p_amount, p_description, p_metadata);
  
  RETURN TRUE;
END;
$$;

-- Create function to calculate image generation cost
CREATE OR REPLACE FUNCTION public.calculate_generation_cost(
  p_model VARCHAR(50) DEFAULT 'standard',
  p_resolution VARCHAR(20) DEFAULT '512x512',
  p_steps INTEGER DEFAULT 20,
  p_advanced_features JSONB DEFAULT '{}'
)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
  base_cost INTEGER := 1;
  resolution_multiplier DECIMAL := 1.0;
  steps_multiplier DECIMAL := 1.0;
  model_multiplier DECIMAL := 1.0;
  final_cost INTEGER;
BEGIN
  -- Resolution cost multiplier
  CASE p_resolution
    WHEN '512x512' THEN resolution_multiplier := 1.0;
    WHEN '768x768' THEN resolution_multiplier := 1.5;
    WHEN '1024x1024' THEN resolution_multiplier := 2.0;
    WHEN '1024x1536' THEN resolution_multiplier := 2.5;
    WHEN '1536x1024' THEN resolution_multiplier := 2.5;
    ELSE resolution_multiplier := 1.0;
  END CASE;
  
  -- Steps multiplier (more steps = higher quality but more cost)
  IF p_steps > 20 THEN
    steps_multiplier := 1.0 + ((p_steps - 20) * 0.05);
  END IF;
  
  -- Model multiplier
  CASE p_model
    WHEN 'standard' THEN model_multiplier := 1.0;
    WHEN 'premium' THEN model_multiplier := 1.5;
    WHEN 'ultra' THEN model_multiplier := 2.0;
    ELSE model_multiplier := 1.0;
  END CASE;
  
  -- Calculate final cost
  final_cost := CEIL(base_cost * resolution_multiplier * steps_multiplier * model_multiplier);
  
  -- Minimum cost is 1 token
  IF final_cost < 1 THEN
    final_cost := 1;
  END IF;
  
  RETURN final_cost;
END;
$$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_token_transactions_user_id ON public.token_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_token_transactions_created_at ON public.token_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_token_transactions_type ON public.token_transactions(type);
