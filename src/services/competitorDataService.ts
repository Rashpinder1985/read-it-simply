import { supabase } from "@/integrations/supabase/client";

export interface CompetitorData {
  competitor_name: string;
  metal: string;
  use_category: string;
  region: string;
  business_type: string;
  price_positioning: string;
  city: string;
  state: string;
  locality: string;
  website: string;
  instagram_handle: string;
  facebook_account: string;
  rating_avg: number;
  review_count: number;
  market_presence_label: 'Low' | 'Medium' | 'High';
  snapshot_date: string;
  store_count?: number;
  category_match?: string;
  social_score?: number;
}

export type ScopeType = 'local' | 'regional' | 'national' | 'international';

class CompetitorDataService {

  private async callEdgeFunction(functionName: string, params: Record<string, any> = {}) {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("Not authenticated");
      }

      // Use Supabase's built-in function invocation
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const url = `${supabaseUrl}/functions/v1/${functionName}`;
      
      const queryString = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryString.append(key, String(value));
        }
      });

      const fullUrl = queryString.toString() ? `${url}?${queryString.toString()}` : url;

      const response = await fetch(fullUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: `HTTP error! status: ${response.status}` }));
        throw new Error(error.error || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error calling ${functionName}:`, error);
      throw error;
    }
  }

  async getCompetitorsByScope(scope: ScopeType, userCity?: string, userState?: string): Promise<CompetitorData[]> {
    try {
      // Get business_id from MarketPulse businesses table
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('No user logged in');
        return [];
      }

      // Query the businesses table (for MarketPulse)
      const { data: business, error: businessError } = await supabase
        .from("businesses")
        .select("id, business_name, hq_city, hq_state")
        .eq("user_id", user.id)
        .maybeSingle();

      if (businessError) {
        console.error('Error fetching business:', businessError);
        return [];
      }

      if (!business?.id) {
        console.log('No business found for user. Please fill out Business Details form first.');
        return [];
      }

      console.log('Found business:', business);

      // Call dashboard endpoint for local/regional/national
      if (scope === 'local' || scope === 'regional' || scope === 'national') {
        const dashboardData = await this.callEdgeFunction('marketpulse-dashboard', {
          business_id: business.id
        });

        if (scope === 'local') {
          return dashboardData.localCompetitors || [];
        } else if (scope === 'regional') {
          return dashboardData.regionalCompetitors || [];
        } else if (scope === 'national') {
          return dashboardData.nationalCompetitors || [];
        }
      }

      // For analytics endpoint (more detailed)
      const analyticsData = await this.callEdgeFunction('marketpulse-analytics', {
        business_id: business.id,
        level: scope === 'international' ? 'national' : scope
      });

      return analyticsData.competitors || [];
    } catch (error) {
      console.error('Failed to load competitors:', error);
      return [];
    }
  }

  async getMarketPositioning(scope: ScopeType, userCity?: string, userState?: string) {
    const competitors = await this.getCompetitorsByScope(scope, userCity, userState);
    
    // Group by price positioning and market presence
    const positioning = competitors.reduce((acc, comp) => {
      const key = `${comp.price_positioning}_${comp.market_presence_label}`;
      if (!acc[key]) {
        acc[key] = {
          pricePosition: comp.price_positioning,
          marketPresence: comp.market_presence_label,
          count: 0,
          competitors: []
        };
      }
      acc[key].count++;
      acc[key].competitors.push(comp.competitor_name);
      return acc;
    }, {} as Record<string, any>);

    return Object.values(positioning);
  }

  async getMetalDistribution(scope: ScopeType, userCity?: string, userState?: string) {
    const competitors = await this.getCompetitorsByScope(scope, userCity, userState);
    
    const metalCounts = competitors.reduce((acc, comp) => {
      acc[comp.metal] = (acc[comp.metal] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(metalCounts).map(([metal, count]) => ({
      metal,
      count,
      percentage: competitors.length > 0 ? ((count / competitors.length) * 100).toFixed(1) : "0"
    }));
  }

  async getTopCompetitors(scope: ScopeType, userCity?: string, userState?: string, limit = 10) {
    const competitors = await this.getCompetitorsByScope(scope, userCity, userState);
    
    // Sort by market presence and rating
    const scored = competitors.map(comp => ({
      ...comp,
      score: this.calculateCompetitorScore(comp)
    }));

    return scored
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  async getCityDistribution(scope: ScopeType, userState?: string) {
    const competitors = await this.getCompetitorsByScope(scope, undefined, userState);

    const cityCounts = competitors.reduce((acc, comp) => {
      acc[comp.city] = (acc[comp.city] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(cityCounts)
      .map(([city, count]) => ({ city, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 20);
  }

  async getMarketPresenceStats(scope: ScopeType, userCity?: string, userState?: string) {
    const competitors = await this.getCompetitorsByScope(scope, userCity, userState);
    
    const stats = {
      total: competitors.length,
      high: competitors.filter(c => c.market_presence_label === 'High').length,
      medium: competitors.filter(c => c.market_presence_label === 'Medium').length,
      low: competitors.filter(c => c.market_presence_label === 'Low').length,
      avgRating: competitors.length > 0 
        ? competitors.reduce((sum, c) => sum + (c.rating_avg || 0), 0) / competitors.length 
        : 0,
      totalReviews: competitors.reduce((sum, c) => sum + (c.review_count || 0), 0),
    };

    return stats;
  }

  async getBusinessTypeDistribution(scope: ScopeType, userCity?: string, userState?: string) {
    const competitors = await this.getCompetitorsByScope(scope, userCity, userState);
    
    const typeCounts = competitors.reduce((acc, comp) => {
      acc[comp.business_type] = (acc[comp.business_type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(typeCounts).map(([type, count]) => ({
      type,
      count,
      percentage: competitors.length > 0 
        ? ((count / competitors.length) * 100).toFixed(1) 
        : "0"
    }));
  }

  private calculateCompetitorScore(competitor: CompetitorData): number {
    let score = 0;
    
    // Market presence score
    if (competitor.market_presence_label === 'High') score += 40;
    else if (competitor.market_presence_label === 'Medium') score += 25;
    else score += 10;
    
    // Rating score (out of 30)
    score += (competitor.rating_avg || 0) * 6;
    
    // Review count score (out of 30, logarithmic)
    const reviewScore = Math.min(30, Math.log10((competitor.review_count || 1) + 1) * 10);
    score += reviewScore;
    
    return score;
  }

  async getStateDistribution() {
    const competitors = await this.getCompetitorsByScope('national');
    
    const stateCounts = competitors.reduce((acc, comp) => {
      acc[comp.state] = (acc[comp.state] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(stateCounts)
      .map(([state, count]) => ({ state, count }))
      .sort((a, b) => b.count - a.count);
  }

  async getCompetitorAnalysis(competitorName: string) {
    const competitors = await this.getCompetitorsByScope('national');
    
    const competitor = competitors.find(c => 
      c.competitor_name.toLowerCase() === competitorName.toLowerCase()
    );

    if (!competitor) return null;

    // Find similar competitors
    const similar = competitors.filter(c => 
      c.city === competitor.city && 
      c.metal === competitor.metal &&
      c.competitor_name !== competitor.competitor_name
    ).slice(0, 5);

    return {
      ...competitor,
      score: this.calculateCompetitorScore(competitor),
      similarCompetitors: similar.map(s => s.competitor_name),
      marketShare: this.calculateMarketShare(competitor, competitors)
    };
  }

  private calculateMarketShare(competitor: CompetitorData, allCompetitors: CompetitorData[]): number {
    const cityCompetitors = allCompetitors.filter(c => c.city === competitor.city);
    const totalReviews = cityCompetitors.reduce((sum, c) => sum + (c.review_count || 0), 0);
    
    if (totalReviews === 0) return 0;
    return ((competitor.review_count || 0) / totalReviews) * 100;
  }

  async getGeographicExpansionHotspots(limit = 10) {
    const competitors = await this.getCompetitorsByScope('national');
    
    const cityStats = competitors.reduce((acc, comp) => {
      const key = `${comp.city}, ${comp.state}`;
      if (!acc[key]) {
        acc[key] = {
          city: comp.city,
          state: comp.state,
          competitorCount: 0,
          avgRating: 0,
          totalReviews: 0,
          highPresence: 0,
          ratings: [] as number[]
        };
      }
      acc[key].competitorCount++;
      acc[key].totalReviews += (comp.review_count || 0);
      acc[key].ratings.push(comp.rating_avg || 0);
      if (comp.market_presence_label === 'High') acc[key].highPresence++;
      return acc;
    }, {} as Record<string, any>);

    return Object.values(cityStats)
      .map((stat: any) => ({
        ...stat,
        avgRating: stat.ratings.length > 0 
          ? stat.ratings.reduce((sum: number, r: number) => sum + r, 0) / stat.ratings.length 
          : 0,
        activityScore: stat.competitorCount * 0.4 + stat.totalReviews * 0.0001 + stat.avgRating * 10 + stat.highPresence * 5,
        trend: stat.competitorCount > 15 ? 'HOT' : stat.competitorCount > 8 ? 'GROWING' : 'EMERGING'
      }))
      .sort((a, b) => b.activityScore - a.activityScore)
      .slice(0, limit);
  }

  async getCategoryMomentum() {
    const competitors = await this.getCompetitorsByScope('national');
    
    const categoryStats = competitors.reduce((acc, comp) => {
      if (!acc[comp.use_category]) {
        acc[comp.use_category] = {
          category: comp.use_category,
          competitorCount: 0,
          avgRating: 0,
          totalReviews: 0,
          highPresence: 0,
          ratings: [] as number[]
        };
      }
      acc[comp.use_category].competitorCount++;
      acc[comp.use_category].totalReviews += (comp.review_count || 0);
      acc[comp.use_category].ratings.push(comp.rating_avg || 0);
      if (comp.market_presence_label === 'High') acc[comp.use_category].highPresence++;
      return acc;
    }, {} as Record<string, any>);

    return Object.values(categoryStats)
      .map((stat: any) => ({
        ...stat,
        avgRating: stat.ratings.length > 0
          ? stat.ratings.reduce((sum: number, r: number) => sum + r, 0) / stat.ratings.length
          : 0,
        momentumScore: stat.competitorCount * 0.3 + stat.avgRating * 15 + stat.highPresence * 8,
        strength: stat.competitorCount > 20 ? 'VERY HIGH' : stat.competitorCount > 10 ? 'HIGH' : stat.competitorCount > 5 ? 'MEDIUM' : 'LOW'
      }))
      .sort((a, b) => b.momentumScore - a.momentumScore);
  }

  async getRisingCompetitors(scope: ScopeType, userCity?: string, userState?: string, limit = 10) {
    const competitors = await this.getCompetitorsByScope(scope, userCity, userState);
    
    return competitors
      .filter(c => (c.rating_avg || 0) >= 4.0 && (c.review_count || 0) > 50)
      .map(comp => ({
        ...comp,
        growthScore: (comp.rating_avg || 0) * 15 + Math.log10((comp.review_count || 1) + 1) * 25,
        ratingQuality: comp.rating_avg || 0,
        reviewMomentum: comp.review_count || 0,
        threat: this.calculateThreatLevel(comp, scope, userCity, userState)
      }))
      .sort((a, b) => b.growthScore - a.growthScore)
      .slice(0, limit);
  }

  private calculateThreatLevel(competitor: CompetitorData, scope: ScopeType, userCity?: string, userState?: string): 'IMMEDIATE' | 'HIGH' | 'MEDIUM' | 'LOW' {
    if (scope === 'local' && competitor.city === userCity) return 'IMMEDIATE';
    if (scope === 'regional' && competitor.state === userState) return 'HIGH';
    if ((competitor.rating_avg || 0) > 4.5 && (competitor.review_count || 0) > 200) return 'HIGH';
    if ((competitor.rating_avg || 0) > 4.0 && (competitor.review_count || 0) > 100) return 'MEDIUM';
    return 'LOW';
  }

  async getMetalTrends() {
    const competitors = await this.getCompetitorsByScope('national');
    
    const metalStats = competitors.reduce((acc, comp) => {
      if (!acc[comp.metal]) {
        acc[comp.metal] = {
          metal: comp.metal,
          competitorCount: 0,
          avgRating: 0,
          totalReviews: 0,
          highPresence: 0,
          ratings: [] as number[]
        };
      }
      acc[comp.metal].competitorCount++;
      acc[comp.metal].totalReviews += (comp.review_count || 0);
      acc[comp.metal].ratings.push(comp.rating_avg || 0);
      if (comp.market_presence_label === 'High') acc[comp.metal].highPresence++;
      return acc;
    }, {} as Record<string, any>);

    return Object.values(metalStats)
      .map((stat: any) => ({
        ...stat,
        avgRating: stat.ratings.length > 0
          ? stat.ratings.reduce((sum: number, r: number) => sum + r, 0) / stat.ratings.length
          : 0,
        trendStrength: stat.competitorCount > 30 ? 'DOMINANT' : stat.competitorCount > 15 ? 'STRONG' : stat.competitorCount > 5 ? 'MODERATE' : 'NICHE'
      }))
      .sort((a, b) => b.competitorCount - a.competitorCount);
  }

  async getBusinessTypeTrends() {
    const competitors = await this.getCompetitorsByScope('national');
    
    const typeStats = competitors.reduce((acc, comp) => {
      if (!acc[comp.business_type]) {
        acc[comp.business_type] = {
          businessType: comp.business_type,
          competitorCount: 0,
          avgRating: 0,
          totalReviews: 0,
          ratings: [] as number[]
        };
      }
      acc[comp.business_type].competitorCount++;
      acc[comp.business_type].totalReviews += (comp.review_count || 0);
      acc[comp.business_type].ratings.push(comp.rating_avg || 0);
      return acc;
    }, {} as Record<string, any>);

    return Object.values(typeStats)
      .map((stat: any) => ({
        ...stat,
        avgRating: stat.ratings.length > 0
          ? stat.ratings.reduce((sum: number, r: number) => sum + r, 0) / stat.ratings.length
          : 0,
        marketShare: competitors.length > 0 
          ? ((stat.competitorCount / competitors.length) * 100).toFixed(1) 
          : "0"
      }))
      .sort((a, b) => b.competitorCount - a.competitorCount);
  }

  // New methods for Edge Functions
  async getNationalIntelligence(businessId: string) {
    try {
      return await this.callEdgeFunction('marketpulse-national-intel', {
        business_id: businessId
      });
    } catch (error) {
      console.error('Failed to load national intelligence:', error);
      return null;
    }
  }

  async getEmergingTrends(state?: string) {
    try {
      const params: Record<string, any> = {};
      if (state) params.state = state;
      
      return await this.callEdgeFunction('marketpulse-trends', params);
    } catch (error) {
      console.error('Failed to load emerging trends:', error);
      return null;
    }
  }
}

export const competitorDataService = new CompetitorDataService();
