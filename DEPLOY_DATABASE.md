# Deploy MarketPulse Database Migration

## Option 1: Via Supabase Dashboard (Recommended - No Docker Required)

### Steps:

1. **Open Supabase Dashboard**
   - Go to https://supabase.com/dashboard
   - Select your project: `tonqbucmhlzqzznjipoy`

2. **Navigate to SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Click "New query"

3. **Copy Migration SQL**
   - Open the file: `supabase/migrations/20251109135008_marketpulse_schema.sql`
   - Copy the entire contents

4. **Paste and Run**
   - Paste the SQL into the SQL Editor
   - Click "Run" or press Cmd+Enter (Mac) / Ctrl+Enter (Windows)
   - Wait for execution to complete

5. **Verify Tables Created**
   - Go to "Table Editor" in the left sidebar
   - You should see these new tables:
     - `competitors`
     - `competitor_locations`
     - `competitor_metrics_daily`
     - `businesses`
     - `gold_rates`
     - `trends_snapshot`

## Option 2: Via Supabase CLI (If Docker is Running)

### Prerequisites:
- Docker Desktop installed and running
- Supabase CLI installed
- Logged into Supabase CLI

### Steps:

```bash
# 1. Login to Supabase (if not already)
supabase login

# 2. Link project (if not already linked)
supabase link --project-ref tonqbucmhlzqzznjipoy

# 3. Push migration to remote database
supabase db push

# Or apply locally first (if Docker is running)
supabase start
supabase migration up
```

## Option 3: Direct SQL Execution via psql

If you have direct database access:

```bash
# Connect to your Supabase database
psql "postgresql://postgres:[PASSWORD]@db.tonqbucmhlzqzznjipoy.supabase.co:5432/postgres"

# Then run the migration file
\i supabase/migrations/20251109135008_marketpulse_schema.sql
```

## Verification

After applying the migration, verify by running this query in SQL Editor:

```sql
-- Check all tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
  'competitors',
  'competitor_locations', 
  'competitor_metrics_daily',
  'businesses',
  'gold_rates',
  'trends_snapshot'
)
ORDER BY table_name;

-- Check RLS policies
SELECT tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN (
  'competitors',
  'competitor_locations',
  'competitor_metrics_daily',
  'businesses'
)
ORDER BY tablename, policyname;
```

You should see:
- 6 tables created
- Multiple RLS policies enabled

## Next Steps

After database migration is complete:
1. Deploy Edge Functions (see `DEPLOYMENT_TESTING_GUIDE.md`)
2. Test endpoints
3. Import data (if needed)

---

**Recommended**: Use Option 1 (Supabase Dashboard) - it's the easiest and doesn't require Docker or CLI setup.

