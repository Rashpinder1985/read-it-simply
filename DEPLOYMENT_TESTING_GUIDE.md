# MarketPulse Integration - Deployment & Testing Guide

## 🚀 Pre-Deployment Checklist

### 1. Database Setup
- [ ] Supabase project created
- [ ] Database migration file ready (`supabase/migrations/20251109135008_marketpulse_schema.sql`)
- [ ] Environment variables configured

### 2. Edge Functions Ready
- [x] `marketpulse-dashboard` - Dashboard data endpoint
- [x] `marketpulse-analytics` - Analytics endpoint
- [x] `marketpulse-national-intel` - National intelligence
- [x] `marketpulse-trends` - Emerging trends
- [x] `marketpulse-sync` - Data scraping/sync (Cheerio-based)

### 3. Frontend Integration
- [x] `competitorDataService.ts` updated to use Supabase
- [x] Components use `competitorDataService` (automatic compatibility)

## 📋 Step-by-Step Deployment

### Step 1: Apply Database Migration

```bash
cd read-it-simply

# Start Supabase locally (for testing)
supabase start

# Apply migration
supabase migration up

# Or if deploying to production:
supabase db push
```

**Expected Output:**
- Tables created: `businesses`, `competitors`, `competitor_locations`, `competitor_metrics_daily`, `gold_rates`, `trends_snapshot`
- RLS policies enabled
- Indexes created

### Step 2: Deploy Edge Functions

```bash
# Deploy all functions
supabase functions deploy marketpulse-dashboard
supabase functions deploy marketpulse-analytics
supabase functions deploy marketpulse-national-intel
supabase functions deploy marketpulse-trends
supabase functions deploy marketpulse-sync

# Or deploy all at once (if supported)
supabase functions deploy
```

**Expected Output:**
- Functions deployed successfully
- URLs available: `https://<project-ref>.supabase.co/functions/v1/<function-name>`

### Step 3: Configure Environment Variables

**Frontend (.env.local):**
```env
VITE_SUPABASE_URL=https://<project-ref>.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=<anon-key>
```

**Edge Functions** (automatically configured by Supabase):
- `SUPABASE_URL` - Auto-set
- `SUPABASE_ANON_KEY` - Auto-set

### Step 4: Import Initial Data (Optional)

If you have existing CSV data:

```sql
-- Example: Import competitors from CSV
-- Use Supabase dashboard or psql

COPY competitors (competitor_name, metal, use_category, region, business_type, ...)
FROM '/path/to/jewellery_knowledge_base.csv'
WITH (FORMAT csv, HEADER true);
```

Or use the sync function:
```bash
curl -X GET "https://<project-ref>.supabase.co/functions/v1/marketpulse-sync?city=Mumbai&state=Maharashtra&business_id=1" \
  -H "Authorization: Bearer <token>"
```

## 🧪 Testing Guide

### Test 1: Database Schema

```sql
-- Connect to Supabase database
-- Check tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('businesses', 'competitors', 'competitor_locations', 'competitor_metrics_daily');

-- Check RLS policies
SELECT tablename, policyname FROM pg_policies 
WHERE schemaname = 'public';
```

### Test 2: Edge Functions

#### Test Dashboard Endpoint
```bash
# Get auth token first (from frontend or Supabase dashboard)
TOKEN="<your-auth-token>"
BUSINESS_ID="<business-id>"

curl -X GET \
  "https://<project-ref>.supabase.co/functions/v1/marketpulse-dashboard?business_id=$BUSINESS_ID" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"
```

**Expected Response:**
```json
{
  "business": { "id": "...", "name": "...", "hq_city": "...", "hq_state": "..." },
  "goldRate": { "rate_24k": ..., "rate_22k": ... },
  "localCompetitors": [...],
  "regionalCompetitors": [...],
  "nationalCompetitors": [...],
  "trends": [...]
}
```

#### Test Analytics Endpoint
```bash
curl -X GET \
  "https://<project-ref>.supabase.co/functions/v1/marketpulse-analytics?business_id=$BUSINESS_ID&level=local" \
  -H "Authorization: Bearer $TOKEN"
```

#### Test National Intelligence
```bash
curl -X GET \
  "https://<project-ref>.supabase.co/functions/v1/marketpulse-national-intel?business_id=$BUSINESS_ID" \
  -H "Authorization: Bearer $TOKEN"
```

#### Test Trends
```bash
curl -X GET \
  "https://<project-ref>.supabase.co/functions/v1/marketpulse-trends?state=Maharashtra" \
  -H "Authorization: Bearer $TOKEN"
```

#### Test Sync (Scraping)
```bash
curl -X GET \
  "https://<project-ref>.supabase.co/functions/v1/marketpulse-sync?city=Mumbai&state=Maharashtra&business_id=$BUSINESS_ID" \
  -H "Authorization: Bearer $TOKEN"
```

### Test 3: Frontend Integration

1. **Start Development Server:**
   ```bash
   npm run dev
   ```

2. **Login to Application:**
   - Create/Login with user account
   - Ensure user has business_details entry

3. **Test MarketPulse Modal:**
   - Open MarketPulse modal
   - Switch between Local/Regional/National tabs
   - Verify competitors load
   - Check charts and statistics

4. **Check Browser Console:**
   - No errors related to Edge Functions
   - Network requests successful (200 status)
   - Data displays correctly

### Test 4: Component Testing

**MarketPulseModal.tsx:**
- ✅ Uses `competitorDataService.getCompetitorsByScope()`
- ✅ Automatically calls Edge Functions
- ✅ Should work without changes

**EnhancedMarketPulseModal.tsx:**
- ✅ Uses `competitorDataService` methods
- ✅ Should work automatically

## 🐛 Troubleshooting

### Issue: "Unauthorized" Error
**Solution:** 
- Check auth token is valid
- Ensure user is logged in
- Verify RLS policies allow access

### Issue: "Business not found"
**Solution:**
- Ensure `business_details` table has entry for user
- Check `user_id` matches authenticated user
- Verify business_id parameter is correct

### Issue: Empty Competitor Lists
**Solution:**
- Check database has competitor data
- Run sync function to populate data
- Verify city/state parameters match data

### Issue: Edge Function Timeout
**Solution:**
- Check function logs in Supabase dashboard
- Verify database queries are optimized
- Consider adding pagination

### Issue: Scraping Returns Empty Results
**Solution:**
- JustDial may have changed HTML structure
- Update selectors in `marketpulse-sync/index.ts`
- Consider using Puppeteer alternative (external service)

## 📊 Monitoring

### Supabase Dashboard
- Monitor Edge Function invocations
- Check error rates
- Review function logs

### Database Monitoring
- Check table sizes
- Monitor query performance
- Review RLS policy effectiveness

## 🔄 Data Sync Workflow

### Initial Setup:
1. User creates business profile
2. System syncs competitors for their city/state
3. Data stored in Supabase

### Regular Updates:
1. Scheduled sync (via cron or manual trigger)
2. Updates competitor metrics
3. Adds new competitors
4. Refreshes trends

### Manual Sync:
```typescript
// In frontend or admin panel
const response = await fetch(
  `${supabaseUrl}/functions/v1/marketpulse-sync?city=${city}&state=${state}&business_id=${businessId}`,
  {
    headers: { 'Authorization': `Bearer ${token}` }
  }
);
```

## ✅ Success Criteria

- [ ] All Edge Functions deploy successfully
- [ ] Database migration applies without errors
- [ ] Dashboard loads competitor data
- [ ] Analytics endpoint returns enriched data
- [ ] National intelligence endpoint works
- [ ] Trends endpoint returns categorized trends
- [ ] Frontend components display data correctly
- [ ] No console errors
- [ ] Authentication works properly
- [ ] RLS policies enforce data access

## 🎯 Post-Deployment

1. **Monitor Performance:**
   - Check Edge Function response times
   - Monitor database query performance
   - Review error logs

2. **User Testing:**
   - Get feedback from users
   - Fix any UI/UX issues
   - Optimize slow queries

3. **Data Quality:**
   - Verify competitor data accuracy
   - Update scraping selectors if needed
   - Enrich missing data fields

## 📝 Notes

- **Puppeteer Limitation:** The sync function uses Cheerio instead of Puppeteer (Deno limitation). For full JS rendering, consider:
  - External scraping service
  - Separate Node.js worker
  - Browser automation service (Playwright Cloud, etc.)

- **Rate Limiting:** JustDial may rate limit requests. Consider:
  - Adding delays between requests
  - Using proxy rotation
  - Caching results

- **Data Enrichment:** Competitors may have missing fields (metal, category, etc.). Consider:
  - Manual enrichment
  - AI-based categorization
  - User input

---

**Ready to deploy!** Follow the steps above and test thoroughly before going live. 🚀

