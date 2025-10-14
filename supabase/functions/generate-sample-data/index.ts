import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { userId, businessName } = await req.json();

    console.log('Generating sample data for user:', userId, 'Business:', businessName);

    // Create sample personas for jewelry business
    const personas = [
      {
        user_id: userId,
        name: "Affluent Bride-to-Be",
        segment: "High-Value Wedding Customers",
        demographics: {
          age: "25-35",
          income: "₹15L+ annually",
          location: "Tier 1 cities",
          occupation: "Professionals, Entrepreneurs"
        },
        psychographics: {
          values: ["Quality", "Tradition", "Status"],
          interests: ["Weddings", "Fashion", "Luxury"],
          lifestyle: "Premium, Brand-conscious"
        },
        behaviors: {
          shopping_pattern: "Research-intensive, Multiple visits",
          channel_preference: "Instagram, Wedding blogs, Store visits",
          decision_factors: ["Design uniqueness", "Brand reputation", "Customization"]
        },
        goals: ["Find perfect wedding jewelry", "Balance tradition with modern style"],
        pain_points: ["High prices", "Limited customization", "Trust concerns"]
      },
      {
        user_id: userId,
        name: "Festival Shopper",
        segment: "Seasonal Occasion Buyers",
        demographics: {
          age: "30-50",
          income: "₹8-15L annually",
          location: "All tiers",
          occupation: "Middle-class families"
        },
        psychographics: {
          values: ["Tradition", "Family", "Auspiciousness"],
          interests: ["Festivals", "Cultural events", "Investment"],
          lifestyle: "Traditional, Value-conscious"
        },
        behaviors: {
          shopping_pattern: "Seasonal purchases (Diwali, Akshaya Tritiya)",
          channel_preference: "Facebook, WhatsApp, Local stores",
          decision_factors: ["Gold purity", "Price", "Auspicious timing"]
        },
        goals: ["Buy gold for Diwali/festivals", "Investment in gold"],
        pain_points: ["Price volatility", "Authenticity concerns", "Limited designs"]
      },
      {
        user_id: userId,
        name: "Young Professional",
        segment: "Daily Wear & Gifting",
        demographics: {
          age: "22-32",
          income: "₹5-10L annually",
          location: "Urban areas",
          occupation: "Working professionals"
        },
        psychographics: {
          values: ["Style", "Convenience", "Affordability"],
          interests: ["Fashion", "Social media", "Gifting"],
          lifestyle: "Modern, Trend-following"
        },
        behaviors: {
          shopping_pattern: "Impulse buys, Online shopping",
          channel_preference: "Instagram, Online stores, Quick delivery",
          decision_factors: ["Design", "Price", "Convenience"]
        },
        goals: ["Daily wear jewelry", "Gifts for occasions"],
        pain_points: ["High prices for gold", "Limited lightweight options"]
      }
    ];

    const { data: personasData, error: personasError } = await supabaseClient
      .from('personas')
      .insert(personas)
      .select();

    if (personasError) throw personasError;

    // Create sample market data for Indian jewelry brands
    const marketData = [
      {
        user_id: userId,
        brand_name: "Tanishq",
        category: "Premium Jewelry",
        gold_price: 7500,
        silver_price: 95,
        social_media_activity: {
          instagram_followers: "2.5M",
          engagement_rate: "4.2%",
          recent_campaigns: ["Diwali Collection 2024", "Bridal Heritage"]
        },
        engagement_metrics: {
          likes_avg: 15000,
          comments_avg: 500,
          shares_avg: 200
        },
        major_update: "Launched sustainable gold collection",
        product_innovation: "Digital gold investment platform"
      },
      {
        user_id: userId,
        brand_name: "PC Jeweller",
        category: "Mid-Premium Jewelry",
        gold_price: 7450,
        silver_price: 93,
        social_media_activity: {
          instagram_followers: "850K",
          engagement_rate: "3.1%",
          recent_campaigns: ["Akshaya Tritiya Special", "Lightweight Gold"]
        },
        engagement_metrics: {
          likes_avg: 5000,
          comments_avg: 150,
          shares_avg: 80
        },
        major_update: "Expanded to 20 new cities",
        product_innovation: "24-hour gold price lock guarantee"
      },
      {
        user_id: userId,
        brand_name: "Kalyan Jewellers",
        category: "Traditional Jewelry",
        gold_price: 7480,
        silver_price: 94,
        social_media_activity: {
          instagram_followers: "1.2M",
          engagement_rate: "3.8%",
          recent_campaigns: ["Wedding Collection", "Temple Jewelry"]
        },
        engagement_metrics: {
          likes_avg: 8000,
          comments_avg: 300,
          shares_avg: 150
        },
        major_update: "Partnership with Amitabh Bachchan for Diwali campaign",
        product_innovation: "Antique jewelry restoration service"
      }
    ];

    const { error: marketError } = await supabaseClient
      .from('market_data')
      .insert(marketData);

    if (marketError) throw marketError;

    // Create sample content for next 2 weeks
    const today = new Date();
    const sampleContent = [];

    for (let i = 0; i < 14; i++) {
      const scheduleDate = new Date(today);
      scheduleDate.setDate(today.getDate() + i);
      scheduleDate.setHours(i % 2 === 0 ? 10 : 17, 0, 0, 0);

      const contentTypes = ['post', 'reel'];
      const type = contentTypes[i % 2];
      const personaId = personasData[i % 3].id;

      sampleContent.push({
        user_id: userId,
        persona_id: personaId,
        type: type,
        status: 'approved',
        title: type === 'post' 
          ? `Diwali Special Day ${i + 1}` 
          : `Reel: Festival Collection ${i + 1}`,
        description: type === 'post'
          ? `Celebrate Diwali with our stunning ${i % 2 === 0 ? 'gold' : 'diamond'} collection`
          : `Watch our latest festival collection showcase`,
        content_text: type === 'post'
          ? `✨ This Diwali, shine brighter than ever! ✨\n\nDiscover our exclusive ${i % 2 === 0 ? 'gold' : 'diamond'} collection designed for the festival of lights.\n\n${businessName || 'Golden treasures'} brings you timeless elegance meets modern design.\n\n🪔 Limited time offer\n💎 Certified purity guaranteed\n🎁 Special festive discounts`
          : `Create stunning reels showcasing our ${i % 3 === 0 ? 'bridal' : i % 3 === 1 ? 'festival' : 'daily wear'} collection`,
        hashtags: ["#Diwali2024", "#JewelryLove", "#GoldJewelry", "#FestiveCollection", `#${(businessName || 'GoldenTreasures').replace(/\s/g, '')}`],
        scheduled_for: scheduleDate.toISOString()
      });
    }

    const { error: contentError } = await supabaseClient
      .from('content')
      .insert(sampleContent);

    if (contentError) throw contentError;

    console.log('Sample data generated successfully');

    return new Response(
      JSON.stringify({ success: true, message: 'Sample data generated' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error generating sample data:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );
  }
});