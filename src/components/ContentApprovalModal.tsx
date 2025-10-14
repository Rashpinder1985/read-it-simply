import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CheckCircle, XCircle, FileText, Video, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ContentApprovalModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ContentApprovalModal = ({ open, onOpenChange }: ContentApprovalModalProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: content } = useQuery({
    queryKey: ['content'],
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
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    }
  });

  const approveContent = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('content')
        .update({ 
          status: 'approved',
          approved_at: new Date().toISOString(),
          approved_by: 'Business Owner'
        })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content'] });
      toast({
        title: "Content Approved",
        description: "Content has been approved and moved to scheduling queue",
      });
    }
  });

  const rejectContent = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('content')
        .update({ status: 'rejected' })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content'] });
      toast({
        title: "Content Rejected",
        description: "Content has been rejected",
        variant: "destructive"
      });
    }
  });

  const pendingContent = content?.filter(c => c.status === 'pending_approval') || [];
  const approvedContent = content?.filter(c => c.status === 'approved') || [];
  const posts = pendingContent.filter(c => c.type === 'post');
  const reels = pendingContent.filter(c => c.type === 'reel');

  const ContentCard = ({ item }: { item: any }) => (
    <Card className="p-4">
      <div className="flex items-start gap-4">
        <div className={`w-12 h-12 rounded-lg ${item.type === 'post' ? 'bg-blue-500/10' : 'bg-purple-500/10'} flex items-center justify-center`}>
          {item.type === 'post' ? <FileText className="h-6 w-6 text-blue-500" /> : <Video className="h-6 w-6 text-purple-500" />}
        </div>
        
        <div className="flex-1">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h4 className="font-semibold">{item.title}</h4>
              <p className="text-sm text-muted-foreground">{item.description}</p>
            </div>
            <Badge variant="outline">{item.type}</Badge>
          </div>

          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{item.content_text}</p>

          <div className="flex flex-wrap gap-1 mb-3">
            {item.hashtags?.slice(0, 5).map((tag: string, i: number) => (
              <Badge key={i} variant="secondary" className="text-xs">{tag}</Badge>
            ))}
          </div>

          {item.personas && (
            <div className="text-xs text-muted-foreground mb-3">
              Target: {item.personas.name} ({item.personas.segment})
            </div>
          )}

          {item.status === 'pending_approval' && (
            <div className="flex gap-2">
              <Button 
                size="sm" 
                onClick={() => approveContent.mutate(item.id)}
                className="bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="h-4 w-4 mr-1" />
                Approve
              </Button>
              <Button 
                size="sm" 
                variant="destructive"
                onClick={() => rejectContent.mutate(item.id)}
              >
                <XCircle className="h-4 w-4 mr-1" />
                Reject
              </Button>
            </div>
          )}

          {item.status === 'approved' && (
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-green-600 font-medium">Approved</span>
              <span className="text-muted-foreground">• Ready for scheduling</span>
            </div>
          )}
        </div>
      </div>
    </Card>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Content Generation & Approval</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="pending" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="pending">
              Pending Approval ({pendingContent.length})
            </TabsTrigger>
            <TabsTrigger value="approved">
              Approved ({approvedContent.length})
            </TabsTrigger>
            <TabsTrigger value="stats">
              Statistics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4 mt-4">
            <div className="grid gap-4">
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Posts ({posts.length})
                </h3>
                <div className="space-y-3">
                  {posts.map(post => <ContentCard key={post.id} item={post} />)}
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Video className="h-5 w-5" />
                  Reels ({reels.length})
                </h3>
                <div className="space-y-3">
                  {reels.map(reel => <ContentCard key={reel.id} item={reel} />)}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="approved" className="space-y-4 mt-4">
            <div className="space-y-3">
              {approvedContent.map(item => <ContentCard key={item.id} item={item} />)}
            </div>
          </TabsContent>

          <TabsContent value="stats" className="mt-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="p-4">
                <div className="text-sm text-muted-foreground mb-1">Total Generated</div>
                <div className="text-2xl font-bold">{content?.length || 0}</div>
              </Card>
              <Card className="p-4">
                <div className="text-sm text-muted-foreground mb-1">Pending Review</div>
                <div className="text-2xl font-bold text-yellow-600">{pendingContent.length}</div>
              </Card>
              <Card className="p-4">
                <div className="text-sm text-muted-foreground mb-1">Approved</div>
                <div className="text-2xl font-bold text-green-600">{approvedContent.length}</div>
              </Card>
              <Card className="p-4">
                <div className="text-sm text-muted-foreground mb-1">Posts</div>
                <div className="text-2xl font-bold">{content?.filter(c => c.type === 'post').length || 0}</div>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
