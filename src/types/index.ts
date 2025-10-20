// Core types for the multi-agent marketing system

export interface User {
  id: string;
  email: string;
  full_name?: string;
  company_name?: string;
  brand_name?: string;
  industry?: string;
  company_size?: string;
}

export interface UserRole {
  user_id: string;
  role: 'admin' | 'marketing' | 'content' | 'assets';
}

export interface Persona {
  id: string;
  name: string;
  segment: string;
  demographics: PersonaDemographics;
  psychographics: PersonaPsychographics;
  behaviors: PersonaBehaviors;
  pain_points: string[];
  goals: string[];
  created_at: string;
  updated_at: string;
}

export interface PersonaDemographics {
  age_range: string;
  income: string;
  location: string;
  gender: string;
}

export interface PersonaPsychographics {
  values: string[];
  lifestyle: string;
}

export interface PersonaBehaviors {
  shopping: string;
  social_media: string;
  purchase_frequency: string;
}

export interface MarketData {
  id: string;
  brand_name: string;
  category?: string;
  gold_price?: number;
  silver_price?: number;
  product_innovation?: string;
  major_update?: string;
  social_media_activity: SocialMediaActivity;
  engagement_metrics: EngagementMetrics;
  timestamp: string;
  created_at: string;
}

export interface SocialMediaActivity {
  posts_today: number;
  platform: string;
  latest_campaign: string;
}

export interface EngagementMetrics {
  likes: number;
  comments: number;
  shares: number;
}

export interface Content {
  id: string;
  type: 'post' | 'reel';
  persona_id?: string;
  title: string;
  description?: string;
  content_text: string;
  media_url?: string;
  hashtags: string[];
  status: 'draft' | 'pending_approval' | 'approved' | 'rejected' | 'scheduled' | 'published';
  scheduled_for?: string;
  approved_by?: string;
  approved_at?: string;
  rejection_reason?: string;
  created_at: string;
  updated_at: string;
  user_id: string;
}

export interface BusinessDetails {
  id: string;
  user_id: string;
  company_name: string;
  hq_address?: string;
  branches?: Branch[];
  primary_segments?: string[];
  social_media_links?: SocialMediaLinks;
  created_at: string;
  updated_at: string;
}

export interface Branch {
  name: string;
  address: string;
  city: string;
  phone?: string;
}

export interface SocialMediaLinks {
  instagram?: string;
  facebook?: string;
  youtube?: string;
  website?: string;
}

export interface Competitor {
  id: string;
  business_name: string;
  brand_names?: string;
  scope: 'national' | 'regional_north' | 'regional_south' | 'regional_east' | 'regional_west' | 'international' | 'online_d2c';
  number_of_stores?: string;
  hq_address?: string;
  average_price_range?: string;
  instagram_url?: string;
  instagram_handle?: string;
  facebook_url?: string;
  facebook_name?: string;
  youtube_url?: string;
  youtube_name?: string;
  owner_name?: string;
  listed_on_nse: boolean;
  region?: string;
  city?: string;
  category: string;
  created_at: string;
}

// Agent System Types
export interface Agent {
  id: string;
  name: string;
  role: string;
  description: string;
  status: 'active' | 'inactive' | 'maintenance';
  capabilities: string[];
  metrics: AgentMetrics;
}

export interface AgentMetrics {
  [key: string]: string | number;
}

// API Response Types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T = unknown> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Error Types
export interface AppError {
  code: string;
  message: string;
  details?: unknown;
}

// Form Types
export interface CreateUserRequest {
  email: string;
  role: string;
  fullName?: string;
  password?: string;
  companyName?: string;
  brandName?: string;
  industry?: string;
  companySize?: string;
}

export interface ContentGenerationRequest {
  personaId: string;
  contentType: 'post' | 'reel';
  prompt: string;
  template?: string;
  occasion?: string;
}

export interface ContentGenerationResponse {
  text: string;
  hashtags?: string[];
  mediaUrl?: string;
}

// Dashboard Types
export interface DashboardStats {
  brandsTracked: number;
  activePersonas: number;
  pendingApproval: number;
  readyToSchedule: number;
}