#!/usr/bin/env node

/**
 * Complete Data Migration Script for Supabase
 * 
 * This script migrates ALL JSON data from the data folder to Supabase database.
 * It handles all categories: forts, treks, waterfalls, caves
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
  console.log(`📂 Reading ${category} files from: ${directory}`);
  
  if (!fs.existsSync(directory)) {
    console.warn(`⚠️ Directory not found: ${directory}`);
    return [];
  }

  const files = fs.readdirSync(directory).filter(file => file.endsWith('.json'));
  const data = [];
  
  console.log(`Found ${files.length} JSON files in ${category}`);
  
  for (const file of files) {
    try {
      const filePath = path.join(directory, file);
      const content = fs.readFileSync(filePath, 'utf8');
      const jsonData = JSON.parse(content);
      
      // Ensure category is set correctly
      jsonData.category = category === 'waterfalls' ? 'waterfall' : category.slice(0, -1);
      
      data.push(jsonData);
      console.log(`  ✅ Loaded ${file} (ID: ${jsonData.id}, Name: ${jsonData.name})`);
    } catch (error) {
      console.error(`  ❌ Error loading ${file}:`, error.message);
    }
  }
  
  return data;
}

/**
 * Transform JSON data to match database schema
 */
function transformDataForDatabase(item) {
  // Handle missing coordinates
  const lat = item.coordinates?.latitude || item.startingPoint?.coordinates?.latitude || 0;
  const lng = item.coordinates?.longitude || item.startingPoint?.coordinates?.longitude || 0;
  
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
    starting_point_name: item.startingPoint?.name || item.name + ' Base',
    starting_point_latitude: item.startingPoint?.coordinates?.latitude || lat,
    starting_point_longitude: item.startingPoint?.coordinates?.longitude || lng,
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
    safety: item.safety || null,
    
    // Other fields
    best_time_to_visit: item.bestTimeToVisit || '',
    image_key: item.imageKey || '',
    images: item.images || [],
    videos: item.videos || [],
    
    // Coordinates
    latitude: lat,
    longitude: lng,
    
    // App-specific fields
    featured: item.featured || false,
    rating: item.rating || 0.0,
    review_count: item.reviewCount || 0,
  };
}

/**
 * Test connection to Supabase
 */
async function testConnection() {
  console.log('🔗 Testing Supabase connection...');
  
  try {
    const { data, error } = await supabase
      .from('treks')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('❌ Connection failed:', error.message);
      return false;
    }
    
    console.log('✅ Connection successful!');
    return true;
  } catch (error) {
    console.error('❌ Connection error:', error.message);
    return false;
  }
}

/**
 * Clear existing data
 */
async function clearExistingData() {
  console.log('🗑️ Clearing existing data...');
  
  try {
    const { error } = await supabase
      .from('treks')
      .delete()
      .neq('id', 0); // Delete all records
    
    if (error) {
      console.warn('⚠️ Warning: Could not clear existing data:', error.message);
      return false;
    }
    
    console.log('✅ Existing data cleared');
    return true;
  } catch (error) {
    console.error('❌ Error clearing data:', error.message);
    return false;
  }
}

/**
 * Insert data into Supabase in batches
 */
async function insertDataToSupabase(data, batchSize = 10) {
  console.log(`📤 Inserting ${data.length} records to Supabase...`);
  
  let successCount = 0;
  let errorCount = 0;
  
  // Process in smaller batches to avoid timeout
  for (let i = 0; i < data.length; i += batchSize) {
    const batch = data.slice(i, i + batchSize);
    const batchNum = Math.floor(i / batchSize) + 1;
    const totalBatches = Math.ceil(data.length / batchSize);
    
    console.log(`\n📦 Processing batch ${batchNum}/${totalBatches} (${batch.length} items):`);
    
    try {
      const { data: result, error } = await supabase
        .from('treks')
        .insert(batch);
      
      if (error) {
        console.error(`❌ Batch ${batchNum} failed:`, error.message);
        
        // Try inserting records one by one to identify problematic records
        for (const record of batch) {
          try {
            const { error: singleError } = await supabase
              .from('treks')
              .insert([record]);
            
            if (singleError) {
              console.error(`  ❌ ${record.name} (ID: ${record.id}): ${singleError.message}`);
              errorCount++;
            } else {
              console.log(`  ✅ ${record.name} (ID: ${record.id})`);
              successCount++;
            }
          } catch (singleErr) {
            console.error(`  ❌ ${record.name} (ID: ${record.id}): ${singleErr.message}`);
            errorCount++;
          }
        }
      } else {
        // Batch succeeded
        for (const record of batch) {
          console.log(`  ✅ ${record.name} (ID: ${record.id})`);
          successCount++;
        }
      }
    } catch (error) {
      console.error(`❌ Batch ${batchNum} exception:`, error.message);
      errorCount += batch.length;
    }
    
    // Small delay between batches
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log(`\n📊 Migration Summary:`);
  console.log(`✅ Successfully inserted: ${successCount} records`);
  console.log(`❌ Failed to insert: ${errorCount} records`);
  console.log(`📈 Success rate: ${Math.round((successCount / data.length) * 100)}%`);
  
  return { successCount, errorCount };
}

/**
 * Validate migrated data
 */
async function validateMigration() {
  console.log('\n🔍 Validating migrated data...');
  
  try {
    // Get total count
    const { data: allData, error: allError } = await supabase
      .from('treks')
      .select('*');
    
    if (allError) {
      console.error('❌ Validation failed:', allError.message);
      return false;
    }
    
    console.log(`📊 Total records in database: ${allData.length}`);
    
    // Count by category
    const categories = ['fort', 'trek', 'waterfall', 'cave'];
    for (const category of categories) {
      const categoryData = allData.filter(item => item.category === category);
      console.log(`  ${category}s: ${categoryData.length}`);
    }
    
    // Count featured
    const featured = allData.filter(item => item.featured);
    console.log(`  Featured: ${featured.length}`);
    
    console.log('\n✅ Validation completed successfully!');
    return true;
    
  } catch (error) {
    console.error('❌ Validation error:', error.message);
    return false;
  }
}

/**
 * Main migration function
 */
async function migrate() {
  console.log('🚀 Starting complete data migration to Supabase...\n');
  
  try {
    // Test connection
    const connected = await testConnection();
    if (!connected) {
      console.log('\n❌ Cannot proceed without connection');
      process.exit(1);
    }
    
    // Clear existing data
    await clearExistingData();
    
    // Load and process data for each category
    const allData = [];
    let totalFiles = 0;
    
    for (const [category, directory] of Object.entries(DATA_DIRS)) {
      console.log(`\n📂 Processing ${category}...`);
      
      const categoryData = readJSONFiles(directory, category);
      const transformedData = categoryData.map(transformDataForDatabase);
      
      allData.push(...transformedData);
      totalFiles += categoryData.length;
      
      console.log(`✅ Processed ${transformedData.length} ${category} records`);
    }
    
    console.log(`\n📋 Migration Summary:`);
    console.log(`Total files found: ${totalFiles}`);
    console.log(`Total records to migrate: ${allData.length}`);
    
    // Insert all data
    if (allData.length > 0) {
      const { successCount, errorCount } = await insertDataToSupabase(allData);
      
      if (successCount > 0) {
        // Validate migration
        await validateMigration();
        console.log(`\n🎉 Migration completed! Successfully migrated ${successCount}/${allData.length} records.`);
      } else {
        console.log('\n❌ Migration failed - no records were inserted.');
      }
    } else {
      console.log('\n⚠️ No data found to migrate.');
    }
    
  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    process.exit(1);
  }
}

// Run migration if this script is executed directly
if (require.main === module) {
  migrate();
}

module.exports = { migrate };
