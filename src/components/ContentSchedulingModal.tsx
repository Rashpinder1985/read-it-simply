import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Calendar as CalendarIcon, Clock, FileText, Video } from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

interface ContentSchedulingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ContentSchedulingModal = ({ open, onOpenChange }: ContentSchedulingModalProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  const { data: scheduledContent } = useQuery({
    queryKey: ['scheduled-content'],
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
        .order('scheduled_for', { ascending: true });
      if (error) throw error;
      return data;
    }
  });

  const scheduleContent = useMutation({
    mutationFn: async ({ id, date }: { id: string; date: Date }) => {
      const { error } = await supabase
        .from('content')
        .update({ scheduled_for: date.toISOString() })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scheduled-content'] });
      queryClient.invalidateQueries({ queryKey: ['content'] });
      toast({
        title: "Content Scheduled",
        description: "Content has been successfully scheduled",
      });
    }
  });

  const selectedDateContent = scheduledContent?.filter(content => {
    if (!selectedDate || !content.scheduled_for) return false;
    const contentDate = new Date(content.scheduled_for);
    return contentDate.toDateString() === selectedDate.toDateString();
  });

  const datesWithContent = scheduledContent?.map(content => 
    content.scheduled_for ? new Date(content.scheduled_for) : null
  ).filter(Boolean) as Date[];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Content Scheduling</DialogTitle>
          <DialogDescription>
            Schedule approved content across your calendar using best practices for optimal engagement
          </DialogDescription>
        </DialogHeader>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Calendar Section */}
          <div>
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              Publishing Calendar
            </h3>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-md border"
              modifiers={{
                scheduled: datesWithContent
              }}
              modifiersClassNames={{
                scheduled: "bg-accent/20 font-bold"
              }}
            />
            <div className="mt-4 space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <div className="w-3 h-3 bg-accent/20 rounded"></div>
                <span className="text-muted-foreground">Scheduled content</span>
              </div>
              <div className="text-sm text-muted-foreground">
                Total scheduled: {scheduledContent?.length || 0} posts
              </div>
            </div>
          </div>

          {/* Content List for Selected Date */}
          <div>
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Clock className="h-5 w-5" />
              {selectedDate ? format(selectedDate, 'MMMM d, yyyy') : 'Select a date'}
            </h3>
            
            <div className="space-y-3 max-h-[500px] overflow-y-auto">
              {selectedDateContent && selectedDateContent.length > 0 ? (
                selectedDateContent.map(content => (
                  <Card key={content.id} className="p-4">
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-lg ${content.type === 'post' ? 'bg-blue-500/10' : 'bg-purple-500/10'} flex items-center justify-center flex-shrink-0`}>
                        {content.type === 'post' ? 
                          <FileText className="h-5 w-5 text-blue-500" /> : 
                          <Video className="h-5 w-5 text-purple-500" />
                        }
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h4 className="font-semibold text-sm">{content.title}</h4>
                          <Badge variant="outline" className="flex-shrink-0">{content.type}</Badge>
                        </div>
                        
                        <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                          {content.content_text}
                        </p>
                        
                        {content.personas && (
                          <div className="text-xs text-muted-foreground">
                            Target: {content.personas.name}
                          </div>
                        )}
                        
                        {content.scheduled_for && (
                          <div className="text-xs text-accent mt-1">
                            {format(new Date(content.scheduled_for), 'h:mm a')}
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                ))
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <CalendarIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No content scheduled for this date</p>
                  <p className="text-sm mt-1">Select a date with scheduled content</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4 pt-4 border-t">
          <Card className="p-3">
            <div className="text-xs text-muted-foreground mb-1">This Week</div>
            <div className="text-xl font-bold">
              {scheduledContent?.filter(c => {
                const date = new Date(c.scheduled_for!);
                const now = new Date();
                const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
                return date >= now && date <= weekFromNow;
              }).length || 0}
            </div>
          </Card>
          <Card className="p-3">
            <div className="text-xs text-muted-foreground mb-1">This Month</div>
            <div className="text-xl font-bold">
              {scheduledContent?.filter(c => {
                const date = new Date(c.scheduled_for!);
                return date.getMonth() === new Date().getMonth();
              }).length || 0}
            </div>
          </Card>
          <Card className="p-3">
            <div className="text-xs text-muted-foreground mb-1">Total Scheduled</div>
            <div className="text-xl font-bold">{scheduledContent?.length || 0}</div>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};
