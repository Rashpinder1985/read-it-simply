// Data Validation and Quality Assurance System
// Ensures data integrity and quality across the application

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  score: number; // 0-100 data quality score
}

export interface DataQualityMetrics {
  completeness: number;
  accuracy: number;
  consistency: number;
  validity: number;
  uniqueness: number;
  overall: number;
}

class DataValidator {
  // Validate competitor data
  validateCompetitorData(data: any): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    let score = 100;

    // Required fields validation
    if (!data.business_name || data.business_name.trim().length === 0) {
      errors.push('Business name is required');
      score -= 30;
    }

    if (!data.scope || !['national', 'regional_north', 'regional_south', 'regional_east', 'regional_west', 'international', 'online_d2c'].includes(data.scope)) {
      errors.push('Valid scope is required');
      score -= 20;
    }

    if (!data.category || data.category.trim().length === 0) {
      errors.push('Category is required');
      score -= 15;
    }

    // Data quality checks
    if (data.business_name && data.business_name.length < 2) {
      warnings.push('Business name seems too short');
      score -= 5;
    }

    if (data.business_name && data.business_name.length > 100) {
      warnings.push('Business name seems too long');
      score -= 5;
    }

    // URL validation
    if (data.instagram_url && !this.isValidUrl(data.instagram_url)) {
      warnings.push('Invalid Instagram URL format');
      score -= 5;
    }

    if (data.facebook_url && !this.isValidUrl(data.facebook_url)) {
      warnings.push('Invalid Facebook URL format');
      score -= 5;
    }

    if (data.youtube_url && !this.isValidUrl(data.youtube_url)) {
      warnings.push('Invalid YouTube URL format');
      score -= 5;
    }

    // Email validation for contact information
    if (data.contact_email && !this.isValidEmail(data.contact_email)) {
      warnings.push('Invalid email format');
      score -= 5;
    }

    // Phone number validation
    if (data.contact_phone && !this.isValidPhoneNumber(data.contact_phone)) {
      warnings.push('Invalid phone number format');
      score -= 5;
    }

    // Address validation
    if (data.hq_address && data.hq_address.length < 10) {
      warnings.push('HQ address seems incomplete');
      score -= 5;
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      score: Math.max(0, score),
    };
  }

  // Validate market data
  validateMarketData(data: any): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    let score = 100;

    // Required fields
    if (!data.brand_name || data.brand_name.trim().length === 0) {
      errors.push('Brand name is required');
      score -= 25;
    }

    // Price validation
    if (data.gold_price !== undefined && data.gold_price !== null) {
      if (typeof data.gold_price !== 'number' || data.gold_price < 1000 || data.gold_price > 15000) {
        errors.push('Gold price must be a valid number between 1000 and 15000');
        score -= 20;
      }
    }

    if (data.silver_price !== undefined && data.silver_price !== null) {
      if (typeof data.silver_price !== 'number' || data.silver_price < 10 || data.silver_price > 200) {
        errors.push('Silver price must be a valid number between 10 and 200');
        score -= 15;
      }
    }

    // Engagement metrics validation
    if (data.engagement_metrics) {
      const metrics = data.engagement_metrics;
      
      if (metrics.likes !== undefined && (typeof metrics.likes !== 'number' || metrics.likes < 0)) {
        warnings.push('Invalid likes count');
        score -= 3;
      }

      if (metrics.comments !== undefined && (typeof metrics.comments !== 'number' || metrics.comments < 0)) {
        warnings.push('Invalid comments count');
        score -= 3;
      }

      if (metrics.shares !== undefined && (typeof metrics.shares !== 'number' || metrics.shares < 0)) {
        warnings.push('Invalid shares count');
        score -= 3;
      }
    }

    // Social media activity validation
    if (data.social_media_activity) {
      const activity = data.social_media_activity;
      
      if (activity.posts_today !== undefined && (typeof activity.posts_today !== 'number' || activity.posts_today < 0)) {
        warnings.push('Invalid posts count');
        score -= 3;
      }

      if (activity.platform && !['Instagram', 'Facebook', 'YouTube', 'Twitter', 'LinkedIn'].includes(activity.platform)) {
        warnings.push('Invalid social media platform');
        score -= 3;
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      score: Math.max(0, score),
    };
  }

  // Validate persona data
  validatePersonaData(data: any): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    let score = 100;

    // Required fields
    if (!data.name || data.name.trim().length === 0) {
      errors.push('Persona name is required');
      score -= 25;
    }

    if (!data.segment || data.segment.trim().length === 0) {
      errors.push('Persona segment is required');
      score -= 20;
    }

    // Demographics validation
    if (data.demographics) {
      const demographics = data.demographics;
      
      if (demographics.age_range && !this.isValidAgeRange(demographics.age_range)) {
        warnings.push('Invalid age range format');
        score -= 5;
      }

      if (demographics.income && !this.isValidIncomeRange(demographics.income)) {
        warnings.push('Invalid income range format');
        score -= 5;
      }

      if (demographics.location && demographics.location.length < 3) {
        warnings.push('Location seems incomplete');
        score -= 5;
      }
    }

    // Psychographics validation
    if (data.psychographics) {
      const psychographics = data.psychographics;
      
      if (psychographics.values && !Array.isArray(psychographics.values)) {
        warnings.push('Values should be an array');
        score -= 5;
      }

      if (psychographics.lifestyle && psychographics.lifestyle.length < 5) {
        warnings.push('Lifestyle description seems incomplete');
        score -= 5;
      }
    }

    // Behaviors validation
    if (data.behaviors) {
      const behaviors = data.behaviors;
      
      if (behaviors.shopping && behaviors.shopping.length < 10) {
        warnings.push('Shopping behavior description seems incomplete');
        score -= 5;
      }

      if (behaviors.social_media && behaviors.social_media.length < 5) {
        warnings.push('Social media behavior description seems incomplete');
        score -= 5;
      }
    }

    // Pain points and goals validation
    if (data.pain_points && !Array.isArray(data.pain_points)) {
      warnings.push('Pain points should be an array');
      score -= 5;
    }

    if (data.goals && !Array.isArray(data.goals)) {
      warnings.push('Goals should be an array');
      score -= 5;
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      score: Math.max(0, score),
    };
  }

  // Validate content data
  validateContentData(data: any): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    let score = 100;

    // Required fields
    if (!data.title || data.title.trim().length === 0) {
      errors.push('Content title is required');
      score -= 25;
    }

    if (!data.content_text || data.content_text.trim().length === 0) {
      errors.push('Content text is required');
      score -= 30;
    }

    if (!data.type || !['post', 'reel'].includes(data.type)) {
      errors.push('Valid content type is required');
      score -= 20;
    }

    if (!data.status || !['draft', 'pending_approval', 'approved', 'rejected', 'scheduled', 'published'].includes(data.status)) {
      errors.push('Valid content status is required');
      score -= 15;
    }

    // Content quality checks
    if (data.title && data.title.length < 5) {
      warnings.push('Title seems too short');
      score -= 5;
    }

    if (data.title && data.title.length > 100) {
      warnings.push('Title seems too long');
      score -= 5;
    }

    if (data.content_text && data.content_text.length < 50) {
      warnings.push('Content text seems too short');
      score -= 10;
    }

    if (data.content_text && data.content_text.length > 2000) {
      warnings.push('Content text seems too long');
      score -= 5;
    }

    // Hashtags validation
    if (data.hashtags && Array.isArray(data.hashtags)) {
      data.hashtags.forEach((hashtag: string, index: number) => {
        if (!hashtag.startsWith('#')) {
          warnings.push(`Hashtag ${index + 1} should start with #`);
          score -= 2;
        }
        
        if (hashtag.length > 50) {
          warnings.push(`Hashtag ${index + 1} seems too long`);
          score -= 2;
        }
      });
    }

    // Media URL validation
    if (data.media_url && !this.isValidUrl(data.media_url)) {
      warnings.push('Invalid media URL format');
      score -= 5;
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      score: Math.max(0, score),
    };
  }

  // Calculate comprehensive data quality metrics
  calculateDataQuality(dataset: any[], validator: (data: any) => ValidationResult): DataQualityMetrics {
    if (dataset.length === 0) {
      return {
        completeness: 0,
        accuracy: 0,
        consistency: 0,
        validity: 0,
        uniqueness: 0,
        overall: 0,
      };
    }

    const results = dataset.map(data => validator(data));
    
    // Completeness: Percentage of required fields filled
    const completeness = results.reduce((sum, result) => sum + result.score, 0) / results.length;
    
    // Accuracy: Percentage of valid data
    const accuracy = results.filter(result => result.errors.length === 0).length / results.length * 100;
    
    // Consistency: Standard deviation of quality scores
    const scores = results.map(result => result.score);
    const avgScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    const variance = scores.reduce((sum, score) => sum + Math.pow(score - avgScore, 2), 0) / scores.length;
    const consistency = Math.max(0, 100 - Math.sqrt(variance));
    
    // Validity: Percentage of data passing validation
    const validity = results.filter(result => result.isValid).length / results.length * 100;
    
    // Uniqueness: Percentage of unique records
    const uniqueCount = new Set(dataset.map(data => JSON.stringify(data))).size;
    const uniqueness = (uniqueCount / dataset.length) * 100;
    
    // Overall score
    const overall = (completeness + accuracy + consistency + validity + uniqueness) / 5;

    return {
      completeness: Math.round(completeness),
      accuracy: Math.round(accuracy),
      consistency: Math.round(consistency),
      validity: Math.round(validity),
      uniqueness: Math.round(uniqueness),
      overall: Math.round(overall),
    };
  }

  // Utility validation methods
  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private isValidPhoneNumber(phone: string): boolean {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
  }

  private isValidAgeRange(ageRange: string): boolean {
    // Validates formats like "25-35", "18+", "45-55"
    const ageRegex = /^(\d+[-+]\d+|\d+\+)$/;
    return ageRegex.test(ageRange);
  }

  private isValidIncomeRange(income: string): boolean {
    // Validates formats like "₹5L-10L", "₹20L+", "$50K-$75K"
    const incomeRegex = /^[₹$]?[\d\.]+[LKMB]?[-+]?[\d\.]*[LKMB]?[KMB]?$/;
    return incomeRegex.test(income);
  }

  // Data cleaning and normalization
  cleanCompetitorData(data: any): any {
    const cleaned = { ...data };

    // Clean business name
    if (cleaned.business_name) {
      cleaned.business_name = cleaned.business_name.trim();
    }

    // Clean brand names
    if (cleaned.brand_names) {
      cleaned.brand_names = cleaned.brand_names.trim();
    }

    // Clean category
    if (cleaned.category) {
      cleaned.category = cleaned.category.trim();
    }

    // Clean URLs
    if (cleaned.instagram_url) {
      cleaned.instagram_url = this.normalizeUrl(cleaned.instagram_url);
    }

    if (cleaned.facebook_url) {
      cleaned.facebook_url = this.normalizeUrl(cleaned.facebook_url);
    }

    if (cleaned.youtube_url) {
      cleaned.youtube_url = this.normalizeUrl(cleaned.youtube_url);
    }

    // Clean handles
    if (cleaned.instagram_handle) {
      cleaned.instagram_handle = cleaned.instagram_handle.replace('@', '').trim();
    }

    if (cleaned.facebook_name) {
      cleaned.facebook_name = cleaned.facebook_name.trim();
    }

    if (cleaned.youtube_name) {
      cleaned.youtube_name = cleaned.youtube_name.trim();
    }

    // Clean address
    if (cleaned.hq_address) {
      cleaned.hq_address = cleaned.hq_address.trim();
    }

    // Clean owner name
    if (cleaned.owner_name) {
      cleaned.owner_name = cleaned.owner_name.trim();
    }

    return cleaned;
  }

  private normalizeUrl(url: string): string {
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return `https://${url}`;
    }
    return url;
  }

  // Data quality monitoring
  generateQualityReport(dataset: any[], datasetName: string): {
    dataset: string;
    totalRecords: number;
    quality: DataQualityMetrics;
    issues: {
      errors: number;
      warnings: number;
      criticalIssues: string[];
    };
    recommendations: string[];
  } {
    const results = dataset.map(data => this.validateCompetitorData(data));
    const quality = this.calculateDataQuality(dataset, this.validateCompetitorData);
    
    const totalErrors = results.reduce((sum, result) => sum + result.errors.length, 0);
    const totalWarnings = results.reduce((sum, result) => sum + result.warnings.length, 0);
    
    const criticalIssues = results
      .flatMap(result => result.errors)
      .filter((error, index, array) => array.indexOf(error) === index);

    const recommendations = this.generateRecommendations(quality, criticalIssues);

    return {
      dataset: datasetName,
      totalRecords: dataset.length,
      quality,
      issues: {
        errors: totalErrors,
        warnings: totalWarnings,
        criticalIssues,
      },
      recommendations,
    };
  }

  private generateRecommendations(quality: DataQualityMetrics, criticalIssues: string[]): string[] {
    const recommendations: string[] = [];

    if (quality.completeness < 80) {
      recommendations.push('Improve data completeness by filling missing required fields');
    }

    if (quality.accuracy < 90) {
      recommendations.push('Enhance data accuracy by validating and correcting invalid entries');
    }

    if (quality.consistency < 70) {
      recommendations.push('Standardize data formats and values for better consistency');
    }

    if (quality.validity < 85) {
      recommendations.push('Fix validation errors to improve data validity');
    }

    if (quality.uniqueness < 95) {
      recommendations.push('Remove or merge duplicate records to improve uniqueness');
    }

    if (criticalIssues.length > 0) {
      recommendations.push('Address critical data issues immediately to prevent system errors');
    }

    return recommendations;
  }
}

// Export singleton instance
export const dataValidator = new DataValidator();