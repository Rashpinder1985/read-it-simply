import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

export const useSampleDataGenerator = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const generateSampleData = async () => {
      if (!user) return;

      // Check if user already has data
      const { data: existingPersonas } = await supabase
        .from('personas')
        .select('id, demographics, behaviors')
        .limit(1);

      // If personas exist, check if they have the new structure
      if (existingPersonas && existingPersonas.length > 0) {
        const firstPersona = existingPersonas[0];
        const demographics = firstPersona.demographics as any;
        const behaviors = firstPersona.behaviors as any;
        
        // Check if data is incomplete (missing new fields)
        if (!demographics?.age_range || !demographics?.gender || !behaviors?.shopping) {
          console.log('Persona data incomplete, updating...');
          try {
            // Call edge function to update existing data
            const { data, error } = await supabase.functions.invoke('generate-sample-data', {
              body: {
                userId: user.id,
                businessName: user.user_metadata?.business_name || 'My Jewelry Business'
              }
            });

            if (error) throw error;

            if (data?.success) {
              toast({
                title: "Data Updated! 🎉",
                description: "Your persona data has been refreshed with complete information.",
              });
              
              // Refresh the page to show updated data
              window.location.reload();
            }
          } catch (error) {
            console.error('Error updating persona data:', error);
          }
        }
        return;
      }

      try {
        // Call edge function to generate sample data
        const { data, error } = await supabase.functions.invoke('generate-sample-data', {
          body: {
            userId: user.id,
            businessName: user.user_metadata?.business_name || 'My Jewelry Business'
          }
        });

        if (error) throw error;

        if (data?.success) {
          toast({
            title: "Welcome! 🎉",
            description: "Sample data has been generated for your jewelry business.",
          });
          
          // Refresh the page to show new data
          window.location.reload();
        }
      } catch (error) {
        console.error('Error generating sample data:', error);
      }
    };

    // Wait a bit to ensure auth is fully loaded
    const timer = setTimeout(generateSampleData, 1000);
    return () => clearTimeout(timer);
  }, [user, toast]);
};