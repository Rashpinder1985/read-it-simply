import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ExternalLink, Save } from "lucide-react";

export default function GoldRatesAdmin() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [rates, setRates] = useState({
    gold_24k_per_10g: "",
    gold_22k_per_10g: "",
    gold_18k_per_10g: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("Not authenticated");
      }

      const response = await fetch(
        `${supabase.supabaseUrl}/functions/v1/marketpulse-gold-rates`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            gold_24k_per_10g: parseFloat(rates.gold_24k_per_10g),
            gold_22k_per_10g: parseFloat(rates.gold_22k_per_10g),
            gold_18k_per_10g: parseFloat(rates.gold_18k_per_10g),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update gold rates");
      }

      toast({
        title: "Gold rates updated successfully!",
        description: "The latest IBJA rates have been saved to the database.",
      });

      // Clear form
      setRates({
        gold_24k_per_10g: "",
        gold_22k_per_10g: "",
        gold_18k_per_10g: "",
      });
    } catch (error: any) {
      console.error("Error updating gold rates:", error);
      toast({
        title: "Error updating gold rates",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl flex items-center gap-2">
                <span className="text-2xl">💰</span>
                Update Gold Rates (Admin)
              </CardTitle>
              <CardDescription>
                Update IBJA benchmark gold rates for the MarketPulse dashboard
              </CardDescription>
            </div>
            <a
              href="https://ibjarates.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-primary hover:underline"
            >
              <ExternalLink className="h-4 w-4" />
              Visit IBJA Rates
            </a>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 24K Gold (999 Purity) */}
            <div className="space-y-2">
              <Label htmlFor="gold_24k">
                24K Gold (999 Purity) - Price per 10 grams
              </Label>
              <div className="flex gap-2 items-center">
                <span className="text-2xl">₹</span>
                <Input
                  id="gold_24k"
                  type="number"
                  step="0.01"
                  placeholder="e.g., 75000.00"
                  value={rates.gold_24k_per_10g}
                  onChange={(e) =>
                    setRates({ ...rates, gold_24k_per_10g: e.target.value })
                  }
                  required
                  className="flex-1"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Pure gold (99.9% purity) - Investment grade
              </p>
            </div>

            {/* 22K Gold (916 Purity) */}
            <div className="space-y-2">
              <Label htmlFor="gold_22k">
                22K Gold (916 Purity) - Price per 10 grams
              </Label>
              <div className="flex gap-2 items-center">
                <span className="text-2xl">₹</span>
                <Input
                  id="gold_22k"
                  type="number"
                  step="0.01"
                  placeholder="e.g., 68750.00"
                  value={rates.gold_22k_per_10g}
                  onChange={(e) =>
                    setRates({ ...rates, gold_22k_per_10g: e.target.value })
                  }
                  required
                  className="flex-1"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Jewellery gold (91.6% purity) - Most common for jewellery
              </p>
            </div>

            {/* 18K Gold (750 Purity) */}
            <div className="space-y-2">
              <Label htmlFor="gold_18k">
                18K Gold (750 Purity) - Price per 10 grams
              </Label>
              <div className="flex gap-2 items-center">
                <span className="text-2xl">₹</span>
                <Input
                  id="gold_18k"
                  type="number"
                  step="0.01"
                  placeholder="e.g., 56250.00"
                  value={rates.gold_18k_per_10g}
                  onChange={(e) =>
                    setRates({ ...rates, gold_18k_per_10g: e.target.value })
                  }
                  required
                  className="flex-1"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Designer gold (75% purity) - Used for designer jewellery
              </p>
            </div>

            <div className="flex gap-4 pt-4">
              <Button type="submit" disabled={loading} className="flex-1">
                <Save className="mr-2 h-4 w-4" />
                {loading ? "Updating..." : "Update Gold Rates"}
              </Button>
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="font-semibold text-blue-900 mb-2">📝 Instructions:</h4>
              <ol className="text-sm text-blue-900 space-y-1 list-decimal list-inside">
                <li>Visit <a href="https://ibjarates.com/" target="_blank" rel="noopener noreferrer" className="underline">ibjarates.com</a> to get the latest rates</li>
                <li>Look for <strong>AM</strong> or <strong>PM</strong> rates (closing rates are usually more accurate)</li>
                <li>Enter rates for 999 purity (24K), 916 purity (22K), and 750 purity (18K)</li>
                <li>Rates should be per 10 grams (IBJA standard)</li>
                <li>Click "Update Gold Rates" to save</li>
              </ol>
            </div>

            <div className="mt-4 p-4 bg-amber-50 rounded-lg border border-amber-200">
              <h4 className="font-semibold text-amber-900 mb-2">💡 About IBJA:</h4>
              <p className="text-sm text-amber-900">
                <strong>India Bullion and Jewellers Association (IBJA)</strong> is a 106-year-old
                association based in Mumbai. IBJA gold rates are India's official benchmark used by:
              </p>
              <ul className="text-sm text-amber-900 mt-2 space-y-1 list-disc list-inside">
                <li>Reserve Bank of India (RBI) for Sovereign Gold Bonds</li>
                <li>All banks and NBFCs for gold loans</li>
                <li>Ministry of Finance for government schemes</li>
              </ul>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}


