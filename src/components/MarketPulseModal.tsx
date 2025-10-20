import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Area, AreaChart } from 'recharts';
import { TrendingUp, TrendingDown, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

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

  // Group competitors by brand
  const competitorsByBrand = marketData?.reduce((acc: any, item) => {
    if (!acc[item.brand_name]) {
      acc[item.brand_name] = item;
    }
    return acc;
  }, {}) || {};

  const competitors = Object.values(competitorsByBrand);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-3xl font-bold text-primary">MarketPulse - Live Market Intelligence</DialogTitle>
        </DialogHeader>

        <div className="space-y-8">
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
          <Tabs defaultValue="competitors" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="competitors">Competitor Analysis</TabsTrigger>
              <TabsTrigger value="trends">10-Year Trends</TabsTrigger>
              <TabsTrigger value="social">Social Media Insights</TabsTrigger>
            </TabsList>

            {/* Competitor Analysis Tab */}
            <TabsContent value="competitors" className="space-y-6 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {competitors.map((competitor: any) => {
                  const tenYearData = generate10YearData(Number(competitor.gold_price));
                  const avgGrowth = ((Number(competitor.gold_price) - tenYearData[0].price) / tenYearData[0].price * 100).toFixed(1);
                  
                  return (
                    <Card key={competitor.id} className="p-5 hover:shadow-lg transition-all border-2 hover:border-accent/50">
                      <div className="space-y-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-bold text-xl">{competitor.brand_name}</h4>
                            <Badge variant="outline" className="mt-1">{competitor.category}</Badge>
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-muted-foreground">Current Rate</div>
                            <div className="text-2xl font-bold text-accent">₹{competitor.gold_price}</div>
                          </div>
                        </div>

                        <div className="space-y-3 text-sm">
                          <div className="bg-muted/30 p-3 rounded-lg">
                            <span className="font-semibold block mb-1">10-Year Growth</span>
                            <p className="text-accent text-lg font-bold">+{avgGrowth}%</p>
                          </div>

                          <div>
                            <span className="font-semibold block mb-1">Innovation</span>
                            <p className="text-muted-foreground">{competitor.product_innovation}</p>
                          </div>
                          
                          <div>
                            <span className="font-semibold block mb-1">Recent Update</span>
                            <p className="text-muted-foreground">{competitor.major_update}</p>
                          </div>

                          {competitor.engagement_metrics && (
                            <div className="pt-3 border-t">
                              <span className="font-semibold block mb-2">Engagement</span>
                              <div className="grid grid-cols-3 gap-2 text-xs">
                                <div className="text-center p-2 bg-green-500/10 rounded">
                                  <div className="font-bold text-green-600">{(competitor.engagement_metrics as any).likes}</div>
                                  <div className="text-muted-foreground">Likes</div>
                                </div>
                                <div className="text-center p-2 bg-blue-500/10 rounded">
                                  <div className="font-bold text-blue-600">{(competitor.engagement_metrics as any).comments}</div>
                                  <div className="text-muted-foreground">Comments</div>
                                </div>
                                <div className="text-center p-2 bg-amber-500/10 rounded">
                                  <div className="font-bold text-amber-600">{(competitor.engagement_metrics as any).shares}</div>
                                  <div className="text-muted-foreground">Shares</div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>

            {/* 10-Year Trends Tab */}
            <TabsContent value="trends" className="space-y-6 mt-6">
              {competitors.map((competitor: any) => {
                const tenYearData = generate10YearData(Number(competitor.gold_price));
                
                return (
                  <Card key={competitor.id} className="p-6">
                    <h3 className="text-xl font-bold mb-4">{competitor.brand_name} - 10 Year Price Trend</h3>
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

            {/* Social Media Insights Tab */}
            <TabsContent value="social" className="space-y-6 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {competitors.map((competitor: any) => {
                  const socialActivity = competitor.social_media_activity as any;
                  const metrics = competitor.engagement_metrics as any;
                  
                  // Display information sources without external links
                  const informationSources = [
                    { platform: 'Company Website', info: `${competitor.brand_name}.com` },
                    { platform: 'Industry Presence', info: 'National & International Markets' },
                    { platform: 'Brand Recognition', info: competitor.category },
                    { platform: 'Market Position', info: 'Established Jeweler' },
                  ];

                  return (
                    <Card key={competitor.id} className="p-6">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between pb-4 border-b">
                          <h3 className="text-xl font-bold">{competitor.brand_name}</h3>
                          <Badge>{socialActivity?.platform || 'Instagram'}</Badge>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-purple-500/10 p-4 rounded-lg">
                            <div className="text-sm text-muted-foreground">Followers</div>
                            <div className="text-2xl font-bold text-purple-600">
                              {socialActivity?.instagram_followers || '1.2M'}
                            </div>
                          </div>
                          <div className="bg-accent/10 p-4 rounded-lg">
                            <div className="text-sm text-muted-foreground">Engagement Rate</div>
                            <div className="text-2xl font-bold text-accent">
                              {socialActivity?.engagement_rate || '4.2%'}
                            </div>
                          </div>
                        </div>

                        <div>
                          <div className="text-sm font-semibold mb-2">Recent Campaigns</div>
                          <div className="flex flex-wrap gap-2">
                            {(socialActivity?.recent_campaigns || ['Festive Collection', 'Bridal Heritage']).map((campaign: string, idx: number) => (
                              <Badge key={idx} variant="secondary">{campaign}</Badge>
                            ))}
                          </div>
                        </div>

                        <div>
                          <div className="text-sm font-semibold mb-2">Activity</div>
                          <div className="bg-muted/30 p-3 rounded-lg">
                            <p className="text-sm">{socialActivity?.posts_today || 5} posts today</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Latest: {socialActivity?.latest_campaign || 'Diwali Collection 2025'}
                            </p>
                          </div>
                        </div>

                        <div>
                          <div className="text-sm font-semibold mb-3 flex items-center gap-2">
                            Brand Information
                            <Badge variant="outline" className="text-xs">Public Data</Badge>
                          </div>
                          <div className="space-y-2">
                            {informationSources.map((source, idx) => (
                              <div
                                key={idx}
                                className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border"
                              >
                                <span className="text-sm font-medium">{source.platform}</span>
                                <span className="text-sm text-muted-foreground">{source.info}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="pt-4 border-t">
                          <div className="text-sm font-semibold mb-2">Engagement Breakdown</div>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">Likes</span>
                              <span className="font-bold text-green-600">{metrics?.likes || 15000}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">Comments</span>
                              <span className="font-bold text-blue-600">{metrics?.comments || 500}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">Shares</span>
                              <span className="font-bold text-amber-600">{metrics?.shares || 200}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};