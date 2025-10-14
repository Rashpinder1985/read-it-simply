import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, Activity } from "lucide-react";

interface AIEmployeeProps {
  name: string;
  role: string;
  description: string;
  status: "active" | "idle" | "processing";
  icon: React.ReactNode;
  metrics?: { label: string; value: string }[];
}

export const AIEmployee = ({ name, role, description, status, icon, metrics }: AIEmployeeProps) => {
  const statusColors = {
    active: "bg-green-500",
    idle: "bg-gray-400",
    processing: "bg-accent",
  };

  return (
    <Card className="p-6 hover:shadow-[var(--shadow-medium)] transition-all duration-300 border-border bg-card">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-accent to-accent/80 flex items-center justify-center text-primary shadow-[var(--shadow-gold)]">
            {icon}
          </div>
          <div>
            <h3 className="font-semibold text-lg text-foreground">{name}</h3>
            <p className="text-sm text-muted-foreground">{role}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${statusColors[status]} animate-pulse`} />
          <Badge variant="secondary" className="text-xs capitalize">
            {status}
          </Badge>
        </div>
      </div>

      <p className="text-sm text-muted-foreground mb-4 line-clamp-3">{description}</p>

      {metrics && metrics.length > 0 && (
        <div className="grid grid-cols-2 gap-3 mb-4">
          {metrics.map((metric, index) => (
            <div key={index} className="bg-muted/50 rounded-lg p-3">
              <p className="text-xs text-muted-foreground mb-1">{metric.label}</p>
              <p className="text-lg font-semibold text-foreground">{metric.value}</p>
            </div>
          ))}
        </div>
      )}

      <Button variant="outline" className="w-full group">
        View Details
        <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
      </Button>
    </Card>
  );
};
