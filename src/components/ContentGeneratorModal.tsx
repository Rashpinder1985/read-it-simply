import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import { Sparkles, Calendar, Target } from "lucide-react";

interface ContentGeneratorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CONTENT_TEMPLATES = [
  { value: "holi", label: "Holi", category: "festival" },
  { value: "diwali", label: "Diwali", category: "festival" },
  { value: "valentines", label: "Valentine's Day", category: "festival" },
  { value: "wedding", label: "Wedding Season", category: "season" },
  { value: "pongal", label: "Pongal", category: "festival" },
  { value: "akshaya-tritiya", label: "Akshaya Tritiya", category: "festival" },
  { value: "pricing", label: "Pricing Promotion", category: "commercial" },
  { value: "promotion", label: "Special Promotion", category: "commercial" },
  { value: "festive", label: "Festive Feel", category: "mood" },
];

export const ContentGeneratorModal = ({ open, onOpenChange }: ContentGeneratorModalProps) => {
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [selectedPersona, setSelectedPersona] = useState("");
  const [contentType, setContentType] = useState<"post" | "reel">("post");
  const [customInstructions, setCustomInstructions] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const { data: personas } = useQuery({
    queryKey: ['personas'],
    queryFn: async () => {
      const { data, error } = await supabase.from('personas').select('*');
      if (error) throw error;
      return data;
    }
  });

  const handleGenerate = async () => {
    if (!selectedTemplate) {
      toast({
        title: "Template Required",
        description: "Please select a content template to generate content.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);

    try {
      const template = CONTENT_TEMPLATES.find(t => t.value === selectedTemplate);
      const persona = personas?.find(p => p.id === selectedPersona);
      
      // Generate content based on template and persona
      const contentTitle = `${template?.label} ${contentType === 'post' ? 'Post' : 'Reel'}${persona ? ` - ${persona.name}` : ''}`;
      const contentText = generateContentText(template?.label || '', persona, customInstructions);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { error } = await supabase.from('content').insert({
        title: contentTitle,
        content_text: contentText,
        description: `AI-generated content for ${template?.label}${persona ? ` targeting ${persona.name}` : ''}`,
        type: contentType,
        status: 'pending_approval',
        persona_id: selectedPersona || null,
        user_id: user.id,
        hashtags: generateHashtags(template?.label || '', persona)
      });

      if (error) throw error;

      toast({
        title: "Content Generated",
        description: "Your content has been generated and is pending approval.",
      });

      // Reset form
      setSelectedTemplate("");
      setSelectedPersona("");
      setCustomInstructions("");
      onOpenChange(false);
    } catch (error) {
      console.error('Error generating content:', error);
      toast({
        title: "Generation Failed",
        description: "Failed to generate content. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const generateContentText = (template: string, persona: any, custom: string) => {
    const personaInfo = persona ? `\n\nTargeted at: ${persona.name} (${persona.segment})` : '';
    const demographics = persona?.demographics as any;
    const psychographics = persona?.psychographics as any;
    
    let baseContent = '';
    
    switch (template) {
      case 'Holi':
        baseContent = `Celebrate the festival of colors with our stunning collection! 🌈✨\n\nThis Holi, add sparkle to your celebrations with our exclusive jewelry pieces. ${personaInfo ? `Perfect for ${demographics?.age_range} who value ${psychographics?.values?.[0] || 'tradition'}.` : ''}\n\n${custom || 'Visit our store to explore the complete collection!'}`;
        break;
      case 'Diwali':
        baseContent = `Light up your Diwali with timeless elegance! 🪔💎\n\nCelebrate the festival of lights with our exquisite gold and diamond collection. ${personaInfo ? `Specially curated for ${persona.name} who appreciate ${psychographics?.lifestyle || 'traditional craftsmanship'}.` : ''}\n\n${custom || 'Make this Diwali truly special with jewelry that shines as bright as your celebrations!'}`;
        break;
      case "Valentine's Day":
        baseContent = `Express your love with jewelry that speaks volumes! 💝✨\n\nThis Valentine's Day, gift something timeless. ${personaInfo ? `Our collection is perfect for ${demographics?.age_range} who believe in ${psychographics?.values?.[0] || 'meaningful gifts'}.` : ''}\n\n${custom || 'Discover the perfect piece to celebrate your love story!'}`;
        break;
      case 'Wedding Season':
        baseContent = `Your dream wedding deserves the perfect jewelry! 👰💍\n\nExplore our bridal collection featuring traditional and contemporary designs. ${personaInfo ? `Tailored for ${persona.name} who are planning their special day.` : ''}\n\n${custom || 'Book your consultation today!'}`;
        break;
      case 'Akshaya Tritiya':
        baseContent = `Invest in prosperity this Akshaya Tritiya! 🌟🪙\n\nBring home auspicious gold and make this day even more special. ${personaInfo ? `Perfect for ${persona.name} who value ${psychographics?.values?.[0] || 'tradition and investment'}.` : ''}\n\n${custom || 'Visit us for exclusive Akshaya Tritiya offers!'}`;
        break;
      case 'Pricing Promotion':
        baseContent = `Special Pricing Alert! 💰✨\n\nLimited time offer on our stunning collection. ${personaInfo ? `Great value for ${persona.name} who are ${psychographics?.lifestyle || 'looking for the perfect piece'}.` : ''}\n\n${custom || 'Don\'t miss out on these incredible savings!'}`;
        break;
      case 'Special Promotion':
        baseContent = `Exclusive Offer Just For You! 🎁\n\nDiscover amazing deals on our premium jewelry collection. ${personaInfo ? `Specially selected for ${persona.name}.` : ''}\n\n${custom || 'Shop now before this offer ends!'}`;
        break;
      case 'Festive Feel':
        baseContent = `Embrace the festive spirit! 🎊✨\n\nCelebrate every moment with jewelry that makes you shine. ${personaInfo ? `Perfect for ${persona.name} who love to celebrate in style.` : ''}\n\n${custom || 'Explore our festive collection today!'}`;
        break;
      default:
        baseContent = `Discover our beautiful jewelry collection! ✨\n\n${personaInfo}\n\n${custom || 'Visit us today!'}`;
    }
    
    return baseContent;
  };

  const generateHashtags = (template: string, persona: any) => {
    const baseHashtags = ['Jewelry', 'JewelleryIndia', 'GoldJewelry'];
    const templateHashtags: Record<string, string[]> = {
      'Holi': ['Holi', 'HoliCollection', 'FestivalJewelry'],
      'Diwali': ['Diwali', 'DiwaliCollection', 'FestivalOfLights'],
      "Valentine's Day": ['ValentinesDay', 'LoveGifts', 'RomanticJewelry'],
      'Wedding Season': ['BridalJewelry', 'WeddingCollection', 'BridalIndia'],
      'Akshaya Tritiya': ['AkshayaTritiya', 'GoldInvestment', 'AuspiciousDay'],
      'Pricing Promotion': ['Sale', 'SpecialOffer', 'JewelryDeals'],
      'Special Promotion': ['Promotion', 'LimitedOffer', 'ExclusiveDeal'],
      'Festive Feel': ['FestiveVibes', 'CelebrationJewelry', 'IndianFestival']
    };
    
    const personaHashtag = persona?.segment ? [persona.segment.replace(/\s+/g, '')] : [];
    
    return [...baseHashtags, ...(templateHashtags[template] || []), ...personaHashtag];
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-accent" />
            Generate Content
          </DialogTitle>
          <DialogDescription>
            Create personalized content using AI based on templates and customer personas
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Content Type Selection */}
          <div className="space-y-2">
            <Label>Content Type</Label>
            <Select value={contentType} onValueChange={(value: "post" | "reel") => setContentType(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="post">Instagram Post</SelectItem>
                <SelectItem value="reel">Instagram Reel</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Template Selection */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Content Template
            </Label>
            <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
              <SelectTrigger>
                <SelectValue placeholder="Select a template" />
              </SelectTrigger>
              <SelectContent className="bg-background z-50">
                <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">Festivals</div>
                {CONTENT_TEMPLATES.filter(t => t.category === 'festival').map(template => (
                  <SelectItem key={template.value} value={template.value}>
                    {template.label}
                  </SelectItem>
                ))}
                <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground mt-2">Seasons</div>
                {CONTENT_TEMPLATES.filter(t => t.category === 'season').map(template => (
                  <SelectItem key={template.value} value={template.value}>
                    {template.label}
                  </SelectItem>
                ))}
                <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground mt-2">Commercial</div>
                {CONTENT_TEMPLATES.filter(t => t.category === 'commercial').map(template => (
                  <SelectItem key={template.value} value={template.value}>
                    {template.label}
                  </SelectItem>
                ))}
                <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground mt-2">Mood</div>
                {CONTENT_TEMPLATES.filter(t => t.category === 'mood').map(template => (
                  <SelectItem key={template.value} value={template.value}>
                    {template.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Persona Selection */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Target Persona (Optional)
            </Label>
            <Select value={selectedPersona} onValueChange={setSelectedPersona}>
              <SelectTrigger>
                <SelectValue placeholder="Select a persona or leave blank for general content" />
              </SelectTrigger>
              <SelectContent className="bg-background z-50">
                <SelectItem value="">No specific persona</SelectItem>
                {personas?.map(persona => (
                  <SelectItem key={persona.id} value={persona.id}>
                    {persona.name} - {persona.segment}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Custom Instructions */}
          <div className="space-y-2">
            <Label>Custom Instructions (Optional)</Label>
            <Textarea
              placeholder="Add any specific instructions or details for the content..."
              value={customInstructions}
              onChange={(e) => setCustomInstructions(e.target.value)}
              rows={4}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleGenerate}
              disabled={isGenerating || !selectedTemplate}
              className="bg-gradient-to-r from-accent to-accent/90 hover:from-accent/90 hover:to-accent text-primary"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate Content
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};