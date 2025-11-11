import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import csv from 'csv-parser';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CSV_PATH = '/Users/rashpinderkaur/Desktop/marketpulse_backup_20241109/backend/knowledge/jewellery_knowledge_base.csv';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.argv[2] || 'https://chzpetqsqhunditgohzx.supabase.co';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || process.argv[3] || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNoenBldHFzcWh1bmRpdGdvaHp4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI2NzY3NTUsImV4cCI6MjA3ODI1Mjc1NX0.us0LR7XcWj2U9bSyPlb3Aeo2vyGuk-SDnSREBMXbFbg';

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Missing Supabase credentials!');
  console.log('Usage: node import-metrics-to-supabase.js <SUPABASE_URL> <SUPABASE_ANON_KEY>');
  console.log('Or set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function importMetrics() {
  console.log(`🚀 Starting metrics import from ${CSV_PATH}`);
  
  // First, get all competitors to map names to IDs
  console.log('📊 Fetching existing competitors...');
  const { data: competitors, error: compError } = await supabase
    .from('competitors')
    .select('id, competitor_name');
  
  if (compError) {
    console.error('❌ Error fetching competitors:', compError);
    return;
  }

  console.log(`✅ Found ${competitors.length} competitors in database`);

  // Create a map of competitor_name -> id
  const competitorMap = new Map();
  competitors.forEach(comp => {
    competitorMap.set(comp.competitor_name, comp.id);
  });

  let importedCount = 0;
  let skippedCount = 0;
  let errorCount = 0;
  const metricsToInsert = [];

  console.log('📖 Reading CSV file...');

  fs.createReadStream(CSV_PATH)
    .pipe(csv())
    .on('data', async (row) => {
      const competitorName = row.competitor_name;
      const competitorId = competitorMap.get(competitorName);

      if (!competitorId) {
        skippedCount++;
        if (skippedCount <= 5) {
          console.log(`⚠️  Competitor not found in DB: ${competitorName}`);
        }
        return;
      }

      // Only import if we have rating or review data
      const ratingAvg = row.rating_avg ? parseFloat(row.rating_avg) : null;
      const reviewCount = row.review_count ? parseInt(row.review_count) : null;
      const marketPresenceLabel = row.market_presence_label || null;

      if (ratingAvg || reviewCount || marketPresenceLabel) {
        const snapshotDate = row.snapshot_date 
          ? new Date(row.snapshot_date).toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0];

        metricsToInsert.push({
          competitor_id: competitorId,
          snapshot_date: snapshotDate,
          rating_avg: ratingAvg,
          review_count: reviewCount,
          market_presence_label: marketPresenceLabel,
          timeframe_window: 'last_90_days',
        });

        importedCount++;
      }
    })
    .on('end', async () => {
      console.log(`\n📊 CSV parsing complete!`);
      console.log(`   Total rows to import: ${metricsToInsert.length}`);
      console.log(`   Skipped (not found): ${skippedCount}`);

      if (metricsToInsert.length === 0) {
        console.log('❌ No metrics to import!');
        return;
      }

      // Insert in batches of 100
      console.log('\n💾 Inserting metrics into database...');
      const batchSize = 100;
      let successCount = 0;

      for (let i = 0; i < metricsToInsert.length; i += batchSize) {
        const batch = metricsToInsert.slice(i, i + batchSize);
        
        const { data, error } = await supabase
          .from('competitor_metrics_daily')
          .upsert(batch, {
            onConflict: 'competitor_id,snapshot_date,timeframe_window',
            ignoreDuplicates: false
          });

        if (error) {
          console.error(`❌ Error inserting batch ${i / batchSize + 1}:`, error.message);
          errorCount += batch.length;
        } else {
          successCount += batch.length;
          process.stdout.write(`\r   Progress: ${successCount}/${metricsToInsert.length} metrics inserted...`);
        }
      }

      console.log(`\n\n✅ Metrics import complete!`);
      console.log(`   Successfully imported: ${successCount}`);
      console.log(`   Errors: ${errorCount}`);
      console.log(`   Total competitors with metrics: ${successCount}`);
    })
    .on('error', (error) => {
      console.error('❌ Error reading CSV file:', error);
    });
}

importMetrics();



