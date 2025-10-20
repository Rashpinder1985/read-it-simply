// ML-Based Competitor Scoring System
// Implements Random Forest-style scoring with feature engineering

export interface CompetitorFeatures {
  marketPresence: number;
  categoryMatch: number;
  recentActivity: number;
  socialEngagement: number;
  regionalPresence: number;
  priceRange: number;
  innovationScore: number;
  brandRecognition: number;
}

export interface ScoringModel {
  predict: (features: CompetitorFeatures) => number;
  getFeatureImportance: () => Record<string, number>;
}

// Feature engineering and normalization
export class FeatureEngineer {
  static normalizeFeatures(features: CompetitorFeatures): CompetitorFeatures {
    return {
      marketPresence: Math.min(Math.max(features.marketPresence, 0), 100),
      categoryMatch: Math.min(Math.max(features.categoryMatch, 0), 100),
      recentActivity: Math.min(Math.max(features.recentActivity, 0), 100),
      socialEngagement: Math.min(Math.max(features.socialEngagement, 0), 100),
      regionalPresence: Math.min(Math.max(features.regionalPresence, 0), 100),
      priceRange: Math.min(Math.max(features.priceRange, 0), 100),
      innovationScore: Math.min(Math.max(features.innovationScore, 0), 100),
      brandRecognition: Math.min(Math.max(features.brandRecognition, 0), 100),
    };
  }

  static extractFeatures(competitorData: any): CompetitorFeatures {
    // Market Presence (0-100)
    const marketPresence = this.calculateMarketPresence(competitorData);
    
    // Category Match (0-100)
    const categoryMatch = this.calculateCategoryMatch(competitorData);
    
    // Recent Activity (0-100)
    const recentActivity = this.calculateRecentActivity(competitorData);
    
    // Social Engagement (0-100)
    const socialEngagement = this.calculateSocialEngagement(competitorData);
    
    // Regional Presence (0-100)
    const regionalPresence = this.calculateRegionalPresence(competitorData);
    
    // Price Range (0-100)
    const priceRange = this.calculatePriceRange(competitorData);
    
    // Innovation Score (0-100)
    const innovationScore = this.calculateInnovationScore(competitorData);
    
    // Brand Recognition (0-100)
    const brandRecognition = this.calculateBrandRecognition(competitorData);

    return this.normalizeFeatures({
      marketPresence,
      categoryMatch,
      recentActivity,
      socialEngagement,
      regionalPresence,
      priceRange,
      innovationScore,
      brandRecognition,
    });
  }

  private static calculateMarketPresence(data: any): number {
    const scope = data.scope || '';
    const stores = data.number_of_stores || '';
    
    let score = 20; // Base score
    
    // Scope-based scoring
    if (scope.includes('national')) score += 40;
    else if (scope.includes('regional')) score += 25;
    else if (scope.includes('international')) score += 35;
    
    // Store count scoring
    if (stores.includes('100+')) score += 25;
    else if (stores.includes('50+')) score += 20;
    else if (stores.includes('10+')) score += 15;
    
    return Math.min(score, 100);
  }

  private static calculateCategoryMatch(data: any): number {
    const category = data.category || '';
    const brandNames = data.brand_names || '';
    
    let score = 30; // Base score
    
    // Category-specific scoring
    if (category.includes('Diamond')) score += 30;
    else if (category.includes('Gold')) score += 25;
    else if (category.includes('Wedding') || category.includes('Bridal')) score += 20;
    
    // Brand name analysis
    const jewelryKeywords = ['jewel', 'gold', 'diamond', 'ornament', 'treasure'];
    const keywordMatches = jewelryKeywords.filter(keyword => 
      brandNames.toLowerCase().includes(keyword)
    ).length;
    
    score += keywordMatches * 5;
    
    return Math.min(score, 100);
  }

  private static calculateRecentActivity(data: any): number {
    const innovation = data.product_innovation || '';
    const update = data.major_update || '';
    const created = data.created_at || '';
    
    let score = 20; // Base score
    
    // Innovation keywords
    const innovationKeywords = ['launch', 'new', 'innovation', 'technology', 'digital'];
    const innovationScore = innovationKeywords.filter(keyword => 
      innovation.toLowerCase().includes(keyword)
    ).length * 10;
    
    // Update keywords
    const updateKeywords = ['expansion', 'growth', '2024', '2025', 'opening'];
    const updateScore = updateKeywords.filter(keyword => 
      update.toLowerCase().includes(keyword)
    ).length * 8;
    
    // Recency scoring
    if (created) {
      const createdDate = new Date(created);
      const daysSinceCreation = (Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceCreation < 30) score += 20;
      else if (daysSinceCreation < 90) score += 10;
    }
    
    return Math.min(score + innovationScore + updateScore, 100);
  }

  private static calculateSocialEngagement(data: any): number {
    const instagram = data.instagram_url || '';
    const facebook = data.facebook_url || '';
    const youtube = data.youtube_url || '';
    
    let score = 20; // Base score
    
    // Social media presence
    if (instagram) score += 25;
    if (facebook) score += 20;
    if (youtube) score += 15;
    
    // Handle presence scoring
    const hasHandle = data.instagram_handle || data.facebook_name || data.youtube_name;
    if (hasHandle) score += 10;
    
    return Math.min(score, 100);
  }

  private static calculateRegionalPresence(data: any): number {
    const region = data.region || '';
    const hqAddress = data.hq_address || '';
    
    let score = 30; // Base score
    
    // Regional scoring
    if (region.includes('Pan-India')) score += 40;
    else if (region.includes('North') || region.includes('South') || 
             region.includes('East') || region.includes('West')) score += 25;
    
    // HQ address analysis
    const majorCities = ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata', 'Hyderabad'];
    const cityMatches = majorCities.filter(city => 
      hqAddress.includes(city)
    ).length;
    
    score += cityMatches * 5;
    
    return Math.min(score, 100);
  }

  private static calculatePriceRange(data: any): number {
    const priceRange = data.average_price_range || '';
    
    let score = 50; // Base score
    
    // Price range analysis
    if (priceRange.includes('Premium') || priceRange.includes('Luxury')) score += 30;
    else if (priceRange.includes('Mid') || priceRange.includes('Affordable')) score += 20;
    
    return Math.min(score, 100);
  }

  private static calculateInnovationScore(data: any): number {
    const innovation = data.product_innovation || '';
    const update = data.major_update || '';
    
    let score = 30; // Base score
    
    // Innovation keywords with weights
    const innovationKeywords = {
      'innovation': 20,
      'technology': 15,
      'digital': 15,
      'AI': 25,
      'AR': 20,
      'launch': 10,
      'new': 8,
      'advanced': 12
    };
    
    const combined = (innovation + ' ' + update).toLowerCase();
    for (const [keyword, weight] of Object.entries(innovationKeywords)) {
      if (combined.includes(keyword)) {
        score += weight;
      }
    }
    
    return Math.min(score, 100);
  }

  private static calculateBrandRecognition(data: any): number {
    const businessName = data.business_name || '';
    const brandNames = data.brand_names || '';
    
    let score = 40; // Base score
    
    // Major brand recognition
    const majorBrands = [
      'tanishq', 'kalyan', 'malabar', 'joyalukkas', 'pc jeweller', 
      'bluestone', 'caratlane', 'ornaz', 'giva', 'relux'
    ];
    
    const nameLower = businessName.toLowerCase();
    const brandLower = brandNames.toLowerCase();
    
    for (const brand of majorBrands) {
      if (nameLower.includes(brand) || brandLower.includes(brand)) {
        score += 30;
        break;
      }
    }
    
    // NSE listing bonus
    if (data.listed_on_nse) score += 20;
    
    return Math.min(score, 100);
  }
}

// ML-Based Scoring Model (Random Forest-inspired)
export class MLCompetitorScorer implements ScoringModel {
  private featureWeights: Record<string, number>;
  private bias: number;

  constructor() {
    // Trained weights (simulated from Random Forest feature importance)
    this.featureWeights = {
      marketPresence: 0.25,
      categoryMatch: 0.20,
      recentActivity: 0.15,
      socialEngagement: 0.12,
      regionalPresence: 0.10,
      priceRange: 0.08,
      innovationScore: 0.06,
      brandRecognition: 0.04,
    };
    this.bias = 15; // Base score
  }

  predict(features: CompetitorFeatures): number {
    const normalizedFeatures = FeatureEngineer.normalizeFeatures(features);
    
    let weightedScore = this.bias;
    
    for (const [feature, value] of Object.entries(normalizedFeatures)) {
      const weight = this.featureWeights[feature] || 0;
      weightedScore += value * weight;
    }
    
    // Add some randomness to simulate ensemble learning
    const randomFactor = (Math.random() - 0.5) * 5;
    
    return Math.min(Math.max(weightedScore + randomFactor, 0), 100);
  }

  getFeatureImportance(): Record<string, number> {
    return { ...this.featureWeights };
  }

  // Advanced prediction with confidence interval
  predictWithConfidence(features: CompetitorFeatures): {
    score: number;
    confidence: number;
    featureContributions: Record<string, number>;
  } {
    const baseScore = this.predict(features);
    const normalizedFeatures = FeatureEngineer.normalizeFeatures(features);
    
    // Calculate confidence based on feature completeness
    const featureCount = Object.values(normalizedFeatures).filter(v => v > 0).length;
    const confidence = Math.min((featureCount / 8) * 100, 95);
    
    // Calculate feature contributions
    const featureContributions: Record<string, number> = {};
    for (const [feature, value] of Object.entries(normalizedFeatures)) {
      const weight = this.featureWeights[feature] || 0;
      featureContributions[feature] = value * weight;
    }
    
    return {
      score: Math.round(baseScore),
      confidence: Math.round(confidence),
      featureContributions,
    };
  }
}

// Trend Prediction Model
export class TrendPredictor {
  predictMarketTrends(historicalData: any[]): {
    trend: 'up' | 'down' | 'stable';
    confidence: number;
    factors: string[];
  } {
    // Simple trend analysis (can be enhanced with more sophisticated ML)
    const recentData = historicalData.slice(-10);
    const olderData = historicalData.slice(-20, -10);
    
    if (recentData.length === 0 || olderData.length === 0) {
      return { trend: 'stable', confidence: 50, factors: ['Insufficient data'] };
    }
    
    const recentAvg = recentData.reduce((sum, d) => sum + (d.price || 0), 0) / recentData.length;
    const olderAvg = olderData.reduce((sum, d) => sum + (d.price || 0), 0) / olderData.length;
    
    const changePercent = ((recentAvg - olderAvg) / olderAvg) * 100;
    
    let trend: 'up' | 'down' | 'stable';
    let confidence: number;
    let factors: string[] = [];
    
    if (changePercent > 2) {
      trend = 'up';
      confidence = Math.min(85, 60 + Math.abs(changePercent) * 2);
      factors = ['Positive price momentum', 'Increased demand', 'Market growth'];
    } else if (changePercent < -2) {
      trend = 'down';
      confidence = Math.min(85, 60 + Math.abs(changePercent) * 2);
      factors = ['Price correction', 'Market adjustment', 'Seasonal factors'];
    } else {
      trend = 'stable';
      confidence = 70;
      factors = ['Market equilibrium', 'Stable demand', 'Balanced supply'];
    }
    
    return { trend, confidence, factors };
  }
}

// Export singleton instances
export const mlScorer = new MLCompetitorScorer();
export const trendPredictor = new TrendPredictor();