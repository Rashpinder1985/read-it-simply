import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Users, TrendingUp, Target, Heart } from "lucide-react";

interface PersonasModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const PersonasModal = ({ open, onOpenChange }: PersonasModalProps) => {
  const { data: personas } = useQuery({
    queryKey: ['personas'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('personas')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    }
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Active Customer Personas</DialogTitle>
        </DialogHeader>

        <div className="grid gap-6">
          {personas?.map((persona) => {
            const demographics = persona.demographics as any;
            const psychographics = persona.psychographics as any;
            const behaviors = persona.behaviors as any;
            
            return (
              <Card key={persona.id} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent to-accent/80 flex items-center justify-center">
                      <Users className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">{persona.name}</h3>
                      <Badge variant="secondary" className="mt-1">{persona.segment}</Badge>
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {/* Demographics */}
                  <div className="space-y-3">
                    <h4 className="font-semibold flex items-center gap-2">
                      <Target className="h-4 w-4 text-accent" />
                      Demographics
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Age Range:</span>
                        <span className="font-medium">{demographics?.age_range}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Income:</span>
                        <span className="font-medium">{demographics?.income}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Location:</span>
                        <span className="font-medium">{demographics?.location}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Gender:</span>
                        <span className="font-medium">{demographics?.gender}</span>
                      </div>
                    </div>
                  </div>

                  {/* Psychographics */}
                  <div className="space-y-3">
                    <h4 className="font-semibold flex items-center gap-2">
                      <Heart className="h-4 w-4 text-accent" />
                      Values & Lifestyle
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-muted-foreground block mb-1">Core Values:</span>
                        <div className="flex flex-wrap gap-1">
                          {psychographics?.values?.map((value: string, i: number) => (
                            <Badge key={i} variant="outline" className="text-xs">{value}</Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Lifestyle:</span>
                        <p className="font-medium">{psychographics?.lifestyle}</p>
                      </div>
                    </div>
                  </div>

                  {/* Behaviors */}
                  <div className="space-y-3">
                    <h4 className="font-semibold flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-accent" />
                      Shopping Behaviors
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Shopping Style:</span>
                        <p className="font-medium">{behaviors?.shopping}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Social Media:</span>
                        <p className="font-medium">{behaviors?.social_media}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Purchase Frequency:</span>
                        <p className="font-medium">{behaviors?.purchase_frequency}</p>
                      </div>
                    </div>
                  </div>

                  {/* Goals & Pain Points */}
                  <div className="space-y-3">
                    <h4 className="font-semibold">Goals & Challenges</h4>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-muted-foreground block mb-1">Pain Points:</span>
                        <ul className="list-disc list-inside space-y-1">
                          {persona.pain_points?.map((point, i) => (
                            <li key={i} className="text-muted-foreground">{point}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <span className="text-muted-foreground block mb-1">Goals:</span>
                        <ul className="list-disc list-inside space-y-1">
                          {persona.goals?.map((goal, i) => (
                            <li key={i} className="font-medium">{goal}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
};
