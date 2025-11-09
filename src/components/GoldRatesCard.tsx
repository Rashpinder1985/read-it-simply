import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface GoldRate {
  id: string;
  captured_at: string;
  gold_24k_per_10g: number;
  gold_22k_per_10g: number;
  gold_18k_per_10g: number;
}

export function GoldRatesCard() {
  const [goldRates, setGoldRates] = useState<GoldRate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGoldRates();
  }, []);

  const fetchGoldRates = async () => {
    try {
      const { data, error } = await supabase
        .from("gold_rates")
        .select("*")
        .order("captured_at", { ascending: false })
        .limit(2); // Get latest 2 to calculate trend

      if (error) throw error;
      setGoldRates(data || []);
    } catch (error) {
      console.error("Error fetching gold rates:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateTrend = (current: number, previous: number | undefined) => {
    if (!previous) return null;
    const diff = current - previous;
    const percentChange = (diff / previous) * 100;
    return { diff, percentChange };
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const TrendIndicator = ({ value }: { value: number }) => {
    if (value > 0.1) {
      return (
        <div className="flex items-center gap-1 text-red-600">
          <TrendingUp className="h-4 w-4" />
          <span className="text-sm font-medium">+{value.toFixed(2)}%</span>
        </div>
      );
    }
    if (value < -0.1) {
      return (
        <div className="flex items-center gap-1 text-green-600">
          <TrendingDown className="h-4 w-4" />
          <span className="text-sm font-medium">{value.toFixed(2)}%</span>
        </div>
      );
    }
    return (
      <div className="flex items-center gap-1 text-gray-500">
        <Minus className="h-4 w-4" />
        <span className="text-sm font-medium">0%</span>
      </div>
    );
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-2xl">💰</span>
            Live Gold Rates
          </CardTitle>
          <CardDescription>IBJA Benchmark Rates (per 10g)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-16 bg-gray-200 rounded"></div>
            <div className="h-16 bg-gray-200 rounded"></div>
            <div className="h-16 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const latestRate = goldRates[0];
  const previousRate = goldRates[1];

  if (!latestRate) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-2xl">💰</span>
            Live Gold Rates
          </CardTitle>
          <CardDescription>IBJA Benchmark Rates (per 10g)</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No gold rates available. Contact admin to update rates from{" "}
            <a
              href="https://ibjarates.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline"
            >
              IBJA
            </a>
          </p>
        </CardContent>
      </Card>
    );
  }

  const trend24k = calculateTrend(latestRate.gold_24k_per_10g, previousRate?.gold_24k_per_10g);
  const trend22k = calculateTrend(latestRate.gold_22k_per_10g, previousRate?.gold_22k_per_10g);
  const trend18k = calculateTrend(latestRate.gold_18k_per_10g, previousRate?.gold_18k_per_10g);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <span className="text-2xl">💰</span>
              Live Gold Rates
            </CardTitle>
            <CardDescription>
              IBJA Benchmark Rates • Updated {formatDate(latestRate.captured_at)}
            </CardDescription>
          </div>
          <a
            href="https://ibjarates.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-primary hover:underline"
          >
            Source: IBJA →
          </a>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* 24K Gold (999 Purity) */}
          <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-yellow-100">
                  24K / 999
                </Badge>
                <span className="font-semibold text-lg">
                  {formatCurrency(latestRate.gold_24k_per_10g)}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Pure Gold (99.9%)</p>
            </div>
            {trend24k && <TrendIndicator value={trend24k.percentChange} />}
          </div>

          {/* 22K Gold (916 Purity) */}
          <div className="flex items-center justify-between p-4 bg-amber-50 rounded-lg border border-amber-200">
            <div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-amber-100">
                  22K / 916
                </Badge>
                <span className="font-semibold text-lg">
                  {formatCurrency(latestRate.gold_22k_per_10g)}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Jewellery Gold (91.6%)</p>
            </div>
            {trend22k && <TrendIndicator value={trend22k.percentChange} />}
          </div>

          {/* 18K Gold (750 Purity) */}
          <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg border border-orange-200">
            <div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-orange-100">
                  18K / 750
                </Badge>
                <span className="font-semibold text-lg">
                  {formatCurrency(latestRate.gold_18k_per_10g)}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Designer Gold (75%)</p>
            </div>
            {trend18k && <TrendIndicator value={trend18k.percentChange} />}
          </div>
        </div>

        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-xs text-blue-900">
            <strong>💡 Pro Tip:</strong> IBJA rates are India's official benchmark used by RBI for
            Sovereign Gold Bonds and by banks for gold loans. All prices exclude 3% GST and making
            charges.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

