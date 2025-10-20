-- Create competitor scope enum
CREATE TYPE public.competitor_scope AS ENUM ('national', 'regional_north', 'regional_south', 'regional_east', 'regional_west', 'international', 'online_d2c');

-- Create competitors table to store Excel data
CREATE TABLE public.competitors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  -- Business Information
  business_name TEXT NOT NULL,
  brand_names TEXT,
  scope competitor_scope NOT NULL,
  number_of_stores TEXT,
  hq_address TEXT,
  average_price_range TEXT,
  
  -- Social Media Links
  instagram_url TEXT,
  instagram_handle TEXT,
  facebook_url TEXT,
  facebook_name TEXT,
  youtube_url TEXT,
  youtube_name TEXT,
  
  -- Business Details
  owner_name TEXT,
  listed_on_nse BOOLEAN DEFAULT false,
  
  -- Additional metadata
  region TEXT, -- For regional filtering (North, South, East, West, Pan-India)
  city TEXT,   -- Extracted from HQ address for local filtering
  category TEXT DEFAULT 'Jewellery'
);

-- Enable RLS
ALTER TABLE public.competitors ENABLE ROW LEVEL SECURITY;

-- Policy: Everyone can read competitors (public data)
CREATE POLICY "Competitors are publicly readable"
ON public.competitors
FOR SELECT
USING (true);

-- Policy: Only admins can modify competitors
CREATE POLICY "Admins can manage competitors"
ON public.competitors
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Create indexes for filtering
CREATE INDEX idx_competitors_scope ON public.competitors(scope);
CREATE INDEX idx_competitors_region ON public.competitors(region);
CREATE INDEX idx_competitors_city ON public.competitors(city);