import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Area, AreaChart } from 'recharts';
import { TrendingUp, TrendingDown, ExternalLink, Search, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface MarketPulseModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface SocialPost {
  description: string;
  postType: string;
  designCategory: string;
  engagement: {
    likes: number;
    comments: number;
    shares: number;
  };
  imageUrl: string;
  postUrl: string;
}

interface BrandSocialData {
  brand: string;
  posts: SocialPost[];
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
  const [socialData, setSocialData] = useState<BrandSocialData[]>([]);
  const [isLoadingSocial, setIsLoadingSocial] = useState(false);

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

  const fetchAllSocialMedia = async () => {
    setIsLoadingSocial(true);
    
    try {
      const brandNames = competitors.map((c: any) => c.brand_name);
      
      const { data, error } = await supabase.functions.invoke('market-pulse-social', {
        body: { brands: brandNames }
      });

      if (error) throw error;

      setSocialData(data || []);
      toast({
        title: "Social Media Data Loaded",
        description: `Found posts from ${brandNames.length} competitors`,
      });
    } catch (error: any) {
      console.error('Social media fetch error:', error);
      toast({
        title: "Failed to Load Social Data",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsLoadingSocial(false);
    }
  };

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
          <Tabs defaultValue="social" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="social">Social Media Posts</TabsTrigger>
              <TabsTrigger value="competitors">Competitor Analysis</TabsTrigger>
              <TabsTrigger value="trends">10-Year Trends</TabsTrigger>
            </TabsList>

            {/* Social Media Posts Tab */}
            <TabsContent value="social" className="space-y-6 mt-6">
              <div className="flex justify-between items-center mb-4">
                <p className="text-muted-foreground">View competitor latest designs and social media posts</p>
                <Button onClick={fetchAllSocialMedia} disabled={isLoadingSocial}>
                  {isLoadingSocial ? (
                    <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Loading...</>
                  ) : (
                    <><Search className="h-4 w-4 mr-2" />Load Social Posts</>
                  )}
                </Button>
              </div>

              {socialData.length > 0 ? (
                <div className="space-y-8">
                  {socialData.map((brandData, idx) => (
                    <div key={idx}>
                      <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                        {brandData.brand}
                        <Badge variant="secondary">{brandData.posts.length} posts</Badge>
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {brandData.posts.map((post, postIdx) => (
                          <Card key={postIdx} className="overflow-hidden hover:shadow-lg transition-all cursor-pointer" onClick={() => window.open(post.postUrl, '_blank')}>
                            <div className="aspect-square bg-muted relative">
                              <img 
                                src={post.imageUrl} 
                                alt={post.description}
                                className="w-full h-full object-cover"
                              />
                              <Badge className="absolute top-2 right-2">{post.postType}</Badge>
                            </div>
                            <div className="p-4 space-y-3">
                              <p className="text-sm line-clamp-2">{post.description}</p>
                              <Badge variant="outline">{post.designCategory}</Badge>
                              
                              <div className="grid grid-cols-3 gap-2 pt-2 border-t text-xs">
                                <div className="text-center">
                                  <div className="font-bold text-green-600">{post.engagement.likes.toLocaleString()}</div>
                                  <div className="text-muted-foreground">Likes</div>
                                </div>
                                <div className="text-center">
                                  <div className="font-bold text-blue-600">{post.engagement.comments.toLocaleString()}</div>
                                  <div className="text-muted-foreground">Comments</div>
                                </div>
                                <div className="text-center">
                                  <div className="font-bold text-amber-600">{post.engagement.shares.toLocaleString()}</div>
                                  <div className="text-muted-foreground">Shares</div>
                                </div>
                              </div>

                              <Button variant="outline" size="sm" className="w-full gap-2">
                                View on Instagram <ExternalLink className="h-3 w-3" />
                              </Button>
                            </div>
                          </Card>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <Card className="p-12 text-center">
                  <p className="text-muted-foreground mb-4">Click &quot;Load Social Posts&quot; to view competitor designs and latest collections</p>
                  <Search className="h-12 w-12 mx-auto text-muted-foreground/50" />
                </Card>
              )}
            </TabsContent>

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
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};