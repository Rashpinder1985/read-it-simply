import { Card } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string;
  change?: string;
  icon: LucideIcon;
  trend?: "up" | "down" | "neutral";
}

export const StatsCard = ({ title, value, change, icon: Icon, trend = "neutral" }: StatsCardProps) => {
  const trendColors = {
    up: "text-green-600",
    down: "text-red-600",
    neutral: "text-muted-foreground",
  };

  return (
    <Card className="p-6 hover:shadow-[var(--shadow-medium)] transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-muted-foreground font-medium">{title}</p>
        <Icon className="h-5 w-5 text-accent" />
      </div>
      <div className="flex items-end justify-between">
        <h3 className="text-3xl font-bold text-foreground">{value}</h3>
        {change && (
          <p className={`text-sm font-medium ${trendColors[trend]}`}>
            {trend === "up" && "↑"} {trend === "down" && "↓"} {change}
          </p>
        )}
      </div>
    </Card>
  );
};
