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

    // Get auth token from request
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

    const localCity = business.hq_city;
    const localState = business.hq_state;

    // Get latest gold rate
    const { data: goldRate } = await supabase
      .from("gold_rates")
      .select("*")
      .order("captured_at", { ascending: false })
      .limit(1)
      .single();

    // Use raw SQL for complex queries with DISTINCT ON
    const { data: localCompetitorsData, error: localError } = await supabase.rpc('get_local_competitors', {
      p_city: localCity
    });

    const { data: regionalCompetitorsData, error: regionalError } = await supabase.rpc('get_regional_competitors', {
      p_state: localState
    });

    const { data: nationalCompetitorsData, error: nationalError } = await supabase.rpc('get_national_competitors', {});

    // Fallback to direct queries if RPC functions don't exist
    let localCompetitors = localCompetitorsData;
    let regionalCompetitors = regionalCompetitorsData;
    let nationalCompetitors = nationalCompetitorsData;

    if (localError || !localCompetitors) {
      // Fallback: Get competitors with locations and latest metrics
      const { data: comps } = await supabase
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
            price_positioning,
            website,
            instagram_handle,
            facebook_account
          )
        `)
        .eq("city", localCity)
        .limit(15);

      // Get latest metrics for each competitor
      if (comps) {
        const competitorIds = comps.map(c => c.competitors.id).filter(Boolean);
        const { data: metrics } = await supabase
          .from("competitor_metrics_daily")
          .select("*")
          .in("competitor_id", competitorIds)
          .order("snapshot_date", { ascending: false });

        // Group metrics by competitor_id and get latest
        const latestMetrics = new Map();
        metrics?.forEach(m => {
          if (!latestMetrics.has(m.competitor_id) || 
              new Date(m.snapshot_date) > new Date(latestMetrics.get(m.competitor_id).snapshot_date)) {
            latestMetrics.set(m.competitor_id, m);
          }
        });

        localCompetitors = comps.map(c => ({
          ...c.competitors,
          city: c.city,
          state: c.state,
          locality: c.locality,
          metrics: latestMetrics.get(c.competitors.id) || {}
        }));
      }
    }

    if (regionalError || !regionalCompetitors) {
      const { data: comps } = await supabase
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
            price_positioning
          )
        `)
        .eq("state", localState)
        .limit(15);

      if (comps) {
        const competitorIds = comps.map(c => c.competitors.id).filter(Boolean);
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

        regionalCompetitors = comps.map(c => ({
          ...c.competitors,
          city: c.city,
          state: c.state,
          locality: c.locality,
          metrics: latestMetrics.get(c.competitors.id) || {}
        }));
      }
    }

    if (nationalError || !nationalCompetitors) {
      const { data: comps } = await supabase
        .from("competitors")
        .select("*")
        .or("national_chain.eq.true,category_focus.ilike.%National%")
        .limit(15);

      if (comps) {
        const competitorIds = comps.map(c => c.id);
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

        nationalCompetitors = comps.map(c => ({
          ...c,
          metrics: latestMetrics.get(c.id) || {}
        }));
      }
    }

    // Get trends snapshot
    const { data: trends } = await supabase
      .from("trends_snapshot")
      .select("*")
      .order("snapshot_at", { ascending: false })
      .limit(1)
      .single();

    // Transform data to match expected format
    const transformCompetitor = (comp: any) => {
      const metrics = comp.metrics || comp.competitor_metrics_daily?.[0] || {};
      const location = comp.city ? { city: comp.city, state: comp.state, locality: comp.locality } 
        : comp.competitor_locations?.[0] || {};
      
      return {
        competitor_name: comp.competitor_name || comp.competitors?.competitor_name,
        metal: comp.metal || comp.competitors?.metal,
        use_category: comp.use_category || comp.competitors?.use_category,
        region: comp.region || comp.competitors?.region,
        business_type: comp.business_type || comp.competitors?.business_type,
        price_positioning: comp.price_positioning || comp.competitors?.price_positioning,
        city: location.city,
        state: location.state,
        locality: location.locality,
        rating_avg: metrics.rating_avg,
        review_count: metrics.review_count,
        market_presence_label: metrics.market_presence_label,
        website: comp.website || comp.competitors?.website,
        instagram_handle: comp.instagram_handle || comp.competitors?.instagram_handle,
        facebook_account: comp.facebook_account || comp.competitors?.facebook_account,
      };
    };

    const response = {
      business: {
        id: business.id,
        name: business.business_name,
        hq_city: localCity,
        hq_state: localState,
      },
      gold: goldRate || null,
      localCompetitors: (localCompetitors || []).map(transformCompetitor),
      regionalCompetitors: (regionalCompetitors || []).map(transformCompetitor),
      nationalCompetitors: (nationalCompetitors || []).map(transformCompetitor),
      trends: trends || null,
      ownerPosition: {
        local_insight: localCompetitors && localCompetitors.length > 0 ? {
          headlineCompetitor: transformCompetitor(localCompetitors[0]).competitor_name || null,
          headlineStrength: transformCompetitor(localCompetitors[0]).market_presence_label || null,
          sampleRating: transformCompetitor(localCompetitors[0]).rating_avg || null,
          sampleReviews: transformCompetitor(localCompetitors[0]).review_count || null,
        } : { headlineCompetitor: null, headlineStrength: null, sampleRating: null, sampleReviews: null },
        state_insight: regionalCompetitors && regionalCompetitors.length > 0 ? {
          headlineCompetitor: transformCompetitor(regionalCompetitors[0]).competitor_name || null,
          headlineStrength: transformCompetitor(regionalCompetitors[0]).market_presence_label || null,
          sampleRating: transformCompetitor(regionalCompetitors[0]).rating_avg || null,
          sampleReviews: transformCompetitor(regionalCompetitors[0]).review_count || null,
        } : { headlineCompetitor: null, headlineStrength: null, sampleRating: null, sampleReviews: null },
        national_insight: nationalCompetitors && nationalCompetitors.length > 0 ? {
          headlineCompetitor: transformCompetitor(nationalCompetitors[0]).competitor_name || null,
          headlineStrength: transformCompetitor(nationalCompetitors[0]).market_presence_label || null,
          sampleRating: transformCompetitor(nationalCompetitors[0]).rating_avg || null,
          sampleReviews: transformCompetitor(nationalCompetitors[0]).review_count || null,
        } : { headlineCompetitor: null, headlineStrength: null, sampleRating: null, sampleReviews: null },
      },
    };

    return new Response(
      JSON.stringify(response),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error("Error in marketpulse-dashboard:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});

