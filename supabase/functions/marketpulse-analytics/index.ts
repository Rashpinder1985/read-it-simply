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
    
    // Get auth token
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Authorization header required");
    }

    // Create Supabase client with user's auth token
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: {
        headers: { Authorization: authHeader }
      }
    });

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error("Unauthorized");
    }

    const url = new URL(req.url);
    const businessId = url.searchParams.get("business_id");
    const level = url.searchParams.get("level") || "local"; // local, regional, national

    if (!businessId) {
      return new Response(
        JSON.stringify({ error: "business_id is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get business details
    const { data: business, error: bizError } = await supabase
      .from("businesses")
      .select("*")
      .eq("id", businessId)
      .eq("user_id", user.id)
      .single();

    if (bizError || !business) {
      return new Response(
        JSON.stringify({ error: "Business not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let competitors: any[] = [];
    let queryError: any = null;

    // Get competitors based on level
    if (level === "local") {
      // Get competitors in same city
      const { data: comps, error } = await supabase
        .from("competitor_locations")
        .select(`
          city,
          state,
          locality,
          competitors!inner(
            id,
            competitor_name,
            metal,
            use_category,
            region,
            business_type,
            category_focus,
            price_positioning,
            website,
            instagram_handle,
            facebook_account
          )
        `)
        .eq("city", business.hq_city)
        .limit(50);

      if (comps && !error) {
        const competitorIds = comps.map(c => c.competitors.id).filter(Boolean);
        
        // Get store counts
        const { data: storeCounts } = await supabase
          .from("competitor_locations")
          .select("competitor_id")
          .in("competitor_id", competitorIds);

        const storeCountMap = new Map<string, number>();
        storeCounts?.forEach(sc => {
          storeCountMap.set(sc.competitor_id, (storeCountMap.get(sc.competitor_id) || 0) + 1);
        });

        // Get latest metrics
        const { data: metrics } = await supabase
          .from("competitor_metrics_daily")
          .select("*")
          .in("competitor_id", competitorIds)
          .order("snapshot_date", { ascending: false });

        const latestMetrics = new Map();
        metrics?.forEach(m => {
          if (!latestMetrics.has(m.competitor_id) || 
              new Date(m.snapshot_date) > new Date(latestMetrics.get(m.competitor_id).snapshot_date)) {
            latestMetrics.set(m.competitor_id, m);
          }
        });

        competitors = comps.map(c => ({
          id: c.competitors.id,
          competitor_name: c.competitors.competitor_name,
          metal: c.competitors.metal,
          use_category: c.competitors.use_category,
          region: c.competitors.region,
          business_type: c.competitors.business_type,
          category_focus: c.competitors.category_focus,
          price_positioning: c.competitors.price_positioning,
          website: c.competitors.website,
          instagram_handle: c.competitors.instagram_handle,
          facebook_account: c.competitors.facebook_account,
          city: c.city,
          state: c.state,
          locality: c.locality,
          store_count: storeCountMap.get(c.competitors.id) || 0,
          rating_avg: latestMetrics.get(c.competitors.id)?.rating_avg,
          review_count: latestMetrics.get(c.competitors.id)?.review_count,
          market_presence_label: latestMetrics.get(c.competitors.id)?.market_presence_label,
          regional_presence_label: latestMetrics.get(c.competitors.id)?.regional_presence_label,
          jewellery_specialization: latestMetrics.get(c.competitors.id)?.jewellery_specialization,
          sentiment_score_overall: latestMetrics.get(c.competitors.id)?.sentiment_score_overall,
        })).sort((a, b) => (b.review_count || 0) - (a.review_count || 0));
      } else {
        queryError = error;
      }
    } else if (level === "regional") {
      // Get competitors in same state
      const { data: comps, error } = await supabase
        .from("competitor_locations")
        .select(`
          city,
          state,
          competitors!inner(
            id,
            competitor_name,
            metal,
            use_category,
            region,
            business_type,
            category_focus,
            price_positioning,
            website,
            instagram_handle,
            facebook_account
          )
        `)
        .eq("state", business.hq_state)
        .limit(50);

      if (comps && !error) {
        const competitorIds = [...new Set(comps.map(c => c.competitors.id).filter(Boolean))];
        
        // Get cities for each competitor
        const citiesMap = new Map<string, string[]>();
        comps.forEach(c => {
          const id = c.competitors.id;
          if (!citiesMap.has(id)) citiesMap.set(id, []);
          citiesMap.get(id)!.push(c.city);
        });

        // Get store counts
        const { data: storeCounts } = await supabase
          .from("competitor_locations")
          .select("competitor_id")
          .in("competitor_id", competitorIds);

        const storeCountMap = new Map<string, number>();
        storeCounts?.forEach(sc => {
          storeCountMap.set(sc.competitor_id, (storeCountMap.get(sc.competitor_id) || 0) + 1);
        });

        // Get latest metrics
        const { data: metrics } = await supabase
          .from("competitor_metrics_daily")
          .select("*")
          .in("competitor_id", competitorIds)
          .order("snapshot_date", { ascending: false });

        const latestMetrics = new Map();
        metrics?.forEach(m => {
          if (!latestMetrics.has(m.competitor_id) || 
              new Date(m.snapshot_date) > new Date(latestMetrics.get(m.competitor_id).snapshot_date)) {
            latestMetrics.set(m.competitor_id, m);
          }
        });

        // Group by competitor
        const competitorMap = new Map();
        comps.forEach(c => {
          const id = c.competitors.id;
          if (!competitorMap.has(id)) {
            competitorMap.set(id, {
              ...c.competitors,
              cities: citiesMap.get(id) || [],
              state: c.state,
            });
          }
        });

        competitors = Array.from(competitorMap.values()).map(c => ({
          id: c.id,
          competitor_name: c.competitor_name,
          metal: c.metal,
          use_category: c.use_category,
          region: c.region,
          business_type: c.business_type,
          category_focus: c.category_focus,
          price_positioning: c.price_positioning,
          website: c.website,
          instagram_handle: c.instagram_handle,
          facebook_account: c.facebook_account,
          cities: c.cities.join(", "),
          state: c.state,
          store_count: storeCountMap.get(c.id) || 0,
          rating_avg: latestMetrics.get(c.id)?.rating_avg,
          review_count: latestMetrics.get(c.id)?.review_count,
          market_presence_label: latestMetrics.get(c.id)?.market_presence_label,
          regional_presence_label: latestMetrics.get(c.id)?.regional_presence_label,
          jewellery_specialization: latestMetrics.get(c.id)?.jewellery_specialization,
          sentiment_score_overall: latestMetrics.get(c.id)?.sentiment_score_overall,
        })).sort((a, b) => (b.review_count || 0) - (a.review_count || 0));
      } else {
        queryError = error;
      }
    } else if (level === "national") {
      // Get national chains
      const { data: comps, error } = await supabase
        .from("competitors")
        .select("*")
        .or("national_chain.eq.true,category_focus.ilike.%National%")
        .limit(50);

      if (comps && !error) {
        const competitorIds = comps.map(c => c.id);

        // Get states for each competitor
        const { data: locations } = await supabase
          .from("competitor_locations")
          .select("competitor_id, state")
          .in("competitor_id", competitorIds);

        const statesMap = new Map<string, string[]>();
        locations?.forEach(l => {
          const id = l.competitor_id;
          if (!statesMap.has(id)) statesMap.set(id, []);
          if (!statesMap.get(id)!.includes(l.state)) {
            statesMap.get(id)!.push(l.state);
          }
        });

        // Get store counts
        const { data: storeCounts } = await supabase
          .from("competitor_locations")
          .select("competitor_id")
          .in("competitor_id", competitorIds);

        const storeCountMap = new Map<string, number>();
        storeCounts?.forEach(sc => {
          storeCountMap.set(sc.competitor_id, (storeCountMap.get(sc.competitor_id) || 0) + 1);
        });

        // Get latest metrics
        const { data: metrics } = await supabase
          .from("competitor_metrics_daily")
          .select("*")
          .in("competitor_id", competitorIds)
          .order("snapshot_date", { ascending: false });

        const latestMetrics = new Map();
        metrics?.forEach(m => {
          if (!latestMetrics.has(m.competitor_id) || 
              new Date(m.snapshot_date) > new Date(latestMetrics.get(m.competitor_id).snapshot_date)) {
            latestMetrics.set(m.competitor_id, m);
          }
        });

        competitors = comps.map(c => ({
          id: c.id,
          competitor_name: c.competitor_name,
          metal: c.metal,
          use_category: c.use_category,
          region: c.region,
          business_type: c.business_type,
          category_focus: c.category_focus,
          price_positioning: c.price_positioning,
          website: c.website,
          instagram_handle: c.instagram_handle,
          facebook_account: c.facebook_account,
          states: (statesMap.get(c.id) || []).join(", "),
          store_count: storeCountMap.get(c.id) || 0,
          rating_avg: latestMetrics.get(c.id)?.rating_avg,
          review_count: latestMetrics.get(c.id)?.review_count,
          market_presence_label: latestMetrics.get(c.id)?.market_presence_label,
          regional_presence_label: latestMetrics.get(c.id)?.regional_presence_label,
          jewellery_specialization: latestMetrics.get(c.id)?.jewellery_specialization,
          sentiment_score_overall: latestMetrics.get(c.id)?.sentiment_score_overall,
        })).sort((a, b) => (b.review_count || 0) - (a.review_count || 0));
      } else {
        queryError = error;
      }
    }

    if (queryError) {
      throw queryError;
    }

    // Calculate category match and social score for each competitor
    const enrichedCompetitors = competitors.map(comp => {
      const categoryMatch = calculateCategoryMatch(
        business.primary_category || '',
        comp.category_focus || '',
        business.target_segment || '',
        comp.price_positioning || ''
      );

      const socialScore = calculateSocialScore({
        instagram: comp.instagram_handle,
        facebook: comp.facebook_account,
        website: comp.website
      });

      return {
        ...comp,
        category_match: categoryMatch,
        social_score: socialScore,
      };
    });

    const response = {
      business: {
        id: business.id,
        name: business.business_name,
        hq_city: business.hq_city,
        hq_state: business.hq_state,
      },
      level,
      competitors: enrichedCompetitors,
      total: enrichedCompetitors.length,
    };

    return new Response(
      JSON.stringify(response),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error("Error in marketpulse-analytics:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});

// Helper functions
function calculateCategoryMatch(bizCategory: string, compCategory: string, bizPrice: string, compPrice: string): string {
  if (!bizCategory || !compCategory) return "Unknown";

  const bizCats = (bizCategory || "").toLowerCase().split(/[,/]/);
  const compCats = (compCategory || "").toLowerCase().split(/[,/]/);

  let overlap = 0;
  bizCats.forEach(bc => {
    compCats.forEach(cc => {
      if (bc.trim() === cc.trim()) overlap++;
    });
  });

  const overlapRatio = overlap / Math.max(bizCats.length, compCats.length);
  const priceMatch = bizPrice === compPrice;

  if (overlapRatio >= 0.7 && priceMatch) return "Direct Rival";
  if (overlapRatio >= 0.4) return "Partial Overlap";
  return "Low Overlap";
}

function calculateSocialScore(socialHandles: { instagram?: string; facebook?: string; website?: string }): number {
  if (!socialHandles) return 0;

  let score = 0;
  if (socialHandles.instagram) score += 3;
  if (socialHandles.facebook) score += 2;
  if (socialHandles.website) score += 1;

  return score;
}

