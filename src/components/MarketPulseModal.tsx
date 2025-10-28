import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as ChartTooltip, ResponsiveContainer, Legend, Area, AreaChart, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, TrendingDown, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

interface MarketPulseModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}


// Mock 10-year historical data generator
const generate10YearData = (currentPrice: number) => {
  const years = [];
  for (let i = 10; i >= 0; i--) {
    const year = new Date().getFullYear() - i;
    const variation = (Math.random() - 0.5) * 500;
    years.push({
      year: year.toString(),
      price: Math.round(currentPrice - variation - (i * 50)),
    });
  }
  return years;
};

export const MarketPulseModal = ({ open, onOpenChange }: MarketPulseModalProps) => {
  const { toast } = useToast();
  const [userInstagram, setUserInstagram] = useState(() => 
    localStorage.getItem('userInstagram') || 'rashpinder85'
  );
  const [competitorAnalysis, setCompetitorAnalysis] = useState<Record<string, any>>({});
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedScope, setSelectedScope] = useState<'local' | 'regional' | 'national' | 'international'>('national');

  // Fetch business details first
  const { data: businessDetails } = useQuery({
    queryKey: ['business-details'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('business_details')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    }
  });

  // Fetch competitors from the new table
  const { data: competitorsData } = useQuery({
    queryKey: ['competitors', selectedScope, businessDetails],
    queryFn: async () => {
      let query = supabase.from('competitors').select('*');
      
      // Get user's city from business details
      const userCity = (businessDetails?.branches as any[])?.[0]?.city?.toLowerCase();
      
      // Filter based on selected scope
      if (selectedScope === 'national') {
        query = query.eq('scope', 'national');
      } else if (selectedScope === 'regional') {
        // Filter by region based on user's location
        if (userCity && (userCity.includes('delhi') || userCity.includes('chandigarh') || userCity.includes('punjab'))) {
          query = query.in('scope', ['regional_north', 'national']);
        } else if (userCity && (userCity.includes('mumbai') || userCity.includes('pune'))) {
          query = query.in('scope', ['regional_west', 'national']);
        } else if (userCity && (userCity.includes('bangalore') || userCity.includes('chennai'))) {
          query = query.in('scope', ['regional_south', 'national']);
        } else if (userCity && (userCity.includes('kolkata'))) {
          query = query.in('scope', ['regional_east', 'national']);
        } else {
          query = query.in('scope', ['regional_north', 'regional_south', 'regional_east', 'regional_west', 'national']);
        }
      } else if (selectedScope === 'international') {
        query = query.eq('scope', 'international');
      } else if (selectedScope === 'local') {
        // Filter by specific city
        if (userCity) {
          // First try exact city match
          query = query.ilike('city', `%${userCity}%`);
          const { data: cityData } = await query;
          if (cityData && cityData.length > 0) {
            return cityData;
          }
          
          // Fallback to region-based filtering
          if (userCity.includes('chandigarh') || userCity.includes('delhi') || userCity.includes('punjab')) {
            query = supabase.from('competitors').select('*');
            query = query.in('scope', ['regional_north', 'national']);
            query = query.or('city.ilike.%Chandigarh%,city.ilike.%Delhi%,city.ilike.%Punjab%');
          }
        } else {
          query = query.in('scope', ['regional_north', 'regional_south', 'regional_east', 'regional_west', 'national']);
        }
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    }
  });

  const { data: marketData } = useQuery({
    queryKey: ['market-data'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('market_data')
        .select('*')
        .order('timestamp', { ascending: false });
      if (error) throw error;
      return data;
    }
  });

  // Get current gold rate (latest entry)
  const currentGoldRate = marketData?.[0]?.gold_price || 7500;
  const goldChange = currentGoldRate > 7450 ? '+2.3%' : '-1.2%';
  const isPositive = currentGoldRate > 7450;

  // Use competitors from the new table
  const competitors = competitorsData || [];

  // Analyze competitors with real-time web search
  useEffect(() => {
    const analyzeCompetitors = async () => {
      if (!competitors.length || !open) return;
      
      setIsAnalyzing(true);
      
      for (const competitor of competitors) {
        const compData = competitor as any;
        // Skip if already analyzed
        if (competitorAnalysis[compData.id]) continue;

        try {
          console.log('Analyzing competitor:', compData.business_name);
          
          const { data, error } = await supabase.functions.invoke('analyze-competitor', {
            body: {
              competitorName: compData.business_name,
              userBusinessName: businessDetails?.company_name || '',
              userCategory: businessDetails?.primary_segments?.[0] || 'jewellery',
            },
          });

          if (error) {
            console.error('Error analyzing competitor:', error);
            continue;
          }

          if (data?.success) {
            setCompetitorAnalysis(prev => ({
              ...prev,
              [compData.id]: data.data,
            }));
          }
        } catch (error) {
          console.error('Failed to analyze competitor:', error);
        }
      }
      
      setIsAnalyzing(false);
    };

    analyzeCompetitors();
  }, [competitors, open, businessDetails]);

  const saveInstagramHandle = () => {
    localStorage.setItem('userInstagram', userInstagram);
    toast({
      title: "Instagram Handle Saved",
      description: "Your Instagram handle has been saved successfully",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-3xl font-bold text-primary">MarketPulse - Live Market Intelligence</DialogTitle>
        </DialogHeader>

        <div className="space-y-8">
          {/* Scope Selection */}
          <Card className="p-4 bg-gradient-to-r from-primary/5 to-accent/5 border border-primary/20">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Market Analysis Scope</label>
                <div className="grid grid-cols-4 gap-2">
                  <Button
                    variant={selectedScope === 'local' ? 'default' : 'outline'}
                    onClick={() => setSelectedScope('local')}
                    size="sm"
                  >
                    Local
                  </Button>
                  <Button
                    variant={selectedScope === 'regional' ? 'default' : 'outline'}
                    onClick={() => setSelectedScope('regional')}
                    size="sm"
                  >
                    Regional
                  </Button>
                  <Button
                    variant={selectedScope === 'national' ? 'default' : 'outline'}
                    onClick={() => setSelectedScope('national')}
                    size="sm"
                  >
                    National
                  </Button>
                  <Button
                    variant={selectedScope === 'international' ? 'default' : 'outline'}
                    onClick={() => setSelectedScope('international')}
                    size="sm"
                  >
                    International
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {selectedScope === 'local' && 'Analyzing competitors in your city and nearby areas'}
                  {selectedScope === 'regional' && 'Analyzing competitors in your region (North/South/East/West India)'}
                  {selectedScope === 'national' && 'Analyzing major national jewelry chains across India'}
                  {selectedScope === 'international' && 'Analyzing international jewelry brands operating in India'}
                </p>
              </div>
              
              <div className="flex-1">
                <label className="text-sm font-medium mb-2 block">Your Instagram Handle</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={userInstagram}
                    onChange={(e) => setUserInstagram(e.target.value)}
                    placeholder="your_instagram_handle"
                    className="flex-1 px-3 py-2 rounded-md border bg-background"
                  />
                  <Button onClick={saveInstagramHandle} size="sm">
                    Save
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          {/* Gold Rate Ticker */}
          <Card className="p-6 bg-gradient-to-r from-accent/10 to-primary/10 border-2 border-accent/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-accent/20 p-3 rounded-full">
                  {isPositive ? (
                    <TrendingUp className="h-8 w-8 text-accent" />
                  ) : (
                    <TrendingDown className="h-8 w-8 text-destructive" />
                  )}
                </div>
                <div>
                  <h3 className="text-sm text-muted-foreground font-medium">LIVE GOLD RATE</h3>
                  <p className="text-4xl font-bold text-foreground mt-1">₹{currentGoldRate.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">per gram (24K)</p>
                </div>
              </div>
              <div className="text-right">
                <Badge variant={isPositive ? "default" : "destructive"} className="text-lg px-4 py-2">
                  {goldChange}
                </Badge>
                <p className="text-xs text-muted-foreground mt-2">vs yesterday</p>
              </div>
            </div>
          </Card>

          {/* Tabs for different sections */}
          <Tabs defaultValue="positioning" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="positioning">Market Positioning</TabsTrigger>
              <TabsTrigger value="trends">Emerging Trends</TabsTrigger>
              <TabsTrigger value="competitors">Competitor Analysis</TabsTrigger>
              <TabsTrigger value="historical">10-Year Trends</TabsTrigger>
            </TabsList>

            {/* Market Positioning Tab */}
            <TabsContent value="positioning" className="space-y-6 mt-6">
              <p className="text-muted-foreground mb-4">Strategic market intelligence and competitive positioning analysis</p>
              
              {/* 1. Regional Market Saturation Analysis - PIE CHART */}
              <Card className="p-6">
                <h3 className="text-xl font-bold mb-2">Regional Market Saturation Analysis</h3>
                <p className="text-sm text-muted-foreground mb-4">Market share distribution by competitor presence across regions</p>
                <ResponsiveContainer width="100%" height={350}>
                  <PieChart>
                    <Pie
                      data={(() => {
                        const regionCounts: Record<string, number> = {};
                        competitors.forEach((competitor: any) => {
                          const region = competitor.region || "Pan-India";
                          regionCounts[region] = (regionCounts[region] || 0) + 1;
                        });
                        return Object.entries(regionCounts).map(([region, count]) => ({
                          region,
                          competitors: count,
                          percentage: Math.round((count / competitors.length) * 100)
                        }));
                      })()}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      label={({ region, percentage }) => `${region}: ${percentage}%`}
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="competitors"
                    >
                      {(() => {
                        const regionCounts: Record<string, number> = {};
                        competitors.forEach((competitor: any) => {
                          const region = competitor.region || "Pan-India";
                          regionCounts[region] = (regionCounts[region] || 0) + 1;
                        });
                        const colors = ['#8b5cf6', '#f59e0b', '#10b981', '#3b82f6', '#ef4444', '#ec4899'];
                        return Object.keys(regionCounts).map((_, index) => (
                          <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                        ));
                      })()}
                    </Pie>
                    <ChartTooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--background))', 
                        border: '1px solid hsl(var(--border))' 
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </Card>

              {/* 2. Category Competition Intensity - COLOR CODED */}
              <Card className="p-6">
                <h3 className="text-xl font-bold mb-2">Category Competition Intensity</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  <span className="inline-block w-3 h-3 bg-red-500 mr-1 rounded"></span>Overcrowded (5+ competitors) | 
                  <span className="inline-block w-3 h-3 bg-yellow-500 mx-1 rounded"></span>Moderate (3-4) | 
                  <span className="inline-block w-3 h-3 bg-green-500 mx-1 rounded"></span>Opportunity (0-2)
                </p>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={(() => {
                      const categoryCounts: Record<string, number> = {};
                      competitors.forEach((competitor: any) => {
                        const category = competitor.category || "Gold & Diamond";
                        categoryCounts[category] = (categoryCounts[category] || 0) + 1;
                      });
                      return Object.entries(categoryCounts)
                        .map(([category, count]) => ({ category, count }))
                        .sort((a, b) => b.count - a.count);
                    })()}
                    layout="vertical"
                    margin={{ top: 20, right: 30, left: 120, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis type="number" label={{ value: 'Number of Competitors', position: 'bottom' }} />
                    <YAxis type="category" dataKey="category" width={110} />
                    <ChartTooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--background))', 
                        border: '1px solid hsl(var(--border))' 
                      }}
                    />
                    <Bar dataKey="count">
                      {(() => {
                        const categoryCounts: Record<string, number> = {};
                        competitors.forEach((competitor: any) => {
                          const category = competitor.category || "Gold & Diamond";
                          categoryCounts[category] = (categoryCounts[category] || 0) + 1;
                        });
                        return Object.entries(categoryCounts)
                          .map(([category, count]) => ({ category, count }))
                          .sort((a, b) => b.count - a.count)
                          .map((entry, index) => (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={entry.count >= 5 ? '#ef4444' : entry.count >= 3 ? '#f59e0b' : '#10b981'} 
                            />
                          ));
                      })()}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </Card>

              {/* 3. Top Competitors by AI Relevance Score */}
              <Card className="p-6">
                <h3 className="text-xl font-bold mb-2">Top Competitors by Market Strength</h3>
                <p className="text-sm text-muted-foreground mb-4">Ranked by AI relevance score - higher scores indicate stronger competitive threat</p>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart
                    data={competitors
                      .map((competitor: any) => {
                        const analysis = competitorAnalysis[competitor.id];
                        const businessName = competitor.business_name || competitor.brand_name;
                        return {
                          name: businessName?.length > 18 
                            ? businessName.substring(0, 16) + '...' 
                            : businessName,
                          score: analysis?.relevanceScore || 75
                        };
                      })
                      .sort((a, b) => b.score - a.score)
                      .slice(0, 10)}
                    layout="vertical"
                    margin={{ top: 20, right: 30, left: 150, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis type="number" domain={[0, 100]} />
                    <YAxis type="category" dataKey="name" width={140} />
                    <ChartTooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--background))', 
                        border: '1px solid hsl(var(--border))' 
                      }}
                    />
                    <Bar dataKey="score" fill="#10b981" radius={[0, 8, 8, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Card>

              {/* 4. Market Positioning Matrix */}
              <Card className="p-6">
                <h3 className="text-xl font-bold mb-2">Market Positioning Matrix</h3>
                <p className="text-sm text-muted-foreground mb-4">Strategic gap analysis - Your segments vs competitor focus areas</p>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={(() => {
                      const userSegments = Array.isArray(businessDetails?.primary_segments) 
                        ? businessDetails.primary_segments 
                        : [];
                      const categoryCounts: Record<string, { competitors: number; yourFocus: number }> = {};
                      
                      // Count competitor categories
                      competitors.forEach((competitor: any) => {
                        const category = competitor.category || "Gold & Diamond";
                        if (!categoryCounts[category]) {
                          categoryCounts[category] = { competitors: 0, yourFocus: 0 };
                        }
                        categoryCounts[category].competitors += 1;
                      });
                      
                      // Mark your focus areas
                      userSegments.forEach((segment: any) => {
                        if (!categoryCounts[segment]) {
                          categoryCounts[segment] = { competitors: 0, yourFocus: 1 };
                        } else {
                          categoryCounts[segment].yourFocus = 1;
                        }
                      });
                      
                      return Object.entries(categoryCounts).map(([category, data]) => ({
                        category,
                        competitors: data.competitors,
                        yourFocus: data.yourFocus * 2, // Scale for visibility
                      }));
                    })()}
                    margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis 
                      dataKey="category" 
                      angle={-45}
                      textAnchor="end"
                      height={100}
                    />
                    <YAxis label={{ value: 'Count', angle: -90, position: 'insideLeft' }} />
                    <ChartTooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--background))', 
                        border: '1px solid hsl(var(--border))' 
                      }}
                    />
                    <Legend />
                    <Bar dataKey="competitors" fill="hsl(var(--primary))" name="Competitor Count" radius={[8, 8, 0, 0]} />
                    <Bar dataKey="yourFocus" fill="hsl(var(--accent))" name="Your Focus" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Card>

              {/* 5. Innovation Activity Tracker */}
              <Card className="p-6">
                <h3 className="text-xl font-bold mb-2">Innovation Activity Tracker</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  <span className="inline-block w-3 h-3 bg-green-500 mr-1 rounded"></span>Active (innovation detected) | 
                  <span className="inline-block w-3 h-3 bg-gray-400 mx-1 rounded"></span>Dormant (no recent innovation)
                </p>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart
                    data={competitors
                      .map((competitor: any) => {
                        const analysis = competitorAnalysis[competitor.id];
                        const insights = (competitor.competitor_insights || '').toLowerCase();
                        const innovation = (competitor.product_innovation || '').toLowerCase();
                        const update = (competitor.major_update || '').toLowerCase();
                        const combined = insights + ' ' + innovation + ' ' + update;
                        
                        let score = 0;
                        if (combined.includes('innovation') || combined.includes('new') || combined.includes('launch')) score += 40;
                        if (combined.includes('technology') || combined.includes('digital')) score += 30;
                        if (combined.includes('2025') || combined.includes('2024')) score += 20;
                        if (combined.includes('expanding') || combined.includes('growth')) score += 10;
                        
                        return {
                          name: competitor.business_name?.length > 15 
                            ? competitor.business_name.substring(0, 13) + '...' 
                            : competitor.business_name,
                          score,
                        };
                      })
                      .sort((a, b) => b.score - a.score)
                      .slice(0, 10)}
                    margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis 
                      dataKey="name" 
                      angle={-45}
                      textAnchor="end"
                      height={120}
                      interval={0}
                    />
                    <YAxis 
                      domain={[0, 100]}
                      label={{ value: 'Innovation Score', angle: -90, position: 'insideLeft' }} 
                    />
                    <ChartTooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--background))', 
                        border: '1px solid hsl(var(--border))' 
                      }}
                    />
                    <Bar dataKey="score">
                      {competitors
                        .map((competitor: any) => {
                          const insights = (competitor.competitor_insights || '').toLowerCase();
                          const innovation = (competitor.product_innovation || '').toLowerCase();
                          const update = (competitor.major_update || '').toLowerCase();
                          const combined = insights + ' ' + innovation + ' ' + update;
                          
                          let score = 0;
                          if (combined.includes('innovation') || combined.includes('new') || combined.includes('launch')) score += 40;
                          if (combined.includes('technology') || combined.includes('digital')) score += 30;
                          if (combined.includes('2025') || combined.includes('2024')) score += 20;
                          if (combined.includes('expanding') || combined.includes('growth')) score += 10;
                          
                          return score;
                        })
                        .sort((a, b) => b - a)
                        .slice(0, 10)
                        .map((score, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={score > 0 ? '#10b981' : '#9ca3af'} 
                          />
                        ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </TabsContent>

            {/* Emerging Trends Tab */}
            <TabsContent value="trends" className="space-y-6 mt-6">
              <p className="text-muted-foreground mb-4">AI-powered emerging market trends and opportunities in the jewelry industry</p>
              
              {[
                {
                  id: 1,
                  title: "Transparency in Pricing and Product Information",
                  impact: "medium",
                  timeHorizon: "short-term",
                  description: "Increasing demand from consumers for clear and transparent pricing, including detailed breakdowns of gold weight, diamond carat, making charges, and stone costs. Comprehensive product information, including certifications and ethical sourcing details, builds trust and confidence.",
                  opportunityScore: 70,
                  affectedCompetitors: competitors.slice(0, 5).map((c: any) => c.business_name),
                  actions: [
                    "Provide a detailed breakdown of pricing components (gold weight, diamond weight, making charges, stone cost) for all products.",
                    "Ensure all gold and diamond jewellery is certified by recognized authorities (e.g., BIS Hallmark for gold, GIA/IGI for diamonds).",
                    "Clearly communicate ethical sourcing practices and certifications on the website and in-store.",
                    "Implement consistent pricing across all channels – online and offline."
                  ]
                },
                {
                  id: 2,
                  title: "Digital-First Shopping Experience",
                  impact: "high",
                  timeHorizon: "immediate",
                  description: "Rapid shift toward online jewelry shopping with virtual try-on, AR visualization, and seamless omnichannel experiences. Mobile-first approach is becoming essential for reaching younger demographics.",
                  opportunityScore: 85,
                  affectedCompetitors: competitors.filter((c: any) => 
                    (c.key_differentiators || '').toLowerCase().includes('digital') ||
                    (c.key_differentiators || '').toLowerCase().includes('online')
                  ).slice(0, 4).map((c: any) => c.business_name),
                  actions: [
                    "Implement virtual try-on technology using AR/AI for rings, necklaces, and earrings.",
                    "Develop a mobile-optimized shopping experience with one-click checkout.",
                    "Create 360-degree product views with zoom capabilities for all jewelry pieces.",
                    "Integrate live chat support for real-time customer queries."
                  ]
                },
                {
                  id: 3,
                  title: "Sustainable and Ethical Jewelry",
                  impact: "high",
                  timeHorizon: "long-term",
                  description: "Growing consumer preference for ethically sourced materials, lab-grown diamonds, and recycled precious metals. Environmental consciousness is driving purchasing decisions, especially among millennials and Gen Z.",
                  opportunityScore: 78,
                  affectedCompetitors: competitors.slice(2, 6).map((c: any) => c.business_name),
                  actions: [
                    "Introduce lab-grown diamond collections with clear pricing advantages.",
                    "Launch recycled gold and sustainable jewelry lines.",
                    "Obtain and display responsible jewelry certifications (e.g., Responsible Jewellery Council).",
                    "Create transparent supply chain documentation available to customers."
                  ]
                },
                {
                  id: 4,
                  title: "Personalization and Customization",
                  impact: "medium",
                  timeHorizon: "short-term",
                  description: "Rising demand for personalized jewelry with custom engravings, birthstones, and bespoke designs. Customers want unique pieces that reflect their individual style and story.",
                  opportunityScore: 72,
                  affectedCompetitors: competitors.filter((c: any) => 
                    (c.key_differentiators || '').toLowerCase().includes('custom') ||
                    (c.key_differentiators || '').toLowerCase().includes('design')
                  ).slice(0, 4).map((c: any) => c.business_name),
                  actions: [
                    "Launch an online customization tool for selecting stones, metals, and designs.",
                    "Offer free engraving services for personal messages and dates.",
                    "Create a 'Design Your Own' section with CAD preview capabilities.",
                    "Implement a consultation booking system for bespoke jewelry services."
                  ]
                },
                {
                  id: 5,
                  title: "Investment-Grade Jewelry",
                  impact: "medium",
                  timeHorizon: "long-term",
                  description: "Increasing awareness of jewelry as an investment asset, particularly in high-purity gold coins, bars, and certified diamond pieces. Customers seek transparency in buyback policies and certification.",
                  opportunityScore: 68,
                  affectedCompetitors: competitors.filter((c: any) => 
                    (c.key_differentiators || '').toLowerCase().includes('gold') ||
                    (c.key_differentiators || '').toLowerCase().includes('investment')
                  ).slice(0, 5).map((c: any) => c.business_name),
                  actions: [
                    "Offer certified investment-grade gold coins and bars with buyback guarantees.",
                    "Provide clear documentation of purity, weight, and certification for all investment pieces.",
                    "Create an investment calculator showing potential returns based on gold price trends.",
                    "Establish a transparent buyback policy with competitive rates."
                  ]
                }
              ].map((trend) => (
                <Card key={trend.id} className="p-6 border-2 hover:shadow-lg transition-shadow">
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="text-4xl font-bold text-primary/60">#{trend.id}</div>
                        <Badge 
                          variant={trend.impact === 'high' ? 'default' : 'secondary'}
                          className={`${
                            trend.impact === 'high' 
                              ? 'bg-red-500 hover:bg-red-600' 
                              : trend.impact === 'medium'
                              ? 'bg-blue-500 hover:bg-blue-600'
                              : 'bg-green-500 hover:bg-green-600'
                          } text-white`}
                        >
                          {trend.impact} impact
                        </Badge>
                      </div>
                    </div>

                    {/* Title and Time Horizon */}
                    <div className="space-y-2">
                      <h3 className="text-2xl font-bold">{trend.title}</h3>
                      <Badge variant="outline" className="border-muted-foreground/30">
                        {trend.timeHorizon}
                      </Badge>
                    </div>

                    {/* Description */}
                    <p className="text-muted-foreground leading-relaxed">
                      {trend.description}
                    </p>

                    {/* Opportunity Score */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-semibold">Opportunity Score</span>
                        <span className="text-2xl font-bold text-primary">
                          {trend.opportunityScore}/100
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-500"
                          style={{ width: `${trend.opportunityScore}%` }}
                        />
                      </div>
                    </div>

                    {/* Affected Competitors */}
                    <div className="space-y-2">
                      <h4 className="font-semibold text-lg">Affected Competitors</h4>
                      <div className="flex flex-wrap gap-2">
                        {trend.affectedCompetitors.map((competitor, idx) => (
                          <Badge 
                            key={idx} 
                            className="bg-primary/10 text-primary hover:bg-primary/20 px-4 py-1.5"
                          >
                            {competitor}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Recommended Actions */}
                    <div className="space-y-3">
                      <h4 className="font-semibold text-lg">Recommended Actions</h4>
                      <ul className="space-y-2">
                        {trend.actions.map((action, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-muted-foreground">
                            <span className="text-primary mt-1">•</span>
                            <span>{action}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </Card>
              ))}
            </TabsContent>

            {/* Competitor Analysis Tab */}
            <TabsContent value="competitors" className="space-y-6 mt-6">
              <p className="text-muted-foreground mb-4">
                Detailed analysis of top competitors in your market segment ({selectedScope} scope) - {competitors.length} competitors found
              </p>
              
              {competitors.length === 0 ? (
                <Card className="p-8 text-center">
                  <p className="text-muted-foreground">No competitors found for the selected scope. Try selecting a different scope.</p>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {competitors.map((competitor: any, index: number) => {
                    const analysis = competitorAnalysis[competitor.id];
                    const isLoading = !analysis && isAnalyzing;
                    
                    // Use analysis data if available, otherwise use default values
                    const relevanceScore = analysis?.relevanceScore || 85;
                    const isAiSelected = analysis?.isAiSelected || false;
                    const region = competitor?.region || analysis?.region || "Pan-India";
                    const competitorInsight = analysis?.competitorInsight || 
                      (isLoading ? "Analyzing competitor with real-time market data..." : 
                       `Major competitor in the ${competitor.category || 'jewellery'} segment with significant market presence.`);
                    
                    const instagramHandle = competitor?.instagram_handle || competitor.business_name?.toLowerCase().replace(/\s+/g, '');
                    const website = `https://www.${competitor.business_name?.toLowerCase().replace(/\s+/g, '')}.com`;
                  
                    return (
                      <Card key={competitor.id} className="p-6 hover:shadow-lg transition-all border-2 border-primary/20 relative">
                        {isAiSelected && (
                          <Badge className="absolute top-4 right-4 bg-primary text-primary-foreground">
                            ✓ AI Selected
                          </Badge>
                        )}
                        {isLoading && (
                          <Badge className="absolute top-4 right-4 bg-accent text-accent-foreground animate-pulse">
                            Analyzing...
                          </Badge>
                        )}
                        
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-bold text-2xl mb-1">{competitor.business_name}</h4>
                            {competitor.brand_names && (
                              <p className="text-xs text-muted-foreground mb-1">{competitor.brand_names}</p>
                            )}
                            <p className="text-sm text-muted-foreground">{competitor.category}</p>
                          </div>

                          <div className="space-y-3">
                            <div className="flex justify-between items-center">
                              <span className="text-muted-foreground">Region:</span>
                              <span className="font-semibold">{region}</span>
                            </div>

                            {competitor.number_of_stores && (
                              <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">Stores:</span>
                                <span className="font-semibold text-sm">{competitor.number_of_stores}</span>
                              </div>
                            )}

                            {competitor.average_price_range && (
                              <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">Price Range:</span>
                                <span className="font-semibold text-sm">{competitor.average_price_range}</span>
                              </div>
                            )}

                            <div className="space-y-2">
                              <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">Relevance Score:</span>
                                <span className="font-bold text-primary text-lg">{relevanceScore}/100</span>
                              </div>
                              <div className="h-2 bg-muted rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all"
                                  style={{ width: `${relevanceScore}%` }}
                                />
                              </div>
                            </div>
                          </div>

                          {competitor.hq_address && (
                            <div className="pt-4 border-t space-y-3">
                              <div>
                                <span className="font-semibold block mb-1 text-sm">Headquarters</span>
                                <p className="text-sm text-muted-foreground">{competitor.hq_address}</p>
                              </div>
                            </div>
                          )}

                          {competitor.owner_name && (
                            <div className="pt-2 border-t space-y-3">
                              <div className="flex justify-between items-center">
                                <span className="text-muted-foreground text-sm">Owner:</span>
                                <span className="font-semibold text-sm">{competitor.owner_name}</span>
                              </div>
                            </div>
                          )}

                          <div className="pt-4 border-t space-y-3">
                            {competitor.instagram_url && (
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium min-w-[80px]">Instagram:</span>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => window.open(competitor.instagram_url, '_blank')}
                                  className="gap-2 flex-1"
                                >
                                  <ExternalLink className="h-4 w-4" />
                                  @{instagramHandle}
                                </Button>
                              </div>
                            )}

                            {competitor.facebook_url && (
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium min-w-[80px]">Facebook:</span>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => window.open(competitor.facebook_url, '_blank')}
                                  className="gap-2 flex-1"
                                >
                                  <ExternalLink className="h-4 w-4" />
                                  {competitor.facebook_name}
                                </Button>
                              </div>
                            )}
                          </div>

                          <div className="pt-4 border-t">
                            <div className="flex items-start gap-2 mb-2">
                              <span className="text-muted-foreground text-sm">ⓘ</span>
                              <span className="font-semibold text-sm">Why this competitor?</span>
                            </div>
                            <div className="bg-muted/30 p-3 rounded-lg">
                              <p className="text-sm text-muted-foreground">
                                {competitorInsight}
                              </p>
                            </div>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              )}
            </TabsContent>

            {/* 10-Year Historical Trends Tab */}
            <TabsContent value="historical" className="space-y-6 mt-6">
              <p className="text-muted-foreground mb-4">10-year gold price trends across the Indian jewelry market</p>
              {competitors.slice(0, 5).map((competitor: any) => {
                const tenYearData = generate10YearData(7500); // Using current gold price
                
                return (
                  <Card key={competitor.id} className="p-6">
                    <h3 className="text-xl font-bold mb-4">{competitor.business_name || competitor.brand_name} - 10 Year Gold Price Trend</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={tenYearData}>
                        <defs>
                          <linearGradient id={`color${competitor.id}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="year" />
                        <YAxis />
                        <Tooltip />
                        <Area 
                          type="monotone" 
                          dataKey="price" 
                          stroke="hsl(var(--accent))" 
                          fillOpacity={1} 
                          fill={`url(#color${competitor.id})`}
                          name="Gold Price (₹/gram)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>

                    <div className="mt-4 grid grid-cols-3 gap-4">
                      <div className="bg-muted/30 p-3 rounded-lg">
                        <div className="text-xs text-muted-foreground">2015 Price</div>
                        <div className="text-lg font-bold">₹{tenYearData[0].price}</div>
                      </div>
                      <div className="bg-muted/30 p-3 rounded-lg">
                        <div className="text-xs text-muted-foreground">Current Price</div>
                        <div className="text-lg font-bold">₹{tenYearData[tenYearData.length - 1].price}</div>
                      </div>
                      <div className="bg-accent/10 p-3 rounded-lg">
                        <div className="text-xs text-muted-foreground">Total Growth</div>
                        <div className="text-lg font-bold text-accent">
                          +{((tenYearData[tenYearData.length - 1].price - tenYearData[0].price) / tenYearData[0].price * 100).toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};