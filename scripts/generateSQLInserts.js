#!/usr/bin/env node

/**
 * Generate SQL INSERT statements from JSON data files
 * This creates a SQL file that you can run directly in Supabase SQL Editor
 */

const fs = require('fs');
const path = require('path');

// Data directories
const DATA_DIRS = {
  forts: path.join(__dirname, '../src/data/forts'),
  treks: path.join(__dirname, '../src/data/treks'),
  waterfalls: path.join(__dirname, '../src/data/waterfall'),
  caves: path.join(__dirname, '../src/data/caves'),
};

/**
 * Escape SQL string values
 */
function escapeSQLString(str) {
  if (str === null || str === undefined) return 'NULL';
  return "'" + String(str).replace(/'/g, "''") + "'";
}

/**
 * Convert array to PostgreSQL array format
 */
function arrayToSQL(arr) {
  if (!arr || !Array.isArray(arr) || arr.length === 0) return 'NULL';
  const escapedItems = arr.map(item => escapeSQLString(item));
  return `ARRAY[${escapedItems.join(', ')}]`;
}

/**
 * Convert object to JSONB format
 */
function objectToJSONB(obj) {
  if (!obj || typeof obj !== 'object') return 'NULL';
  return escapeSQLString(JSON.stringify(obj)) + '::jsonb';
}

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
 * Generate SQL INSERT statement for a trek
 */
function generateInsertSQL(item) {
  // Handle missing coordinates
  const lat = item.coordinates?.latitude || item.startingPoint?.coordinates?.latitude || 0;
  const lng = item.coordinates?.longitude || item.startingPoint?.coordinates?.longitude || 0;
  
  const values = [
    item.id,
    escapeSQLString(item.name),
    escapeSQLString(item.category),
    escapeSQLString(item.location),
    escapeSQLString(item.difficulty),
    escapeSQLString(item.duration),
    escapeSQLString(item.elevation),
    escapeSQLString(item.description),
    
    // Starting point
    escapeSQLString(item.startingPoint?.name || item.name + ' Base'),
    item.startingPoint?.coordinates?.latitude || lat,
    item.startingPoint?.coordinates?.longitude || lng,
    arrayToSQL(item.startingPoint?.facilities),
    escapeSQLString(item.startingPoint?.description),
    
    // Coordinates
    lat,
    lng,
    
    // App-specific fields
    item.featured || false,
    item.rating || 0.0,
    item.reviewCount || 0,
    
    // Media
    arrayToSQL(item.images),
    arrayToSQL(item.videos),
    escapeSQLString(item.imageKey),
    
    // Other fields
    escapeSQLString(item.bestTimeToVisit),
    
    // Complex data as JSONB
    objectToJSONB(item.networkAvailability),
    objectToJSONB(item.foodAndWater),
    objectToJSONB(item.accommodation),
    objectToJSONB(item.permits),
    objectToJSONB(item.safety),
    objectToJSONB(item.weather),
    objectToJSONB(item.trekRoute),
    objectToJSONB(item.howToReach),
    objectToJSONB(item.localContacts),
  ];
  
  return `(${values.join(', ')})`;
}

/**
 * Generate complete SQL file
 */
function generateSQLFile() {
  console.log('🚀 Generating SQL INSERT statements...\n');
  
  let sqlContent = `-- Complete Data Migration SQL for Supabase
-- Generated from JSON files in data folder
-- Run this in your Supabase SQL Editor

-- Clear existing data (optional - uncomment if needed)
-- DELETE FROM treks;

-- Insert all trek data
INSERT INTO treks (
    id, name, category, location, difficulty, duration, elevation, description,
    starting_point_name, starting_point_latitude, starting_point_longitude,
    starting_point_facilities, starting_point_description,
    latitude, longitude, featured, rating, review_count,
    images, videos, image_key, best_time_to_visit,
    network_availability, food_and_water, accommodation, permits,
    safety, weather, trek_route, how_to_reach, local_contacts
) VALUES\n`;

  const allInserts = [];
  let totalRecords = 0;
  
  // Process each category
  for (const [category, directory] of Object.entries(DATA_DIRS)) {
    console.log(`\n📂 Processing ${category}...`);
    
    const categoryData = readJSONFiles(directory, category);
    
    for (const item of categoryData) {
      try {
        const insertSQL = generateInsertSQL(item);
        allInserts.push(insertSQL);
        totalRecords++;
      } catch (error) {
        console.error(`❌ Error generating SQL for ${item.name}:`, error.message);
      }
    }
    
    console.log(`✅ Generated SQL for ${categoryData.length} ${category} records`);
  }
  
  // Join all inserts
  sqlContent += allInserts.join(',\n');
  
  // Add conflict resolution
  sqlContent += `
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    category = EXCLUDED.category,
    location = EXCLUDED.location,
    difficulty = EXCLUDED.difficulty,
    duration = EXCLUDED.duration,
    elevation = EXCLUDED.elevation,
    description = EXCLUDED.description,
    starting_point_name = EXCLUDED.starting_point_name,
    starting_point_latitude = EXCLUDED.starting_point_latitude,
    starting_point_longitude = EXCLUDED.starting_point_longitude,
    starting_point_facilities = EXCLUDED.starting_point_facilities,
    starting_point_description = EXCLUDED.starting_point_description,
    latitude = EXCLUDED.latitude,
    longitude = EXCLUDED.longitude,
    featured = EXCLUDED.featured,
    rating = EXCLUDED.rating,
    review_count = EXCLUDED.review_count,
    images = EXCLUDED.images,
    videos = EXCLUDED.videos,
    image_key = EXCLUDED.image_key,
    best_time_to_visit = EXCLUDED.best_time_to_visit,
    network_availability = EXCLUDED.network_availability,
    food_and_water = EXCLUDED.food_and_water,
    accommodation = EXCLUDED.accommodation,
    permits = EXCLUDED.permits,
    safety = EXCLUDED.safety,
    weather = EXCLUDED.weather,
    trek_route = EXCLUDED.trek_route,
    how_to_reach = EXCLUDED.how_to_reach,
    local_contacts = EXCLUDED.local_contacts,
    updated_at = NOW();

-- Verify the data was inserted
SELECT 
    category,
    COUNT(*) as count,
    COUNT(CASE WHEN featured = true THEN 1 END) as featured_count
FROM treks 
GROUP BY category
ORDER BY category;

-- Show total count
SELECT COUNT(*) as total_treks FROM treks;

-- Show sample data
SELECT id, name, category, location, difficulty, featured, rating 
FROM treks 
ORDER BY category, name 
LIMIT 10;
`;

  // Write to file
  const outputPath = path.join(__dirname, '../database/complete_migration.sql');
  fs.writeFileSync(outputPath, sqlContent);
  
  console.log(`\n📄 SQL file generated: ${outputPath}`);
  console.log(`📊 Total records: ${totalRecords}`);
  console.log(`\n🎯 Next steps:`);
  console.log(`1. Open your Supabase Dashboard SQL Editor`);
  console.log(`2. Copy and paste the content from: database/complete_migration.sql`);
  console.log(`3. Click "Run" to execute the migration`);
  console.log(`4. Test in your app using the QuickSupabaseTest component`);
  
  return { totalRecords, outputPath };
}

// Run if this script is executed directly
if (require.main === module) {
  try {
    generateSQLFile();
  } catch (error) {
    console.error('❌ Error generating SQL:', error.message);
    process.exit(1);
  }
}

module.exports = { generateSQLFile };
