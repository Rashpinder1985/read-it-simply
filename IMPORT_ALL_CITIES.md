# 🗺️ Import ALL Cities from Knowledge Base

## Current Situation

**Database has only 3 cities:**
- Mumbai, Maharashtra
- Pune, Maharashtra  
- Nagpur, Maharashtra

**CSV has 596 competitors across many cities and states!**

The dropdown code is **correct and dynamic** - it loads ALL cities from the database. The issue is we only imported sample data.

## 📊 Original CSV Coverage

From `marketpulse_backup_20241109/backend/knowledge/jewellery_knowledge_base.csv`:

**States:** 36+ states across India
**Cities:** 100+ cities including:
- Mumbai, Delhi, Bangalore, Hyderabad, Chennai
- Kolkata, Pune, Ahmedabad, Jaipur, Lucknow
- Surat, Nagpur, Indore, Bhopal, Visakhapatnam
- And many more...

## 🚀 Solution: Import Full CSV Data

### Option 1: Use the CSV Import Script (Recommended)

Create a Node.js script to import all data:

```javascript
// import-csv-data.js
const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');
const Papa = require('papaparse');

const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseKey = 'YOUR_SUPABASE_SERVICE_ROLE_KEY';
const supabase = createClient(supabaseUrl, supabaseKey);

async function importCSV() {
  const csvFile = fs.readFileSync(
    '/Users/rashpinderkaur/Desktop/marketpulse_backup_20241109/backend/knowledge/jewellery_knowledge_base.csv',
    'utf8'
  );
  
  const parsed = Papa.parse(csvFile, { header: true });
  const rows = parsed.data;
  
  console.log(`Found ${rows.length} rows to import`);
  
  for (const row of rows) {
    if (!row.competitor_name) continue;
    
    // 1. Upsert competitor
    const { data: comp, error: compError } = await supabase
      .from('competitors')
      .upsert({
        competitor_name: row.competitor_name,
        metal: row.metal || null,
        use_category: row.use_category || null,
        region: row.region || null,
        business_type: row.business_type || null,
        price_positioning: row.price_positioning || null,
        website: row.website || null,
        instagram_handle: row.instagram_handle || null,
        facebook_account: row.facebook_account || null,
        national_chain: row.national_chain_presence === 'Yes'
      }, {
        onConflict: 'competitor_name'
      })
      .select()
      .single();
    
    if (compError) {
      console.error('Error inserting competitor:', compError);
      continue;
    }
    
    // 2. Insert location
    if (row.city && row.state) {
      await supabase
        .from('competitor_locations')
        .upsert({
          competitor_id: comp.id,
          city: row.city,
          state: row.state,
          locality: row.locality || null
        }, {
          onConflict: 'competitor_id,city,state'
        });
    }
    
    // 3. Insert metrics
    if (row.rating_avg && row.review_count) {
      await supabase
        .from('competitor_metrics_daily')
        .upsert({
          competitor_id: comp.id,
          snapshot_date: new Date().toISOString().split('T')[0],
          timeframe_window: 'last_90_days',
          rating_avg: parseFloat(row.rating_avg),
          review_count: parseInt(row.review_count),
          market_presence_label: row.market_presence_label || 'Low'
        }, {
          onConflict: 'competitor_id,snapshot_date,timeframe_window'
        });
    }
    
    console.log(`✅ Imported: ${row.competitor_name} in ${row.city}, ${row.state}`);
  }
  
  console.log('✅ Import complete!');
}

importCSV().catch(console.error);
```

Run it:
```bash
cd /Users/rashpinderkaur/Desktop/read-it-simply
node import-csv-data.js
```

### Option 2: SQL Bulk Import (Faster)

If you can copy the CSV to Supabase, use SQL COPY command via the Dashboard.

### Option 3: Use JustDial Sync Function

Run the `marketpulse-sync` Edge Function for multiple cities to scrape fresh data:

```javascript
// Call sync for each major city
const cities = ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata', 'Pune', 'Ahmedabad'];

for (const city of cities) {
  await fetch(`${SUPABASE_URL}/functions/v1/marketpulse-sync?city=${city}&state=...`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
}
```

## 🎯 Quick Fix: Add Major Cities Manually

For now, let's add the top 20 cities manually:

```sql
-- Add major Indian cities for jewellery business
INSERT INTO competitor_locations (competitor_id, city, state)
SELECT id, 'Delhi', 'Delhi' FROM competitors WHERE competitor_name = 'Tanishq'
UNION ALL
SELECT id, 'Bangalore', 'Karnataka' FROM competitors WHERE competitor_name = 'Tanishq'
UNION ALL
SELECT id, 'Hyderabad', 'Telangana' FROM competitors WHERE competitor_name = 'Tanishq'
UNION ALL
SELECT id, 'Chennai', 'TamilNadu' FROM competitors WHERE competitor_name = 'Tanishq'
UNION ALL
SELECT id, 'Kolkata', 'WestBengal' FROM competitors WHERE competitor_name = 'Tanishq'
-- Add more cities...
ON CONFLICT (competitor_id, city, state) DO NOTHING;
```

## ✅ After Import

The dropdown will automatically show ALL cities because the code dynamically loads from the database!

**No code changes needed** - the form will automatically populate with all available cities. 🎉





