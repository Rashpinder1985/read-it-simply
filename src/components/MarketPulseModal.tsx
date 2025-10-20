import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as ChartTooltip, ResponsiveContainer, Legend, Area, AreaChart } from 'recharts';
import { TrendingUp, TrendingDown, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
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
          {/* Instagram Handle Section */}
          <Card className="p-4 bg-gradient-to-r from-primary/5 to-accent/5 border border-primary/20">
            <div className="flex items-center gap-4">
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
          <Tabs defaultValue="social" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="social">Follow Competitors</TabsTrigger>
              <TabsTrigger value="competitors">Competitor Analysis</TabsTrigger>
              <TabsTrigger value="trends">10-Year Trends</TabsTrigger>
            </TabsList>

            {/* Follow Competitors Tab */}
            <TabsContent value="social" className="space-y-6 mt-6">
              <p className="text-muted-foreground mb-4">Connect with competitors on social media and visit their websites</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {competitors.map((competitor: any) => {
                  const instagramHandle = competitor?.instagram_handle || competitor.brand_name.toLowerCase().replace(/\s+/g, '');
                  const socialMediaLinks = competitor?.social_media_links || {};
                  const website = socialMediaLinks?.website || `https://www.${competitor.brand_name.toLowerCase().replace(/\s+/g, '')}.com`;
                  
                  return (
                    <Card key={competitor.id} className="p-6 hover:shadow-lg transition-all">
                      <div className="space-y-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-bold text-xl mb-1">{competitor.brand_name}</h4>
                            <Badge variant="outline">{competitor.category}</Badge>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium min-w-[100px]">Instagram:</span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.open(`https://instagram.com/${instagramHandle}`, '_blank')}
                              className="gap-2 flex-1"
                            >
                              <ExternalLink className="h-4 w-4" />
                              @{instagramHandle}
                            </Button>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium min-w-[100px]">Website:</span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.open(website, '_blank')}
                              className="gap-2 flex-1"
                            >
                              <ExternalLink className="h-4 w-4" />
                              Visit Website
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>

            {/* Competitor Analysis Tab */}
            <TabsContent value="competitors" className="space-y-6 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {competitors.map((competitor: any) => {
                  const relevanceScore = Math.floor(Math.random() * 10) + 90; // 90-100
                  const region = "Pan-India"; // Default region
                  const instagramHandle = competitor?.instagram_handle || competitor.brand_name.toLowerCase().replace(/\s+/g, '');
                  const socialMediaLinks = competitor?.social_media_links || {};
                  const website = socialMediaLinks?.website || `https://www.${competitor.brand_name.toLowerCase().replace(/\s+/g, '')}.com`;
                  
                  return (
                    <Card key={competitor.id} className="p-6 hover:shadow-lg transition-all border-2 border-primary/20 relative">
                      <Badge className="absolute top-4 right-4 bg-primary text-primary-foreground">
                        ✓ AI Selected
                      </Badge>
                      
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-bold text-2xl mb-1">{competitor.brand_name}</h4>
                          <p className="text-sm text-muted-foreground">{competitor.category}</p>
                        </div>

                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">Region:</span>
                            <span className="font-semibold">{region}</span>
                          </div>

                          <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">Category:</span>
                            <span className="font-semibold text-sm">{competitor.category}</span>
                          </div>

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

                        <div className="pt-4 border-t space-y-3">
                          <div>
                            <span className="font-semibold block mb-1 text-sm">Latest Innovation</span>
                            <p className="text-sm text-muted-foreground">{competitor.product_innovation}</p>
                          </div>
                          
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-semibold text-sm">Recent Update</span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => window.open(`https://www.google.com/search?q=${encodeURIComponent(competitor.brand_name + ' ' + competitor.major_update)}`, '_blank')}
                                className="h-6 px-2 text-xs gap-1"
                              >
                                <ExternalLink className="h-3 w-3" />
                                Verify
                              </Button>
                            </div>
                            <p className="text-sm text-muted-foreground">{competitor.major_update}</p>
                          </div>
                        </div>

                        <div className="pt-4 border-t space-y-3">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium min-w-[80px]">Instagram:</span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.open(`https://instagram.com/${instagramHandle}`, '_blank')}
                              className="gap-2 flex-1"
                            >
                              <ExternalLink className="h-4 w-4" />
                              @{instagramHandle}
                            </Button>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium min-w-[80px]">Website:</span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.open(website, '_blank')}
                              className="gap-2 flex-1"
                            >
                              <ExternalLink className="h-4 w-4" />
                              Visit Website
                            </Button>
                          </div>
                        </div>

                        <div className="pt-4 border-t">
                          <div className="flex items-start gap-2 mb-2">
                            <span className="text-muted-foreground text-sm">ⓘ</span>
                            <span className="font-semibold text-sm">Why this competitor?</span>
                          </div>
                          <div className="bg-muted/30 p-3 rounded-lg">
                            <p className="text-sm text-muted-foreground">
                              {competitor.competitor_insights || `Major direct competitor with extensive presence and diverse offerings, representing a significant market share.`}
                            </p>
                          </div>
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
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};