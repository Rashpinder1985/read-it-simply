-- Add instagram_handle column to market_data table
ALTER TABLE public.market_data
ADD COLUMN IF NOT EXISTS instagram_handle TEXT;

-- Update existing data with generated Instagram handles
UPDATE public.market_data
SET instagram_handle = LOWER(REPLACE(REGEXP_REPLACE(brand_name, '[^a-zA-Z0-9\s]', '', 'g'), ' ', ''))
WHERE instagram_handle IS NULL;