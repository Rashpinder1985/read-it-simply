import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Plus, Trash2, Upload } from "lucide-react";

interface Branch {
  city: string;
  state: string;
  address: string;
}

interface Segment {
  category: string;
  subcategories: string[];
}

interface SocialMedia {
  facebook?: string;
  instagram?: string;
  twitter?: string;
  linkedin?: string;
  youtube?: string;
}

interface MediaFile {
  url: string;
  name: string;
  type: 'image' | 'video';
}

export default function BusinessDetails() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [companyName, setCompanyName] = useState("");
  const [hqAddress, setHqAddress] = useState("");
  const [branches, setBranches] = useState<Branch[]>([{ city: "", state: "", address: "" }]);
  const [segments, setSegments] = useState<Segment[]>([{ category: "", subcategories: [""] }]);
  const [socialMedia, setSocialMedia] = useState<SocialMedia>({});
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    } else if (user) {
      fetchBusinessDetails();
      fetchMediaFiles();
    }
  }, [user, authLoading, navigate]);

  const fetchBusinessDetails = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("business_details")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setCompanyName(data.company_name || "");
        setHqAddress(data.hq_address || "");
        setBranches((data.branches as unknown as Branch[]) || [{ city: "", state: "", address: "" }]);
        setSegments((data.primary_segments as unknown as Segment[]) || [{ category: "", subcategories: [""] }]);
        setSocialMedia((data.social_media_links as unknown as SocialMedia) || {});
      }
    } catch (error) {
      console.error("Error fetching business details:", error);
      toast.error("Failed to load business details");
    }
  };

  const fetchMediaFiles = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase.storage
        .from("business-media")
        .list(user.id, { limit: 100 });

      if (error) throw error;

      const files: MediaFile[] = data.map(file => ({
        url: supabase.storage.from("business-media").getPublicUrl(`${user.id}/${file.name}`).data.publicUrl,
        name: file.name,
        type: file.name.match(/\.(mp4|mov|avi|webm)$/i) ? 'video' : 'image'
      }));

      setMediaFiles(files);
    } catch (error) {
      console.error("Error fetching media files:", error);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!user || !e.target.files?.length) return;

    setUploading(true);
    const files = Array.from(e.target.files);

    try {
      for (const file of files) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `${user.id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("business-media")
          .upload(filePath, file);

        if (uploadError) throw uploadError;
      }

      toast.success("Files uploaded successfully");
      await fetchMediaFiles();
    } catch (error) {
      console.error("Error uploading files:", error);
      toast.error("Failed to upload files");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const deleteMediaFile = async (fileName: string) => {
    if (!user) return;

    try {
      const { error } = await supabase.storage
        .from("business-media")
        .remove([`${user.id}/${fileName}`]);

      if (error) throw error;

      toast.success("File deleted");
      await fetchMediaFiles();
    } catch (error) {
      console.error("Error deleting file:", error);
      toast.error("Failed to delete file");
    }
  };

  const handleSave = async () => {
    if (!user || !companyName) {
      toast.error("Company name is required");
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase
        .from("business_details")
        .upsert({
          user_id: user.id,
          company_name: companyName,
          hq_address: hqAddress,
          branches: branches as any,
          primary_segments: segments as any,
          social_media_links: socialMedia as any,
        }, {
          onConflict: 'user_id'
        });

      if (error) throw error;

      toast.success("Business details saved successfully");
      navigate("/");
    } catch (error) {
      console.error("Error saving business details:", error);
      toast.error("Failed to save business details");
    } finally {
      setLoading(false);
    }
  };

  const addBranch = () => setBranches([...branches, { city: "", state: "", address: "" }]);
  const removeBranch = (index: number) => setBranches(branches.filter((_, i) => i !== index));

  const addSegment = () => setSegments([...segments, { category: "", subcategories: [""] }]);
  const removeSegment = (index: number) => setSegments(segments.filter((_, i) => i !== index));

  const addSubcategory = (segmentIndex: number) => {
    const newSegments = [...segments];
    newSegments[segmentIndex].subcategories.push("");
    setSegments(newSegments);
  };

  const removeSubcategory = (segmentIndex: number, subIndex: number) => {
    const newSegments = [...segments];
    newSegments[segmentIndex].subcategories = newSegments[segmentIndex].subcategories.filter((_, i) => i !== subIndex);
    setSegments(newSegments);
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Business Details</h1>
        <p className="text-muted-foreground">Manage your business information and media assets</p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Company Information</CardTitle>
            <CardDescription>Basic details about your business</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="companyName">Company Name *</Label>
              <Input
                id="companyName"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Enter company name"
              />
            </div>
            <div>
              <Label htmlFor="hqAddress">Headquarters Address</Label>
              <Textarea
                id="hqAddress"
                value={hqAddress}
                onChange={(e) => setHqAddress(e.target.value)}
                placeholder="Enter HQ address"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Branches</CardTitle>
            <CardDescription>Add your business branches</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {branches.map((branch, index) => (
              <div key={index} className="p-4 border rounded-lg space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium">Branch {index + 1}</h4>
                  {branches.length > 1 && (
                    <Button variant="ghost" size="sm" onClick={() => removeBranch(index)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>City</Label>
                    <Input
                      value={branch.city}
                      onChange={(e) => {
                        const newBranches = [...branches];
                        newBranches[index].city = e.target.value;
                        setBranches(newBranches);
                      }}
                      placeholder="City"
                    />
                  </div>
                  <div>
                    <Label>State</Label>
                    <Input
                      value={branch.state}
                      onChange={(e) => {
                        const newBranches = [...branches];
                        newBranches[index].state = e.target.value;
                        setBranches(newBranches);
                      }}
                      placeholder="State"
                    />
                  </div>
                </div>
                <div>
                  <Label>Address</Label>
                  <Input
                    value={branch.address}
                    onChange={(e) => {
                      const newBranches = [...branches];
                      newBranches[index].address = e.target.value;
                      setBranches(newBranches);
                    }}
                    placeholder="Full address"
                  />
                </div>
              </div>
            ))}
            <Button onClick={addBranch} variant="outline" className="w-full">
              <Plus className="w-4 h-4 mr-2" /> Add Branch
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Primary Segments</CardTitle>
            <CardDescription>Define your business categories and subcategories</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {segments.map((segment, segmentIndex) => (
              <div key={segmentIndex} className="p-4 border rounded-lg space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium">Segment {segmentIndex + 1}</h4>
                  {segments.length > 1 && (
                    <Button variant="ghost" size="sm" onClick={() => removeSegment(segmentIndex)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
                <div>
                  <Label>Category</Label>
                  <Input
                    value={segment.category}
                    onChange={(e) => {
                      const newSegments = [...segments];
                      newSegments[segmentIndex].category = e.target.value;
                      setSegments(newSegments);
                    }}
                    placeholder="e.g., Retail, Technology"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Subcategories</Label>
                  {segment.subcategories.map((sub, subIndex) => (
                    <div key={subIndex} className="flex gap-2">
                      <Input
                        value={sub}
                        onChange={(e) => {
                          const newSegments = [...segments];
                          newSegments[segmentIndex].subcategories[subIndex] = e.target.value;
                          setSegments(newSegments);
                        }}
                        placeholder="e.g., E-commerce, Software"
                      />
                      {segment.subcategories.length > 1 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeSubcategory(segmentIndex, subIndex)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    onClick={() => addSubcategory(segmentIndex)}
                    variant="outline"
                    size="sm"
                    className="w-full"
                  >
                    <Plus className="w-4 h-4 mr-2" /> Add Subcategory
                  </Button>
                </div>
              </div>
            ))}
            <Button onClick={addSegment} variant="outline" className="w-full">
              <Plus className="w-4 h-4 mr-2" /> Add Segment
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Social Media Links</CardTitle>
            <CardDescription>Connect your social media profiles</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="facebook">Facebook</Label>
              <Input
                id="facebook"
                value={socialMedia.facebook || ""}
                onChange={(e) => setSocialMedia({ ...socialMedia, facebook: e.target.value })}
                placeholder="https://facebook.com/..."
              />
            </div>
            <div>
              <Label htmlFor="instagram">Instagram</Label>
              <Input
                id="instagram"
                value={socialMedia.instagram || ""}
                onChange={(e) => setSocialMedia({ ...socialMedia, instagram: e.target.value })}
                placeholder="https://instagram.com/..."
              />
            </div>
            <div>
              <Label htmlFor="twitter">Twitter/X</Label>
              <Input
                id="twitter"
                value={socialMedia.twitter || ""}
                onChange={(e) => setSocialMedia({ ...socialMedia, twitter: e.target.value })}
                placeholder="https://twitter.com/..."
              />
            </div>
            <div>
              <Label htmlFor="linkedin">LinkedIn</Label>
              <Input
                id="linkedin"
                value={socialMedia.linkedin || ""}
                onChange={(e) => setSocialMedia({ ...socialMedia, linkedin: e.target.value })}
                placeholder="https://linkedin.com/..."
              />
            </div>
            <div>
              <Label htmlFor="youtube">YouTube</Label>
              <Input
                id="youtube"
                value={socialMedia.youtube || ""}
                onChange={(e) => setSocialMedia({ ...socialMedia, youtube: e.target.value })}
                placeholder="https://youtube.com/..."
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Business Media</CardTitle>
            <CardDescription>Upload images and videos for content generation</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="mediaUpload" className="cursor-pointer">
                <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary transition-colors">
                  <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Click to upload images or videos
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Supported: JPG, PNG, MP4, MOV, etc.
                  </p>
                </div>
                <Input
                  id="mediaUpload"
                  type="file"
                  multiple
                  accept="image/*,video/*"
                  onChange={handleFileUpload}
                  disabled={uploading}
                  className="hidden"
                />
              </Label>
            </div>

            {uploading && (
              <div className="flex items-center justify-center p-4">
                <Loader2 className="w-6 h-6 animate-spin mr-2" />
                <span>Uploading files...</span>
              </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {mediaFiles.map((file, index) => (
                <div key={index} className="relative group">
                  {file.type === 'image' ? (
                    <img
                      src={file.url}
                      alt={file.name}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                  ) : (
                    <video
                      src={file.url}
                      className="w-full h-32 object-cover rounded-lg"
                      controls
                    />
                  )}
                  <Button
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => deleteMediaFile(file.name)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button onClick={handleSave} disabled={loading} className="flex-1">
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Save Business Details
          </Button>
          <Button variant="outline" onClick={() => navigate("/")} disabled={loading}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
