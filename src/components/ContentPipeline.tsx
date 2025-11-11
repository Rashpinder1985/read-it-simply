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
    <Card className="p-6 mt-6">
      <Tabs defaultValue="calendar" className="w-full">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <h2 className="text-xl font-bold text-foreground">Content Pipeline</h2>
          <TabsList>
            <TabsTrigger value="calendar">Calendar</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
            <TabsTrigger value="personas">Personas</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="calendar" className="mt-0 space-y-4">
          <div className="grid grid-cols-7 gap-2 sm:gap-3">
            {weekDays.map((day, index) => {
              const dayContent = getContentForDay(day);
              const isToday = day.toDateString() === new Date().toDateString();
              
              return (
                <div key={index} className="relative flex flex-col">
                  <div className={`text-center mb-3 pb-2 border-b ${isToday ? 'border-accent' : 'border-border'}`}>
                    <p className="text-xs sm:text-sm font-semibold text-muted-foreground uppercase">
                      {format(day, 'EEE')}
                    </p>
                    <p className={`text-xl sm:text-2xl font-bold ${isToday ? 'text-accent' : 'text-foreground'}`}>
                      {format(day, 'd')}
                    </p>
                  </div>
                  
                  <div className="space-y-2 flex-1">
                    {dayContent.length > 0 ? (
                      dayContent.map((content) => (
                        <div
                          key={content.id}
                          className="bg-card border border-border rounded-lg p-2 hover:border-accent/50 hover:shadow-sm transition-all cursor-pointer group"
                        >
                          <div className="flex items-start gap-2 mb-1">
                            {content.type === 'post' ? (
                              <FileText className="h-3 w-3 text-blue-500 flex-shrink-0 mt-0.5" />
                            ) : (
                              <Video className="h-3 w-3 text-purple-500 flex-shrink-0 mt-0.5" />
                            )}
                            <p className="text-xs font-medium line-clamp-2 group-hover:text-accent transition-colors">
                              {content.title}
                            </p>
                          </div>
                          {content.scheduled_for && (
                            <p className="text-xs text-muted-foreground ml-5">
                              {format(new Date(content.scheduled_for), 'h:mm a')}
                            </p>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="bg-muted/20 border border-dashed border-muted-foreground/20 rounded-lg p-3 text-center min-h-[80px] flex items-center justify-center">
                        <p className="text-xs text-muted-foreground">No posts</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Week Summary */}
          <div className="mt-8 pt-6 border-t">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="text-center p-3 rounded-lg bg-accent/5">
                <div className="text-2xl sm:text-3xl font-bold text-accent">
                  {scheduledContent?.length || 0}
                </div>
                <div className="text-xs text-muted-foreground mt-1">Total Scheduled</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-blue-500/5">
                <div className="text-2xl sm:text-3xl font-bold text-blue-500">
                  {scheduledContent?.filter(c => c.type === 'post').length || 0}
                </div>
                <div className="text-xs text-muted-foreground mt-1">Posts</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-purple-500/5">
                <div className="text-2xl sm:text-3xl font-bold text-purple-500">
                  {scheduledContent?.filter(c => c.type === 'reel').length || 0}
                </div>
                <div className="text-xs text-muted-foreground mt-1">Reels</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-green-500/5">
                <div className="text-2xl sm:text-3xl font-bold text-green-500">
                  {weekDays.filter(day => getContentForDay(day).length > 0).length}
                </div>
                <div className="text-xs text-muted-foreground mt-1">Active Days</div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="insights" className="mt-0 space-y-4">
          <Card className="p-5 hover:shadow-sm transition-shadow">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                <TrendingUp className="h-6 w-6 text-accent" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-lg mb-1">Publishing Frequency</h4>
                <p className="text-sm text-muted-foreground">
                  {scheduledContent?.length ? 
                    `${(scheduledContent.length / 7).toFixed(1)} posts per day average this week` : 
                    'No scheduled content yet - generate some content to get started'
                  }
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-5 hover:shadow-sm transition-shadow">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center flex-shrink-0">
                <Calendar className="h-6 w-6 text-purple-500" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-lg mb-1">Content Distribution</h4>
                <p className="text-sm text-muted-foreground">
                  Balanced mix of posts and reels for maximum engagement
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="bg-blue-500/10 text-blue-700 border-blue-200">
                <FileText className="h-3 w-3 mr-1" />
                {scheduledContent?.filter(c => c.type === 'post').length || 0} Posts
              </Badge>
              <Badge variant="outline" className="bg-purple-500/10 text-purple-700 border-purple-200">
                <Video className="h-3 w-3 mr-1" />
                {scheduledContent?.filter(c => c.type === 'reel').length || 0} Reels
              </Badge>
            </div>
          </Card>

          {scheduledContent && scheduledContent.length > 0 && (
            <Card className="p-5 hover:shadow-sm transition-shadow">
              <h4 className="font-semibold text-lg mb-3 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-accent" />
                Upcoming Highlights
              </h4>
              <div className="space-y-3">
                {scheduledContent?.slice(0, 5).map(content => (
                  <div key={content.id} className="flex items-center gap-3 text-sm p-2 rounded-lg hover:bg-muted/50 transition-colors">
                    <Badge variant="secondary" className="flex-shrink-0">
                      {content.type === 'post' ? 'Post' : 'Reel'}
                    </Badge>
                    <span className="line-clamp-1 flex-1">{content.title}</span>
                    {content.scheduled_for && (
                      <span className="text-xs text-muted-foreground flex-shrink-0">
                        {format(new Date(content.scheduled_for), 'MMM d')}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="personas" className="mt-0 space-y-3">
          {personas && personas.length > 0 ? (
            personas.map(persona => (
              <Card key={persona.id} className="p-5 hover:shadow-sm transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                    <Users className="h-6 w-6 text-accent" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <h4 className="font-semibold text-lg">{persona.name}</h4>
                      <Badge variant="outline" className="flex-shrink-0">{persona.segment}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      <span className="font-medium text-foreground">
                        {scheduledContent?.filter(c => c.persona_id === persona.id).length || 0}
                      </span>
                      {' '}scheduled posts targeting this persona
                    </p>
                    {persona.goals && persona.goals.length > 0 && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-2 font-medium">Key Goals:</p>
                        <div className="flex flex-wrap gap-2">
                          {persona.goals.slice(0, 4).map((goal, i) => (
                            <Badge key={i} variant="secondary" className="text-xs">
                              {goal}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <Card className="p-8 text-center">
              <Users className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
              <p className="text-muted-foreground">No personas created yet</p>
              <p className="text-sm text-muted-foreground mt-1">Generate personas to see them here</p>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </Card>
  );
};
