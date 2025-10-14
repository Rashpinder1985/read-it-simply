-- Create enum for content status
CREATE TYPE content_status AS ENUM ('draft', 'pending_approval', 'approved', 'rejected', 'scheduled', 'published');

-- Create enum for content type
CREATE TYPE content_type AS ENUM ('post', 'reel');

-- Create personas table
CREATE TABLE public.personas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  segment TEXT NOT NULL,
  demographics JSONB,
  psychographics JSONB,
  behaviors JSONB,
  pain_points TEXT[],
  goals TEXT[],
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create market_data table for competitor tracking
CREATE TABLE public.market_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_name TEXT NOT NULL,
  category TEXT,
  gold_price DECIMAL(10,2),
  silver_price DECIMAL(10,2),
  product_innovation TEXT,
  major_update TEXT,
  social_media_activity JSONB,
  engagement_metrics JSONB,
  timestamp TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create content table
CREATE TABLE public.content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type content_type NOT NULL,
  persona_id UUID REFERENCES public.personas(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  content_text TEXT NOT NULL,
  media_url TEXT,
  hashtags TEXT[],
  status content_status DEFAULT 'draft',
  scheduled_for TIMESTAMPTZ,
  approved_by TEXT,
  approved_at TIMESTAMPTZ,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.personas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.market_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content ENABLE ROW LEVEL SECURITY;

-- Create policies (public read for now since no auth yet)
CREATE POLICY "Allow public read for personas" ON public.personas FOR SELECT USING (true);
CREATE POLICY "Allow public insert for personas" ON public.personas FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update for personas" ON public.personas FOR UPDATE USING (true);

CREATE POLICY "Allow public read for market_data" ON public.market_data FOR SELECT USING (true);
CREATE POLICY "Allow public insert for market_data" ON public.market_data FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update for market_data" ON public.market_data FOR UPDATE USING (true);

CREATE POLICY "Allow public read for content" ON public.content FOR SELECT USING (true);
CREATE POLICY "Allow public insert for content" ON public.content FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update for content" ON public.content FOR UPDATE USING (true);
CREATE POLICY "Allow public delete for content" ON public.content FOR DELETE USING (true);

-- Create triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_personas_updated_at BEFORE UPDATE ON public.personas
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_content_updated_at BEFORE UPDATE ON public.content
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add realtime support
ALTER PUBLICATION supabase_realtime ADD TABLE public.personas;
ALTER PUBLICATION supabase_realtime ADD TABLE public.market_data;
ALTER PUBLICATION supabase_realtime ADD TABLE public.content;

-- Insert sample personas
INSERT INTO public.personas (name, segment, demographics, psychographics, behaviors, pain_points, goals) VALUES
('The Modern Minimalist', 'Young Professionals', 
 '{"age_range": "25-35", "income": "₹8L-15L", "location": "Metro cities", "gender": "All"}'::jsonb,
 '{"values": ["Sustainability", "Quality over quantity", "Timeless design"], "lifestyle": "Urban, career-focused"}'::jsonb,
 '{"shopping": "Research-heavy, online-first", "social_media": "Instagram, Pinterest", "purchase_frequency": "Quarterly"}'::jsonb,
 ARRAY['Finding ethically sourced jewelry', 'Avoiding trend-based purchases'],
 ARRAY['Build a capsule jewelry collection', 'Express personal style subtly']
),
('The Traditional Bride', 'Wedding Shoppers', 
 '{"age_range": "22-30", "income": "₹5L-25L", "location": "Tier 1 & 2 cities", "gender": "Female"}'::jsonb,
 '{"values": ["Family tradition", "Cultural significance", "Auspicious occasions"], "lifestyle": "Family-oriented"}'::jsonb,
 '{"shopping": "Family involvement, in-store preference", "social_media": "WhatsApp, Facebook", "purchase_frequency": "Life events"}'::jsonb,
 ARRAY['Overwhelming choices', 'Budget vs expectations', 'Timing purchases'],
 ARRAY['Find perfect bridal jewelry', 'Honor family traditions', 'Stay within budget']
),
('The Investment Buyer', 'Wealth Builders', 
 '{"age_range": "35-55", "income": "₹20L+", "location": "All cities", "gender": "All"}'::jsonb,
 '{"values": ["Wealth preservation", "Gold as security", "Legacy"], "lifestyle": "Financially savvy"}'::jsonb,
 '{"shopping": "Price-conscious, festive buying", "social_media": "LinkedIn, Economic Times", "purchase_frequency": "Akshaya Tritiya, Dhanteras"}'::jsonb,
 ARRAY['Price volatility', 'Purity concerns', 'Storage security'],
 ARRAY['Build gold portfolio', 'Time purchases optimally', 'Ensure authenticity']
);

-- Insert sample market data
INSERT INTO public.market_data (brand_name, category, gold_price, silver_price, product_innovation, major_update, social_media_activity, engagement_metrics) VALUES
('Tanishq', 'Premium', 6850.00, 82.50, 'Lab-grown diamond collection launch', 'New store opening in Bangalore', 
 '{"posts_today": 4, "platform": "Instagram", "latest_campaign": "Diwali Collection 2025"}'::jsonb,
 '{"likes": 15420, "comments": 892, "shares": 234}'::jsonb
),
('CaratLane', 'Online-First', 6835.00, 82.30, 'AR try-on for earrings', 'Partnership with celebrity designer', 
 '{"posts_today": 6, "platform": "Instagram", "latest_campaign": "Everyday Elegance"}'::jsonb,
 '{"likes": 22100, "comments": 1203, "shares": 445}'::jsonb
),
('Malabar Gold', 'Traditional', 6845.00, 82.45, 'Temple jewelry revival collection', 'Expansion to USA market', 
 '{"posts_today": 3, "platform": "Facebook", "latest_campaign": "Akshaya Tritiya Special"}'::jsonb,
 '{"likes": 18900, "comments": 756, "shares": 312}'::jsonb
),
('Bluestone', 'Digital', 6840.00, 82.35, 'AI-powered design customization', 'Same-day delivery in metro cities', 
 '{"posts_today": 5, "platform": "Instagram", "latest_campaign": "Smart Shopping Festival"}'::jsonb,
 '{"likes": 19200, "comments": 1045, "shares": 389}'::jsonb
);

-- Insert sample content
INSERT INTO public.content (type, persona_id, title, description, content_text, hashtags, status) 
SELECT 
  'post',
  (SELECT id FROM public.personas WHERE name = 'The Modern Minimalist' LIMIT 1),
  'Minimalist Gold Chains for Everyday Elegance',
  'Discover timeless pieces that elevate any outfit',
  'Less is more when it comes to everyday jewelry. Our delicate gold chains are crafted for the modern professional who values subtle sophistication. Each piece is ethically sourced and designed to last a lifetime. Shop our minimalist collection today.',
  ARRAY['#MinimalistJewelry', '#EverydayElegance', '#SustainableGold', '#TimelessDesign', '#ModernGold'],
  'pending_approval';

INSERT INTO public.content (type, persona_id, title, description, content_text, hashtags, status) 
SELECT 
  'reel',
  (SELECT id FROM public.personas WHERE name = 'The Traditional Bride' LIMIT 1),
  '5 Must-Have Pieces for Your Bridal Jewelry Collection',
  'Complete bridal jewelry guide',
  'Planning your bridal look? Here are the essential pieces every bride needs: 1) Temple necklace set 2) Matching earrings 3) Bangles or kada 4) Maang tikka 5) Nath (nose ring). Visit us to create your perfect bridal ensemble.',
  ARRAY['#BridalJewelry', '#WeddingEssentials', '#BridalCollection', '#IndianWedding', '#BridalGold'],
  'pending_approval';

INSERT INTO public.content (type, persona_id, title, description, content_text, hashtags, status) 
SELECT 
  'post',
  (SELECT id FROM public.personas WHERE name = 'The Investment Buyer' LIMIT 1),
  'Akshaya Tritiya 2025: Smart Gold Buying Guide',
  'Make informed gold investments this festive season',
  'This Akshaya Tritiya, invest wisely. Current gold rate: ₹6,840/gram. Our certified 22K gold coins come with buyback guarantee. Limited period: Zero making charges on gold purchases above 50g. Book your appointment today.',
  ARRAY['#AkshayaTritiya', '#GoldInvestment', '#SmartBuying', '#GoldCoins', '#WealthBuilding'],
  'draft';

INSERT INTO public.content (type, persona_id, title, description, content_text, hashtags, status) 
SELECT 
  'reel',
  (SELECT id FROM public.personas WHERE name = 'The Modern Minimalist' LIMIT 1),
  'How to Layer Delicate Necklaces Like a Pro',
  'Styling tips for minimalist jewelry lovers',
  'Master the art of layering! Start with a choker, add a 16" chain, finish with an 18" pendant. Mix textures and lengths for dimension. Pro tip: Stick to one metal family for a cohesive look. Shop our layering sets.',
  ARRAY['#JewelryLayering', '#NecklaceStack', '#MinimalistStyle', '#JewelryTips', '#GoldLayers'],
  'approved';

INSERT INTO public.content (type, persona_id, title, description, content_text, hashtags, status) 
SELECT 
  'post',
  (SELECT id FROM public.personas WHERE name = 'The Traditional Bride' LIMIT 1),
  'South Indian Temple Jewelry: Timeless Tradition',
  'Heritage designs for modern brides',
  'Celebrate your roots with our exquisite temple jewelry collection. Handcrafted by master artisans, each piece tells a story of Indian heritage. From Lakshmi Devi motifs to peacock designs. Perfect for your wedding day.',
  ARRAY['#TempleJewelry', '#SouthIndianWedding', '#HeritageJewelry', '#TraditionalGold', '#BridalHeritage'],
  'approved';