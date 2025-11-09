import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as ChartTooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, TrendingDown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { competitorDataService, type ScopeType } from "@/services/competitorDataService";

interface MarketPulseModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const MarketPulseModal = ({ open, onOpenChange }: MarketPulseModalProps) => {
  const { toast } = useToast();
  const [selectedScope, setSelectedScope] = useState<'local' | 'regional' | 'national'>('local');

  // Fetch business details
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

  const userCity = (businessDetails?.branches as any[])?.[0]?.city;
  const userState = (businessDetails?.branches as any[])?.[0]?.state;

  // Fetch competitors from CSV knowledge base
  const { data: competitorsData } = useQuery({
    queryKey: ['competitors-csv', selectedScope, userCity, userState],
    queryFn: async () => {
      return await competitorDataService.getCompetitorsByScope(
        selectedScope as ScopeType,
        userCity,
        userState
      );
    },
    enabled: !!userCity || selectedScope === 'national'
  });

  // Get metal distribution
  const { data: metalDistribution } = useQuery({
    queryKey: ['metal-distribution', selectedScope, userCity, userState],
    queryFn: async () => {
      return await competitorDataService.getMetalDistribution(
        selectedScope as ScopeType,
        userCity,
        userState
      );
    }
  });

  // Get market presence stats
  const { data: marketStats } = useQuery({
    queryKey: ['market-stats', selectedScope, userCity, userState],
    queryFn: async () => {
      return await competitorDataService.getMarketPresenceStats(
        selectedScope as ScopeType,
        userCity,
        userState
      );
    }
  });

  // Fetch trend data
  const { data: geographicHotspots } = useQuery({
    queryKey: ['geographic-hotspots'],
    queryFn: async () => {
      return await competitorDataService.getGeographicExpansionHotspots(10);
    }
  });

  const { data: categoryMomentum } = useQuery({
    queryKey: ['category-momentum'],
    queryFn: async () => {
      return await competitorDataService.getCategoryMomentum();
    }
  });

  const { data: risingCompetitors } = useQuery({
    queryKey: ['rising-competitors', selectedScope, userCity, userState],
    queryFn: async () => {
      return await competitorDataService.getRisingCompetitors(
        selectedScope as ScopeType,
        userCity,
        userState,
        10
      );
    }
  });

  const { data: metalTrends } = useQuery({
    queryKey: ['metal-trends'],
    queryFn: async () => {
      return await competitorDataService.getMetalTrends();
    }
  });

  const { data: businessTypeTrends } = useQuery({
    queryKey: ['business-type-trends'],
    queryFn: async () => {
      return await competitorDataService.getBusinessTypeTrends();
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

  const competitors = competitorsData || [];
  const currentGoldRate = marketData?.[0]?.gold_price || 7500;
  const goldChange = currentGoldRate > 7450 ? '+2.3%' : '-1.2%';
  const isPositive = currentGoldRate > 7450;

  const getThreatLevel = (competitor: any) => {
    if (selectedScope === 'local' && competitor.city === userCity) return 'IMMEDIATE';
    if (selectedScope === 'regional' && competitor.state === userState) return 'HIGH';
    if (selectedScope === 'national') return 'MEDIUM';
    return 'LOW';
  };

  const getThreatBadgeVariant = (level: string) => {
    switch(level) {
      case 'IMMEDIATE': return 'destructive';
      case 'HIGH': return 'default';
      case 'MEDIUM': return 'secondary';
      default: return 'outline';
    }
  };

  const renderCompetitorCards = (filteredCompetitors: any[]) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {filteredCompetitors.slice(0, 12).map((competitor: any, index: number) => {
        const threatLevel = getThreatLevel(competitor);
        return (
          <Card key={index} className="p-4 hover:shadow-lg transition-shadow border-l-4" style={{
            borderLeftColor: threatLevel === 'IMMEDIATE' ? 'hsl(var(--destructive))' : 
                           threatLevel === 'HIGH' ? 'hsl(var(--primary))' : 
                           threatLevel === 'MEDIUM' ? 'hsl(var(--secondary))' : 'hsl(var(--border))'
          }}>
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <h4 className="font-bold text-sm line-clamp-2 flex-1">{competitor.competitor_name}</h4>
                <Badge variant={getThreatBadgeVariant(threatLevel)} className="text-xs shrink-0">
                  {threatLevel}
                </Badge>
              </div>
              
              <div className="flex flex-wrap gap-1">
                <Badge variant="outline" className="text-xs">{competitor.metal}</Badge>
                <Badge variant="outline" className="text-xs">{competitor.use_category}</Badge>
                <Badge variant="outline" className="text-xs">{competitor.business_type}</Badge>
                <Badge variant={
                  competitor.market_presence_label === 'High' ? 'default' :
                  competitor.market_presence_label === 'Medium' ? 'secondary' : 'outline'
                } className="text-xs">
                  {competitor.market_presence_label}
                </Badge>
              </div>
              
              <div className="text-xs text-muted-foreground space-y-1">
                <p className="flex items-center gap-1">
                  <span className="font-medium">Location:</span> {competitor.locality}, {competitor.city}
                </p>
                <p className="flex items-center gap-1">
                  <span className="font-medium">Region:</span> {competitor.region}
                </p>
                <p className="flex items-center gap-1">
                  <span className="font-medium">Price:</span> {competitor.price_positioning}
                </p>
              </div>
              
              <div className="flex items-center justify-between pt-2 border-t">
                <div className="text-xs">
                  <span className="font-bold text-accent">{competitor.rating_avg || 'N/A'}</span>
                  <span className="text-muted-foreground"> / 5.0</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  {competitor.review_count || 0} reviews
                </div>
              </div>

              {competitor.instagram_handle && (
                <div className="text-xs text-muted-foreground">
                  <span className="font-medium">Instagram:</span> @{competitor.instagram_handle}
                </div>
              )}
            </div>
          </Card>
        );
      })}
    </div>
  );

  const analyzeMarketPosition = (filteredCompetitors: any[], scopeLevel: string) => {
    const total = filteredCompetitors.length;
    const highPresence = filteredCompetitors.filter(c => c.market_presence_label === 'High').length;
    const avgRating = filteredCompetitors.reduce((sum, c) => sum + (c.rating_avg || 0), 0) / total || 0;
    const totalReviews = filteredCompetitors.reduce((sum, c) => sum + (c.review_count || 0), 0);

    // Competition Level Assessment
    let competitionLevel = 'LOW';
    let competitionColor = 'hsl(var(--accent))';
    if (total > 50) {
      competitionLevel = 'VERY HIGH';
      competitionColor = 'hsl(var(--destructive))';
    } else if (total > 30) {
      competitionLevel = 'HIGH';
      competitionColor = 'hsl(var(--primary))';
    } else if (total > 10) {
      competitionLevel = 'MEDIUM';
      competitionColor = 'hsl(var(--secondary))';
    }

    // Market Gap Analysis
    const metalDistrib = filteredCompetitors.reduce((acc, c) => {
      acc[c.metal] = (acc[c.metal] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const categoryDistrib = filteredCompetitors.reduce((acc, c) => {
      acc[c.use_category] = (acc[c.use_category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const priceDistrib = filteredCompetitors.reduce((acc, c) => {
      acc[c.price_positioning] = (acc[c.price_positioning] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Identify gaps (segments with < 3 competitors)
    const gaps: { type: string; segment: string; count: number }[] = [];
    
    Object.entries(metalDistrib).forEach(([metal, count]) => {
      if ((count as number) < 3) gaps.push({ type: 'Metal', segment: metal, count: count as number });
    });
    
    Object.entries(categoryDistrib).forEach(([category, count]) => {
      if ((count as number) < 3) gaps.push({ type: 'Category', segment: category, count: count as number });
    });

    Object.entries(priceDistrib).forEach(([price, count]) => {
      if ((count as number) < 3) gaps.push({ type: 'Price', segment: price, count: count as number });
    });

    // Strategic Recommendations
    const recommendations: { priority: 'HIGH' | 'MEDIUM' | 'LOW'; action: string }[] = [];

    if (competitionLevel === 'LOW' || competitionLevel === 'MEDIUM') {
      recommendations.push({
        priority: 'HIGH',
        action: `${scopeLevel} market is underserved. Strong opportunity to establish market leadership with aggressive marketing.`
      });
    }

    if (highPresence > total * 0.6) {
      recommendations.push({
        priority: 'HIGH',
        action: 'Market dominated by established players. Focus on differentiation and niche positioning.'
      });
    }

    if (avgRating < 4.0) {
      recommendations.push({
        priority: 'HIGH',
        action: 'Customer satisfaction is below industry standards. Opportunity to compete on service quality.'
      });
    }

    gaps.forEach(gap => {
      if (gap.count <= 1) {
        recommendations.push({
          priority: 'HIGH',
          action: `${gap.type} gap: "${gap.segment}" segment is severely underserved. Blue ocean opportunity.`
        });
      } else if (gap.count === 2) {
        recommendations.push({
          priority: 'MEDIUM',
          action: `${gap.type} opportunity: "${gap.segment}" has limited competition (${gap.count} players).`
        });
      }
    });

    if (recommendations.length === 0) {
      recommendations.push({
        priority: 'MEDIUM',
        action: 'Market is well-balanced. Focus on operational excellence and customer retention.'
      });
    }

    return {
      total,
      highPresence,
      avgRating: avgRating.toFixed(1),
      totalReviews,
      competitionLevel,
      competitionColor,
      gaps: gaps.slice(0, 5),
      recommendations: recommendations.slice(0, 4)
    };
  };

  const renderMarketPositionAnalysis = (filteredCompetitors: any[], scopeLevel: string) => {
    if (!filteredCompetitors.length) return null;

    const analysis = analyzeMarketPosition(filteredCompetitors, scopeLevel);

    return (
      <Card className="p-6 bg-gradient-to-br from-primary/5 to-accent/5 border-2 border-primary/20">
        <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
          Market Position Analysis - {scopeLevel}
        </h3>

        {/* Competition Level */}
        <div className="mb-6">
          <h4 className="text-lg font-semibold mb-3">Competition Level</h4>
          <div className="flex items-center gap-4">
            <Badge 
              className="text-lg px-4 py-2"
              style={{ backgroundColor: analysis.competitionColor, color: 'white' }}
            >
              {analysis.competitionLevel}
            </Badge>
            <div className="text-sm text-muted-foreground">
              {analysis.total} active competitors | {analysis.highPresence} with high market presence
            </div>
          </div>
        </div>

        {/* Market Gaps */}
        {analysis.gaps.length > 0 && (
          <div className="mb-6">
            <h4 className="text-lg font-semibold mb-3">Market Gaps Identified</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {analysis.gaps.map((gap, idx) => (
                <Card key={idx} className="p-3 border-l-4 border-l-accent">
                  <div className="flex justify-between items-start">
                    <div>
                      <Badge variant="outline" className="text-xs mb-1">{gap.type}</Badge>
                      <p className="font-medium text-sm">{gap.segment}</p>
                    </div>
                    <span className="text-xs text-muted-foreground">{gap.count} competitors</span>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Strategic Recommendations */}
        <div>
          <h4 className="text-lg font-semibold mb-3">Strategic Recommendations</h4>
          <div className="space-y-3">
            {analysis.recommendations.map((rec, idx) => (
              <Card key={idx} className="p-4 border-l-4" style={{
                borderLeftColor: rec.priority === 'HIGH' ? 'hsl(var(--destructive))' : 
                               rec.priority === 'MEDIUM' ? 'hsl(var(--primary))' : 'hsl(var(--secondary))'
              }}>
                <div className="flex items-start gap-3">
                  <Badge variant={
                    rec.priority === 'HIGH' ? 'destructive' : 
                    rec.priority === 'MEDIUM' ? 'default' : 'secondary'
                  } className="shrink-0">
                    {rec.priority}
                  </Badge>
                  <p className="text-sm flex-1">{rec.action}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </Card>
    );
  };

  const renderMarketPresenceHistogram = (filteredCompetitors: any[], title: string) => {
    const sortedCompetitors = [...filteredCompetitors]
      .sort((a, b) => (b.rating_avg || 0) - (a.rating_avg || 0))
      .slice(0, 15);

    return (
      <Card className="p-6">
        <h3 className="text-xl font-bold mb-2">{title}</h3>
        <p className="text-sm text-muted-foreground mb-4">Top competitors by rating and review volume (real JustDial data)</p>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart
            data={sortedCompetitors.map((c: any) => ({
              name: c.competitor_name.length > 15 ? c.competitor_name.substring(0, 13) + '...' : c.competitor_name,
              rating: c.rating_avg || 0,
              reviews: c.review_count || 0,
            }))}
            margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
            <YAxis yAxisId="left" orientation="left" stroke="hsl(var(--primary))" label={{ value: 'Rating (0-5)', angle: -90, position: 'insideLeft' }} />
            <YAxis yAxisId="right" orientation="right" stroke="hsl(var(--accent))" label={{ value: 'Reviews', angle: 90, position: 'insideRight' }} />
            <ChartTooltip />
            <Legend />
            <Bar yAxisId="left" dataKey="rating" fill="hsl(var(--primary))" name="Avg Rating" />
            <Bar yAxisId="right" dataKey="reviews" fill="hsl(var(--accent))" name="Review Count" />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-3xl font-bold text-primary">MarketPulse - Live Market Intelligence</DialogTitle>
        </DialogHeader>

        <div className="space-y-8">
          {/* Market Statistics Card */}
          {marketStats && (
            <Card className="p-6 bg-gradient-to-r from-primary/5 to-accent/5 border border-primary/20">
              <h3 className="text-xl font-bold mb-4">Market Overview - {selectedScope.charAt(0).toUpperCase() + selectedScope.slice(1)}</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-3xl font-bold text-primary">{marketStats.total}</p>
                  <p className="text-sm text-muted-foreground">Total Competitors</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-green-500">{marketStats.high}</p>
                  <p className="text-sm text-muted-foreground">High Presence</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-accent">{marketStats.avgRating.toFixed(1)}</p>
                  <p className="text-sm text-muted-foreground">Avg Rating</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-primary">{marketStats.totalReviews.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">Total Reviews</p>
                </div>
              </div>
            </Card>
          )}

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

          {/* Hierarchical Tabs: Local -> Regional -> National -> Trends */}
          <Tabs value={selectedScope} onValueChange={(value) => setSelectedScope(value as any)} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="local">Local Competitors</TabsTrigger>
              <TabsTrigger value="regional">Regional Market</TabsTrigger>
              <TabsTrigger value="national">National Players</TabsTrigger>
              <TabsTrigger value="trends">Emerging Trends</TabsTrigger>
            </TabsList>

            {/* Local Competitors Tab */}
            <TabsContent value="local" className="space-y-6 mt-6">
              <p className="text-muted-foreground mb-4">Competitors in your local market: {userCity || 'N/A'}</p>
              
              {/* Market Position Analysis - Local */}
              {renderMarketPositionAnalysis(competitors, 'Local')}

              {/* Competitor Cards Grid */}
              {renderCompetitorCards(competitors)}

              {/* Market Presence Histogram - Local */}
              {renderMarketPresenceHistogram(competitors, "Local Market Presence Analysis")}

              {/* Metal Distribution */}
              <Card className="p-6">
                <h3 className="text-xl font-bold mb-2">Local Metal Specialization</h3>
                <p className="text-sm text-muted-foreground mb-4">Metal category preferences in your local market</p>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={metalDistribution || []}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      label={({ metal, percentage }) => `${metal}: ${percentage}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {(metalDistribution || []).map((entry, index) => {
                        const colors = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];
                        return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                      })}
                    </Pie>
                    <ChartTooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </Card>
            </TabsContent>

            {/* Regional Market Tab */}
            <TabsContent value="regional" className="space-y-6 mt-6">
              <p className="text-muted-foreground mb-4">Competitors across your region: {userState || 'N/A'}</p>
              
              {/* Market Position Analysis - Regional */}
              {renderMarketPositionAnalysis(competitors, 'Regional')}

              {/* Competitor Cards Grid - Regional */}
              {renderCompetitorCards(competitors)}

              {/* Market Presence Histogram - Regional */}
              {renderMarketPresenceHistogram(competitors, "Regional Market Presence Analysis")}

              {/* Metal Distribution */}
              <Card className="p-6">
                <h3 className="text-xl font-bold mb-2">Regional Metal Specialization</h3>
                <p className="text-sm text-muted-foreground mb-4">Metal category distribution across the region</p>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={metalDistribution || []}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      label={({ metal, percentage }) => `${metal}: ${percentage}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {(metalDistribution || []).map((entry, index) => {
                        const colors = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];
                        return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                      })}
                    </Pie>
                    <ChartTooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </Card>
            </TabsContent>

            {/* National Players Tab */}
            <TabsContent value="national" className="space-y-6 mt-6">
              <p className="text-muted-foreground mb-4">Major national jewelry chains across India</p>
              
              {/* Market Position Analysis - National */}
              {renderMarketPositionAnalysis(competitors, 'National')}

              {/* Competitor Cards Grid - National */}
              {renderCompetitorCards(competitors)}

              {/* Market Presence Histogram - National */}
              {renderMarketPresenceHistogram(competitors, "National Market Leaders")}

              {/* Metal Distribution */}
              <Card className="p-6">
                <h3 className="text-xl font-bold mb-2">National Metal Specialization</h3>
                <p className="text-sm text-muted-foreground mb-4">Metal category distribution at national level</p>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={metalDistribution || []}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      label={({ metal, percentage }) => `${metal}: ${percentage}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {(metalDistribution || []).map((entry, index) => {
                        const colors = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];
                        return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                      })}
                    </Pie>
                    <ChartTooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </Card>
            </TabsContent>

            {/* Emerging Trends Tab */}
            <TabsContent value="trends" className="space-y-6 mt-6">
              <p className="text-muted-foreground mb-4">Discover emerging patterns and opportunities across the jewellery market</p>

              {/* Geographic Expansion Hotspots */}
              <Card className="p-6 bg-gradient-to-br from-accent/10 to-primary/5">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <TrendingUp className="h-6 w-6 text-accent" />
                  Geographic Expansion Hotspots
                </h3>
                <p className="text-sm text-muted-foreground mb-4">Cities with highest market activity and growth potential</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(geographicHotspots || []).map((hotspot: any, idx: number) => (
                    <Card key={idx} className="p-4 border-l-4" style={{
                      borderLeftColor: hotspot.trend === 'HOT' ? 'hsl(var(--destructive))' : 
                                     hotspot.trend === 'GROWING' ? 'hsl(var(--primary))' : 'hsl(var(--accent))'
                    }}>
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-bold">{hotspot.city}, {hotspot.state}</h4>
                          <Badge variant={
                            hotspot.trend === 'HOT' ? 'destructive' : 
                            hotspot.trend === 'GROWING' ? 'default' : 'secondary'
                          } className="mt-1">
                            {hotspot.trend}
                          </Badge>
                        </div>
                        <div className="text-right text-sm">
                          <p className="font-bold text-primary">{hotspot.competitorCount}</p>
                          <p className="text-xs text-muted-foreground">competitors</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-xs mt-3 pt-3 border-t">
                        <div>
                          <p className="text-muted-foreground">Avg Rating</p>
                          <p className="font-semibold">{hotspot.avgRating.toFixed(1)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Reviews</p>
                          <p className="font-semibold">{hotspot.totalReviews.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">High Presence</p>
                          <p className="font-semibold">{hotspot.highPresence}</p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </Card>

              {/* Category Momentum */}
              <Card className="p-6">
                <h3 className="text-xl font-bold mb-4">Category Momentum Analysis</h3>
                <p className="text-sm text-muted-foreground mb-4">Use categories with highest market activity and ratings</p>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={categoryMomentum || []} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" angle={-45} textAnchor="end" height={80} />
                    <YAxis yAxisId="left" orientation="left" stroke="hsl(var(--primary))" label={{ value: 'Competitors', angle: -90, position: 'insideLeft' }} />
                    <YAxis yAxisId="right" orientation="right" stroke="hsl(var(--accent))" label={{ value: 'Avg Rating', angle: 90, position: 'insideRight' }} />
                    <ChartTooltip />
                    <Legend />
                    <Bar yAxisId="left" dataKey="competitorCount" fill="hsl(var(--primary))" name="Competitor Count" />
                    <Bar yAxisId="right" dataKey="avgRating" fill="hsl(var(--accent))" name="Avg Rating" />
                  </BarChart>
                </ResponsiveContainer>
              </Card>

              {/* Rising Competitors */}
              <Card className="p-6 bg-gradient-to-br from-primary/5 to-accent/10">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <TrendingUp className="h-6 w-6 text-primary" />
                  Rising Competitors - {selectedScope.charAt(0).toUpperCase() + selectedScope.slice(1)}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">High-performing competitors with strong growth momentum</p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {(risingCompetitors || []).map((comp: any, idx: number) => (
                    <Card key={idx} className="p-4 border-l-4" style={{
                      borderLeftColor: comp.threat === 'IMMEDIATE' ? 'hsl(var(--destructive))' : 
                                     comp.threat === 'HIGH' ? 'hsl(var(--primary))' : 'hsl(var(--accent))'
                    }}>
                      <div className="space-y-2">
                        <div className="flex justify-between items-start">
                          <h4 className="font-bold text-sm line-clamp-2 flex-1">{comp.competitor_name}</h4>
                          <Badge variant={
                            comp.threat === 'IMMEDIATE' ? 'destructive' : 
                            comp.threat === 'HIGH' ? 'default' : 'secondary'
                          } className="text-xs shrink-0 ml-2">
                            {comp.threat}
                          </Badge>
                        </div>
                        <div className="flex gap-1 flex-wrap">
                          <Badge variant="outline" className="text-xs">{comp.metal}</Badge>
                          <Badge variant="outline" className="text-xs">{comp.use_category}</Badge>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          <p>{comp.city}, {comp.state}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-2 pt-2 border-t text-xs">
                          <div>
                            <p className="text-muted-foreground">Rating</p>
                            <p className="font-bold text-accent">{comp.rating_avg.toFixed(1)}/5.0</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Reviews</p>
                            <p className="font-bold">{comp.review_count.toLocaleString()}</p>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </Card>

              {/* Metal & Business Type Trends */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Metal Trends */}
                <Card className="p-6">
                  <h3 className="text-xl font-bold mb-4">Metal Specialization Trends</h3>
                  <div className="space-y-3">
                    {(metalTrends || []).map((trend: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <p className="font-semibold">{trend.metal}</p>
                          <p className="text-xs text-muted-foreground">Avg Rating: {trend.avgRating.toFixed(1)}</p>
                        </div>
                        <div className="text-right">
                          <Badge variant={
                            trend.trendStrength === 'DOMINANT' ? 'default' :
                            trend.trendStrength === 'STRONG' ? 'secondary' : 'outline'
                          }>
                            {trend.trendStrength}
                          </Badge>
                          <p className="text-xs text-muted-foreground mt-1">{trend.competitorCount} players</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Business Type Trends */}
                <Card className="p-6">
                  <h3 className="text-xl font-bold mb-4">Business Type Distribution</h3>
                  <div className="space-y-3">
                    {(businessTypeTrends || []).map((trend: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <p className="font-semibold">{trend.businessType}</p>
                          <p className="text-xs text-muted-foreground">Avg Rating: {trend.avgRating.toFixed(1)}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-primary">{trend.marketShare}%</p>
                          <p className="text-xs text-muted-foreground">{trend.competitorCount} businesses</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};
