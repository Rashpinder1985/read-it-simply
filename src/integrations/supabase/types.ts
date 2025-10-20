export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      business_details: {
        Row: {
          branches: Json | null
          company_name: string
          created_at: string | null
          hq_address: string | null
          id: string
          primary_segments: Json | null
          social_media_links: Json | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          branches?: Json | null
          company_name: string
          created_at?: string | null
          hq_address?: string | null
          id?: string
          primary_segments?: Json | null
          social_media_links?: Json | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          branches?: Json | null
          company_name?: string
          created_at?: string | null
          hq_address?: string | null
          id?: string
          primary_segments?: Json | null
          social_media_links?: Json | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      competitors: {
        Row: {
          average_price_range: string | null
          brand_names: string | null
          business_name: string
          category: string | null
          city: string | null
          created_at: string | null
          facebook_name: string | null
          facebook_url: string | null
          hq_address: string | null
          id: string
          instagram_handle: string | null
          instagram_url: string | null
          listed_on_nse: boolean | null
          number_of_stores: string | null
          owner_name: string | null
          region: string | null
          scope: Database["public"]["Enums"]["competitor_scope"]
          youtube_name: string | null
          youtube_url: string | null
        }
        Insert: {
          average_price_range?: string | null
          brand_names?: string | null
          business_name: string
          category?: string | null
          city?: string | null
          created_at?: string | null
          facebook_name?: string | null
          facebook_url?: string | null
          hq_address?: string | null
          id?: string
          instagram_handle?: string | null
          instagram_url?: string | null
          listed_on_nse?: boolean | null
          number_of_stores?: string | null
          owner_name?: string | null
          region?: string | null
          scope: Database["public"]["Enums"]["competitor_scope"]
          youtube_name?: string | null
          youtube_url?: string | null
        }
        Update: {
          average_price_range?: string | null
          brand_names?: string | null
          business_name?: string
          category?: string | null
          city?: string | null
          created_at?: string | null
          facebook_name?: string | null
          facebook_url?: string | null
          hq_address?: string | null
          id?: string
          instagram_handle?: string | null
          instagram_url?: string | null
          listed_on_nse?: boolean | null
          number_of_stores?: string | null
          owner_name?: string | null
          region?: string | null
          scope?: Database["public"]["Enums"]["competitor_scope"]
          youtube_name?: string | null
          youtube_url?: string | null
        }
        Relationships: []
      }
      content: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          content_text: string
          created_at: string | null
          description: string | null
          hashtags: string[] | null
          id: string
          media_url: string | null
          persona_id: string | null
          rejection_reason: string | null
          scheduled_for: string | null
          status: Database["public"]["Enums"]["content_status"] | null
          title: string
          type: Database["public"]["Enums"]["content_type"]
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          content_text: string
          created_at?: string | null
          description?: string | null
          hashtags?: string[] | null
          id?: string
          media_url?: string | null
          persona_id?: string | null
          rejection_reason?: string | null
          scheduled_for?: string | null
          status?: Database["public"]["Enums"]["content_status"] | null
          title: string
          type: Database["public"]["Enums"]["content_type"]
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          content_text?: string
          created_at?: string | null
          description?: string | null
          hashtags?: string[] | null
          id?: string
          media_url?: string | null
          persona_id?: string | null
          rejection_reason?: string | null
          scheduled_for?: string | null
          status?: Database["public"]["Enums"]["content_status"] | null
          title?: string
          type?: Database["public"]["Enums"]["content_type"]
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "content_persona_id_fkey"
            columns: ["persona_id"]
            isOneToOne: false
            referencedRelation: "personas"
            referencedColumns: ["id"]
          },
        ]
      }
      market_data: {
        Row: {
          brand_name: string
          category: string | null
          competitor_insights: string | null
          created_at: string | null
          engagement_metrics: Json | null
          gold_price: number | null
          id: string
          instagram_handle: string | null
          major_update: string | null
          market_analysis: Json | null
          product_innovation: string | null
          silver_price: number | null
          social_media_activity: Json | null
          social_media_links: Json | null
          ten_year_data: Json | null
          timestamp: string | null
          user_id: string | null
        }
        Insert: {
          brand_name: string
          category?: string | null
          competitor_insights?: string | null
          created_at?: string | null
          engagement_metrics?: Json | null
          gold_price?: number | null
          id?: string
          instagram_handle?: string | null
          major_update?: string | null
          market_analysis?: Json | null
          product_innovation?: string | null
          silver_price?: number | null
          social_media_activity?: Json | null
          social_media_links?: Json | null
          ten_year_data?: Json | null
          timestamp?: string | null
          user_id?: string | null
        }
        Update: {
          brand_name?: string
          category?: string | null
          competitor_insights?: string | null
          created_at?: string | null
          engagement_metrics?: Json | null
          gold_price?: number | null
          id?: string
          instagram_handle?: string | null
          major_update?: string | null
          market_analysis?: Json | null
          product_innovation?: string | null
          silver_price?: number | null
          social_media_activity?: Json | null
          social_media_links?: Json | null
          ten_year_data?: Json | null
          timestamp?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      personas: {
        Row: {
          behaviors: Json | null
          created_at: string | null
          demographics: Json | null
          goals: string[] | null
          id: string
          name: string
          pain_points: string[] | null
          psychographics: Json | null
          segment: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          behaviors?: Json | null
          created_at?: string | null
          demographics?: Json | null
          goals?: string[] | null
          id?: string
          name: string
          pain_points?: string[] | null
          psychographics?: Json | null
          segment: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          behaviors?: Json | null
          created_at?: string | null
          demographics?: Json | null
          goals?: string[] | null
          id?: string
          name?: string
          pain_points?: string[] | null
          psychographics?: Json | null
          segment?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          brand_name: string | null
          business_name: string | null
          company_name: string | null
          company_size: string | null
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          industry: string | null
          updated_at: string | null
        }
        Insert: {
          brand_name?: string | null
          business_name?: string | null
          company_name?: string | null
          company_size?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          industry?: string | null
          updated_at?: string | null
        }
        Update: {
          brand_name?: string | null
          business_name?: string | null
          company_name?: string | null
          company_size?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          industry?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "marketing" | "content" | "assets"
      competitor_scope:
        | "national"
        | "regional_north"
        | "regional_south"
        | "regional_east"
        | "regional_west"
        | "international"
        | "online_d2c"
      content_status:
        | "draft"
        | "pending_approval"
        | "approved"
        | "rejected"
        | "scheduled"
        | "published"
      content_type: "post" | "reel"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "marketing", "content", "assets"],
      competitor_scope: [
        "national",
        "regional_north",
        "regional_south",
        "regional_east",
        "regional_west",
        "international",
        "online_d2c",
      ],
      content_status: [
        "draft",
        "pending_approval",
        "approved",
        "rejected",
        "scheduled",
        "published",
      ],
      content_type: ["post", "reel"],
    },
  },
} as const
