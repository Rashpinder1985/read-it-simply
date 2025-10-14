import { Header } from "@/components/Header";
import { AIEmployee } from "@/components/AIEmployee";
import { StatsCard } from "@/components/StatsCard";
import { MarketPulseModal } from "@/components/MarketPulseModal";
import { PersonasModal } from "@/components/PersonasModal";
import { ContentApprovalModal } from "@/components/ContentApprovalModal";
import { ContentSchedulingModal } from "@/components/ContentSchedulingModal";
import { ContentPipeline } from "@/components/ContentPipeline";
import { Button } from "@/components/ui/button";
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
  const [contentSchedulingOpen, setContentSchedulingOpen] = useState(false);

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
      <ContentSchedulingModal open={contentSchedulingOpen} onOpenChange={setContentSchedulingOpen} />
      
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

            <div onClick={() => setContentSchedulingOpen(true)} className="cursor-pointer">
              <AIEmployee
                name="Content Scheduling"
                role="Publishing Optimization Manager"
                description="Schedules content across the calendar using best practices from leading brands. Optimizes for frequency, dayparts, and occasions like Diwali, Akshaya Tritiya, and weddings. Click to view scheduling calendar."
                status="active"
                icon={<Clock className="h-6 w-6" />}
                metrics={[
                  { label: "Scheduled", value: approvedContent.toString() },
                  { label: "This Week", value: "7" },
                ]}
              />
            </div>
          </div>
        </div>

        {/* Content Calendar Preview */}
        <ContentPipeline />
      </main>
    </div>
  );
};

export default Dashboard;
