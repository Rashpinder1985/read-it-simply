-- MarketPulse Database Schema Migration
-- Creates tables for competitor tracking, locations, metrics, and analytics

-- Competitors table
CREATE TABLE IF NOT EXISTS competitors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  competitor_name TEXT NOT NULL UNIQUE,
  metal TEXT,
  use_category TEXT,
  region TEXT,
  business_type TEXT,
  category_focus TEXT,
  price_positioning TEXT,
  website TEXT,
  instagram_handle TEXT,
  facebook_account TEXT,
  store_count INTEGER DEFAULT 0,
  branch_count INTEGER DEFAULT 0,
  national_chain BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Competitor locations table
CREATE TABLE IF NOT EXISTS competitor_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  competitor_id UUID NOT NULL REFERENCES competitors(id) ON DELETE CASCADE,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  locality TEXT,
  pincode TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(competitor_id, city, state)
);

-- Competitor metrics (daily snapshots)
CREATE TABLE IF NOT EXISTS competitor_metrics_daily (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  competitor_id UUID NOT NULL REFERENCES competitors(id) ON DELETE CASCADE,
  snapshot_date DATE NOT NULL DEFAULT CURRENT_DATE,
  timeframe_window TEXT DEFAULT 'last_90_days',
  rating_avg DECIMAL(3,2),
  review_count INTEGER,
  market_presence_label TEXT CHECK (market_presence_label IN ('High', 'Medium', 'Low')),
  regional_presence_label TEXT,
  jewellery_specialization JSONB,
  sentiment_score_overall DECIMAL(5,2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(competitor_id, snapshot_date, timeframe_window)
);

-- Businesses table (if not exists)
CREATE TABLE IF NOT EXISTS businesses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_name TEXT NOT NULL,
  hq_city TEXT,
  hq_state TEXT,
  primary_category TEXT,
  target_segment TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Gold rates table (optional)
CREATE TABLE IF NOT EXISTS gold_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  captured_at TIMESTAMPTZ DEFAULT NOW(),
  gold_24k_per_10g DECIMAL(10,2),
  gold_22k_per_10g DECIMAL(10,2),
  gold_18k_per_10g DECIMAL(10,2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trends snapshot table (optional)
CREATE TABLE IF NOT EXISTS trends_snapshot (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  snapshot_at TIMESTAMPTZ DEFAULT NOW(),
  competitors_tracked INTEGER,
  ml_analysed INTEGER,
  sentiment_monitored INTEGER,
  prediction_confidence_label TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_competitors_name ON competitors(competitor_name);
CREATE INDEX IF NOT EXISTS idx_competitors_business_type ON competitors(business_type);
CREATE INDEX IF NOT EXISTS idx_competitors_national_chain ON competitors(national_chain);
CREATE INDEX IF NOT EXISTS idx_locations_competitor_id ON competitor_locations(competitor_id);
CREATE INDEX IF NOT EXISTS idx_locations_city_state ON competitor_locations(city, state);
CREATE INDEX IF NOT EXISTS idx_metrics_competitor_id ON competitor_metrics_daily(competitor_id);
CREATE INDEX IF NOT EXISTS idx_metrics_snapshot_date ON competitor_metrics_daily(snapshot_date DESC);
CREATE INDEX IF NOT EXISTS idx_businesses_user_id ON businesses(user_id);
CREATE INDEX IF NOT EXISTS idx_gold_rates_captured_at ON gold_rates(captured_at DESC);

-- Row Level Security (RLS) Policies
ALTER TABLE competitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE competitor_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE competitor_metrics_daily ENABLE ROW LEVEL SECURITY;
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE gold_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE trends_snapshot ENABLE ROW LEVEL SECURITY;

-- Policies: Allow authenticated users to read all competitor data
CREATE POLICY "Allow authenticated read on competitors" ON competitors
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated read on competitor_locations" ON competitor_locations
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated read on competitor_metrics_daily" ON competitor_metrics_daily
  FOR SELECT USING (auth.role() = 'authenticated');

-- Policies: Users can only manage their own business
CREATE POLICY "Users can manage own business" ON businesses
  FOR ALL USING (auth.uid() = user_id);

-- Policies: Gold rates and trends are public read
CREATE POLICY "Public read on gold_rates" ON gold_rates
  FOR SELECT USING (true);

CREATE POLICY "Public read on trends_snapshot" ON trends_snapshot
  FOR SELECT USING (true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_competitors_updated_at
  BEFORE UPDATE ON competitors
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_businesses_updated_at
  BEFORE UPDATE ON businesses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to calculate store_count and branch_count
CREATE OR REPLACE FUNCTION update_competitor_store_counts()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE competitors
  SET
    store_count = (
      SELECT COUNT(*)::int
      FROM competitor_locations
      WHERE competitor_id = NEW.competitor_id
    ),
    branch_count = GREATEST(
      (SELECT COUNT(*)::int FROM competitor_locations WHERE competitor_id = NEW.competitor_id) - 1,
      0
    ),
    national_chain = (
      SELECT COUNT(DISTINCT state)::int > 1
      FROM competitor_locations
      WHERE competitor_id = NEW.competitor_id
    )
  WHERE id = NEW.competitor_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update store counts when locations change
CREATE TRIGGER update_store_counts_on_location_change
  AFTER INSERT OR UPDATE OR DELETE ON competitor_locations
  FOR EACH ROW
  EXECUTE FUNCTION update_competitor_store_counts();

