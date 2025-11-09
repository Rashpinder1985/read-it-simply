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
    const state = url.searchParams.get("state"); // Optional filter by state

    // Get all trends in parallel
    const [
      geoTrends,
      categoryMomentum,
      metalTrends,
      regionalStyles,
      marketStructure,
      emergingPlayers
    ] = await Promise.all([
      detectGeographicTrends(supabase),
      detectCategoryMomentum(supabase),
      detectMetalTrends(supabase),
      detectRegionalStyleTrends(supabase),
      detectMarketConcentration(supabase),
      detectEmergingPlayers(supabase)
    ]);

    // Combine all trends
    const allTrends = [
      ...geoTrends,
      ...categoryMomentum,
      ...metalTrends,
      ...regionalStyles,
      ...marketStructure,
      ...emergingPlayers
    ];

    // Filter by state if provided
    let filteredTrends = allTrends;
    if (state) {
      filteredTrends = allTrends.filter(t =>
        !t.location || t.location.includes(state)
      );
    }

    // Categorize trends
    const categorized = {
      geographic_expansion: allTrends.filter((t: any) => t.type === 'geographic_expansion'),
      category_shifts: allTrends.filter((t: any) => t.type === 'category_momentum'),
      material_preferences: allTrends.filter((t: any) => t.type === 'material_trend'),
      regional_styles: allTrends.filter((t: any) => t.type === 'regional_style'),
      market_structure: allTrends.filter((t: any) => t.type === 'market_structure'),
      rising_competitors: allTrends.filter((t: any) => t.type === 'emerging_player')
    };

    const response = {
      trends: filteredTrends,
      categorized: categorized,
      summary: {
        total_trends: filteredTrends.length,
        high_strength: filteredTrends.filter((t: any) => t.trend_strength === 'High').length,
        key_insight: generateKeyInsight(categorized)
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
    console.error("Error in marketpulse-trends:", error);
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
async function detectGeographicTrends(supabase: any) {
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  // Get locations created in last 6 months
  const { data: recentLocations } = await supabase
    .from("competitor_locations")
    .select("competitor_id, city, state, created_at")
    .gte("created_at", sixMonthsAgo.toISOString());

  if (!recentLocations || recentLocations.length === 0) return [];

  // Get competitor IDs
  const competitorIds = [...new Set(recentLocations.map((l: any) => l.competitor_id))];
  const { data: competitors } = await supabase
    .from("competitors")
    .select("id")
    .in("id", competitorIds);

  // Get metrics for review counts
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

  // Group by city, state
  const cityStats: Record<string, { city: string; state: string; count: number; reviews: number[] }> = {};
  recentLocations.forEach((loc: any) => {
    const key = `${loc.city}, ${loc.state}`;
    if (!cityStats[key]) {
      cityStats[key] = { city: loc.city, state: loc.state, count: 0, reviews: [] };
    }
    cityStats[key].count++;
    const reviewCount = latestMetrics.get(loc.competitor_id)?.review_count || 0;
    cityStats[key].reviews.push(parseInt(reviewCount));
  });

  return Object.values(cityStats)
    .filter(stat => stat.count >= 2)
    .map(stat => ({
      type: 'geographic_expansion',
      location: `${stat.city}, ${stat.state}`,
      metric: stat.count,
      signal: `${stat.count} new competitors in 6 months`,
      trend_strength: stat.count >= 5 ? 'High' : 'Medium'
    }))
    .sort((a, b) => b.metric - a.metric)
    .slice(0, 10);
}

async function detectCategoryMomentum(supabase: any) {
  const { data: competitors } = await supabase
    .from("competitors")
    .select("id, use_category")
    .not("use_category", "eq", "General");

  if (!competitors) return [];

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

  // Group by use_category
  const categoryStats: Record<string, { count: number; reviews: number[] }> = {};
  competitors.forEach((comp: any) => {
    const category = comp.use_category;
    if (!categoryStats[category]) {
      categoryStats[category] = { count: 0, reviews: [] };
    }
    categoryStats[category].count++;
    const reviewCount = latestMetrics.get(comp.id)?.review_count || 0;
    categoryStats[category].reviews.push(parseInt(reviewCount));
  });

  return Object.entries(categoryStats)
    .filter(([_, data]) => data.count >= 2)
    .map(([category, data]) => ({
      type: 'category_momentum',
      category: category,
      metric: data.reviews.reduce((a, b) => a + b, 0),
      signal: `${data.count} players with ${data.reviews.reduce((a, b) => a + b, 0)} reviews`,
      trend_strength: data.reviews.reduce((a, b) => a + b, 0) > 1000 ? 'High' : 'Medium'
    }))
    .sort((a, b) => b.metric - a.metric)
    .slice(0, 5);
}

async function detectMetalTrends(supabase: any) {
  const { data: competitors } = await supabase
    .from("competitors")
    .select("id, metal")
    .not("metal", "eq", "Multi-Metal");

  if (!competitors) return [];

  const competitorIds = competitors.map((c: any) => c.id);
  const { data: metrics } = await supabase
    .from("competitor_metrics_daily")
    .select("competitor_id, rating_avg, review_count, snapshot_date")
    .in("competitor_id", competitorIds)
    .order("snapshot_date", { ascending: false });

  const latestMetrics = new Map();
  metrics?.forEach((m: any) => {
    if (!latestMetrics.has(m.competitor_id) || 
        new Date(m.snapshot_date) > new Date(latestMetrics.get(m.competitor_id).snapshot_date)) {
      latestMetrics.set(m.competitor_id, m);
    }
  });

  // Group by metal
  const metalStats: Record<string, { count: number; ratings: number[]; reviews: number[] }> = {};
  competitors.forEach((comp: any) => {
    const metal = comp.metal;
    if (!metalStats[metal]) {
      metalStats[metal] = { count: 0, ratings: [], reviews: [] };
    }
    metalStats[metal].count++;
    const metric = latestMetrics.get(comp.id);
    if (metric?.rating_avg) metalStats[metal].ratings.push(parseFloat(metric.rating_avg));
    if (metric?.review_count) metalStats[metal].reviews.push(parseInt(metric.review_count));
  });

  return Object.entries(metalStats)
    .map(([metal, data]) => {
      const avgRating = data.ratings.length > 0 
        ? data.ratings.reduce((a, b) => a + b, 0) / data.ratings.length 
        : 0;
      return {
        type: 'material_trend',
        material: metal,
        metric: avgRating,
        signal: `${data.count} specialists, ${avgRating.toFixed(1)} avg rating`,
        trend_strength: avgRating >= 4.5 ? 'High' : 'Medium'
      };
    })
    .sort((a, b) => b.metric - a.metric)
    .slice(0, 5);
}

async function detectRegionalStyleTrends(supabase: any) {
  const { data: competitors } = await supabase
    .from("competitors")
    .select("id, region")
    .not("region", "eq", "Pan-India");

  if (!competitors) return [];

  const competitorIds = competitors.map((c: any) => c.id);
  const { data: metrics } = await supabase
    .from("competitor_metrics_daily")
    .select("competitor_id, rating_avg, review_count, snapshot_date")
    .in("competitor_id", competitorIds)
    .order("snapshot_date", { ascending: false });

  const latestMetrics = new Map();
  metrics?.forEach((m: any) => {
    if (!latestMetrics.has(m.competitor_id) || 
        new Date(m.snapshot_date) > new Date(latestMetrics.get(m.competitor_id).snapshot_date)) {
      latestMetrics.set(m.competitor_id, m);
    }
  });

  // Group by region
  const regionStats: Record<string, { count: number; ratings: number[]; reviews: number[] }> = {};
  competitors.forEach((comp: any) => {
    const region = comp.region;
    if (!regionStats[region]) {
      regionStats[region] = { count: 0, ratings: [], reviews: [] };
    }
    regionStats[region].count++;
    const metric = latestMetrics.get(comp.id);
    if (metric?.rating_avg) regionStats[region].ratings.push(parseFloat(metric.rating_avg));
    if (metric?.review_count) regionStats[region].reviews.push(parseInt(metric.review_count));
  });

  return Object.entries(regionStats)
    .filter(([_, data]) => data.count >= 5)
    .map(([region, data]) => ({
      type: 'regional_style',
      region: region,
      metric: data.count,
      signal: `${data.count} specialists in ${region} style`,
      trend_strength: data.count >= 20 ? 'High' : 'Medium'
    }))
    .sort((a, b) => b.metric - a.metric)
    .slice(0, 5);
}

async function detectMarketConcentration(supabase: any) {
  const { data: competitors } = await supabase
    .from("competitors")
    .select("id, business_type");

  if (!competitors) return [];

  const competitorIds = competitors.map((c: any) => c.id);
  
  // Get store counts
  const { data: locations } = await supabase
    .from("competitor_locations")
    .select("competitor_id")
    .in("competitor_id", competitorIds);

  const storeCounts = new Map<string, number>();
  locations?.forEach((l: any) => {
    storeCounts.set(l.competitor_id, (storeCounts.get(l.competitor_id) || 0) + 1);
  });

  // Group by business_type
  const typeStats: Record<string, { count: number; stores: number[] }> = {};
  competitors.forEach((comp: any) => {
    const type = comp.business_type;
    if (!typeStats[type]) {
      typeStats[type] = { count: 0, stores: [] };
    }
    typeStats[type].count++;
    typeStats[type].stores.push(storeCounts.get(comp.id) || 0);
  });

  const total = competitors.length;
  const chains = typeStats['Chain'];
  const chainPct = chains ? Math.round((chains.count / total) * 100) : 0;

  return [{
    type: 'market_structure',
    metric: chainPct,
    signal: chainPct < 5
      ? `Fragmented market: Only ${chainPct}% chains, ${100-chainPct}% independents`
      : `Consolidating market: ${chainPct}% chains`,
    trend_strength: chainPct < 5 ? 'Low' : chainPct < 15 ? 'Medium' : 'High',
    insight: chainPct < 5
      ? 'Opportunity for local differentiation and community focus'
      : 'Compete on experience and personalization vs chain efficiency'
  }];
}

async function detectEmergingPlayers(supabase: any) {
  // Get non-chain competitors
  const { data: competitors } = await supabase
    .from("competitors")
    .select("id, competitor_name, metal, use_category, region, business_type")
    .neq("business_type", "Chain");

  if (!competitors) return [];

  const competitorIds = competitors.map((c: any) => c.id);
  
  // Get locations
  const { data: locations } = await supabase
    .from("competitor_locations")
    .select("competitor_id, city, state")
    .in("competitor_id", competitorIds);

  // Get metrics
  const { data: metrics } = await supabase
    .from("competitor_metrics_daily")
    .select("competitor_id, rating_avg, review_count, snapshot_date")
    .in("competitor_id", competitorIds)
    .order("snapshot_date", { ascending: false });

  const latestMetrics = new Map();
  metrics?.forEach((m: any) => {
    if (!latestMetrics.has(m.competitor_id) || 
        new Date(m.snapshot_date) > new Date(latestMetrics.get(m.competitor_id).snapshot_date)) {
      latestMetrics.set(m.competitor_id, m);
    }
  });

  // Filter: review_count between 100-1000, rating >= 4.3
  const emerging = competitors
    .map((comp: any) => {
      const metric = latestMetrics.get(comp.id);
      const reviewCount = parseInt(metric?.review_count || 0);
      const rating = parseFloat(metric?.rating_avg || 0);
      const location = locations?.find((l: any) => l.competitor_id === comp.id);

      if (reviewCount >= 100 && reviewCount <= 1000 && rating >= 4.3) {
        return {
          type: 'emerging_player',
          player: comp.competitor_name,
          location: location ? `${location.city}, ${location.state}` : 'Unknown',
          metric: reviewCount,
          rating: rating,
          signal: `${reviewCount} reviews, ${rating.toFixed(1)}⭐ - Rising local player`,
          category: `${comp.metal} → ${comp.use_category} → ${comp.region}`,
          trend_strength: 'Medium'
        };
      }
      return null;
    })
    .filter(Boolean)
    .sort((a: any, b: any) => b.metric - a.metric)
    .slice(0, 5);

  return emerging;
}

function generateKeyInsight(categorized: any) {
  const topGeo = categorized.geographic_expansion[0];
  const topCategory = categorized.category_shifts[0];
  const structure = categorized.market_structure[0];

  if (topGeo && topCategory) {
    return `${topGeo.location} is hotspot with ${topGeo.metric} new entrants. ${topCategory.category} category gaining traction. ${structure?.insight || ''}`;
  } else if (topGeo) {
    return `Geographic expansion in ${topGeo.location}. ${structure?.insight || 'Market remains fragmented.'}`;
  } else {
    return structure?.insight || 'Market trends developing. Monitor category and geographic shifts.';
  }
}

