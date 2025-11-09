# MarketPulse Edge Functions - Quick Reference

## 📦 All Edge Functions Created

### 1. marketpulse-dashboard
**Purpose**: Main dashboard data (local/regional/national competitors)  
**Endpoint**: `GET /functions/v1/marketpulse-dashboard?business_id={id}`  
**Returns**: Dashboard data with competitors, gold rates, trends, owner insights

### 2. marketpulse-analytics  
**Purpose**: Detailed competitor analytics  
**Endpoint**: `GET /functions/v1/marketpulse-analytics?business_id={id}&level={local|regional|national}`  
**Returns**: Enriched competitor data with category matching and social scores

### 3. marketpulse-national-intel
**Purpose**: National competitor intelligence  
**Endpoint**: `GET /functions/v1/marketpulse-national-intel?business_id={id}`  
**Returns**: Market share, expansion trends, threat matrix, market gaps, sentiment insights

### 4. marketpulse-trends
**Purpose**: Emerging trends detection  
**Endpoint**: `GET /functions/v1/marketpulse-trends?state={optional}`  
**Returns**: Categorized trends (geographic, category, material, regional, market structure, emerging players)

## 🚀 Deployment Commands

```bash
# Navigate to project
cd read-it-simply

# Apply database migration
supabase migration up

# Deploy all Edge Functions
supabase functions deploy marketpulse-dashboard
supabase functions deploy marketpulse-analytics  
supabase functions deploy marketpulse-national-intel
supabase functions deploy marketpulse-trends

# Or deploy all at once (if supported)
supabase functions deploy
```

## 🔧 Environment Setup

Edge Functions automatically use:
- `SUPABASE_URL` - From Supabase project settings
- `SUPABASE_ANON_KEY` - From Supabase project settings

No additional environment variables needed!

## 📝 Frontend Usage

```typescript
import { competitorDataService } from "@/services/competitorDataService";

// Get dashboard data (automatically calls marketpulse-dashboard)
const competitors = await competitorDataService.getCompetitorsByScope('local');

// Get analytics (automatically calls marketpulse-analytics)
const analytics = await competitorDataService.getCompetitorsByScope('local');

// Get national intelligence
const intelligence = await competitorDataService.getNationalIntelligence(businessId);

// Get emerging trends
const trends = await competitorDataService.getEmergingTrends(state);
```

## ✅ Integration Complete!

All Edge Functions are ready for deployment. The frontend service has been updated to use them automatically.

