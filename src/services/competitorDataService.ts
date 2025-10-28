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
}

export const competitorDataService = new CompetitorDataService();
