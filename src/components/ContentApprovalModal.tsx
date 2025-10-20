import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CheckCircle, XCircle, FileText, Video, Edit, Save, X, Upload, Sparkles, Image as ImageIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

interface ContentApprovalModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const REJECTION_REASONS = [
  "Not aligned with brand voice",
  "Poor quality content",
  "Wrong target audience",
  "Incorrect information",
  "Inappropriate tone",
  "Missing key details",
  "Other"
];

export const ContentApprovalModal = ({ open, onOpenChange }: ContentApprovalModalProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<any>({});
  const [uploadingMedia, setUploadingMedia] = useState<string | null>(null);
  const [generatingImage, setGeneratingImage] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState<string>("");
  const [rejectingId, setRejectingId] = useState<string | null>(null);

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

  const updateContent = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      const { error } = await supabase
        .from('content')
        .update(updates)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content'] });
      setEditingId(null);
      setEditForm({});
      toast({
        title: "Content Updated",
        description: "Your changes have been saved successfully",
      });
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
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      const { error } = await supabase
        .from('content')
        .update({ 
          status: 'rejected',
          rejection_reason: reason
        })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content'] });
      setRejectingId(null);
      setRejectionReason("");
      toast({
        title: "Content Rejected",
        description: "Content has been rejected",
        variant: "destructive"
      });
    }
  });

  const handleEdit = (item: any) => {
    setEditingId(item.id);
    setEditForm({
      title: item.title,
      content_text: item.content_text,
      description: item.description,
      hashtags: item.hashtags?.join(', ') || ''
    });
  };

  const handleSave = (id: string) => {
    const updates = {
      ...editForm,
      hashtags: editForm.hashtags.split(',').map((tag: string) => tag.trim()).filter(Boolean)
    };
    updateContent.mutate({ id, updates });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const handleMediaUpload = async (id: string, file: File) => {
    setUploadingMedia(id);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${id}_${Date.now()}.${fileExt}`;
      const filePath = `content-media/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('business-media')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('business-media')
        .getPublicUrl(filePath);

      await updateContent.mutateAsync({ 
        id, 
        updates: { media_url: publicUrl }
      });

      toast({
        title: "Media Uploaded",
        description: "Media has been attached to the content",
      });
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload Failed",
        description: "Failed to upload media. Please try again.",
        variant: "destructive"
      });
    } finally {
      setUploadingMedia(null);
    }
  };

  const handleGenerateImage = async (id: string, contentText: string, title: string) => {
    setGeneratingImage(id);
    try {
      const prompt = `Create a beautiful, professional jewelry marketing image for Instagram. Context: ${title}. ${contentText.substring(0, 200)}. Style: Elegant, luxury, modern, high-quality product photography with beautiful lighting and composition.`;

      const { data, error } = await supabase.functions.invoke('generate-content-image', {
        body: { prompt }
      });

      if (error) throw error;

      if (data.imageUrl) {
        // Convert base64 to blob
        const base64Response = await fetch(data.imageUrl);
        const blob = await base64Response.blob();
        
        // Upload to storage
        const fileName = `${id}_${Date.now()}.png`;
        const filePath = `content-media/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('business-media')
          .upload(filePath, blob);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('business-media')
          .getPublicUrl(filePath);

        await updateContent.mutateAsync({ 
          id, 
          updates: { media_url: publicUrl }
        });

        toast({
          title: "Image Generated",
          description: "AI-generated image has been attached to the content",
        });
      }
    } catch (error) {
      console.error('Generation error:', error);
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "Failed to generate image. Please try again.",
        variant: "destructive"
      });
    } finally {
      setGeneratingImage(null);
    }
  };

  const handleReject = (id: string) => {
    setRejectingId(id);
  };

  const confirmReject = (id: string) => {
    if (!rejectionReason) {
      toast({
        title: "Reason Required",
        description: "Please select a rejection reason",
        variant: "destructive"
      });
      return;
    }
    rejectContent.mutate({ id, reason: rejectionReason });
  };

  const pendingContent = content?.filter(c => c.status === 'pending_approval') || [];
  const approvedContent = content?.filter(c => c.status === 'approved') || [];
  const rejectedContent = content?.filter(c => c.status === 'rejected') || [];
  const posts = pendingContent.filter(c => c.type === 'post');
  const reels = pendingContent.filter(c => c.type === 'reel');

  const ContentCard = ({ item }: { item: any }) => {
    const isEditing = editingId === item.id;
    const isRejecting = rejectingId === item.id;

    return (
      <Card className="p-4">
        <div className="flex items-start gap-4">
          <div className={`w-12 h-12 rounded-lg ${item.type === 'post' ? 'bg-blue-500/10' : 'bg-purple-500/10'} flex items-center justify-center flex-shrink-0`}>
            {item.type === 'post' ? <FileText className="h-6 w-6 text-blue-500" /> : <Video className="h-6 w-6 text-purple-500" />}
          </div>
          
          <div className="flex-1 min-w-0">
            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={editForm.title}
                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={editForm.description}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="content">Content</Label>
                  <Textarea
                    id="content"
                    value={editForm.content_text}
                    onChange={(e) => setEditForm({ ...editForm, content_text: e.target.value })}
                    rows={4}
                  />
                </div>
                <div>
                  <Label htmlFor="hashtags">Hashtags (comma-separated)</Label>
                  <Input
                    id="hashtags"
                    value={editForm.hashtags}
                    onChange={(e) => setEditForm({ ...editForm, hashtags: e.target.value })}
                    placeholder="jewelry, gold, luxury"
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={() => handleSave(item.id)} size="sm">
                    <Save className="h-4 w-4 mr-1" />
                    Save Changes
                  </Button>
                  <Button onClick={handleCancelEdit} variant="outline" size="sm">
                    <X className="h-4 w-4 mr-1" />
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold truncate">{item.title}</h4>
                    <p className="text-sm text-muted-foreground truncate">{item.description}</p>
                  </div>
                  <Badge variant="outline" className="ml-2 flex-shrink-0">{item.type}</Badge>
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

                {item.media_url && (
                  <div className="mb-3">
                    <img src={item.media_url} alt="Content media" className="rounded-lg max-h-40 object-cover" />
                  </div>
                )}

                {item.status === 'pending_approval' && (
                  <div className="space-y-3">
                    {!item.media_url && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => document.getElementById(`file-${item.id}`)?.click()}
                          disabled={uploadingMedia === item.id}
                        >
                          {uploadingMedia === item.id ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-1"></div>
                              Uploading...
                            </>
                          ) : (
                            <>
                              <Upload className="h-4 w-4 mr-1" />
                              Upload Media
                            </>
                          )}
                        </Button>
                        <input
                          id={`file-${item.id}`}
                          type="file"
                          accept="image/*,video/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleMediaUpload(item.id, file);
                          }}
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleGenerateImage(item.id, item.content_text, item.title)}
                          disabled={generatingImage === item.id}
                        >
                          {generatingImage === item.id ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-1"></div>
                              Generating...
                            </>
                          ) : (
                            <>
                              <Sparkles className="h-4 w-4 mr-1" />
                              AI Generate
                            </>
                          )}
                        </Button>
                      </div>
                    )}

                    {isRejecting ? (
                      <div className="space-y-2 p-3 border rounded-lg">
                        <Label>Rejection Reason</Label>
                        <Select value={rejectionReason} onValueChange={setRejectionReason}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a reason" />
                          </SelectTrigger>
                          <SelectContent className="bg-background z-50">
                            {REJECTION_REASONS.map(reason => (
                              <SelectItem key={reason} value={reason}>
                                {reason}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => confirmReject(item.id)}
                          >
                            Confirm Reject
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setRejectingId(null);
                              setRejectionReason("");
                            }}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleEdit(item)}
                          variant="outline"
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
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
                          onClick={() => handleReject(item.id)}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    )}
                  </div>
                )}

                {item.status === 'approved' && (
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-green-600 font-medium">Approved</span>
                    <span className="text-muted-foreground">• Ready for scheduling</span>
                  </div>
                )}

                {item.status === 'rejected' && item.rejection_reason && (
                  <div className="flex items-center gap-2 text-sm">
                    <XCircle className="h-4 w-4 text-red-600" />
                    <span className="text-red-600 font-medium">Rejected:</span>
                    <span className="text-muted-foreground">{item.rejection_reason}</span>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </Card>
    );
  };

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
                  {posts.length > 0 ? (
                    posts.map(post => <ContentCard key={post.id} item={post} />)
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-8">No pending posts</p>
                  )}
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Video className="h-5 w-5" />
                  Reels ({reels.length})
                </h3>
                <div className="space-y-3">
                  {reels.length > 0 ? (
                    reels.map(reel => <ContentCard key={reel.id} item={reel} />)
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-8">No pending reels</p>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="approved" className="space-y-4 mt-4">
            <div className="space-y-3">
              {approvedContent.length > 0 ? (
                approvedContent.map(item => <ContentCard key={item.id} item={item} />)
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">No approved content yet</p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="stats" className="mt-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
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
                <div className="text-sm text-muted-foreground mb-1">Rejected</div>
                <div className="text-2xl font-bold text-red-600">{rejectedContent.length}</div>
              </Card>
            </div>

            {rejectedContent.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <XCircle className="h-5 w-5 text-red-600" />
                  Rejected Content
                </h3>
                <div className="space-y-3">
                  {rejectedContent.map(item => (
                    <Card key={item.id} className="p-4 border-red-200">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-lg bg-red-500/10 flex items-center justify-center flex-shrink-0">
                          {item.type === 'post' ? <FileText className="h-6 w-6 text-red-500" /> : <Video className="h-6 w-6 text-red-500" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold truncate">{item.title}</h4>
                              <p className="text-sm text-muted-foreground truncate">{item.description}</p>
                            </div>
                            <Badge variant="outline" className="ml-2 flex-shrink-0 border-red-600 text-red-600">{item.type}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{item.content_text}</p>
                          <div className="flex items-center gap-2 text-sm p-2 bg-red-50 dark:bg-red-950/20 rounded">
                            <XCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
                            <span className="text-red-600 font-medium">Reason:</span>
                            <span className="text-red-700 dark:text-red-400">{item.rejection_reason}</span>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};