import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Calendar,
  Sparkles,
  Instagram,
  Video,
  Users,
  Hash,
  Eye,
  Trash2,
  Edit
} from "lucide-react";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

export default function ContentApproval() {
  const queryClient = useQueryClient();
  const [selectedContent, setSelectedContent] = useState<any>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  // Fetch all content
  const { data: contents, isLoading } = useQuery({
    queryKey: ['content-approval'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from('content')
        .select(`
          *,
          personas (
            id,
            name,
            segment
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    }
  });

  // Update content status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from('content')
        .update({ 
          status,
          published_at: status === 'published' ? new Date().toISOString() : null
        })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content-approval'] });
      toast({
        title: "Status Updated",
        description: "Content status has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Delete content mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('content')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content-approval'] });
      toast({
        title: "Content Deleted",
        description: "Content has been deleted successfully.",
      });
      setPreviewOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Delete Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const handleApprove = (id: string) => {
    updateStatusMutation.mutate({ id, status: 'approved' });
  };

  const handleReject = (id: string) => {
    updateStatusMutation.mutate({ id, status: 'rejected' });
  };

  const handlePublish = (id: string) => {
    updateStatusMutation.mutate({ id, status: 'published' });
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this content?')) {
      deleteMutation.mutate(id);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; icon: any; label: string }> = {
      draft: { variant: "outline", icon: Edit, label: "Draft" },
      pending_approval: { variant: "secondary", icon: Clock, label: "Pending" },
      approved: { variant: "default", icon: CheckCircle, label: "Approved" },
      scheduled: { variant: "default", icon: Calendar, label: "Scheduled" },
      published: { variant: "default", icon: CheckCircle, label: "Published" },
      rejected: { variant: "destructive", icon: XCircle, label: "Rejected" },
    };

    const config = variants[status] || variants.draft;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case 'reel':
        return <Video className="h-4 w-4" />;
      case 'story':
        return <Sparkles className="h-4 w-4" />;
      default:
        return <Instagram className="h-4 w-4" />;
    }
  };

  const filterContentByStatus = (status: string) => {
    return contents?.filter(c => c.status === status) || [];
  };

  const ContentCard = ({ content }: { content: any }) => (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg flex items-center gap-2">
              {getContentTypeIcon(content.type)}
              {content.title}
            </CardTitle>
            <CardDescription className="mt-1">
              {content.description || 'No description'}
            </CardDescription>
          </div>
          {getStatusBadge(content.status)}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Content Preview */}
          <div className="p-3 bg-muted rounded-lg">
            <p className="text-sm line-clamp-3 whitespace-pre-wrap">
              {content.content_text}
            </p>
          </div>

          {/* Metadata */}
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            {content.personas && (
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span>{content.personas.name}</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <Hash className="h-4 w-4" />
              <span>{content.hashtags?.length || 0} hashtags</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>{format(new Date(content.created_at), 'PPp')}</span>
            </div>
          </div>

          {/* Hashtags Preview */}
          {content.hashtags && content.hashtags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {content.hashtags.slice(0, 5).map((tag: string) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  #{tag}
                </Badge>
              ))}
              {content.hashtags.length > 5 && (
                <Badge variant="outline" className="text-xs">
                  +{content.hashtags.length - 5} more
                </Badge>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-2 border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedContent(content);
                setPreviewOpen(true);
              }}
              className="flex-1"
            >
              <Eye className="h-4 w-4 mr-1" />
              View Full
            </Button>

            {content.status === 'pending_approval' && (
              <>
                <Button
                  size="sm"
                  onClick={() => handleApprove(content.id)}
                  disabled={updateStatusMutation.isPending}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Approve
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleReject(content.id)}
                  disabled={updateStatusMutation.isPending}
                >
                  <XCircle className="h-4 w-4 mr-1" />
                  Reject
                </Button>
              </>
            )}

            {content.status === 'approved' && (
              <Button
                size="sm"
                onClick={() => handlePublish(content.id)}
                disabled={updateStatusMutation.isPending}
                className="flex-1"
              >
                <CheckCircle className="h-4 w-4 mr-1" />
                Publish Now
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  const pendingCount = filterContentByStatus('pending_approval').length;
  const approvedCount = filterContentByStatus('approved').length;
  const publishedCount = filterContentByStatus('published').length;

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Sparkles className="h-8 w-8 text-accent" />
          Content Approval Center
        </h1>
        <p className="text-muted-foreground mt-2">
          Review and approve AI-generated social media content
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending Approval
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{pendingCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Approved
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{approvedCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Published
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{publishedCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Content
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{contents?.length || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="pending">
            Pending ({pendingCount})
          </TabsTrigger>
          <TabsTrigger value="approved">
            Approved ({approvedCount})
          </TabsTrigger>
          <TabsTrigger value="published">
            Published ({publishedCount})
          </TabsTrigger>
          <TabsTrigger value="rejected">
            Rejected
          </TabsTrigger>
          <TabsTrigger value="all">
            All ({contents?.length || 0})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filterContentByStatus('pending_approval').map(content => (
              <ContentCard key={content.id} content={content} />
            ))}
          </div>
          {pendingCount === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No content pending approval</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="approved" className="mt-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filterContentByStatus('approved').map(content => (
              <ContentCard key={content.id} content={content} />
            ))}
          </div>
          {approvedCount === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No approved content</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="published" className="mt-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filterContentByStatus('published').map(content => (
              <ContentCard key={content.id} content={content} />
            ))}
          </div>
          {publishedCount === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <Instagram className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No published content yet</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="rejected" className="mt-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filterContentByStatus('rejected').map(content => (
              <ContentCard key={content.id} content={content} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="all" className="mt-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {contents?.map(content => (
              <ContentCard key={content.id} content={content} />
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Preview Dialog */}
      {selectedContent && (
        <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex items-center justify-between">
                <DialogTitle className="text-xl flex items-center gap-2">
                  {getContentTypeIcon(selectedContent.type)}
                  {selectedContent.title}
                </DialogTitle>
                {getStatusBadge(selectedContent.status)}
              </div>
              <DialogDescription>
                {selectedContent.description}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 mt-4">
              {/* Full Content */}
              <div>
                <h3 className="font-semibold mb-2">Content:</h3>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="whitespace-pre-wrap text-sm">
                    {selectedContent.content_text}
                  </p>
                </div>
              </div>

              {/* Metadata */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold mb-2">Details:</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Type:</span>
                      <span className="capitalize">{selectedContent.type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Created:</span>
                      <span>{format(new Date(selectedContent.created_at), 'PPp')}</span>
                    </div>
                    {selectedContent.scheduled_for && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Scheduled:</span>
                        <span>{format(new Date(selectedContent.scheduled_for), 'PPp')}</span>
                      </div>
                    )}
                  </div>
                </div>

                {selectedContent.personas && (
                  <div>
                    <h3 className="font-semibold mb-2">Target Persona:</h3>
                    <Card className="p-3">
                      <p className="font-medium">{selectedContent.personas.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {selectedContent.personas.segment}
                      </p>
                    </Card>
                  </div>
                )}
              </div>

              {/* Hashtags */}
              {selectedContent.hashtags && selectedContent.hashtags.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">Hashtags:</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedContent.hashtags.map((tag: string) => (
                      <Badge key={tag} variant="secondary">
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-4 border-t">
                {selectedContent.status === 'pending_approval' && (
                  <>
                    <Button
                      onClick={() => handleApprove(selectedContent.id)}
                      disabled={updateStatusMutation.isPending}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approve
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => handleReject(selectedContent.id)}
                      disabled={updateStatusMutation.isPending}
                      className="flex-1"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject
                    </Button>
                  </>
                )}

                {selectedContent.status === 'approved' && (
                  <Button
                    onClick={() => handlePublish(selectedContent.id)}
                    disabled={updateStatusMutation.isPending}
                    className="flex-1"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Publish Now
                  </Button>
                )}

                <Button
                  variant="outline"
                  onClick={() => handleDelete(selectedContent.id)}
                  disabled={deleteMutation.isPending}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}




