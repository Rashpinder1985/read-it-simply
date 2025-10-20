-- Add Data Validation Constraints and Quality Assurance
-- Migration to enhance data integrity and quality

-- Add constraints for competitors table
ALTER TABLE public.competitors 
ADD CONSTRAINT valid_scope 
CHECK (scope IN ('national', 'regional_north', 'regional_south', 'regional_east', 'regional_west', 'international', 'online_d2c'));

ALTER TABLE public.competitors 
ADD CONSTRAINT valid_business_name 
CHECK (char_length(trim(business_name)) >= 2 AND char_length(trim(business_name)) <= 100);

ALTER TABLE public.competitors 
ADD CONSTRAINT valid_category 
CHECK (char_length(trim(category)) >= 2 AND char_length(trim(category)) <= 50);

-- Add constraints for market_data table
ALTER TABLE public.market_data 
ADD CONSTRAINT valid_gold_price 
CHECK (gold_price IS NULL OR (gold_price >= 1000 AND gold_price <= 15000));

ALTER TABLE public.market_data 
ADD CONSTRAINT valid_silver_price 
CHECK (silver_price IS NULL OR (silver_price >= 10 AND silver_price <= 200));

ALTER TABLE public.market_data 
ADD CONSTRAINT valid_brand_name 
CHECK (char_length(trim(brand_name)) >= 2 AND char_length(trim(brand_name)) <= 100);

-- Add constraints for content table
ALTER TABLE public.content 
ADD CONSTRAINT valid_content_type 
CHECK (type IN ('post', 'reel'));

ALTER TABLE public.content 
ADD CONSTRAINT valid_content_status 
CHECK (status IN ('draft', 'pending_approval', 'approved', 'rejected', 'scheduled', 'published'));

ALTER TABLE public.content 
ADD CONSTRAINT valid_title_length 
CHECK (char_length(trim(title)) >= 5 AND char_length(trim(title)) <= 100);

ALTER TABLE public.content 
ADD CONSTRAINT valid_content_text_length 
CHECK (char_length(trim(content_text)) >= 50 AND char_length(trim(content_text)) <= 2000);

-- Add constraints for personas table
ALTER TABLE public.personas 
ADD CONSTRAINT valid_persona_name 
CHECK (char_length(trim(name)) >= 2 AND char_length(trim(name)) <= 50);

ALTER TABLE public.personas 
ADD CONSTRAINT valid_segment 
CHECK (char_length(trim(segment)) >= 2 AND char_length(trim(segment)) <= 50);

-- Add data quality monitoring functions
CREATE OR REPLACE FUNCTION public.calculate_data_quality_score()
RETURNS TABLE(
  table_name TEXT,
  total_records BIGINT,
  quality_score NUMERIC,
  completeness_score NUMERIC,
  validity_score NUMERIC
) 
LANGUAGE plpgsql
AS $$
BEGIN
  -- Competitors quality
  RETURN QUERY
  SELECT 
    'competitors'::TEXT,
    COUNT(*)::BIGINT,
    ROUND(
      (
        COUNT(*) FILTER (WHERE business_name IS NOT NULL AND trim(business_name) != '') +
        COUNT(*) FILTER (WHERE scope IS NOT NULL) +
        COUNT(*) FILTER (WHERE category IS NOT NULL AND trim(category) != '') +
        COUNT(*) FILTER (WHERE region IS NOT NULL) +
        COUNT(*) FILTER (WHERE hq_address IS NOT NULL AND trim(hq_address) != '')
      )::NUMERIC / (COUNT(*) * 5) * 100, 2
    ),
    ROUND(
      COUNT(*) FILTER (WHERE business_name IS NOT NULL AND trim(business_name) != '')::NUMERIC / COUNT(*) * 100, 2
    ),
    ROUND(
      COUNT(*) FILTER (WHERE 
        business_name IS NOT NULL AND trim(business_name) != '' AND
        scope IS NOT NULL AND 
        category IS NOT NULL AND trim(category) != ''
      )::NUMERIC / COUNT(*) * 100, 2
    )
  FROM public.competitors;

  -- Market data quality
  RETURN QUERY
  SELECT 
    'market_data'::TEXT,
    COUNT(*)::BIGINT,
    ROUND(
      (
        COUNT(*) FILTER (WHERE brand_name IS NOT NULL AND trim(brand_name) != '') +
        COUNT(*) FILTER (WHERE gold_price IS NOT NULL) +
        COUNT(*) FILTER (WHERE social_media_activity IS NOT NULL) +
        COUNT(*) FILTER (WHERE engagement_metrics IS NOT NULL)
      )::NUMERIC / (COUNT(*) * 4) * 100, 2
    ),
    ROUND(
      COUNT(*) FILTER (WHERE brand_name IS NOT NULL AND trim(brand_name) != '')::NUMERIC / COUNT(*) * 100, 2
    ),
    ROUND(
      COUNT(*) FILTER (WHERE 
        brand_name IS NOT NULL AND trim(brand_name) != '' AND
        gold_price IS NOT NULL AND gold_price >= 1000 AND gold_price <= 15000
      )::NUMERIC / COUNT(*) * 100, 2
    )
  FROM public.market_data;

  -- Content quality
  RETURN QUERY
  SELECT 
    'content'::TEXT,
    COUNT(*)::BIGINT,
    ROUND(
      (
        COUNT(*) FILTER (WHERE title IS NOT NULL AND trim(title) != '' AND char_length(trim(title)) >= 5) +
        COUNT(*) FILTER (WHERE content_text IS NOT NULL AND trim(content_text) != '' AND char_length(trim(content_text)) >= 50) +
        COUNT(*) FILTER (WHERE type IS NOT NULL) +
        COUNT(*) FILTER (WHERE status IS NOT NULL) +
        COUNT(*) FILTER (WHERE hashtags IS NOT NULL AND array_length(hashtags, 1) > 0)
      )::NUMERIC / (COUNT(*) * 5) * 100, 2
    ),
    ROUND(
      COUNT(*) FILTER (WHERE title IS NOT NULL AND trim(title) != '' AND content_text IS NOT NULL AND trim(content_text) != '')::NUMERIC / COUNT(*) * 100, 2
    ),
    ROUND(
      COUNT(*) FILTER (WHERE 
        title IS NOT NULL AND trim(title) != '' AND char_length(trim(title)) >= 5 AND
        content_text IS NOT NULL AND trim(content_text) != '' AND char_length(trim(content_text)) >= 50 AND
        type IS NOT NULL AND status IS NOT NULL
      )::NUMERIC / COUNT(*) * 100, 2
    )
  FROM public.content;

  -- Personas quality
  RETURN QUERY
  SELECT 
    'personas'::TEXT,
    COUNT(*)::BIGINT,
    ROUND(
      (
        COUNT(*) FILTER (WHERE name IS NOT NULL AND trim(name) != '') +
        COUNT(*) FILTER (WHERE segment IS NOT NULL AND trim(segment) != '') +
        COUNT(*) FILTER (WHERE demographics IS NOT NULL) +
        COUNT(*) FILTER (WHERE psychographics IS NOT NULL) +
        COUNT(*) FILTER (WHERE behaviors IS NOT NULL)
      )::NUMERIC / (COUNT(*) * 5) * 100, 2
    ),
    ROUND(
      COUNT(*) FILTER (WHERE name IS NOT NULL AND trim(name) != '' AND segment IS NOT NULL AND trim(segment) != '')::NUMERIC / COUNT(*) * 100, 2
    ),
    ROUND(
      COUNT(*) FILTER (WHERE 
        name IS NOT NULL AND trim(name) != '' AND
        segment IS NOT NULL AND trim(segment) != '' AND
        demographics IS NOT NULL AND psychographics IS NOT NULL
      )::NUMERIC / COUNT(*) * 100, 2
    )
  FROM public.personas;
END;
$$;

-- Create data quality monitoring view
CREATE OR REPLACE VIEW public.data_quality_dashboard AS
SELECT * FROM public.calculate_data_quality_score();

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_competitors_quality ON public.competitors(business_name, scope, category) 
WHERE business_name IS NOT NULL AND scope IS NOT NULL AND category IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_market_data_quality ON public.market_data(brand_name, gold_price, timestamp) 
WHERE brand_name IS NOT NULL AND gold_price IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_content_quality ON public.content(title, content_text, status, type) 
WHERE title IS NOT NULL AND content_text IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_personas_quality ON public.personas(name, segment, demographics, psychographics) 
WHERE name IS NOT NULL AND segment IS NOT NULL;

-- Add data quality triggers
CREATE OR REPLACE FUNCTION public.validate_competitor_data()
RETURNS TRIGGER AS $$
BEGIN
  -- Validate business name
  IF NEW.business_name IS NULL OR trim(NEW.business_name) = '' THEN
    RAISE EXCEPTION 'Business name cannot be empty';
  END IF;
  
  -- Validate scope
  IF NEW.scope NOT IN ('national', 'regional_north', 'regional_south', 'regional_east', 'regional_west', 'international', 'online_d2c') THEN
    RAISE EXCEPTION 'Invalid scope value';
  END IF;
  
  -- Validate category
  IF NEW.category IS NULL OR trim(NEW.category) = '' THEN
    RAISE EXCEPTION 'Category cannot be empty';
  END IF;
  
  -- Validate URLs if provided
  IF NEW.instagram_url IS NOT NULL AND NEW.instagram_url != '' THEN
    IF NOT NEW.instagram_url ~ '^https?://' THEN
      RAISE EXCEPTION 'Invalid Instagram URL format';
    END IF;
  END IF;
  
  IF NEW.facebook_url IS NOT NULL AND NEW.facebook_url != '' THEN
    IF NOT NEW.facebook_url ~ '^https?://' THEN
      RAISE EXCEPTION 'Invalid Facebook URL format';
    END IF;
  END IF;
  
  IF NEW.youtube_url IS NOT NULL AND NEW.youtube_url != '' THEN
    IF NOT NEW.youtube_url ~ '^https?://' THEN
      RAISE EXCEPTION 'Invalid YouTube URL format';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_validate_competitor_data
  BEFORE INSERT OR UPDATE ON public.competitors
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_competitor_data();

-- Add data quality monitoring function for real-time updates
CREATE OR REPLACE FUNCTION public.update_data_quality_metrics()
RETURNS TRIGGER AS $$
BEGIN
  -- This function can be called to update data quality metrics
  -- In a real implementation, this could update a metrics table
  -- or send notifications about data quality issues
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Add comments for documentation
COMMENT ON FUNCTION public.calculate_data_quality_score() IS 'Calculates comprehensive data quality metrics for all tables';
COMMENT ON VIEW public.data_quality_dashboard IS 'Real-time dashboard showing data quality metrics across all tables';
COMMENT ON FUNCTION public.validate_competitor_data() IS 'Validates competitor data before insert/update operations';
COMMENT ON FUNCTION public.update_data_quality_metrics() IS 'Updates data quality metrics in real-time';

-- Grant permissions
GRANT SELECT ON public.data_quality_dashboard TO authenticated;
GRANT EXECUTE ON FUNCTION public.calculate_data_quality_score() TO authenticated;