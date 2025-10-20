import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SearchRequest {
  brands: string[];
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

    const { brands }: SearchRequest = await req.json();

    const systemPrompt = `You are a social media research assistant. For each jewelry brand provided, generate realistic social media post data including:
- Post description
- Estimated engagement (likes, comments, shares)
- Post type (product launch, campaign, festival collection, etc)
- Design category (bridal, daily wear, traditional, modern, etc)
- Mock Instagram post URL format

Return the data as a JSON array with this structure:
[{
  "brand": "Brand Name",
  "posts": [{
    "description": "Post description",
    "postType": "Product Launch",
    "designCategory": "Bridal Collection",
    "engagement": {"likes": 15000, "comments": 500, "shares": 200},
    "imageUrl": "https://picsum.photos/400/400?random=X",
    "postUrl": "https://www.instagram.com/p/mock-post-id"
  }]
}]

Generate 3-4 posts per brand. Make the data realistic based on brand positioning.`;

    const userQuery = `Generate social media post data for these jewelry brands: ${brands.join(', ')}. Focus on their latest designs, collections, and campaigns.`;

    console.log('Fetching social media data for:', brands);

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
        response_format: { type: "json_object" }
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

    console.log('Social media data received');

    // Parse the AI response
    let parsedData;
    try {
      parsedData = JSON.parse(aiResponse);
    } catch (e) {
      // If parsing fails, return mock data
      parsedData = brands.map((brand, idx) => ({
        brand,
        posts: [
          {
            description: `Latest ${brand} bridal collection featuring intricate designs`,
            postType: "Product Launch",
            designCategory: "Bridal Collection",
            engagement: { likes: 15000 + (idx * 1000), comments: 500, shares: 200 },
            imageUrl: `https://picsum.photos/400/400?random=${idx}`,
            postUrl: `https://www.instagram.com/explore/tags/${brand.toLowerCase().replace(/\s/g, '')}`
          }
        ]
      }));
    }

    return new Response(
      JSON.stringify(parsedData),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error("Error in market-pulse-social function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});