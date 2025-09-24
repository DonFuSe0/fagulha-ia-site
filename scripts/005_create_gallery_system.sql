-- Adicionar campos para sistema de galeria
ALTER TABLE images ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT FALSE;
ALTER TABLE images ADD COLUMN IF NOT EXISTS public_expires_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE images ADD COLUMN IF NOT EXISTS views_count INTEGER DEFAULT 0;
ALTER TABLE images ADD COLUMN IF NOT EXISTS likes_count INTEGER DEFAULT 0;

-- Função para limpar imagens expiradas
CREATE OR REPLACE FUNCTION cleanup_expired_images()
RETURNS void AS $$
BEGIN
  -- Deletar imagens privadas expiradas (24h)
  DELETE FROM images 
  WHERE is_public = FALSE 
  AND created_at < NOW() - INTERVAL '24 hours';
  
  -- Deletar imagens públicas expiradas (120h)
  DELETE FROM images 
  WHERE is_public = TRUE 
  AND public_expires_at < NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para tornar imagem pública
CREATE OR REPLACE FUNCTION make_image_public(image_id UUID, user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  image_exists BOOLEAN;
BEGIN
  -- Verificar se a imagem pertence ao usuário
  SELECT EXISTS(
    SELECT 1 FROM images 
    WHERE id = image_id AND user_id = make_image_public.user_id
  ) INTO image_exists;
  
  IF NOT image_exists THEN
    RETURN FALSE;
  END IF;
  
  -- Tornar a imagem pública e definir expiração
  UPDATE images 
  SET 
    is_public = TRUE,
    public_expires_at = NOW() + INTERVAL '120 hours'
  WHERE id = image_id;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para incrementar visualizações
CREATE OR REPLACE FUNCTION increment_image_views(image_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE images 
  SET views_count = views_count + 1
  WHERE id = image_id AND is_public = TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS para galeria pública
CREATE POLICY "Public images are viewable by everyone" ON images
  FOR SELECT USING (is_public = TRUE AND public_expires_at > NOW());

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_images_public ON images(is_public, public_expires_at) WHERE is_public = TRUE;
CREATE INDEX IF NOT EXISTS idx_images_user_created ON images(user_id, created_at);
