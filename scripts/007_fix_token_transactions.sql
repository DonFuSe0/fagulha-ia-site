-- Corrigir inconsistência na tabela token_transactions
-- O script 003 usa 'type' mas o script 006 usa 'transaction_type'

-- Verificar se a coluna transaction_type existe e renomear para type se necessário
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'token_transactions' 
        AND column_name = 'transaction_type'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.token_transactions RENAME COLUMN transaction_type TO type;
    END IF;
END $$;

-- Atualizar a função process_payment_success para usar 'type' em vez de 'transaction_type'
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
  
  -- Adicionar tokens ao usuário usando a função correta
  PERFORM update_user_tokens(
    payment_record.user_id,
    payment_record.tokens_purchased,
    'purchase',
    'Compra de tokens - Plano ' || payment_record.plan_name,
    jsonb_build_object('payment_id', payment_uuid)
  );
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
