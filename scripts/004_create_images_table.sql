-- Create images table
CREATE TABLE IF NOT EXISTS public.images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  prompt TEXT NOT NULL,
  negative_prompt TEXT,
  model VARCHAR(50) NOT NULL DEFAULT 'standard',
  style VARCHAR(50),
  resolution VARCHAR(20) NOT NULL DEFAULT '512x512',
  steps INTEGER NOT NULL DEFAULT 20,
  seed BIGINT,
  cfg_scale DECIMAL(3,1) DEFAULT 7.0,
  image_url TEXT,
  thumbnail_url TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  is_public BOOLEAN DEFAULT FALSE,
  tokens_used INTEGER NOT NULL,
  generation_time INTEGER, -- in seconds
  error_message TEXT,
  metadata JSONB DEFAULT '{}',
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '24 hours'),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.images ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for images
CREATE POLICY "images_select_own" ON public.images
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "images_insert_own" ON public.images
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "images_update_own" ON public.images
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "images_delete_own" ON public.images
  FOR DELETE USING (auth.uid() = user_id);

-- Create policy for public images
CREATE POLICY "images_select_public" ON public.images
  FOR SELECT USING (is_public = TRUE AND status = 'completed');

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_images_user_id ON public.images(user_id);
CREATE INDEX IF NOT EXISTS idx_images_status ON public.images(status);
CREATE INDEX IF NOT EXISTS idx_images_created_at ON public.images(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_images_public ON public.images(is_public, status) WHERE is_public = TRUE;
CREATE INDEX IF NOT EXISTS idx_images_expires_at ON public.images(expires_at);

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_images_updated_at ON public.images;
CREATE TRIGGER update_images_updated_at
  BEFORE UPDATE ON public.images
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for generated images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('generated-images', 'generated-images', true)
ON CONFLICT (id) DO NOTHING;

-- Create policy to allow users to upload their generated images
CREATE POLICY "Users can upload generated images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'generated-images' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Create policy to allow users to update their generated images
CREATE POLICY "Users can update their generated images" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'generated-images' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Create policy to allow users to delete their generated images
CREATE POLICY "Users can delete their generated images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'generated-images' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Create policy to allow public access to generated images
CREATE POLICY "Generated images are publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'generated-images');

-- Function to clean up expired images
CREATE OR REPLACE FUNCTION public.cleanup_expired_images()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  -- Delete expired images from database
  DELETE FROM public.images 
  WHERE expires_at < NOW() AND status != 'processing';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  RETURN deleted_count;
END;
$$;
