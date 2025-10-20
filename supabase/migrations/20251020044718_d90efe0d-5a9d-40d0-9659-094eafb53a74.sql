-- Add competitor analysis and social media tracking fields
ALTER TABLE public.market_data
ADD COLUMN IF NOT EXISTS market_analysis jsonb DEFAULT '{}',
ADD COLUMN IF NOT EXISTS social_media_links jsonb DEFAULT '{}',
ADD COLUMN IF NOT EXISTS ten_year_data jsonb DEFAULT '[]',
ADD COLUMN IF NOT EXISTS competitor_insights text;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_market_data_brand ON public.market_data(brand_name);
CREATE INDEX IF NOT EXISTS idx_market_data_timestamp ON public.market_data(timestamp DESC);