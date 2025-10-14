import { Header } from "@/components/Header";
import { AIEmployee } from "@/components/AIEmployee";
import { StatsCard } from "@/components/StatsCard";
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

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <Header />
      
      <main className="container mx-auto px-6 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard 
            title="Brands Analyzed" 
            value="65" 
            change="+15 this week"
            trend="up"
            icon={Target}
          />
          <StatsCard 
            title="Personas Created" 
            value="12" 
            change="+3 this week"
            trend="up"
            icon={Users}
          />
          <StatsCard 
            title="Content Generated" 
            value="248" 
            change="+52 this week"
            trend="up"
            icon={FileText}
          />
          <StatsCard 
            title="Posts Scheduled" 
            value="156" 
            change="Next 30 days"
            trend="neutral"
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
            <AIEmployee
              name="MarketPulse"
              role="Market Research Specialist"
              description="Analyzes 15 national and 50 regional jewellery brands across India, tracking social media activity, trends, and competitive insights. Updates daily with latest market intelligence."
              status="active"
              icon={<TrendingUp className="h-6 w-6" />}
              metrics={[
                { label: "Brands Tracked", value: "65" },
                { label: "Updates Today", value: "127" },
              ]}
            />

            <AIEmployee
              name="Brand Persona"
              role="Customer Intelligence Analyst"
              description="Creates detailed buyer personas based on demographics, psychographics, and behaviors. Identifies target customers like 'The Socially-Conscious Minimalist' with deep insights."
              status="processing"
              icon={<Users className="h-6 w-6" />}
              metrics={[
                { label: "Active Personas", value: "12" },
                { label: "Segments", value: "4" },
              ]}
            />

            <AIEmployee
              name="Content Generation"
              role="Creative Content Strategist"
              description="Generates highly impactful Instagram posts and reels tailored to each persona. Uses data-driven insights from MarketPulse to create engaging, relevant content."
              status="active"
              icon={<Brain className="h-6 w-6" />}
              metrics={[
                { label: "Posts Generated", value: "248" },
                { label: "Reels Created", value: "64" },
              ]}
            />

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
