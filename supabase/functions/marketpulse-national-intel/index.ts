import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get auth token
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Authorization header required");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error("Unauthorized");
    }

    const url = new URL(req.url);
    const businessId = url.searchParams.get("business_id");

    if (!businessId) {
      return new Response(
        JSON.stringify({ error: "business_id is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get business details
    const { data: business, error: bizError } = await supabase
      .from("businesses")
      .select("hq_city, hq_state, primary_category")
      .eq("id", businessId)
      .eq("user_id", user.id)
      .single();

    if (bizError || !business) {
      return new Response(
        JSON.stringify({ error: "Business not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 1. Calculate Market Share by Region
    const marketShareByRegion = await calculateMarketShareByRegion(supabase);

    // 2. Calculate Expansion Velocity
    const expansionTrends = await calculateExpansionVelocity(supabase);

    // 3. Threat Assessment Matrix
    const threatMatrix = await assessCompetitiveThreat(supabase, businessId, business.hq_city, business.hq_state);

    // 4. Market Gap Analysis
    const marketGaps = await identifyMarketGaps(supabase);

    // 5. Sentiment Breakdown
    const sentimentInsights = await analyzeSentimentBreakdown(supabase);

    const response = {
      business_intelligence: {
        market_share_by_region: marketShareByRegion,
        expansion_trends: expansionTrends,
        threat_matrix: threatMatrix,
        sentiment_insights: sentimentInsights
      },
      strategic_opportunities: {
        market_gaps: marketGaps,
        top_opportunities: marketGaps.slice(0, 5)
      },
      summary: {
        total_national_chains: threatMatrix.length,
        immediate_threats: threatMatrix.filter((t: any) => t.presence.threat_level === 'IMMEDIATE').length,
        high_threats: threatMatrix.filter((t: any) => t.presence.threat_level === 'HIGH').length,
        untapped_segments: marketGaps.filter((g: any) => g.opportunity_level === 'HIGH').length
      }
    };

    return new Response(
      JSON.stringify(response),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error("Error in marketpulse-national-intel:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});

// Helper Functions
async function calculateMarketShareByRegion(supabase: any) {
  // Get all chains
  const { data: chains } = await supabase
    .from("competitors")
    .select("id, competitor_name, region, business_type")
    .eq("business_type", "Chain");

  if (!chains || chains.length === 0) return {};

  const chainIds = chains.map((c: any) => c.id);

  // Get locations for chains
  const { data: locations } = await supabase
    .from("competitor_locations")
    .select("competitor_id, state")
    .in("competitor_id", chainIds);

  // Get latest metrics
  const { data: metrics } = await supabase
    .from("competitor_metrics_daily")
    .select("competitor_id, review_count, snapshot_date")
    .in("competitor_id", chainIds)
    .order("snapshot_date", { ascending: false });

  // Get latest metrics per competitor
  const latestMetrics = new Map();
  metrics?.forEach((m: any) => {
    if (!latestMetrics.has(m.competitor_id) || 
        new Date(m.snapshot_date) > new Date(latestMetrics.get(m.competitor_id).snapshot_date)) {
      latestMetrics.set(m.competitor_id, m);
    }
  });

  // Calculate regional breakdown
  const regionalBreakdown: Record<string, any[]> = {};
  const regionTotals: Record<string, { stores: number; reviews: number }> = {};

  chains.forEach((chain: any) => {
    const chainLocations = locations?.filter((l: any) => l.competitor_id === chain.id) || [];
    const storeCount = chainLocations.length;
    const reviewCount = latestMetrics.get(chain.id)?.review_count || 0;
    const region = chain.region || "Pan-India";

    if (!regionalBreakdown[region]) {
      regionalBreakdown[region] = [];
      regionTotals[region] = { stores: 0, reviews: 0 };
    }

    regionalBreakdown[region].push({
      competitor: chain.competitor_name,
      store_count: storeCount,
      review_count: parseInt(reviewCount),
    });

    regionTotals[region].stores += storeCount;
    regionTotals[region].reviews += parseInt(reviewCount);
  });

  // Calculate market share percentages
  const byRegion: Record<string, any[]> = {};
  Object.entries(regionalBreakdown).forEach(([region, competitors]) => {
    const total = regionTotals[region].stores;
    byRegion[region] = competitors.map(comp => ({
      ...comp,
      market_share: total > 0 ? parseFloat(((comp.store_count / total) * 100).toFixed(2)) : 0
    })).sort((a, b) => b.market_share - a.market_share);
  });

  return byRegion;
}

async function calculateExpansionVelocity(supabase: any) {
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

  // Get all chains
  const { data: chains } = await supabase
    .from("competitors")
    .select("id, competitor_name")
    .eq("business_type", "Chain");

  if (!chains) return [];

  const chainIds = chains.map((c: any) => c.id);

  // Get all locations for chains
  const { data: allLocations } = await supabase
    .from("competitor_locations")
    .select("competitor_id, created_at")
    .in("competitor_id", chainIds);

  const expansionData = chains.map((chain: any) => {
    const chainLocations = allLocations?.filter((l: any) => l.competitor_id === chain.id) || [];
    const currentStoreCount = chainLocations.length;
    const storesLast6mo = chainLocations.filter((l: any) => 
      new Date(l.created_at) > sixMonthsAgo
    ).length;
    const storesLastYear = chainLocations.filter((l: any) => 
      new Date(l.created_at) > oneYearAgo
    ).length;

    return {
      competitor: chain.competitor_name,
      total_stores: currentStoreCount,
      added_last_6mo: storesLast6mo,
      added_last_year: storesLastYear,
      velocity_score: storesLast6mo
    };
  });

  return expansionData.sort((a, b) => b.velocity_score - a.velocity_score);
}

async function assessCompetitiveThreat(supabase: any, businessId: string, userCity: string, userState: string) {
  // Get all chains
  const { data: chains } = await supabase
    .from("competitors")
    .select("id, competitor_name, metal, use_category, region, business_type")
    .eq("business_type", "Chain");

  if (!chains || chains.length === 0) return [];

  const chainIds = chains.map((c: any) => c.id);

  // Get locations
  const { data: locations } = await supabase
    .from("competitor_locations")
    .select("competitor_id, city, state")
    .in("competitor_id", chainIds);

  // Get latest metrics
  const { data: metrics } = await supabase
    .from("competitor_metrics_daily")
    .select("competitor_id, rating_avg, review_count, snapshot_date")
    .in("competitor_id", chainIds)
    .order("snapshot_date", { ascending: false });

  const latestMetrics = new Map();
  metrics?.forEach((m: any) => {
    if (!latestMetrics.has(m.competitor_id) || 
        new Date(m.snapshot_date) > new Date(latestMetrics.get(m.competitor_id).snapshot_date)) {
      latestMetrics.set(m.competitor_id, m);
    }
  });

  const threatAssessment = chains.map((chain: any) => {
    const chainLocations = locations?.filter((l: any) => l.competitor_id === chain.id) || [];
    const storeCount = chainLocations.length;
    const stateReach = new Set(chainLocations.map((l: any) => l.state)).size;
    const storesInUserState = chainLocations.filter((l: any) => l.state === userState).length;
    const storesInUserCity = chainLocations.filter((l: any) => l.city === userCity).length;
    
    const metric = latestMetrics.get(chain.id);
    const totalReviews = parseInt(metric?.review_count || 0);
    const avgRating = parseFloat(metric?.rating_avg || 0);

    let threatLevel = 'LOW';
    let threatOrder = 4;
    if (storesInUserCity > 0) {
      threatLevel = 'IMMEDIATE';
      threatOrder = 1;
    } else if (storesInUserState > 0) {
      threatLevel = 'HIGH';
      threatOrder = 2;
    } else if (stateReach > 10) {
      threatLevel = 'MEDIUM';
      threatOrder = 3;
    }

    let marketPresence = 'Low';
    if (storeCount > 100) marketPresence = 'High';
    else if (storeCount > 30) marketPresence = 'Medium';

    return {
      competitor: chain.competitor_name,
      taxonomy: {
        metal: chain.metal,
        use_category: chain.use_category,
        region: chain.region,
        business_type: chain.business_type
      },
      metrics: {
        store_count: storeCount,
        state_reach: stateReach,
        total_reviews: totalReviews,
        avg_rating: avgRating
      },
      presence: {
        in_user_city: storesInUserCity,
        in_user_state: storesInUserState,
        market_presence: marketPresence,
        threat_level: threatLevel
      }
    };
  });

  return threatAssessment.sort((a, b) => {
    const orderA = a.presence.threat_level === 'IMMEDIATE' ? 1 : 
                   a.presence.threat_level === 'HIGH' ? 2 : 
                   a.presence.threat_level === 'MEDIUM' ? 3 : 4;
    const orderB = b.presence.threat_level === 'IMMEDIATE' ? 1 : 
                   b.presence.threat_level === 'HIGH' ? 2 : 
                   b.presence.threat_level === 'MEDIUM' ? 3 : 4;
    if (orderA !== orderB) return orderA - orderB;
    return b.metrics.total_reviews - a.metrics.total_reviews;
  });
}

async function identifyMarketGaps(supabase: any) {
  // Get all competitors with their taxonomy
  const { data: competitors } = await supabase
    .from("competitors")
    .select("id, metal, use_category, region, business_type");

  if (!competitors) return [];

  // Get latest metrics
  const competitorIds = competitors.map((c: any) => c.id);
  const { data: metrics } = await supabase
    .from("competitor_metrics_daily")
    .select("competitor_id, review_count, snapshot_date")
    .in("competitor_id", competitorIds)
    .order("snapshot_date", { ascending: false });

  const latestMetrics = new Map();
  metrics?.forEach((m: any) => {
    if (!latestMetrics.has(m.competitor_id) || 
        new Date(m.snapshot_date) > new Date(latestMetrics.get(m.competitor_id).snapshot_date)) {
      latestMetrics.set(m.competitor_id, m);
    }
  });

  // Group by taxonomy combination
  const segmentCounts: Record<string, { count: number; reviews: number[] }> = {};
  competitors.forEach((comp: any) => {
    const key = `${comp.metal || 'Unknown'}_${comp.use_category || 'Unknown'}_${comp.region || 'Unknown'}_${comp.business_type || 'Unknown'}`;
    if (!segmentCounts[key]) {
      segmentCounts[key] = { count: 0, reviews: [] };
    }
    segmentCounts[key].count++;
    const reviewCount = latestMetrics.get(comp.id)?.review_count || 0;
    segmentCounts[key].reviews.push(parseInt(reviewCount));
  });

  // High-demand segments
  const highDemandSegments = [
    { use_category: 'Bridal', demand_score: 9.5 },
    { use_category: 'Temple', demand_score: 7.5 },
    { use_category: 'Contemporary', demand_score: 8.5 },
    { use_category: 'Daily Wear', demand_score: 7.0 },
    { metal: 'Diamond', demand_score: 8.0 },
    { metal: 'Gold', demand_score: 9.0 },
    { region: 'Kerala Style', demand_score: 8.0 },
    { region: 'Tamil Style', demand_score: 8.2 },
    { region: 'Rajasthani', demand_score: 7.8 }
  ];

  const gaps: any[] = [];
  Object.entries(segmentCounts).forEach(([key, data]) => {
    const [metal, use_category, region, business_type] = key.split('_');
    const competitorCount = data.count;
    const avgReviews = data.reviews.length > 0 
      ? data.reviews.reduce((a, b) => a + b, 0) / data.reviews.length 
      : 0;

    // Check if matches high-demand criteria
    const demandMatch = highDemandSegments.find(
      d => (d.use_category === use_category) ||
           (d.metal === metal) ||
           (d.region === region)
    );

    if (demandMatch && competitorCount < 10) {
      const gapSize = 100 - ((competitorCount / 10) * 100);
      gaps.push({
        segment: { metal, use_category, region, business_type },
        current_players: competitorCount,
        avg_review_volume: avgReviews,
        demand_score: demandMatch.demand_score,
        gap_percentage: Math.round(gapSize),
        opportunity_level: gapSize > 70 ? 'HIGH' : gapSize > 40 ? 'MEDIUM' : 'LOW'
      });
    }
  });

  // Sort by opportunity score
  gaps.sort((a, b) => {
    const scoreA = a.gap_percentage * a.demand_score;
    const scoreB = b.gap_percentage * b.demand_score;
    return scoreB - scoreA;
  });

  return gaps.slice(0, 15);
}

async function analyzeSentimentBreakdown(supabase: any) {
  // Get all chains with metrics
  const { data: chains } = await supabase
    .from("competitors")
    .select("id, competitor_name, business_type")
    .eq("business_type", "Chain");

  if (!chains) return [];

  const chainIds = chains.map((c: any) => c.id);

  // Get latest metrics
  const { data: metrics } = await supabase
    .from("competitor_metrics_daily")
    .select("competitor_id, rating_avg, review_count, snapshot_date")
    .in("competitor_id", chainIds)
    .not("rating_avg", "is", null)
    .order("snapshot_date", { ascending: false });

  const latestMetrics = new Map();
  metrics?.forEach((m: any) => {
    if (!latestMetrics.has(m.competitor_id) || 
        new Date(m.snapshot_date) > new Date(latestMetrics.get(m.competitor_id).snapshot_date)) {
      latestMetrics.set(m.competitor_id, m);
    }
  });

  const sentimentData = chains
    .filter((chain: any) => latestMetrics.has(chain.id))
    .map((chain: any) => {
      const metric = latestMetrics.get(chain.id);
      const rating = parseFloat(metric.rating_avg);
      const reviewCount = parseInt(metric.review_count || 0);

      let sentimentLabel = 'Poor';
      let positivePct = rating * 10;
      if (rating >= 4.5) {
        sentimentLabel = 'Excellent';
        positivePct = 90 + (rating - 4.5) * 20;
      } else if (rating >= 4.0) {
        sentimentLabel = 'Good';
        positivePct = 70 + (rating - 4.0) * 20;
      } else if (rating >= 3.5) {
        sentimentLabel = 'Average';
        positivePct = 50 + (rating - 3.5) * 20;
      } else if (rating >= 3.0) {
        sentimentLabel = 'Below Average';
        positivePct = 30 + (rating - 3.0) * 20;
      }

      return {
        competitor: chain.competitor_name,
        rating: rating,
        review_count: reviewCount,
        sentiment: sentimentLabel,
        positive_percentage: Math.round(positivePct),
        negative_percentage: Math.round(100 - positivePct),
        inferred_strengths: rating >= 4.5
          ? ["Brand trust", "Quality consistency", "Customer service"]
          : rating >= 4.0
          ? ["Good value", "Variety"]
          : ["Accessibility"],
        inferred_weaknesses: rating < 4.0
          ? ["Price concerns", "Service issues"]
          : rating < 4.5
          ? ["Premium pricing"]
          : []
      };
    })
    .sort((a, b) => b.review_count - a.review_count);

  return sentimentData;
}

