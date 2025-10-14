import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Calendar, FileText, Video, TrendingUp, Users } from "lucide-react";
import { format, startOfWeek, addDays } from "date-fns";

export const ContentPipeline = () => {
  const { data: scheduledContent } = useQuery({
    queryKey: ['pipeline-content'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('content')
        .select(`
          *,
          personas (
            name,
            segment
          )
        `)
        .eq('status', 'approved')
        .not('scheduled_for', 'is', null)
        .gte('scheduled_for', new Date().toISOString())
        .order('scheduled_for', { ascending: true })
        .limit(50);
      if (error) throw error;
      return data;
    }
  });

  const { data: personas } = useQuery({
    queryKey: ['personas'],
    queryFn: async () => {
      const { data, error } = await supabase.from('personas').select('*');
      if (error) throw error;
      return data;
    }
  });

  // Get current week's days
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 }); // Monday
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  // Group content by day
  const getContentForDay = (day: Date) => {
    return scheduledContent?.filter(content => {
      if (!content.scheduled_for) return false;
      const contentDate = new Date(content.scheduled_for);
      return contentDate.toDateString() === day.toDateString();
    }) || [];
  };

  return (
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
          <div className="grid grid-cols-7 gap-3">
            {weekDays.map((day, index) => {
              const dayContent = getContentForDay(day);
              const isToday = day.toDateString() === new Date().toDateString();
              
              return (
                <div key={index} className="min-h-[200px]">
                  <div className={`text-center mb-3 ${isToday ? 'text-accent font-bold' : ''}`}>
                    <p className="text-sm font-semibold text-muted-foreground">
                      {format(day, 'EEE')}
                    </p>
                    <p className={`text-lg ${isToday ? 'text-accent' : 'text-foreground'}`}>
                      {format(day, 'd')}
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    {dayContent.length > 0 ? (
                      dayContent.map((content) => (
                        <div
                          key={content.id}
                          className="bg-card border border-border rounded-lg p-2 hover:border-accent/50 transition-colors cursor-pointer group"
                        >
                          <div className="flex items-center gap-2 mb-1">
                            {content.type === 'post' ? (
                              <FileText className="h-3 w-3 text-blue-500 flex-shrink-0" />
                            ) : (
                              <Video className="h-3 w-3 text-purple-500 flex-shrink-0" />
                            )}
                            <p className="text-xs font-medium line-clamp-1 group-hover:text-accent transition-colors">
                              {content.title}
                            </p>
                          </div>
                          {content.scheduled_for && (
                            <p className="text-xs text-muted-foreground">
                              {format(new Date(content.scheduled_for), 'h:mm a')}
                            </p>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="bg-muted/30 border border-dashed border-muted-foreground/20 rounded-lg p-3 text-center">
                        <p className="text-xs text-muted-foreground">No posts</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Week Summary */}
          <div className="mt-6 pt-6 border-t">
            <div className="grid grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-accent">
                  {scheduledContent?.length || 0}
                </div>
                <div className="text-xs text-muted-foreground">Total Scheduled</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-500">
                  {scheduledContent?.filter(c => c.type === 'post').length || 0}
                </div>
                <div className="text-xs text-muted-foreground">Posts</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-500">
                  {scheduledContent?.filter(c => c.type === 'reel').length || 0}
                </div>
                <div className="text-xs text-muted-foreground">Reels</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-500">
                  {weekDays.filter(day => getContentForDay(day).length > 0).length}
                </div>
                <div className="text-xs text-muted-foreground">Active Days</div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="insights" className="mt-0">
          <div className="space-y-4">
            <Card className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <h4 className="font-semibold">Publishing Frequency</h4>
                  <p className="text-sm text-muted-foreground">
                    {scheduledContent?.length ? 
                      `${(scheduledContent.length / 7).toFixed(1)} posts per day average` : 
                      'No scheduled content yet'
                    }
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-purple-500" />
                </div>
                <div>
                  <h4 className="font-semibold">Content Distribution</h4>
                  <p className="text-sm text-muted-foreground">
                    Balanced mix of posts and reels for maximum engagement
                  </p>
                </div>
              </div>
              <div className="flex gap-2 mt-3">
                <Badge variant="outline" className="bg-blue-500/10">
                  {scheduledContent?.filter(c => c.type === 'post').length || 0} Posts
                </Badge>
                <Badge variant="outline" className="bg-purple-500/10">
                  {scheduledContent?.filter(c => c.type === 'reel').length || 0} Reels
                </Badge>
              </div>
            </Card>

            <Card className="p-4">
              <h4 className="font-semibold mb-2">Upcoming Highlights</h4>
              <div className="space-y-2">
                {scheduledContent?.slice(0, 3).map(content => (
                  <div key={content.id} className="flex items-center gap-2 text-sm">
                    <Badge variant="secondary">{content.type}</Badge>
                    <span className="line-clamp-1">{content.title}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="personas" className="mt-0">
          <div className="space-y-3">
            {personas?.map(persona => (
              <Card key={persona.id} className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                    <Users className="h-5 w-5 text-accent" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold">{persona.name}</h4>
                      <Badge variant="outline">{persona.segment}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Targeted content: {scheduledContent?.filter(c => c.persona_id === persona.id).length || 0} posts
                    </p>
                    {persona.goals && persona.goals.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {persona.goals.slice(0, 3).map((goal, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            {goal}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
};
