#!/usr/bin/env node

/**
 * Simple script to test Supabase connection and add sample data
 */

// Load environment variables
require('dotenv').config();

const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Missing Supabase configuration. Please check your .env file.');
  console.log('SUPABASE_URL:', SUPABASE_URL ? 'Set' : 'Missing');
  console.log('SUPABASE_ANON_KEY:', SUPABASE_ANON_KEY ? 'Set' : 'Missing');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Sample trek data for testing
const sampleTreks = [
  {
    id: 1,
    name: 'Raigad Fort',
    category: 'fort',
    location: 'Raigad District',
    difficulty: 'Moderate',
    duration: '5-6 hours',
    elevation: '820 meters',
    description: 'Historic fort and capital of Maratha Empire under Chhatrapati Shivaji Maharaj.',
    starting_point_name: 'Raigad Peth',
    starting_point_latitude: 18.2311,
    starting_point_longitude: 73.4143,
    starting_point_facilities: ['Parking', 'Restaurants', 'Ropeway'],
    starting_point_description: 'Base village with facilities',
    latitude: 18.2311,
    longitude: 73.4143,
    featured: true,
    rating: 4.8,
    review_count: 450,
    images: [
      'https://res.cloudinary.com/dworlkdn8/image/upload/v1573202739/trekapp/trek%20images/raigad_dae0q5.jpg'
    ],
    best_time_to_visit: 'November to February'
  },
  {
    id: 2,
    name: 'Sinhagad Fort',
    category: 'fort',
    location: 'Pune District',
    difficulty: 'Easy',
    duration: '3-4 hours',
    elevation: '1312 meters',
    description: 'Popular fort near Pune known for its historical significance and scenic beauty.',
    starting_point_name: 'Sinhagad Base',
    starting_point_latitude: 18.3664,
    starting_point_longitude: 73.7556,
    starting_point_facilities: ['Parking', 'Food stalls', 'Restrooms'],
    starting_point_description: 'Well-developed base with facilities',
    latitude: 18.3664,
    longitude: 73.7556,
    featured: true,
    rating: 4.5,
    review_count: 320,
    images: [
      'https://res.cloudinary.com/dworlkdn8/image/upload/v1573202739/trekapp/trek%20images/sinhagad_example.jpg'
    ],
    best_time_to_visit: 'October to March'
  },
  {
    id: 3,
    name: 'Bhimashankar Waterfall',
    category: 'waterfall',
    location: 'Pune District',
    difficulty: 'Easy',
    duration: '2-3 hours',
    elevation: '1033 meters',
    description: 'Beautiful waterfall near the famous Bhimashankar temple.',
    starting_point_name: 'Bhimashankar Temple',
    starting_point_latitude: 19.0728,
    starting_point_longitude: 73.5347,
    starting_point_facilities: ['Temple facilities', 'Parking', 'Food'],
    starting_point_description: 'Temple complex with facilities',
    latitude: 19.0728,
    longitude: 73.5347,
    featured: false,
    rating: 4.2,
    review_count: 180,
    images: [
      'https://res.cloudinary.com/dworlkdn8/image/upload/v1573202739/trekapp/trek%20images/bhimashankar_waterfall.jpg'
    ],
    best_time_to_visit: 'June to September'
  }
];

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

async function insertSampleData() {
  console.log('📤 Inserting sample data...');
  
  try {
    // Clear existing data first
    const { error: deleteError } = await supabase
      .from('treks')
      .delete()
      .neq('id', 0);
    
    if (deleteError) {
      console.warn('⚠️ Could not clear existing data:', deleteError.message);
    } else {
      console.log('🗑️ Cleared existing data');
    }
    
    // Insert sample data
    const { data, error } = await supabase
      .from('treks')
      .insert(sampleTreks);
    
    if (error) {
      console.error('❌ Insert failed:', error.message);
      return false;
    }
    
    console.log(`✅ Inserted ${sampleTreks.length} sample treks`);
    return true;
  } catch (error) {
    console.error('❌ Insert error:', error.message);
    return false;
  }
}

async function validateData() {
  console.log('🔍 Validating data...');
  
  try {
    // Test different queries
    const { data: allTreks, error: allError } = await supabase
      .from('treks')
      .select('*');
    
    if (allError) {
      console.error('❌ Query failed:', allError.message);
      return false;
    }
    
    console.log(`✅ Total treks: ${allTreks.length}`);
    
    // Test category query
    const { data: forts, error: fortsError } = await supabase
      .from('treks')
      .select('*')
      .eq('category', 'fort');
    
    if (fortsError) {
      console.error('❌ Category query failed:', fortsError.message);
    } else {
      console.log(`✅ Forts: ${forts.length}`);
    }
    
    // Test featured query
    const { data: featured, error: featuredError } = await supabase
      .from('treks')
      .select('*')
      .eq('featured', true);
    
    if (featuredError) {
      console.error('❌ Featured query failed:', featuredError.message);
    } else {
      console.log(`✅ Featured treks: ${featured.length}`);
    }
    
    return true;
  } catch (error) {
    console.error('❌ Validation error:', error.message);
    return false;
  }
}

async function main() {
  console.log('🚀 Starting Supabase test...\n');
  
  // Test connection
  const connected = await testConnection();
  if (!connected) {
    console.log('\n❌ Cannot proceed without connection');
    process.exit(1);
  }
  
  console.log('');
  
  // Insert sample data
  const inserted = await insertSampleData();
  if (!inserted) {
    console.log('\n❌ Failed to insert sample data');
    process.exit(1);
  }
  
  console.log('');
  
  // Validate data
  const validated = await validateData();
  if (!validated) {
    console.log('\n❌ Data validation failed');
    process.exit(1);
  }
  
  console.log('\n🎉 Supabase test completed successfully!');
  console.log('\n📱 Now test in your app:');
  console.log('1. Open your app');
  console.log('2. Navigate to Trek Planner screen');
  console.log('3. Click "Run Test" in the test component');
}

if (require.main === module) {
  main();
}

module.exports = { testConnection, insertSampleData, validateData };
