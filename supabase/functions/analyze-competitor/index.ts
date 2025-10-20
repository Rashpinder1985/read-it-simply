import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { competitorName, userBusinessName, userCategory } = await req.json();
    
    console.log('Analyzing competitor:', competitorName);

    const tavilyApiKey = Deno.env.get('TAVILY_API_KEY');
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');

    if (!tavilyApiKey || !lovableApiKey) {
      throw new Error('Required API keys not configured');
    }

    // Search for real-time competitor information
    const searchQuery = `${competitorName} jewellery brand India market presence innovation 2024 2025 news`;
    console.log('Searching with query:', searchQuery);
    
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

    if (!tavilyResponse.ok) {
      console.error('Tavily API error:', await tavilyResponse.text());
      throw new Error('Failed to search web');
    }

    const searchResults = await tavilyResponse.json();
    console.log('Search results received:', searchResults.results?.length || 0, 'results');
    
    const content = searchResults.results?.map((r: any) => r.content).join(' ') || '';
    
    // Calculate relevance score based on search results
    let marketPresenceScore = 10;
    let categoryMatchScore = 10;
    let recentActivityScore = 5;
    let competitiveOverlapScore = 10;

    const contentLower = content.toLowerCase();
    
    // Market presence (0-30 points)
    if (contentLower.includes('pan india') || contentLower.includes('national') || contentLower.includes('all india')) {
      marketPresenceScore = 30;
    } else if (contentLower.includes('multiple states') || contentLower.includes('regional') || contentLower.includes('expansion')) {
      marketPresenceScore = 20;
    }

    // Category match (0-30 points)
    const categoryKeywords = ['gold', 'diamond', 'platinum', 'jewellery', 'jewelry', 'ornament'];
    const matchCount = categoryKeywords.filter(keyword => contentLower.includes(keyword)).length;
    categoryMatchScore = Math.min(30, matchCount * 5);

    // Recent activity (0-25 points)
    if (content.includes('2025')) {
      recentActivityScore = 25;
    } else if (content.includes('2024')) {
      recentActivityScore = 20;
    } else if (content.includes('2023')) {
      recentActivityScore = 10;
    }

    // Competitive overlap (0-15 points)
    if (userBusinessName && contentLower.includes(userBusinessName.toLowerCase())) {
      competitiveOverlapScore = 15;
    }

    const totalScore = marketPresenceScore + categoryMatchScore + recentActivityScore + competitiveOverlapScore;

    // Determine region from search results
    let region = 'Pan-India';
    if (contentLower.includes('south india') || contentLower.includes('kerala') || contentLower.includes('tamil nadu')) {
      region = 'South India';
    } else if (contentLower.includes('north india') || contentLower.includes('delhi') || contentLower.includes('punjab')) {
      region = 'North India';
    } else if (contentLower.includes('west india') || contentLower.includes('mumbai') || contentLower.includes('gujarat')) {
      region = 'West India';
    } else if (contentLower.includes('east india') || contentLower.includes('kolkata') || contentLower.includes('bengal')) {
      region = 'East India';
    }

    // Generate AI-powered competitive insight
    console.log('Generating AI insight for:', competitorName);
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
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
            content: 'You are a business competitive analyst. Create a concise 2-sentence insight explaining why this competitor is relevant for a jewellery business owner to track. Focus on their unique market position, recent moves, or competitive advantages. Be specific and actionable.',
          },
          {
            role: 'user',
            content: `Competitor: ${competitorName}\nYour Business Category: ${userCategory || 'jewellery'}\nRecent Market Intelligence:\n${content.substring(0, 2000)}`,
          },
        ],
        max_tokens: 150,
      }),
    });

    if (!aiResponse.ok) {
      console.error('AI API error:', aiResponse.status, await aiResponse.text());
      throw new Error('Failed to generate insight');
    }

    const aiData = await aiResponse.json();
    const competitorInsight = aiData.choices?.[0]?.message?.content || 
      `${competitorName} is a significant player in the ${userCategory || 'jewellery'} market with strong brand presence and competitive offerings worth monitoring.`;

    console.log('Analysis complete for:', competitorName);

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          relevanceScore: Math.min(100, totalScore),
          region,
          competitorInsight,
          isAiSelected: totalScore >= 85,
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
      JSON.stringify({ 
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
