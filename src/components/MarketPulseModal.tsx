import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp, TrendingDown, Activity } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

interface MarketPulseModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

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

  const priceData = marketData?.map(m => ({
    brand: m.brand_name,
    gold: Number(m.gold_price),
    silver: Number(m.silver_price)
  })) || [];

  const engagementData = marketData?.map(m => {
    const metrics = m.engagement_metrics as any;
    return {
      brand: m.brand_name,
      likes: metrics?.likes || 0,
      comments: metrics?.comments || 0,
      shares: metrics?.shares || 0
    };
  }) || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">MarketPulse - Live Market Intelligence</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Gold & Silver Prices */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-accent" />
              Live Precious Metal Prices
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={priceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="brand" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="gold" fill="hsl(var(--accent))" name="Gold (₹/gram)" />
                <Bar dataKey="silver" fill="hsl(var(--muted))" name="Silver (₹/gram)" />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Engagement Metrics */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Activity className="h-5 w-5 text-accent" />
              Social Media Engagement Tracker
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={engagementData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="brand" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="likes" fill="#10b981" name="Likes" />
                <Bar dataKey="comments" fill="#6366f1" name="Comments" />
                <Bar dataKey="shares" fill="#f59e0b" name="Shares" />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Competitor Insights */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {marketData?.map((brand) => (
              <Card key={brand.id} className="p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-semibold text-lg">{brand.brand_name}</h4>
                    <Badge variant="outline" className="mt-1">{brand.category}</Badge>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground">Gold</div>
                    <div className="text-lg font-bold text-accent">₹{brand.gold_price}</div>
                  </div>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-semibold">Innovation:</span>
                    <p className="text-muted-foreground">{brand.product_innovation}</p>
                  </div>
                  
                  <div>
                    <span className="font-semibold">Major Update:</span>
                    <p className="text-muted-foreground">{brand.major_update}</p>
                  </div>

                  {brand.social_media_activity && (
                    <div className="flex items-center gap-2 pt-2 border-t">
                      <Badge variant="secondary">
                        {(brand.social_media_activity as any).posts_today} posts today
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        on {(brand.social_media_activity as any).platform}
                      </span>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
