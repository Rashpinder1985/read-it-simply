import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

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
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const { competitorName, userBusinessName, userCategory } = await req.json();

    // Use Tavily API for web search
    const tavilyApiKey = Deno.env.get('TAVILY_API_KEY');
    if (!tavilyApiKey) {
      throw new Error('TAVILY_API_KEY not configured');
    }

    // Search for competitor information
    const searchQuery = `${competitorName} jewellery brand India market presence latest innovations 2024`;
    const tavilyResponse = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        api_key: tavilyApiKey,
        query: searchQuery,
        search_depth: 'advanced',
        max_results: 5,
      }),
    });

    const searchResults = await tavilyResponse.json();
    
    // Calculate relevance score based on multiple factors
    const relevanceFactors = {
      marketPresence: 0,
      categoryMatch: 0,
      recentActivity: 0,
      competitiveOverlap: 0,
    };

    // Analyze search results
    const content = searchResults.results?.map((r: any) => r.content).join(' ') || '';
    
    // Market presence (0-30 points)
    if (content.toLowerCase().includes('pan india') || content.toLowerCase().includes('national')) {
      relevanceFactors.marketPresence = 30;
    } else if (content.toLowerCase().includes('multiple states') || content.toLowerCase().includes('regional')) {
      relevanceFactors.marketPresence = 20;
    } else {
      relevanceFactors.marketPresence = 10;
    }

    // Category match (0-30 points)
    const categoryKeywords = ['gold', 'diamond', 'platinum', 'jewellery', 'jewelry'];
    const matchCount = categoryKeywords.filter(keyword => 
      content.toLowerCase().includes(keyword)
    ).length;
    relevanceFactors.categoryMatch = Math.min(30, matchCount * 6);

    // Recent activity (0-25 points)
    if (content.includes('2024') || content.includes('2025')) {
      relevanceFactors.recentActivity = 25;
    } else if (content.includes('2023')) {
      relevanceFactors.recentActivity = 15;
    } else {
      relevanceFactors.recentActivity = 5;
    }

    // Competitive overlap (0-15 points)
    if (userBusinessName && content.toLowerCase().includes(userBusinessName.toLowerCase())) {
      relevanceFactors.competitiveOverlap = 15;
    } else {
      relevanceFactors.competitiveOverlap = 10;
    }

    const totalScore = Object.values(relevanceFactors).reduce((a, b) => a + b, 0);

    // Extract key information
    let region = 'Pan-India';
    if (content.toLowerCase().includes('south india')) region = 'South India';
    else if (content.toLowerCase().includes('north india')) region = 'North India';
    else if (content.toLowerCase().includes('west india')) region = 'West India';
    else if (content.toLowerCase().includes('east india')) region = 'East India';

    // Generate AI-powered insight using Lovable AI
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
    let competitorInsight = `Direct competitor in the ${userCategory || 'jewellery'} segment with significant market presence.`;
    
    if (lovableApiKey) {
      const aiResponse = await fetch('https://api.lovable.app/v1/ai/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${lovableApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages: [
            {
              role: 'system',
              content: 'You are a business analyst. Provide a concise 2-sentence insight about why this competitor is relevant for a jewellery business owner to track.',
            },
            {
              role: 'user',
              content: `Competitor: ${competitorName}\nBusiness Category: ${userCategory}\nMarket Data: ${content.substring(0, 1000)}`,
            },
          ],
          max_tokens: 150,
        }),
      });

      if (aiResponse.ok) {
        const aiData = await aiResponse.json();
        competitorInsight = aiData.choices?.[0]?.message?.content || competitorInsight;
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          relevanceScore: Math.min(100, totalScore),
          region,
          competitorInsight,
          isAiSelected: totalScore >= 85, // Only high-relevance competitors get AI Selected badge
        },
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error analyzing competitor:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
