// Social Media Sentiment Analysis Service
// Analyzes brand sentiment from social media posts and comments

export interface SentimentData {
  sentiment: 'positive' | 'negative' | 'neutral';
  confidence: number;
  emotions: EmotionAnalysis;
  keywords: string[];
  timestamp: string;
}

export interface EmotionAnalysis {
  joy: number;
  trust: number;
  fear: number;
  anger: number;
  sadness: number;
  surprise: number;
  disgust: number;
  anticipation: number;
}

export interface BrandSentimentReport {
  brand: string;
  overallSentiment: 'positive' | 'negative' | 'neutral';
  sentimentScore: number; // -100 to 100
  confidence: number;
  trend: 'improving' | 'declining' | 'stable';
  keyInsights: string[];
  sentimentHistory: SentimentData[];
  competitorComparison: CompetitorSentimentComparison[];
}

export interface CompetitorSentimentComparison {
  competitor: string;
  sentimentScore: number;
  marketPosition: 'leader' | 'challenger' | 'follower';
}

class SentimentAnalyzer {
  private sentimentCache: Map<string, SentimentData[]> = new Map();
  private analysisInterval: number = 3600000; // 1 hour

  // Main sentiment analysis method
  async analyzeBrandSentiment(brandName: string, posts: any[]): Promise<SentimentData> {
    try {
      // Combine all post content for analysis
      const content = posts.map(post => 
        `${post.description || ''} ${post.comments?.map((c: any) => c.text).join(' ') || ''}`
      ).join(' ');

      if (!content.trim()) {
        return this.generateNeutralSentiment();
      }

      // Perform sentiment analysis
      const sentiment = await this.performSentimentAnalysis(content);
      
      // Cache the result
      const cacheKey = brandName.toLowerCase();
      const cached = this.sentimentCache.get(cacheKey) || [];
      cached.push(sentiment);
      
      // Keep only last 24 hours of data
      const cutoff = Date.now() - 86400000;
      const filtered = cached.filter(s => new Date(s.timestamp).getTime() > cutoff);
      this.sentimentCache.set(cacheKey, filtered);

      return sentiment;
    } catch (error) {
      console.error('Sentiment analysis failed:', error);
      return this.generateNeutralSentiment();
    }
  }

  private async performSentimentAnalysis(content: string): Promise<SentimentData> {
    // Simulate AI-powered sentiment analysis
    const words = content.toLowerCase().split(/\s+/);
    
    // Sentiment dictionaries
    const positiveWords = [
      'amazing', 'excellent', 'beautiful', 'love', 'perfect', 'great', 'wonderful',
      'fantastic', 'outstanding', 'brilliant', 'stunning', 'gorgeous', 'elegant',
      'quality', 'trusted', 'reliable', 'recommended', 'satisfied', 'happy'
    ];
    
    const negativeWords = [
      'terrible', 'awful', 'bad', 'hate', 'worst', 'disappointed', 'poor',
      'cheap', 'fake', 'scam', 'fraud', 'overpriced', 'broken', 'defective',
      'unreliable', 'slow', 'rude', 'unprofessional', 'waste'
    ];

    const emotionWords = {
      joy: ['happy', 'excited', 'thrilled', 'delighted', 'ecstatic', 'joyful'],
      trust: ['trusted', 'reliable', 'confident', 'secure', 'guaranteed', 'authentic'],
      fear: ['scared', 'worried', 'concerned', 'anxious', 'nervous', 'afraid'],
      anger: ['angry', 'furious', 'mad', 'irritated', 'frustrated', 'annoyed'],
      sadness: ['sad', 'disappointed', 'depressed', 'upset', 'heartbroken', 'grief'],
      surprise: ['surprised', 'shocked', 'amazed', 'astonished', 'stunned', 'wow'],
      disgust: ['disgusting', 'revolting', 'gross', 'nasty', 'repulsive', 'sickening'],
      anticipation: ['excited', 'eager', 'hopeful', 'expecting', 'waiting', 'looking forward']
    };

    // Calculate sentiment score
    let sentimentScore = 0;
    let totalWords = 0;

    for (const word of words) {
      totalWords++;
      if (positiveWords.includes(word)) sentimentScore += 1;
      else if (negativeWords.includes(word)) sentimentScore -= 1;
    }

    // Calculate emotions
    const emotions: EmotionAnalysis = {
      joy: 0, trust: 0, fear: 0, anger: 0, sadness: 0, surprise: 0, disgust: 0, anticipation: 0
    };

    for (const [emotion, keywords] of Object.entries(emotionWords)) {
      emotions[emotion as keyof EmotionAnalysis] = keywords.filter(keyword => 
        words.includes(keyword)
      ).length / keywords.length * 100;
    }

    // Determine sentiment
    let sentiment: 'positive' | 'negative' | 'neutral';
    let confidence: number;

    if (sentimentScore > 0.1) {
      sentiment = 'positive';
      confidence = Math.min(90, 60 + Math.abs(sentimentScore) * 10);
    } else if (sentimentScore < -0.1) {
      sentiment = 'negative';
      confidence = Math.min(90, 60 + Math.abs(sentimentScore) * 10);
    } else {
      sentiment = 'neutral';
      confidence = 70;
    }

    // Extract keywords
    const keywords = [...new Set(words.filter(word => 
      word.length > 4 && !['this', 'that', 'with', 'from', 'they', 'have', 'been', 'were'].includes(word)
    ).slice(0, 10))];

    return {
      sentiment,
      confidence,
      emotions,
      keywords,
      timestamp: new Date().toISOString(),
    };
  }

  // Generate comprehensive brand sentiment report
  async generateBrandSentimentReport(brandName: string, competitors: string[]): Promise<BrandSentimentReport> {
    const cacheKey = brandName.toLowerCase();
    const sentimentHistory = this.sentimentCache.get(cacheKey) || [];
    
    if (sentimentHistory.length === 0) {
      return this.generateDefaultSentimentReport(brandName);
    }

    // Calculate overall sentiment
    const recentSentiments = sentimentHistory.slice(-10); // Last 10 analyses
    const avgSentimentScore = recentSentiments.reduce((sum, s) => {
      const score = s.sentiment === 'positive' ? 1 : s.sentiment === 'negative' ? -1 : 0;
      return sum + score * s.confidence / 100;
    }, 0) / recentSentiments.length;

    const overallSentiment = avgSentimentScore > 0.2 ? 'positive' : 
                           avgSentimentScore < -0.2 ? 'negative' : 'neutral';

    const sentimentScore = Math.round(avgSentimentScore * 100);

    // Calculate trend
    const trend = this.calculateSentimentTrend(sentimentHistory);

    // Generate insights
    const keyInsights = this.generateSentimentInsights(sentimentHistory, overallSentiment);

    // Competitor comparison
    const competitorComparison = await this.compareWithCompetitors(brandName, competitors);

    return {
      brand: brandName,
      overallSentiment,
      sentimentScore,
      confidence: Math.round(recentSentiments.reduce((sum, s) => sum + s.confidence, 0) / recentSentiments.length),
      trend,
      keyInsights,
      sentimentHistory,
      competitorComparison,
    };
  }

  private calculateSentimentTrend(history: SentimentData[]): 'improving' | 'declining' | 'stable' {
    if (history.length < 3) return 'stable';

    const recent = history.slice(-3);
    const older = history.slice(-6, -3);

    if (recent.length === 0 || older.length === 0) return 'stable';

    const recentAvg = recent.reduce((sum, s) => {
      const score = s.sentiment === 'positive' ? 1 : s.sentiment === 'negative' ? -1 : 0;
      return sum + score * s.confidence / 100;
    }, 0) / recent.length;

    const olderAvg = older.reduce((sum, s) => {
      const score = s.sentiment === 'positive' ? 1 : s.sentiment === 'negative' ? -1 : 0;
      return sum + score * s.confidence / 100;
    }, 0) / older.length;

    const change = recentAvg - olderAvg;

    if (change > 0.1) return 'improving';
    if (change < -0.1) return 'declining';
    return 'stable';
  }

  private generateSentimentInsights(history: SentimentData[], overallSentiment: string): string[] {
    const insights: string[] = [];

    if (overallSentiment === 'positive') {
      insights.push('Brand sentiment is predominantly positive, indicating strong customer satisfaction');
      insights.push('High trust and joy emotions suggest strong brand loyalty');
    } else if (overallSentiment === 'negative') {
      insights.push('Brand sentiment shows negative trends, requiring immediate attention');
      insights.push('Customer satisfaction issues may be impacting brand reputation');
    } else {
      insights.push('Brand sentiment is neutral, indicating stable but not exceptional customer perception');
      insights.push('Opportunity exists to improve customer experience and sentiment');
    }

    // Add trend-specific insights
    const trend = this.calculateSentimentTrend(history);
    if (trend === 'improving') {
      insights.push('Sentiment is improving over time, suggesting effective brand management');
    } else if (trend === 'declining') {
      insights.push('Sentiment is declining, indicating potential brand reputation risks');
    }

    return insights;
  }

  private async compareWithCompetitors(brandName: string, competitors: string[]): Promise<CompetitorSentimentComparison[]> {
    const comparisons: CompetitorSentimentComparison[] = [];

    for (const competitor of competitors) {
      const competitorHistory = this.sentimentCache.get(competitor.toLowerCase()) || [];
      let sentimentScore = 0;

      if (competitorHistory.length > 0) {
        const recent = competitorHistory.slice(-5);
        sentimentScore = Math.round(recent.reduce((sum, s) => {
          const score = s.sentiment === 'positive' ? 1 : s.sentiment === 'negative' ? -1 : 0;
          return sum + score * s.confidence / 100;
        }, 0) / recent.length * 100);
      }

      let marketPosition: 'leader' | 'challenger' | 'follower' = 'follower';
      if (sentimentScore > 50) marketPosition = 'leader';
      else if (sentimentScore > 20) marketPosition = 'challenger';

      comparisons.push({
        competitor,
        sentimentScore,
        marketPosition,
      });
    }

    return comparisons.sort((a, b) => b.sentimentScore - a.sentimentScore);
  }

  private generateNeutralSentiment(): SentimentData {
    return {
      sentiment: 'neutral',
      confidence: 50,
      emotions: {
        joy: 20, trust: 30, fear: 10, anger: 5, sadness: 10, 
        surprise: 15, disgust: 5, anticipation: 5
      },
      keywords: [],
      timestamp: new Date().toISOString(),
    };
  }

  private generateDefaultSentimentReport(brandName: string): BrandSentimentReport {
    return {
      brand: brandName,
      overallSentiment: 'neutral',
      sentimentScore: 0,
      confidence: 50,
      trend: 'stable',
      keyInsights: ['Insufficient data for sentiment analysis', 'More social media data needed for accurate assessment'],
      sentimentHistory: [],
      competitorComparison: [],
    };
  }

  // Real-time sentiment monitoring
  startSentimentMonitoring(brandName: string, intervalMs: number = 3600000): void {
    setInterval(async () => {
      try {
        // In a real implementation, this would fetch new social media posts
        // and analyze sentiment in real-time
        console.log(`Monitoring sentiment for ${brandName}`);
      } catch (error) {
        console.error('Sentiment monitoring error:', error);
      }
    }, intervalMs);
  }

  // Get sentiment statistics
  getSentimentStats(brandName: string): {
    totalAnalyses: number;
    positivePercentage: number;
    negativePercentage: number;
    neutralPercentage: number;
    averageConfidence: number;
  } {
    const history = this.sentimentCache.get(brandName.toLowerCase()) || [];
    
    if (history.length === 0) {
      return {
        totalAnalyses: 0,
        positivePercentage: 0,
        negativePercentage: 0,
        neutralPercentage: 0,
        averageConfidence: 0,
      };
    }

    const positive = history.filter(s => s.sentiment === 'positive').length;
    const negative = history.filter(s => s.sentiment === 'negative').length;
    const neutral = history.filter(s => s.sentiment === 'neutral').length;
    
    const averageConfidence = history.reduce((sum, s) => sum + s.confidence, 0) / history.length;

    return {
      totalAnalyses: history.length,
      positivePercentage: Math.round((positive / history.length) * 100),
      negativePercentage: Math.round((negative / history.length) * 100),
      neutralPercentage: Math.round((neutral / history.length) * 100),
      averageConfidence: Math.round(averageConfidence),
    };
  }
}

// Export singleton instance
export const sentimentAnalyzer = new SentimentAnalyzer();