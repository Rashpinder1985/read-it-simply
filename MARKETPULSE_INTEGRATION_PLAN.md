# MarketPulse Integration Plan - Supabase Deployment

## Deployment Strategy: Supabase-First Approach

### Why Supabase?
✅ **Single deployment unit** - Frontend + Backend (Supabase)  
✅ **Serverless & scalable** - Auto-scaling Edge Functions  
✅ **Cost-effective** - Pay per use, free tier available  
✅ **Already integrated** - read-it-simply uses Supabase  
✅ **Easy CI/CD** - Deploy via Supabase CLI or GitHub Actions  

### Architecture Overview

```
Frontend (React/Vite)
    ↓
Supabase Client SDK
    ↓
┌─────────────────────────────────────┐
│   Supabase Edge Functions (Deno)   │
├─────────────────────────────────────┤
│ • marketpulse-dashboard            │
│ • marketpulse-sync                  │
│ • marketpulse-analytics             │
│ • marketpulse-national-intel        │
│ • marketpulse-trends                │
│ • marketpulse-scraper (Puppeteer)  │
└─────────────────────────────────────┘
    ↓
┌─────────────────────────────────────┐
│   Supabase PostgreSQL Database      │
├─────────────────────────────────────┤
│ • competitors                       │
│ • competitor_locations              │
│ • competitor_metrics_daily          │
│ • businesses                        │
│ • gold_rates                        │
└─────────────────────────────────────┘
```

## Migration Steps

### Phase 1: Database Schema Migration
- [x] Create Supabase migration for MarketPulse tables
- [ ] Migrate existing CSV data to PostgreSQL
- [ ] Set up RLS policies

### Phase 2: Edge Functions Creation
- [ ] Create `marketpulse-dashboard` function
- [ ] Create `marketpulse-sync` function (JustDial scraping)
- [ ] Create `marketpulse-analytics` function
- [ ] Create `marketpulse-national-intel` function
- [ ] Create `marketpulse-trends` function
- [ ] Create `marketpulse-scraper` function (Puppeteer alternative)

### Phase 3: Frontend Integration
- [ ] Update `competitorDataService.ts` to use Supabase
- [ ] Replace `MarketPulseModal.tsx` with enhanced version
- [ ] Update `EnhancedMarketPulseModal.tsx` to use new endpoints
- [ ] Create new `MarketPulseDashboard.tsx` component

### Phase 4: Scraping Solution
**Challenge**: Puppeteer requires Node.js, Edge Functions use Deno

**Solutions**:
1. **Option A**: Use Deno-compatible scraping (Cheerio + fetch)
2. **Option B**: Separate scraping service (Railway/Render)
3. **Option C**: Use Supabase Edge Function with extended timeout (60s)

**Recommendation**: Option A + C hybrid
- Use Cheerio + fetch for basic scraping
- Fallback to external service for complex Puppeteer needs

## Implementation Priority

1. **High Priority** (Core Features):
   - Database schema migration
   - Dashboard API endpoint
   - Analytics endpoints
   - Frontend component updates

2. **Medium Priority** (Enhanced Features):
   - National intelligence
   - Trends detection
   - Scraping integration

3. **Low Priority** (Nice to Have):
   - Real-time updates
   - Advanced ML features
   - Social media scraping

## Files to Create/Update

### New Supabase Edge Functions:
- `supabase/functions/marketpulse-dashboard/index.ts`
- `supabase/functions/marketpulse-sync/index.ts`
- `supabase/functions/marketpulse-analytics/index.ts`
- `supabase/functions/marketpulse-national-intel/index.ts`
- `supabase/functions/marketpulse-trends/index.ts`
- `supabase/functions/marketpulse-scraper/index.ts`

### New Database Migrations:
- `supabase/migrations/YYYYMMDDHHMMSS_marketpulse_schema.sql`

### Updated Frontend Files:
- `src/services/competitorDataService.ts` (use Supabase)
- `src/components/MarketPulseModal.tsx` (enhanced)
- `src/components/EnhancedMarketPulseModal.tsx` (updated)
- `src/components/MarketPulseDashboard.tsx` (new)

## Deployment Checklist

- [ ] Database migrations applied
- [ ] Edge Functions deployed
- [ ] Environment variables configured
- [ ] Frontend updated and tested
- [ ] Scraping functionality verified
- [ ] Performance tested
- [ ] Documentation updated

