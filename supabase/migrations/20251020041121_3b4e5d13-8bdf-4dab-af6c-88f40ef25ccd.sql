-- Create business_details table
CREATE TABLE public.business_details (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  company_name text NOT NULL,
  hq_address text,
  branches jsonb DEFAULT '[]'::jsonb,
  primary_segments jsonb DEFAULT '[]'::jsonb,
  social_media_links jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.business_details ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own business details"
  ON public.business_details FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own business details"
  ON public.business_details FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own business details"
  ON public.business_details FOR UPDATE
  USING (auth.uid() = user_id);

-- Create storage bucket for business media
INSERT INTO storage.buckets (id, name, public)
VALUES ('business-media', 'business-media', true);

-- Storage policies
CREATE POLICY "Users can view their own media"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'business-media' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload their own media"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'business-media' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own media"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'business-media' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own media"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'business-media' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Trigger for updated_at
CREATE TRIGGER update_business_details_updated_at
  BEFORE UPDATE ON public.business_details
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();