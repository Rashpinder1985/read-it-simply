import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Users, TrendingUp, Target, Heart, ChevronRight, Search, ArrowLeft } from "lucide-react";
import { useState } from "react";

interface PersonasModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const PersonasModal = ({ open, onOpenChange }: PersonasModalProps) => {
  const [selectedPersona, setSelectedPersona] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  
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

  const filteredPersonas = personas?.filter(persona => 
    persona.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    persona.segment.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (selectedPersona) {
    const demographics = selectedPersona.demographics as any;
    const psychographics = selectedPersona.psychographics as any;
    const behaviors = selectedPersona.behaviors as any;

    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => setSelectedPersona(null)}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <DialogTitle className="text-2xl font-bold">Persona Mapping - {new Date().toLocaleDateString()}</DialogTitle>
                <p className="text-sm text-muted-foreground">Generated on {new Date().toLocaleDateString()}</p>
              </div>
            </div>
          </DialogHeader>

          {/* Industry Context */}
          <Card className="p-6 mb-6">
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Target className="h-5 w-5" />
              Industry Context
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              The retail Indian jewellery market is highly diverse, driven by cultural significance, investment value, gifting traditions, and increasingly, fashion trends. 
              Gold remains a dominant material, but there's a growing acceptance of LGD (Lab-Grown Diamonds) and a consistent demand for silver. Customer segments range from 
              traditionalists seeking heirloom pieces to modern consumers looking for contemporary, ethically sourced designs. Digital presence and transparent pricing are becoming crucial.
            </p>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">Facebook Insights</Badge>
              <Badge variant="secondary">Google Analytics</Badge>
              <Badge variant="secondary">Social Listening</Badge>
              <Badge variant="secondary">Market Research</Badge>
              <Badge variant="secondary">Competitor Customer Base Analysis</Badge>
            </div>
          </Card>

          {/* Detailed Persona Card */}
          <Card className="p-6">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold">{selectedPersona.name}</h2>
                <p className="text-muted-foreground">{demographics?.age_range} • {demographics?.gender} • {demographics?.occupation || 'Student/Junior Executive'}</p>
              </div>
              <div className="text-right">
                <Badge className="mb-2">8% of market</Badge>
                <p className="text-sm text-muted-foreground">85% confidence</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Demographics */}
              <div>
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Demographics
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground mb-1">Location:</p>
                    <p className="font-medium">{demographics?.location}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-1">Income:</p>
                    <p className="font-medium">{demographics?.income}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-1">Education:</p>
                    <p className="font-medium">{demographics?.education || 'Undergraduate'}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-1">Lifestyle:</p>
                    <p className="font-medium">{psychographics?.lifestyle}</p>
                  </div>
                </div>
              </div>

              {/* Psychographics */}
              <div>
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Heart className="h-5 w-5" />
                  Psychographics
                </h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="text-muted-foreground mb-2">Values</p>
                    <div className="flex flex-wrap gap-2">
                      {psychographics?.values?.map((value: string, i: number) => (
                        <Badge key={i} variant="outline">{value}</Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-2">Interests</p>
                    <div className="flex flex-wrap gap-2">
                      {psychographics?.interests?.map((interest: string, i: number) => (
                        <Badge key={i} variant="outline">{interest}</Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-2">Pain Points</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedPersona.pain_points?.map((point: string, i: number) => (
                        <Badge key={i} variant="destructive" className="text-xs">{point}</Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Purchasing Behavior */}
              <div>
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Purchasing Behavior
                </h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="text-muted-foreground mb-2">Drivers</p>
                    <div className="flex flex-wrap gap-2">
                      {behaviors?.drivers?.map((driver: string, i: number) => (
                        <Badge key={i} variant="secondary">{driver}</Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-2">Preferred Channels</p>
                    <div className="flex flex-wrap gap-2">
                      {behaviors?.preferred_channels?.map((channel: string, i: number) => (
                        <Badge key={i} variant="outline">{channel}</Badge>
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-3">
                    <div>
                      <p className="text-muted-foreground mb-1">Price Sensitivity:</p>
                      <Badge variant={behaviors?.price_sensitivity === 'high' ? 'destructive' : 'secondary'}>
                        {behaviors?.price_sensitivity || 'high'}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-muted-foreground mb-1">Brand Loyalty:</p>
                      <Badge variant={behaviors?.brand_loyalty === 'low' ? 'outline' : 'default'}>
                        {behaviors?.brand_loyalty || 'low'}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              {/* Behavioral Predictions */}
              <div>
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Behavioral Predictions
                </h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="text-muted-foreground mb-2">Likely to Buy</p>
                    <ul className="list-disc list-inside space-y-1">
                      {behaviors?.likely_purchases?.map((item: string, i: number) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-2">Influenced By</p>
                    <div className="flex flex-wrap gap-2">
                      {behaviors?.influenced_by?.map((influence: string, i: number) => (
                        <Badge key={i} variant="outline">{influence}</Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-2">Decision Making Factors</p>
                    <div className="flex flex-wrap gap-2">
                      {behaviors?.decision_factors?.map((factor: string, i: number) => (
                        <Badge key={i} variant="secondary">{factor}</Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Active Customer Personas</DialogTitle>
        </DialogHeader>

        {/* Search Bar */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search personas by name, occupation, age, location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
          <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-muted-foreground">
            {filteredPersonas?.length || 0} results
          </span>
        </div>

        <div className="grid gap-6">
          {filteredPersonas?.map((persona) => {
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

                {/* Dig Deeper Button */}
                <div className="mt-6 pt-6 border-t">
                  <Button 
                    onClick={() => setSelectedPersona(persona)}
                    className="w-full"
                    variant="default"
                  >
                    View Detailed Persona Mapping
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
};
