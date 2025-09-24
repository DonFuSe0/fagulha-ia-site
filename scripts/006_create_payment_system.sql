-- Tabela para armazenar transações de pagamento
CREATE TABLE IF NOT EXISTS payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  plan_name TEXT NOT NULL,
  amount_brl DECIMAL(10,2) NOT NULL,
  tokens_purchased INTEGER NOT NULL,
  payment_method TEXT NOT NULL DEFAULT 'pix',
  payment_status TEXT NOT NULL DEFAULT 'pending', -- pending, completed, failed, cancelled
  payment_id TEXT, -- ID do provedor de pagamento
  payment_url TEXT, -- URL para pagamento PIX
  expires_at TIMESTAMP WITH TIME ZONE,
  paid_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS para payments
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own payments" ON payments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own payments" ON payments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Função para criar pagamento
CREATE OR REPLACE FUNCTION create_payment(
  plan_name TEXT,
  amount_brl DECIMAL,
  tokens_purchased INTEGER
)
RETURNS UUID AS $$
DECLARE
  payment_id UUID;
  user_id UUID;
BEGIN
  -- Obter ID do usuário atual
  SELECT auth.uid() INTO user_id;
  
  IF user_id IS NULL THEN
    RAISE EXCEPTION 'User not authenticated';
  END IF;
  
  -- Criar registro de pagamento
  INSERT INTO payments (user_id, plan_name, amount_brl, tokens_purchased, expires_at)
  VALUES (user_id, plan_name, amount_brl, tokens_purchased, NOW() + INTERVAL '30 minutes')
  RETURNING id INTO payment_id;
  
  RETURN payment_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para processar pagamento aprovado
CREATE OR REPLACE FUNCTION process_payment_success(payment_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
  payment_record payments%ROWTYPE;
  user_id UUID;
  tokens_to_add INTEGER;
BEGIN
  -- Buscar o pagamento
  SELECT * INTO payment_record FROM payments WHERE id = payment_uuid;
  
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;
  
  -- Verificar se já foi processado
  IF payment_record.payment_status = 'completed' THEN
    RETURN TRUE;
  END IF;
  
  -- Atualizar status do pagamento
  UPDATE payments 
  SET 
    payment_status = 'completed',
    paid_at = NOW(),
    updated_at = NOW()
  WHERE id = payment_uuid;
  
  -- Adicionar tokens ao usuário
  UPDATE profiles 
  SET 
    tokens = tokens + payment_record.tokens_purchased,
    updated_at = NOW()
  WHERE id = payment_record.user_id;
  
  -- Registrar transação de tokens
  INSERT INTO token_transactions (user_id, amount, transaction_type, description)
  VALUES (
    payment_record.user_id, 
    payment_record.tokens_purchased, 
    'purchase', 
    'Compra de tokens - Plano ' || payment_record.plan_name
  );
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(payment_status);
CREATE INDEX IF NOT EXISTS idx_payments_created ON payments(created_at);
