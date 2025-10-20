import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SearchRequest {
  brand: string;
  searchType: 'market_analysis' | 'social_engagement' | 'news' | 'general';
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!lovableApiKey) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const { brand, searchType }: SearchRequest = await req.json();

    // Construct search query and instructions based on type
    let systemPrompt = "";
    let userQuery = "";
    
    switch (searchType) {
      case 'market_analysis':
        systemPrompt = "You are a market research analyst specializing in the jewelry industry. Provide comprehensive, data-driven analysis based on publicly available information.";
        userQuery = `Analyze ${brand}'s market position in the Indian jewelry industry. Include: 1) Market share estimates, 2) Competitive positioning vs Tanishq/Kalyan/PC Jeweller, 3) Key strengths and differentiators, 4) Recent expansion or strategic moves, 5) Target customer segments. Be specific and cite any known data points.`;
        break;
      case 'social_engagement':
        systemPrompt = "You are a social media analytics expert for the jewelry retail industry. Focus on digital engagement metrics and campaign performance.";
        userQuery = `Analyze ${brand}'s social media presence and engagement. Include: 1) Estimated Instagram/Facebook follower base, 2) Recent successful campaigns or posts, 3) Content strategy (product showcases, bridal, festivals), 4) Engagement patterns and customer interaction style, 5) Influencer partnerships if any. Provide realistic estimates based on brand size.`;
        break;
      case 'news':
        systemPrompt = "You are a business news analyst covering the jewelry retail sector in India. Focus on recent developments and newsworthy events.";
        userQuery = `What are the latest developments, news, or updates about ${brand} jewelry company in 2024-2025? Include: 1) New store openings or expansions, 2) Product launches or collections, 3) Celebrity endorsements or campaigns, 4) Business performance or awards, 5) Any strategic partnerships or initiatives.`;
        break;
      default:
        systemPrompt = "You are a knowledgeable assistant about the Indian jewelry retail industry.";
        userQuery = `Provide key information about ${brand} jewelry company.`;
    }

    console.log('AI Search Query:', userQuery);

    // Call Lovable AI Gateway
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userQuery }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Lovable AI error:', response.status, errorText);
      
      if (response.status === 429) {
        throw new Error("Rate limit exceeded. Please try again in a moment.");
      }
      if (response.status === 402) {
        throw new Error("AI credits depleted. Please add credits to continue.");
      }
      
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    console.log('AI Response received');

    // Format the response
    const formattedResults = {
      answer: aiResponse,
      sources: [
        {
          title: `${brand} ${searchType === 'market_analysis' ? 'Market Analysis' : searchType === 'social_engagement' ? 'Social Media Insights' : 'Latest News'}`,
          url: '#',
          content: 'AI-generated analysis based on publicly available information',
          score: 1.0
        }
      ]
    };

    return new Response(
      JSON.stringify(formattedResults),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error("Error in market-search function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});