// MarketPulse Gold Rates Sync
// Fetches and stores daily gold rates from IBJA (India Bullion and Jewellers Association)
// IBJA is India's official benchmark for gold rates

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // IBJA Website: https://ibjarates.com/
    // Note: IBJA requires API subscription for automated access
    // For now, we'll accept manual input or you can subscribe to their API
    
    const { method } = req;
    
    if (method === "GET") {
      // Fetch latest gold rates from database
      const { data, error } = await supabase
        .from("gold_rates")
        .select("*")
        .order("captured_at", { ascending: false })
        .limit(10);

      if (error) throw error;

      return new Response(
        JSON.stringify({
          success: true,
          rates: data,
          message: "Latest gold rates fetched successfully",
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (method === "POST") {
      // Store new gold rates
      // Expected input format from IBJA:
      // {
      //   "gold_24k_per_10g": 75000,  // Gold 999 purity
      //   "gold_22k_per_10g": 68750,  // Gold 916 purity
      //   "gold_18k_per_10g": 56250   // Gold 750 purity
      // }
      
      const body = await req.json();
      const { gold_24k_per_10g, gold_22k_per_10g, gold_18k_per_10g } = body;

      if (!gold_24k_per_10g || !gold_22k_per_10g || !gold_18k_per_10g) {
        return new Response(
          JSON.stringify({
            error: "Missing required fields: gold_24k_per_10g, gold_22k_per_10g, gold_18k_per_10g",
          }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      // Insert new gold rate
      const { data, error } = await supabase
        .from("gold_rates")
        .insert({
          captured_at: new Date().toISOString(),
          gold_24k_per_10g: parseFloat(gold_24k_per_10g),
          gold_22k_per_10g: parseFloat(gold_22k_per_10g),
          gold_18k_per_10g: parseFloat(gold_18k_per_10g),
        })
        .select()
        .single();

      if (error) throw error;

      return new Response(
        JSON.stringify({
          success: true,
          data,
          message: "Gold rates stored successfully",
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      {
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Gold rates error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});


