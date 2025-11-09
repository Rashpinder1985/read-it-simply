import Papa from 'papaparse';

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
}

export type ScopeType = 'local' | 'regional' | 'national' | 'international';

class CompetitorDataService {
  private data: CompetitorData[] = [];
  private initialized = false;

  async initialize() {
    if (this.initialized) return;
    
    try {
      const response = await fetch('/src/data/jewellery_knowledge_base.csv');
      const csvText = await response.text();
      
      const result = Papa.parse<CompetitorData>(csvText, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
      });
      
      this.data = result.data;
      this.initialized = true;
    } catch (error) {
      console.error('Failed to load competitor data:', error);
      this.data = [];
    }
  }

  async getCompetitorsByScope(scope: ScopeType, userCity?: string, userState?: string): Promise<CompetitorData[]> {
    await this.initialize();
    
    if (!this.data.length) return [];

    switch (scope) {
      case 'local':
        // Filter by user's city
        return this.data.filter(c => 
          userCity && c.city.toLowerCase().includes(userCity.toLowerCase())
        );
      
      case 'regional':
        // Filter by user's state
        return this.data.filter(c => 
          userState && c.state.toLowerCase().includes(userState.toLowerCase())
        );
      
      case 'national':
        // All competitors in India (region: Pan-India)
        return this.data.filter(c => c.region === 'Pan-India');
      
      case 'international':
        // International competitors (for future expansion)
        return this.data.filter(c => c.region !== 'Pan-India');
      
      default:
        return this.data;
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
      percentage: ((count / competitors.length) * 100).toFixed(1)
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
    await this.initialize();
    
    let filtered = this.data;
    if (scope === 'regional' && userState) {
      filtered = this.data.filter(c => 
        c.state.toLowerCase().includes(userState.toLowerCase())
      );
    }

    const cityCounts = filtered.reduce((acc, comp) => {
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
      avgRating: competitors.reduce((sum, c) => sum + (c.rating_avg || 0), 0) / competitors.length,
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
      percentage: ((count / competitors.length) * 100).toFixed(1)
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
    await this.initialize();
    
    const stateCounts = this.data.reduce((acc, comp) => {
      acc[comp.state] = (acc[comp.state] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(stateCounts)
      .map(([state, count]) => ({ state, count }))
      .sort((a, b) => b.count - a.count);
  }

  async getCompetitorAnalysis(competitorName: string) {
    await this.initialize();
    
    const competitor = this.data.find(c => 
      c.competitor_name.toLowerCase() === competitorName.toLowerCase()
    );

    if (!competitor) return null;

    // Find similar competitors
    const similar = this.data.filter(c => 
      c.city === competitor.city && 
      c.metal === competitor.metal &&
      c.competitor_name !== competitor.competitor_name
    ).slice(0, 5);

    return {
      ...competitor,
      score: this.calculateCompetitorScore(competitor),
      similarCompetitors: similar.map(s => s.competitor_name),
      marketShare: this.calculateMarketShare(competitor)
    };
  }

  private calculateMarketShare(competitor: CompetitorData): number {
    const cityCompetitors = this.data.filter(c => c.city === competitor.city);
    const totalReviews = cityCompetitors.reduce((sum, c) => sum + (c.review_count || 0), 0);
    
    if (totalReviews === 0) return 0;
    return ((competitor.review_count || 0) / totalReviews) * 100;
  }

  async getGeographicExpansionHotspots(limit = 10) {
    await this.initialize();
    
    const cityStats = this.data.reduce((acc, comp) => {
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
        avgRating: stat.ratings.reduce((sum: number, r: number) => sum + r, 0) / stat.ratings.length,
        activityScore: stat.competitorCount * 0.4 + stat.totalReviews * 0.0001 + stat.avgRating * 10 + stat.highPresence * 5,
        trend: stat.competitorCount > 15 ? 'HOT' : stat.competitorCount > 8 ? 'GROWING' : 'EMERGING'
      }))
      .sort((a, b) => b.activityScore - a.activityScore)
      .slice(0, limit);
  }

  async getCategoryMomentum() {
    await this.initialize();
    
    const categoryStats = this.data.reduce((acc, comp) => {
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
        avgRating: stat.ratings.reduce((sum: number, r: number) => sum + r, 0) / stat.ratings.length,
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
    await this.initialize();
    
    const metalStats = this.data.reduce((acc, comp) => {
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
        avgRating: stat.ratings.reduce((sum: number, r: number) => sum + r, 0) / stat.ratings.length,
        trendStrength: stat.competitorCount > 30 ? 'DOMINANT' : stat.competitorCount > 15 ? 'STRONG' : stat.competitorCount > 5 ? 'MODERATE' : 'NICHE'
      }))
      .sort((a, b) => b.competitorCount - a.competitorCount);
  }

  async getBusinessTypeTrends() {
    await this.initialize();
    
    const typeStats = this.data.reduce((acc, comp) => {
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
        avgRating: stat.ratings.reduce((sum: number, r: number) => sum + r, 0) / stat.ratings.length,
        marketShare: ((stat.competitorCount / this.data.length) * 100).toFixed(1)
      }))
      .sort((a, b) => b.competitorCount - a.competitorCount);
  }
}

export const competitorDataService = new CompetitorDataService();
