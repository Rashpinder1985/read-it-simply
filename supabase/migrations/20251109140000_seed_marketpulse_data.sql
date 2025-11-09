-- Import CSV data into Supabase MarketPulse tables
-- This script imports competitor data from the CSV knowledge base

-- Step 1: Create sample competitors from CSV data
-- (We'll insert competitors, locations, and metrics)

-- Sample data for Mumbai/Maharashtra (for testing)
INSERT INTO competitors (competitor_name, metal, use_category, region, business_type, price_positioning, website, instagram_handle, facebook_account, national_chain)
VALUES
  ('Tanishq', 'Multi-Metal', 'General', 'Pan-India', 'Chain', 'premium', 'https://www.tanishq.co.in', 'tanishq', 'Tanishq', true),
  ('Malabar Gold & Diamonds', 'Multi-Metal', 'General', 'Pan-India', 'Chain', 'premium', 'https://www.malabargoldanddiamonds.com', 'malabargold', 'MalabarGold', true),
  ('Kalyan Jewellers', 'Multi-Metal', 'General', 'Pan-India', 'Chain', 'premium', 'https://www.kalyanjewellers.net', 'kalyanjewellers', 'KalyanJewellers', true),
  ('PC Jeweller', 'Multi-Metal', 'General', 'Pan-India', 'Chain', 'premium', 'https://www.pcjeweller.com', 'pcjeweller', 'PCJeweller', true),
  ('Reliance Jewels', 'Multi-Metal', 'General', 'Pan-India', 'Chain', 'mid-range', 'https://www.relianceretail.com', 'relianceretail', 'RelianceRetail', true),
  ('CaratLane', 'Diamond', 'Contemporary', 'Pan-India', 'Chain', 'mid-range', 'https://www.caratlane.com', 'caratlane', 'CaratLane', true),
  ('Melorra', 'Multi-Metal', 'Contemporary', 'Pan-India', 'Chain', 'mid-range', 'https://www.melorra.com', 'melorra', 'Melorra', true),
  ('Bluestone', 'Diamond', 'Contemporary', 'Pan-India', 'Chain', 'mid-range', 'https://www.bluestone.com', 'bluestone', 'Bluestone', true),
  ('Senco Gold & Diamonds', 'Multi-Metal', 'General', 'Pan-India', 'Chain', 'premium', 'https://www.sencogold.com', 'sencogold', 'SencoGold', true),
  ('Joyalukkas', 'Multi-Metal', 'General', 'Pan-India', 'Chain', 'premium', 'https://www.joyalukkas.com', 'joyalukkas', 'Joyalukkas', true)
ON CONFLICT (competitor_name) DO NOTHING;

-- Step 2: Get competitor IDs and create locations
DO $$
DECLARE
  comp_record RECORD;
  comp_id UUID;
BEGIN
  FOR comp_record IN SELECT competitor_name FROM competitors WHERE competitor_name IN ('Tanishq', 'Malabar Gold & Diamonds', 'Kalyan Jewellers', 'PC Jeweller', 'Reliance Jewels', 'CaratLane', 'Melorra', 'Bluestone', 'Senco Gold & Diamonds', 'Joyalukkas')
  LOOP
    SELECT id INTO comp_id FROM competitors WHERE competitor_name = comp_record.competitor_name;
    
    -- Add Mumbai locations
    INSERT INTO competitor_locations (competitor_id, city, state, locality)
    VALUES 
      (comp_id, 'Mumbai', 'Maharashtra', 'Bandra West'),
      (comp_id, 'Mumbai', 'Maharashtra', 'Andheri West'),
      (comp_id, 'Mumbai', 'Maharashtra', 'Powai')
    ON CONFLICT (competitor_id, city, state) DO NOTHING;
    
    -- Add some other Maharashtra cities
    INSERT INTO competitor_locations (competitor_id, city, state, locality)
    VALUES 
      (comp_id, 'Pune', 'Maharashtra', 'Koregaon Park'),
      (comp_id, 'Nagpur', 'Maharashtra', 'Sitabuldi')
    ON CONFLICT (competitor_id, city, state) DO NOTHING;
  END LOOP;
END $$;

-- Step 3: Add metrics for competitors
DO $$
DECLARE
  comp_record RECORD;
  comp_id UUID;
  rating_val DECIMAL;
  review_count_val INTEGER;
  presence_label TEXT;
BEGIN
  FOR comp_record IN SELECT competitor_name FROM competitors WHERE competitor_name IN ('Tanishq', 'Malabar Gold & Diamonds', 'Kalyan Jewellers', 'PC Jeweller', 'Reliance Jewels', 'CaratLane', 'Melorra', 'Bluestone', 'Senco Gold & Diamonds', 'Joyalukkas')
  LOOP
    SELECT id INTO comp_id FROM competitors WHERE competitor_name = comp_record.competitor_name;
    
    -- Assign ratings and reviews based on competitor
    CASE comp_record.competitor_name
      WHEN 'Tanishq' THEN rating_val := 4.7; review_count_val := 5000; presence_label := 'High';
      WHEN 'Malabar Gold & Diamonds' THEN rating_val := 4.6; review_count_val := 4500; presence_label := 'High';
      WHEN 'Kalyan Jewellers' THEN rating_val := 4.5; review_count_val := 4000; presence_label := 'High';
      WHEN 'PC Jeweller' THEN rating_val := 4.4; review_count_val := 3500; presence_label := 'High';
      WHEN 'Reliance Jewels' THEN rating_val := 4.3; review_count_val := 2000; presence_label := 'Medium';
      WHEN 'CaratLane' THEN rating_val := 4.6; review_count_val := 3000; presence_label := 'High';
      WHEN 'Melorra' THEN rating_val := 4.5; review_count_val := 2500; presence_label := 'Medium';
      WHEN 'Bluestone' THEN rating_val := 4.4; review_count_val := 2800; presence_label := 'Medium';
      WHEN 'Senco Gold & Diamonds' THEN rating_val := 4.5; review_count_val := 3200; presence_label := 'High';
      WHEN 'Joyalukkas' THEN rating_val := 4.6; review_count_val := 3800; presence_label := 'High';
      ELSE rating_val := 4.0; review_count_val := 100; presence_label := 'Low';
    END CASE;
    
    INSERT INTO competitor_metrics_daily (competitor_id, snapshot_date, timeframe_window, rating_avg, review_count, market_presence_label)
    VALUES (comp_id, CURRENT_DATE, 'last_90_days', rating_val, review_count_val, presence_label)
    ON CONFLICT (competitor_id, snapshot_date, timeframe_window) DO UPDATE
      SET rating_avg = EXCLUDED.rating_avg,
          review_count = EXCLUDED.review_count,
          market_presence_label = EXCLUDED.market_presence_label;
  END LOOP;
END $$;

-- Step 4: Add some local Mumbai competitors
INSERT INTO competitors (competitor_name, metal, use_category, region, business_type, price_positioning, national_chain)
VALUES
  ('Mumbai Gold Centre', 'Gold', 'Bridal', 'Maharashtrian', 'Showroom', 'mid-range', false),
  ('Rajesh Jewellers', 'Multi-Metal', 'General', 'Maharashtrian', 'Showroom', 'mid-range', false),
  ('Shree Ganesh Jewellers', 'Gold', 'Temple', 'Maharashtrian', 'Showroom', 'affordable', false),
  ('Diamond Palace', 'Diamond', 'Contemporary', 'Pan-India', 'Showroom', 'premium', false),
  ('Gold Palace', 'Gold', 'Bridal', 'Maharashtrian', 'Showroom', 'mid-range', false)
ON CONFLICT (competitor_name) DO NOTHING;

-- Add locations for local competitors
DO $$
DECLARE
  comp_record RECORD;
  comp_id UUID;
BEGIN
  FOR comp_record IN SELECT competitor_name FROM competitors WHERE competitor_name IN ('Mumbai Gold Centre', 'Rajesh Jewellers', 'Shree Ganesh Jewellers', 'Diamond Palace', 'Gold Palace')
  LOOP
    SELECT id INTO comp_id FROM competitors WHERE competitor_name = comp_record.competitor_name;
    
    INSERT INTO competitor_locations (competitor_id, city, state, locality)
    VALUES (comp_id, 'Mumbai', 'Maharashtra', 'Bandra')
    ON CONFLICT (competitor_id, city, state) DO NOTHING;
    
    -- Add metrics
    INSERT INTO competitor_metrics_daily (competitor_id, snapshot_date, timeframe_window, rating_avg, review_count, market_presence_label)
    VALUES (comp_id, CURRENT_DATE, 'last_90_days', 4.2 + (RANDOM() * 0.5), 100 + (RANDOM() * 400)::INTEGER, 'Medium')
    ON CONFLICT (competitor_id, snapshot_date, timeframe_window) DO UPDATE
      SET rating_avg = EXCLUDED.rating_avg,
          review_count = EXCLUDED.review_count;
  END LOOP;
END $$;

-- Step 5: Add gold rates
INSERT INTO gold_rates (captured_at, gold_24k_per_10g, gold_22k_per_10g, gold_18k_per_10g)
VALUES 
  (NOW(), 65000.00, 59500.00, 48750.00),
  (NOW() - INTERVAL '1 day', 64800.00, 59300.00, 48600.00),
  (NOW() - INTERVAL '2 days', 65200.00, 59700.00, 48900.00)
ON CONFLICT DO NOTHING;

-- Step 6: Add trends snapshot
INSERT INTO trends_snapshot (snapshot_at, competitors_tracked, ml_analysed, sentiment_monitored, prediction_confidence_label)
VALUES (NOW(), 15, 12, 10, 'High')
ON CONFLICT DO NOTHING;

-- Summary
SELECT 
  'Competitors created: ' || COUNT(*)::TEXT as summary
FROM competitors;

SELECT 
  'Locations created: ' || COUNT(*)::TEXT as summary
FROM competitor_locations;

SELECT 
  'Metrics created: ' || COUNT(*)::TEXT as summary
FROM competitor_metrics_daily;

