import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { toast } from "sonner";
import { Loader2, Plus, Trash2, Upload, Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

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
  const [companyNameOpen, setCompanyNameOpen] = useState(false);
  const [hqAddress, setHqAddress] = useState("");
  const [branches, setBranches] = useState<Branch[]>([{ city: "", state: "", address: "" }]);
  const [segments, setSegments] = useState<Segment[]>([{ category: "", subcategories: [""] }]);
  const [socialMedia, setSocialMedia] = useState<SocialMedia>({});
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  
  // Dropdown options from MarketPulse database
  const [cities, setCities] = useState<Array<{city: string, state: string}>>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [subcategoryOptions, setSubcategoryOptions] = useState<string[]>([]);
  const [companyNames, setCompanyNames] = useState<string[]>([]);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    } else if (user) {
      fetchBusinessDetails();
      fetchMediaFiles();
      fetchMarketPlaceData();
    }
  }, [user, authLoading, navigate]);

  const fetchMarketPlaceData = async () => {
    try {
      console.log("🔍 Fetching marketplace data...");
      
      // Fetch unique cities and states from competitor_locations
      const { data: locationData, error: locError } = await supabase
        .from("competitor_locations")
        .select("city, state")
        .order("state")
        .order("city");

      console.log("📍 Location data:", locationData);
      console.log("❌ Location error:", locError);

      if (locationData && locationData.length > 0) {
        // Remove duplicates
        const uniqueLocations = Array.from(
          new Map(locationData.map(item => [`${item.city}-${item.state}`, item])).values()
        );
        console.log("✅ Setting cities:", uniqueLocations);
        setCities(uniqueLocations);
      } else {
        console.warn("⚠️ No location data found in database");
      }

      // Fetch unique categories from competitors
      const { data: categoryData, error: catError } = await supabase
        .from("competitors")
        .select("use_category, metal, business_type")
        .not("use_category", "is", null);

      console.log("📦 Category data:", categoryData);
      console.log("❌ Category error:", catError);

      if (categoryData) {
        const uniqueCategories = [...new Set(categoryData.map(c => c.use_category))];
        console.log("✅ Setting categories:", uniqueCategories);
        setCategories(uniqueCategories.filter(Boolean).sort());
        
        // Common jewellery subcategories
        const subcats = [
          "Gold Jewellery", "Diamond Jewellery", "Silver Jewellery", 
          "Platinum Jewellery", "Bridal Sets", "Temple Jewellery",
          "Contemporary Designs", "Custom Design", "Repairs & Alterations"
        ];
        setSubcategoryOptions(subcats);
      }

      // Fetch company names from competitors
      const { data: companyData, error: compError } = await supabase
        .from("competitors")
        .select("competitor_name")
        .order("competitor_name");

      console.log("🏢 Company names data:", companyData);
      console.log("❌ Company error:", compError);

      if (companyData) {
        const uniqueCompanyNames = companyData.map(c => c.competitor_name).filter(Boolean);
        console.log("✅ Setting company names:", uniqueCompanyNames.length);
        setCompanyNames(uniqueCompanyNames);
      }
    } catch (error) {
      console.error("💥 Error fetching marketplace data:", error);
    }
  };

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
      // Save to business_details table
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

      // Also save to businesses table for MarketPulse
      // Extract city and state from first branch or headquarters address
      const hqCity = branches[0]?.city || "";
      const hqState = branches[0]?.state || "";
      const primaryCategory = segments[0]?.category || "Jewellery";

      const { error: businessError } = await supabase
        .from("businesses")
        .upsert({
          user_id: user.id,
          business_name: companyName,
          hq_city: hqCity,
          hq_state: hqState,
          primary_category: primaryCategory,
          target_segment: segments[0]?.subcategories?.join(", ") || null,
        }, {
          onConflict: 'user_id'
        });

      if (businessError) {
        console.error("Error saving to businesses table:", businessError);
        toast.error(`Business sync failed: ${businessError.message}`);
        // Show the error to help debug
      } else {
        console.log("Successfully saved to businesses table for MarketPulse");
      }

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
              <Popover open={companyNameOpen} onOpenChange={setCompanyNameOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={companyNameOpen}
                    className="w-full justify-between"
                  >
                    {companyName || "Select or type company name"}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0" align="start">
                  <Command>
                    <CommandInput 
                      placeholder="Search company name..." 
                      value={companyName}
                      onValueChange={setCompanyName}
                    />
                    <CommandList>
                      <CommandEmpty>
                        <div className="py-2 px-4 text-sm text-muted-foreground">
                          No company found. Type to add custom name.
                        </div>
                      </CommandEmpty>
                      <CommandGroup>
                        {companyNames.slice(0, 100).map((name) => (
                          <CommandItem
                            key={name}
                            value={name}
                            onSelect={(currentValue) => {
                              setCompanyName(currentValue === companyName ? "" : currentValue);
                              setCompanyNameOpen(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                companyName === name ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              <p className="text-xs text-muted-foreground mt-1">
                {companyNames.length} companies available in database
              </p>
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
                    <Select
                      value={branch.city}
                      onValueChange={(value) => {
                        const newBranches = [...branches];
                        newBranches[index].city = value;
                        // Auto-fill state when city is selected
                        const selectedLocation = cities.find(c => c.city === value);
                        if (selectedLocation) {
                          newBranches[index].state = selectedLocation.state;
                        }
                        setBranches(newBranches);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select city" />
                      </SelectTrigger>
                      <SelectContent>
                        {cities.map((location, idx) => (
                          <SelectItem key={idx} value={location.city}>
                            {location.city}
                          </SelectItem>
                        ))}
                        <SelectItem value="Other">Other (Manual Entry)</SelectItem>
                      </SelectContent>
                    </Select>
                    {branch.city === "Other" && (
                      <Input
                        className="mt-2"
                        value={branch.city === "Other" ? "" : branch.city}
                        onChange={(e) => {
                          const newBranches = [...branches];
                          newBranches[index].city = e.target.value;
                          setBranches(newBranches);
                        }}
                        placeholder="Enter city name"
                      />
                    )}
                  </div>
                  <div>
                    <Label>State</Label>
                    <Select
                      value={branch.state}
                      onValueChange={(value) => {
                        const newBranches = [...branches];
                        newBranches[index].state = value;
                        setBranches(newBranches);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select state" />
                      </SelectTrigger>
                      <SelectContent>
                        {[...new Set(cities.map(c => c.state))].map((state, idx) => (
                          <SelectItem key={idx} value={state}>
                            {state}
                          </SelectItem>
                        ))}
                        <SelectItem value="Other">Other (Manual Entry)</SelectItem>
                      </SelectContent>
                    </Select>
                    {branch.state === "Other" && (
                      <Input
                        className="mt-2"
                        value={branch.state === "Other" ? "" : branch.state}
                        onChange={(e) => {
                          const newBranches = [...branches];
                          newBranches[index].state = e.target.value;
                          setBranches(newBranches);
                        }}
                        placeholder="Enter state name"
                      />
                    )}
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
                  <Select
                    value={segment.category}
                    onValueChange={(value) => {
                      const newSegments = [...segments];
                      newSegments[segmentIndex].category = value;
                      setSegments(newSegments);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat, idx) => (
                        <SelectItem key={idx} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                      <SelectItem value="Jewellery">Jewellery (General)</SelectItem>
                      <SelectItem value="Other">Other (Manual Entry)</SelectItem>
                    </SelectContent>
                  </Select>
                  {segment.category === "Other" && (
                    <Input
                      className="mt-2"
                      value={segment.category === "Other" ? "" : segment.category}
                      onChange={(e) => {
                        const newSegments = [...segments];
                        newSegments[segmentIndex].category = e.target.value;
                        setSegments(newSegments);
                      }}
                      placeholder="Enter custom category"
                    />
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Subcategories</Label>
                  {segment.subcategories.map((sub, subIndex) => (
                    <div key={subIndex} className="flex gap-2">
                      <Select
                        value={sub}
                        onValueChange={(value) => {
                          const newSegments = [...segments];
                          newSegments[segmentIndex].subcategories[subIndex] = value;
                          setSegments(newSegments);
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select subcategory" />
                        </SelectTrigger>
                        <SelectContent>
                          {subcategoryOptions.map((subcat, idx) => (
                            <SelectItem key={idx} value={subcat}>
                              {subcat}
                            </SelectItem>
                          ))}
                          <SelectItem value="Custom">Custom (Manual Entry)</SelectItem>
                        </SelectContent>
                      </Select>
                      {sub === "Custom" && (
                        <Input
                          className="mt-2"
                          value={sub === "Custom" ? "" : sub}
                          onChange={(e) => {
                            const newSegments = [...segments];
                            newSegments[segmentIndex].subcategories[subIndex] = e.target.value;
                            setSegments(newSegments);
                          }}
                          placeholder="Enter custom subcategory"
                        />
                      )}
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
