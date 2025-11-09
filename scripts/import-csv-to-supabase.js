import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// CSV file path
const CSV_PATH = '/Users/rashpinderkaur/Desktop/marketpulse_backup_20241109/backend/knowledge/jewellery_knowledge_base.csv';

// Read Supabase credentials from .env or prompt
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.argv[2];
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || process.argv[3];

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Missing Supabase credentials!');
  console.log('Usage: node import-csv-to-supabase.js <SUPABASE_URL> <SUPABASE_ANON_KEY>');
  console.log('Or set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Parse CSV
function parseCSV(text) {
  const lines = text.split('\n').filter(line => line.trim());
  const headers = lines[0].split(',');
  
  return lines.slice(1).map(line => {
    const values = parseCSVLine(line);
    const obj = {};
    headers.forEach((header, i) => {
      obj[header.trim()] = values[i]?.trim() || null;
    });
    return obj;
  });
}

// Handle CSV lines with commas in quoted fields
function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}

async function importData() {
  try {
    console.log('📖 Reading CSV file...');
    const csvContent = fs.readFileSync(CSV_PATH, 'utf-8');
    const rows = parseCSV(csvContent);
    
    console.log(`✅ Found ${rows.length} competitors in CSV`);
    
    let importedCompetitors = 0;
    let importedLocations = 0;
    let errors = 0;
    
    console.log('🚀 Starting import...\n');
    
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      
      try {
        // Insert/update competitor (using ONLY columns that exist in schema)
        const { data: competitor, error: compError} = await supabase
          .from('competitors')
          .upsert({
            competitor_name: row.competitor_name,
            metal: row.metal || 'unknown',
            use_category: row.use_category || 'General',
            region: row.region || 'unknown',
            business_type: row.business_type || 'Showroom',
            price_positioning: row.price_positioning || 'unknown',
            national_chain: row.national_chain_presence === 'Yes',
            website: row.website || null,
            instagram_handle: row.instagram_handle || null,
            facebook_account: row.facebook_account || null
          }, {
            onConflict: 'competitor_name',
            ignoreDuplicates: false
          })
          .select()
          .single();
        
        if (compError) {
          console.error(`❌ Error importing competitor "${row.competitor_name}":`, compError.message);
          errors++;
          continue;
        }
        
        importedCompetitors++;
        
        // Insert location
        const { error: locError } = await supabase
          .from('competitor_locations')
          .insert({
            competitor_id: competitor.id,
            city: row.city || 'Unknown',
            state: row.state || 'Unknown',
            locality: row.locality || null,
            store_count: row.store_count ? parseInt(row.store_count) : 1,
            branch_count: row.branch_count ? parseInt(row.branch_count) : 0
          });
        
        if (locError && !locError.message.includes('duplicate')) {
          console.error(`⚠️ Error importing location for "${row.competitor_name}":`, locError.message);
        } else if (!locError) {
          importedLocations++;
        }
        
        // Progress indicator
        if ((i + 1) % 50 === 0) {
          console.log(`📊 Progress: ${i + 1}/${rows.length} rows processed`);
        }
        
      } catch (error) {
        console.error(`💥 Unexpected error on row ${i + 1}:`, error.message);
        errors++;
      }
    }
    
    console.log('\n✨ Import Complete!');
    console.log(`✅ Competitors imported: ${importedCompetitors}`);
    console.log(`✅ Locations imported: ${importedLocations}`);
    console.log(`❌ Errors: ${errors}`);
    
    // Show unique cities and states
    const { data: stats } = await supabase
      .from('competitor_locations')
      .select('city, state');
    
    if (stats) {
      const uniqueCities = [...new Set(stats.map(s => s.city))].length;
      const uniqueStates = [...new Set(stats.map(s => s.state))].length;
      console.log(`\n🌍 Database now has:`);
      console.log(`   📍 ${uniqueCities} unique cities`);
      console.log(`   🗺️  ${uniqueStates} unique states`);
    }
    
  } catch (error) {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  }
}

importData();

