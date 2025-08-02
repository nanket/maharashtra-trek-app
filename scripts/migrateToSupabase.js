#!/usr/bin/env node

/**
 * Data Migration Script for Supabase
 * 
 * This script migrates all JSON data from the local files to Supabase database.
 * Run this script after setting up your Supabase project and database schema.
 * 
 * Usage: node scripts/migrateToSupabase.js
 */

const fs = require('fs');
const path = require('path');

// Load environment variables first
require('dotenv').config();

// Import Supabase client
const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Missing Supabase configuration. Please check your .env file.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Data directories
const DATA_DIRS = {
  forts: path.join(__dirname, '../src/data/forts'),
  treks: path.join(__dirname, '../src/data/treks'),
  waterfalls: path.join(__dirname, '../src/data/waterfall'),
  caves: path.join(__dirname, '../src/data/caves'),
};

/**
 * Read all JSON files from a directory
 */
function readJSONFiles(directory, category) {
  const files = fs.readdirSync(directory).filter(file => file.endsWith('.json'));
  const data = [];
  
  for (const file of files) {
    try {
      const filePath = path.join(directory, file);
      const content = fs.readFileSync(filePath, 'utf8');
      const jsonData = JSON.parse(content);
      
      // Ensure category is set correctly
      jsonData.category = category;
      data.push(jsonData);
      
      console.log(`✅ Loaded ${file}`);
    } catch (error) {
      console.error(`❌ Error loading ${file}:`, error.message);
    }
  }
  
  return data;
}

/**
 * Transform JSON data to match database schema
 */
function transformDataForDatabase(item) {
  return {
    id: item.id,
    name: item.name,
    category: item.category,
    location: item.location,
    difficulty: item.difficulty,
    duration: item.duration,
    elevation: item.elevation || null,
    description: item.description,
    
    // Starting point
    starting_point_name: item.startingPoint?.name || '',
    starting_point_latitude: item.startingPoint?.coordinates?.latitude || item.coordinates?.latitude,
    starting_point_longitude: item.startingPoint?.coordinates?.longitude || item.coordinates?.longitude,
    starting_point_facilities: item.startingPoint?.facilities || [],
    starting_point_description: item.startingPoint?.description || '',
    
    // Complex fields as JSONB
    network_availability: item.networkAvailability || null,
    food_and_water: item.foodAndWater || null,
    accommodation: item.accommodation || null,
    permits: item.permits || null,
    weather: item.weather || null,
    trek_route: item.trekRoute || null,
    how_to_reach: item.howToReach || null,
    local_contacts: item.localContacts || [],
    
    // Safety information
    safety_risk_level: item.safety?.riskLevel || 'Moderate',
    safety_common_risks: item.safety?.commonRisks || [],
    safety_precautions: item.safety?.precautions || [],
    safety_rescue_points: item.safety?.rescuePoints || [],
    safety_nearest_hospital: item.safety?.nearestHospital || null,
    safety_emergency_numbers: item.safety?.emergencyNumbers || null,
    
    // Other fields
    best_time_to_visit: item.bestTimeToVisit || '',
    image_key: item.imageKey || '',
    images: item.images || [],
    videos: item.videos || [],
    
    // Coordinates
    latitude: item.coordinates?.latitude || item.startingPoint?.coordinates?.latitude,
    longitude: item.coordinates?.longitude || item.startingPoint?.coordinates?.longitude,
    
    // App-specific fields
    featured: item.featured || false,
    rating: item.rating || 0.0,
    review_count: item.reviewCount || 0,
  };
}

/**
 * Insert data into Supabase
 */
async function insertDataToSupabase(data, batchSize = 50) {
  console.log(`📤 Inserting ${data.length} records to Supabase...`);
  
  // Process in batches to avoid timeout
  for (let i = 0; i < data.length; i += batchSize) {
    const batch = data.slice(i, i + batchSize);
    
    try {
      const { data: result, error } = await supabase
        .from('treks')
        .insert(batch);
      
      if (error) {
        console.error(`❌ Error inserting batch ${i / batchSize + 1}:`, error);
        
        // Try inserting records one by one to identify problematic records
        for (const record of batch) {
          try {
            const { error: singleError } = await supabase
              .from('treks')
              .insert([record]);
            
            if (singleError) {
              console.error(`❌ Error inserting record ${record.id} (${record.name}):`, singleError);
            } else {
              console.log(`✅ Inserted record ${record.id} (${record.name})`);
            }
          } catch (singleErr) {
            console.error(`❌ Exception inserting record ${record.id}:`, singleErr.message);
          }
        }
      } else {
        console.log(`✅ Inserted batch ${i / batchSize + 1} (${batch.length} records)`);
      }
    } catch (error) {
      console.error(`❌ Exception inserting batch ${i / batchSize + 1}:`, error.message);
    }
  }
}

/**
 * Main migration function
 */
async function migrate() {
  console.log('🚀 Starting data migration to Supabase...\n');
  
  try {
    // Test connection
    console.log('🔗 Testing Supabase connection...');
    const { data, error } = await supabase.from('treks').select('count').limit(1);
    
    if (error) {
      console.error('❌ Supabase connection failed:', error.message);
      return;
    }
    
    console.log('✅ Supabase connection successful\n');
    
    // Clear existing data (optional - comment out if you want to keep existing data)
    console.log('🗑️ Clearing existing data...');
    const { error: deleteError } = await supabase.from('treks').delete().neq('id', 0);
    if (deleteError) {
      console.warn('⚠️ Warning: Could not clear existing data:', deleteError.message);
    } else {
      console.log('✅ Existing data cleared\n');
    }
    
    // Load and migrate data for each category
    const allData = [];
    
    for (const [category, directory] of Object.entries(DATA_DIRS)) {
      console.log(`📂 Processing ${category} data...`);
      
      if (!fs.existsSync(directory)) {
        console.warn(`⚠️ Directory not found: ${directory}`);
        continue;
      }
      
      const categoryData = readJSONFiles(directory, category === 'waterfalls' ? 'waterfall' : category.slice(0, -1));
      const transformedData = categoryData.map(transformDataForDatabase);
      
      allData.push(...transformedData);
      console.log(`✅ Processed ${transformedData.length} ${category} records\n`);
    }
    
    // Insert all data
    if (allData.length > 0) {
      await insertDataToSupabase(allData);
      console.log(`\n🎉 Migration completed! Inserted ${allData.length} total records.`);
    } else {
      console.log('⚠️ No data found to migrate.');
    }
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

/**
 * Validate migrated data integrity
 */
async function validateMigration() {
  console.log('🔍 Validating migrated data...\n');

  try {
    // Get total count from database
    const { data: countData, error: countError } = await supabase
      .from('treks')
      .select('count');

    if (countError) {
      console.error('❌ Failed to get database count:', countError.message);
      return false;
    }

    const dbCount = countData.length;

    // Count local files
    let localCount = 0;
    for (const [category, directory] of Object.entries(DATA_DIRS)) {
      if (fs.existsSync(directory)) {
        const files = fs.readdirSync(directory).filter(file => file.endsWith('.json'));
        localCount += files.length;
      }
    }

    console.log(`📊 Local files: ${localCount}`);
    console.log(`📊 Database records: ${dbCount}`);

    if (dbCount === localCount) {
      console.log('✅ Data counts match!');
    } else {
      console.warn(`⚠️ Data count mismatch! Local: ${localCount}, DB: ${dbCount}`);
    }

    // Test sample queries
    console.log('\n🧪 Testing sample queries...');

    const { data: forts, error: fortsError } = await supabase
      .from('treks')
      .select('*')
      .eq('category', 'fort')
      .limit(5);

    if (fortsError) {
      console.error('❌ Fort query failed:', fortsError.message);
    } else {
      console.log(`✅ Fort query successful (${forts.length} results)`);
    }

    const { data: featured, error: featuredError } = await supabase
      .from('treks')
      .select('*')
      .eq('featured', true)
      .limit(5);

    if (featuredError) {
      console.error('❌ Featured query failed:', featuredError.message);
    } else {
      console.log(`✅ Featured query successful (${featured.length} results)`);
    }

    console.log('\n🎉 Validation completed!');
    return true;

  } catch (error) {
    console.error('❌ Validation failed:', error.message);
    return false;
  }
}

// Run migration if this script is executed directly
if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.includes('--validate')) {
    validateMigration();
  } else if (args.includes('--dry-run')) {
    console.log('🏃 Dry run mode - no data will be inserted');
    // TODO: Implement dry run logic
  } else {
    migrate().then(() => {
      console.log('\n🔍 Running validation...');
      return validateMigration();
    });
  }
}

module.exports = { migrate, transformDataForDatabase, validateMigration };
