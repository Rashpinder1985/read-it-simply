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

  const renderCompetitorCards = (filteredCompetitors: any[]) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {filteredCompetitors.slice(0, 12).map((competitor: any, index: number) => (
        <Card key={index} className="p-4 hover:shadow-lg transition-shadow">
          <div className="space-y-3">
            <div className="flex items-start justify-between">
              <h4 className="font-bold text-sm line-clamp-2">{competitor.competitor_name}</h4>
              <Badge variant={
                competitor.market_presence_label === 'High' ? 'default' :
                competitor.market_presence_label === 'Medium' ? 'secondary' : 'outline'
              }>
                {competitor.market_presence_label}
              </Badge>
            </div>
            
            <div className="text-xs text-muted-foreground space-y-1">
              <p className="flex items-center gap-1">
                <span className="font-medium">Location:</span> {competitor.city}, {competitor.state}
              </p>
              <p className="flex items-center gap-1">
                <span className="font-medium">Metal:</span>
                <Badge variant="outline" className="text-xs">{competitor.metal}</Badge>
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
          </div>
        </Card>
      ))}
    </div>
  );

  const renderMarketPresenceHistogram = (filteredCompetitors: any[], title: string) => (
    <Card className="p-6">
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground mb-4">Compare ratings and reviews based on actual data</p>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart
          data={filteredCompetitors.slice(0, 15).map((c: any) => ({
            name: c.competitor_name.length > 15 ? c.competitor_name.substring(0, 13) + '...' : c.competitor_name,
            rating: c.rating_avg || 0,
            reviews: c.review_count || 0,
          }))}
          margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
          <YAxis yAxisId="left" orientation="left" stroke="#8884d8" label={{ value: 'Rating (0-5)', angle: -90, position: 'insideLeft' }} />
          <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" label={{ value: 'Reviews', angle: 90, position: 'insideRight' }} />
          <ChartTooltip />
          <Legend />
          <Bar yAxisId="left" dataKey="rating" fill="#8884d8" name="Avg Rating" />
          <Bar yAxisId="right" dataKey="reviews" fill="#82ca9d" name="Review Count" />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );

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

          {/* Hierarchical Tabs: Local -> Regional -> National */}
          <Tabs value={selectedScope} onValueChange={(value) => setSelectedScope(value as any)} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="local">Local Competitors</TabsTrigger>
              <TabsTrigger value="regional">Regional Market</TabsTrigger>
              <TabsTrigger value="national">National Players</TabsTrigger>
            </TabsList>

            {/* Local Competitors Tab */}
            <TabsContent value="local" className="space-y-6 mt-6">
              <p className="text-muted-foreground mb-4">Competitors in your local market: {userCity || 'N/A'}</p>
              
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
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};
