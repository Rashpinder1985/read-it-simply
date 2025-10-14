import { Header } from "@/components/Header";
import { AIEmployee } from "@/components/AIEmployee";
import { StatsCard } from "@/components/StatsCard";
import { MarketPulseModal } from "@/components/MarketPulseModal";
import { PersonasModal } from "@/components/PersonasModal";
import { ContentApprovalModal } from "@/components/ContentApprovalModal";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  TrendingUp, 
  Users, 
  FileText, 
  Calendar,
  Brain,
  Target,
  Sparkles,
  Clock
} from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const Dashboard = () => {
  const [marketPulseOpen, setMarketPulseOpen] = useState(false);
  const [personasOpen, setPersonasOpen] = useState(false);
  const [contentApprovalOpen, setContentApprovalOpen] = useState(false);

  const { data: personas } = useQuery({
    queryKey: ['personas'],
    queryFn: async () => {
      const { data, error } = await supabase.from('personas').select('*');
      if (error) throw error;
      return data;
    }
  });

  const { data: content } = useQuery({
    queryKey: ['content'],
    queryFn: async () => {
      const { data, error } = await supabase.from('content').select('*');
      if (error) throw error;
      return data;
    }
  });

  const { data: marketData } = useQuery({
    queryKey: ['market-data'],
    queryFn: async () => {
      const { data, error } = await supabase.from('market_data').select('*');
      if (error) throw error;
      return data;
    }
  });

  const pendingContent = content?.filter(c => c.status === 'pending_approval').length || 0;
  const approvedContent = content?.filter(c => c.status === 'approved').length || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <Header />
      
      <MarketPulseModal open={marketPulseOpen} onOpenChange={setMarketPulseOpen} />
      <PersonasModal open={personasOpen} onOpenChange={setPersonasOpen} />
      <ContentApprovalModal open={contentApprovalOpen} onOpenChange={setContentApprovalOpen} />
      
      <main className="container mx-auto px-6 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard 
            title="Brands Tracked" 
            value={marketData?.length.toString() || "0"} 
            change="Live data"
            trend="up"
            icon={Target}
          />
          <StatsCard 
            title="Active Personas" 
            value={personas?.length.toString() || "0"} 
            change="Click to view details"
            trend="up"
            icon={Users}
          />
          <StatsCard 
            title="Pending Approval" 
            value={pendingContent.toString()} 
            change="Content awaiting review"
            trend="neutral"
            icon={FileText}
          />
          <StatsCard 
            title="Ready to Schedule" 
            value={approvedContent.toString()} 
            change="Approved content"
            trend="up"
            icon={Calendar}
          />
        </div>

        {/* AI Employees Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2">AI Employees</h2>
              <p className="text-muted-foreground">Your intelligent marketing team working 24/7</p>
            </div>
            <Button className="bg-gradient-to-r from-accent to-accent/90 hover:from-accent/90 hover:to-accent text-primary font-semibold shadow-[var(--shadow-gold)]">
              <Sparkles className="mr-2 h-4 w-4" />
              Configure Team
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div onClick={() => setMarketPulseOpen(true)} className="cursor-pointer">
              <AIEmployee
                name="MarketPulse"
                role="Market Research Specialist"
                description="Analyzes Indian jewellery brands, tracking gold/silver prices, social media activity, trends, and competitive insights. Click to view live market dashboard."
                status="active"
                icon={<TrendingUp className="h-6 w-6" />}
                metrics={[
                  { label: "Brands Tracked", value: marketData?.length.toString() || "0" },
                  { label: "Live Updates", value: "Real-time" },
                ]}
              />
            </div>

            <div onClick={() => setPersonasOpen(true)} className="cursor-pointer">
              <AIEmployee
                name="Brand Persona"
                role="Customer Intelligence Analyst"
                description="Creates detailed buyer personas with demographics, psychographics, and behaviors. Click to view active personas and their complete profiles."
                status="active"
                icon={<Users className="h-6 w-6" />}
                metrics={[
                  { label: "Active Personas", value: personas?.length.toString() || "0" },
                  { label: "Segments", value: "3" },
                ]}
              />
            </div>

            <div onClick={() => setContentApprovalOpen(true)} className="cursor-pointer">
              <AIEmployee
                name="Content Generation"
                role="Creative Content Strategist"
                description="Generates Instagram posts and reels tailored to each persona. Click to review, approve, or reject generated content before scheduling."
                status="active"
                icon={<Brain className="h-6 w-6" />}
                metrics={[
                  { label: "Pending Approval", value: pendingContent.toString() },
                  { label: "Approved", value: approvedContent.toString() },
                ]}
              />
            </div>

            <AIEmployee
              name="Content Scheduling"
              role="Publishing Optimization Manager"
              description="Schedules content across the calendar using best practices from leading brands. Optimizes for frequency, dayparts, and occasions like Diwali, Akshaya Tritiya, and weddings."
              status="idle"
              icon={<Clock className="h-6 w-6" />}
              metrics={[
                { label: "Scheduled", value: "156" },
                { label: "Next Post", value: "2h" },
              ]}
            />
          </div>
        </div>

        {/* Content Calendar Preview */}
        <Card className="p-6">
          <Tabs defaultValue="calendar" className="w-full">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-foreground">Content Pipeline</h2>
              <TabsList>
                <TabsTrigger value="calendar">Calendar</TabsTrigger>
                <TabsTrigger value="insights">Insights</TabsTrigger>
                <TabsTrigger value="personas">Personas</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="calendar" className="mt-0">
              <div className="grid grid-cols-7 gap-4">
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
                  <div key={day} className="text-center">
                    <p className="text-sm font-semibold text-muted-foreground mb-3">{day}</p>
                    <div className="space-y-2">
                      {[1, 2].map((item) => (
                        <div
                          key={item}
                          className="bg-accent/10 border border-accent/20 rounded-lg p-2 hover:bg-accent/20 transition-colors cursor-pointer"
                        >
                          <div className="w-2 h-2 bg-accent rounded-full mb-1" />
                          <p className="text-xs text-foreground">Post</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="insights" className="mt-0">
              <div className="text-center py-12">
                <TrendingUp className="h-12 w-12 text-accent mx-auto mb-4" />
                <p className="text-muted-foreground">Market insights and trends coming soon</p>
              </div>
            </TabsContent>

            <TabsContent value="personas" className="mt-0">
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-accent mx-auto mb-4" />
                <p className="text-muted-foreground">Detailed persona profiles coming soon</p>
              </div>
            </TabsContent>
          </Tabs>
        </Card>
      </main>
    </div>
  );
};

export default Dashboard;
