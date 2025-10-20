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
    const tavilyApiKey = Deno.env.get("TAVILY_API_KEY");
    if (!tavilyApiKey) {
      throw new Error("TAVILY_API_KEY is not configured");
    }

    const { brand, searchType }: SearchRequest = await req.json();

    // Construct search query based on type
    let searchQuery = "";
    switch (searchType) {
      case 'market_analysis':
        searchQuery = `${brand} jewelry market share analysis competitive position india`;
        break;
      case 'social_engagement':
        searchQuery = `${brand} jewelry social media engagement instagram facebook campaign`;
        break;
      case 'news':
        searchQuery = `${brand} jewelry latest news updates 2025`;
        break;
      default:
        searchQuery = `${brand} jewelry company information`;
    }

    console.log('Searching for:', searchQuery);

    // Call Tavily API
    const response = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        api_key: tavilyApiKey,
        query: searchQuery,
        search_depth: "advanced",
        include_answer: true,
        include_raw_content: false,
        max_results: 5,
        include_domains: [],
        exclude_domains: []
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Tavily API error:', response.status, errorText);
      throw new Error(`Tavily API error: ${response.status}`);
    }

    const data = await response.json();

    // Extract and format the results
    const formattedResults = {
      answer: data.answer || "No summary available",
      sources: data.results?.map((result: any) => ({
        title: result.title,
        url: result.url,
        content: result.content,
        score: result.score
      })) || []
    };

    console.log('Search results:', formattedResults);

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