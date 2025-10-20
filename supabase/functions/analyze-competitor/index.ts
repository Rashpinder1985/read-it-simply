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

    // Multi-source web search for comprehensive data
    const searchQueries = [
      `${competitorName} India jewellery latest news 2025`,
      `${competitorName} market share stores expansion India`,
      `${competitorName} product innovation jewellery segment`,
    ];
    
    let content = '';
    let searchSuccess = false;
    
    // Try Tavily search with fallback
    try {
      const tavilyResponse = await fetch('https://api.tavily.com/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          api_key: tavilyApiKey,
          query: searchQueries.join(' '),
          search_depth: 'advanced',
          max_results: 5,
        }),
      });

      if (tavilyResponse.ok) {
        const searchResults = await tavilyResponse.json();
        content = searchResults.results?.map((r: any) => r.content).join(' ') || '';
        searchSuccess = true;
        console.log('Tavily search successful, results:', searchResults.results?.length || 0);
      }
    } catch (e) {
      console.log('Tavily search failed, using fallback analysis');
    }

    const contentLower = content.toLowerCase();
    const nameTokens = competitorName.toLowerCase().split(' ');
    
    // Advanced ML-inspired scoring algorithm with weighted features
    
    // Feature 1: Market Presence & Scale (0-35 points)
    let marketPresenceScore = 15; // base
    const scaleKeywords = {
      national: 35,
      'pan india': 35,
      'all india': 35,
      'pan-india': 35,
      '100+ stores': 32,
      '50+ stores': 28,
      'multi-state': 25,
      regional: 20,
      expansion: 18,
    };
    for (const [keyword, score] of Object.entries(scaleKeywords)) {
      if (contentLower.includes(keyword)) {
        marketPresenceScore = Math.max(marketPresenceScore, score);
      }
    }

    // Feature 2: Category Relevance & Product Match (0-30 points)
    const categoryWeights = {
      diamond: 6, gold: 6, platinum: 5, 'wedding jewellery': 5,
      jewellery: 4, jewelry: 4, ornament: 3, 'fine jewelry': 5,
      luxury: 4, bridal: 4, 'precious stones': 4,
    };
    let categoryMatchScore = 0;
    for (const [keyword, weight] of Object.entries(categoryWeights)) {
      const matches = (contentLower.match(new RegExp(keyword, 'g')) || []).length;
      categoryMatchScore += Math.min(matches * weight, weight * 2);
    }
    categoryMatchScore = Math.min(30, categoryMatchScore);

    // Feature 3: Temporal Relevance & Innovation (0-20 points)
    let recentActivityScore = 0;
    const currentYear = new Date().getFullYear();
    const innovationKeywords = ['launch', 'new collection', 'innovation', 'technology', 'digital', 'expansion'];
    
    if (content.includes(String(currentYear))) {
      recentActivityScore = 20;
      innovationKeywords.forEach(kw => {
        if (contentLower.includes(kw)) recentActivityScore = Math.min(20, recentActivityScore + 2);
      });
    } else if (content.includes(String(currentYear - 1))) {
      recentActivityScore = 12;
    }

    // Feature 4: Competitive Overlap & Threat (0-15 points)
    let competitiveOverlapScore = 8; // base assumption
    if (userBusinessName && contentLower.includes(userBusinessName.toLowerCase())) {
      competitiveOverlapScore = 15;
    }
    if (userCategory && contentLower.includes(userCategory.toLowerCase())) {
      competitiveOverlapScore = Math.min(15, competitiveOverlapScore + 5);
    }

    const totalScore = marketPresenceScore + categoryMatchScore + recentActivityScore + competitiveOverlapScore;

    // Advanced region detection with multi-signal analysis
    let region = 'Pan-India';
    const regionSignals = {
      'South India': ['south india', 'kerala', 'tamil nadu', 'chennai', 'bangalore', 'hyderabad', 'karnataka', 'andhra'],
      'North India': ['north india', 'delhi', 'punjab', 'haryana', 'rajasthan', 'uttar pradesh', 'chandigarh'],
      'West India': ['west india', 'mumbai', 'gujarat', 'maharashtra', 'pune', 'ahmedabad', 'goa'],
      'East India': ['east india', 'kolkata', 'bengal', 'west bengal', 'odisha', 'bihar'],
    };
    
    let maxRegionMatches = 0;
    for (const [regionName, keywords] of Object.entries(regionSignals)) {
      const matches = keywords.filter(kw => contentLower.includes(kw)).length;
      if (matches > maxRegionMatches) {
        maxRegionMatches = matches;
        region = regionName;
      }
    }

    // Determine primary category based on content analysis
    let category = userCategory || 'Jewellery';
    const categoryTypes = {
      'Diamond Jewellery': ['diamond', 'solitaire', 'polki'],
      'Gold Jewellery': ['gold', '22k', '18k', 'gold ornament'],
      'Platinum Jewellery': ['platinum'],
      'Wedding Jewellery': ['bridal', 'wedding', 'trousseau'],
      'Fashion Jewellery': ['fashion', 'artificial', 'imitation'],
    };
    let maxCategoryScore = 0;
    for (const [catName, keywords] of Object.entries(categoryTypes)) {
      const score = keywords.filter(kw => contentLower.includes(kw)).length;
      if (score > maxCategoryScore) {
        maxCategoryScore = score;
        category = catName;
      }
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
