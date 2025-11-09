import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";
import { load } from "https://esm.sh/cheerio@1.0.0-rc.12";

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
    const city = url.searchParams.get("city");
    const state = url.searchParams.get("state");
    const businessId = url.searchParams.get("business_id");

    if (!city) {
      return new Response(
        JSON.stringify({ error: "city parameter is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Scrape JustDial (using Cheerio - no JS rendering)
    const competitors = await scrapeJustDial(city, state || "unknown");

    if (competitors.length === 0) {
      return new Response(
        JSON.stringify({ 
          status: "ok", 
          message: `No data found for ${city}`,
          inserted: 0 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    // If business_id provided, sync to database
    if (businessId) {
      const inserted = await syncCompetitorsToDatabase(supabase, competitors, city, state || "unknown");
      
      return new Response(
        JSON.stringify({
          status: "ok",
          inserted: inserted,
          message: `Synced ${inserted} competitors for ${city}`,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    // Just return scraped data
    return new Response(
      JSON.stringify({
        status: "ok",
        competitors: competitors,
        count: competitors.length
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error: any) {
    console.error("Error in marketpulse-sync:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});

// Scrape JustDial using Cheerio (no JS rendering - limited but works in Deno)
async function scrapeJustDial(city: string, state: string) {
  const cityEncoded = encodeURIComponent(city);
  const url = `https://www.justdial.com/${cityEncoded}/Jewellery-Showrooms`;

  try {
    console.log(`[Scraper] Fetching ${city} from ${url}`);

    // Fetch HTML
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const html = await response.text();
    const $ = load(html);

    const competitors: any[] = [];

    // Try multiple selectors (JustDial may change their HTML structure)
    const selectors = [
      '.resultbox',
      '.cntanr',
      '.store-details',
      '.store-details-card',
      '.jbbg',
      '[class*="result"]',
      '[class*="listing"]'
    ];

    let cards: any[] = [];
    for (const selector of selectors) {
      cards = Array.from($(selector));
      if (cards.length > 0) break;
    }

    cards.forEach((card) => {
      const $card = $(card);
      
      // Extract competitor name
      const nameEl = $card.find('a.resultbox_title_anchor, .jcn a, h2, h3, [class*="title"]').first();
      const competitor_name = nameEl.text().trim();

      if (!competitor_name || competitor_name.toLowerCase().includes("user review")) {
        return;
      }

      // Extract rating
      const ratingText = $card.find('.green-star, .green-box, .rating, [class*="rat"], [class*="star"]').first().text().trim();
      const ratingMatch = ratingText.match(/([0-9]+(\.[0-9]+)?)/);
      const rating_avg = ratingMatch ? parseFloat(ratingMatch[1]) : null;

      // Extract review count
      const reviewText = $card.find('.rating-count, .rt_count, [class*="review"], [class*="rating"]').text();
      const reviewMatch = reviewText.match(/([0-9][0-9,]*)\s*(Ratings?|Reviews?)/i);
      const review_count = reviewMatch ? reviewMatch[1].replace(/,/g, "") : null;

      // Extract locality/address
      const localityEl = $card.find('.resultbox_address, .shop-address, .address, [class*="address"]').first();
      const locality = localityEl.text().trim() || null;

      // Extract website
      const websiteEl = $card.find('a[href^="http"]').filter((i, el) => {
        const href = $(el).attr('href') || '';
        return !href.includes('justdial.com') && 
               !href.includes('facebook.com') && 
               !href.includes('instagram.com');
      }).first();
      const website = websiteEl.attr('href') || null;

      // Extract social media (basic - may need enhancement)
      const allLinks = $card.find('a[href]');
      let instagram_handle = null;
      let facebook_account = null;

      allLinks.each((i, el) => {
        const href = $(el).attr('href') || '';
        if (href.includes('instagram.com')) {
          const match = href.match(/instagram\.com\/([^\/\?]+)/);
          if (match) instagram_handle = match[1];
        }
        if (href.includes('facebook.com')) {
          const match = href.match(/facebook\.com\/([^\/\?]+)/);
          if (match) facebook_account = match[1];
        }
      });

      competitors.push({
        competitor_name,
        city,
        state,
        locality: normalizeLocality(locality, city),
        rating_avg,
        review_count: review_count ? parseInt(review_count) : null,
        website,
        instagram_handle,
        facebook_account,
      });
    });

    console.log(`[Scraper] Found ${competitors.length} competitors for ${city}`);
    return competitors.slice(0, 30); // Limit to 30

  } catch (error) {
    console.error(`[Scraper] Error scraping ${city}:`, error);
    // Return empty array on error (could fallback to knowledge base)
    return [];
  }
}

function normalizeLocality(localityRaw: string | null, cityName: string): string | null {
  if (!localityRaw) return null;

  const cityLow = (cityName || "").toLowerCase();
  let parts = localityRaw
    .split(",")
    .map(p => p.trim())
    .filter(Boolean);

  parts = parts.filter(p => p.toLowerCase() !== cityLow);

  const cleanedParts = parts.map(part => {
    const tokens = part.split(/\s+/).filter(Boolean);
    const seen = new Set();
    const uniqTokens = [];
    for (const t of tokens) {
      const low = t.toLowerCase();
      if (!seen.has(low)) {
        seen.add(low);
        uniqTokens.push(t);
      }
    }
    return uniqTokens.join(" ");
  });

  const finalSeen = new Set();
  const finalOut = [];
  for (const seg of cleanedParts) {
    const low = seg.toLowerCase();
    if (!finalSeen.has(low)) {
      finalSeen.add(low);
      finalOut.push(seg);
    }
  }

  return finalOut.join(", ") || null;
}

async function syncCompetitorsToDatabase(supabase: any, competitors: any[], city: string, state: string) {
  let inserted = 0;

  for (const c of competitors) {
    try {
      // 1. Upsert competitor
      const { data: competitor, error: compError } = await supabase
        .from("competitors")
        .upsert({
          competitor_name: c.competitor_name,
          metal: null, // Will be enriched later
          use_category: null,
          region: null,
          business_type: null,
          category_focus: null,
          price_positioning: null,
          website: c.website || null,
          instagram_handle: c.instagram_handle || null,
          facebook_account: c.facebook_account || null,
        }, {
          onConflict: 'competitor_name',
          ignoreDuplicates: false
        })
        .select()
        .single();

      if (compError && compError.code !== '23505') { // Ignore duplicate key errors
        console.error(`Error upserting competitor ${c.competitor_name}:`, compError);
        continue;
      }

      // Get competitor ID
      let competitorId;
      if (competitor && competitor.id) {
        competitorId = competitor.id;
      } else {
        // Fetch existing competitor
        const { data: existing } = await supabase
          .from("competitors")
          .select("id")
          .eq("competitor_name", c.competitor_name)
          .single();
        
        if (existing) competitorId = existing.id;
        else continue; // Skip if can't find/create
      }

      // 2. Upsert location
      if (competitorId) {
        await supabase
          .from("competitor_locations")
          .upsert({
            competitor_id: competitorId,
            city: city,
            state: state,
            locality: c.locality || null,
            pincode: null, // Extract from locality if needed
          }, {
            onConflict: 'competitor_id,city,state',
            ignoreDuplicates: false
          });

        // 3. Calculate market presence
        const reviewNum = c.review_count || 0;
        const presenceLabel = reviewNum > 200 ? "High" : reviewNum > 50 ? "Medium" : "Low";

        // 4. Insert metrics snapshot
        await supabase
          .from("competitor_metrics_daily")
          .upsert({
            competitor_id: competitorId,
            snapshot_date: new Date().toISOString().split('T')[0],
            timeframe_window: 'last_90_days',
            rating_avg: c.rating_avg || null,
            review_count: c.review_count || null,
            market_presence_label: presenceLabel,
            jewellery_specialization: null,
          }, {
            onConflict: 'competitor_id,snapshot_date,timeframe_window',
            ignoreDuplicates: false
          });

        inserted++;
      }
    } catch (error) {
      console.error(`Error syncing competitor ${c.competitor_name}:`, error);
    }
  }

  return inserted;
}

