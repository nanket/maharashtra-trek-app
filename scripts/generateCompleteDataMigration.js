#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Read all data from individual JSON files
function loadAllData() {
    const srcDataDir = path.join(__dirname, '..', 'src', 'data');
    const allData = [];
    let idCounter = 1;

    // Categories and their directories
    const categories = [
        { name: 'fort', dir: 'forts' },
        { name: 'trek', dir: 'treks' },
        { name: 'waterfall', dir: 'waterfall' },
        { name: 'cave', dir: 'caves' }
    ];

    categories.forEach(category => {
        const categoryDir = path.join(srcDataDir, category.dir);

        if (!fs.existsSync(categoryDir)) {
            console.warn(`⚠️ Directory not found: ${categoryDir}`);
            return;
        }

        const files = fs.readdirSync(categoryDir).filter(file => file.endsWith('.json'));

        files.forEach(file => {
            try {
                const filePath = path.join(categoryDir, file);
                const rawData = fs.readFileSync(filePath, 'utf8');
                const data = JSON.parse(rawData);

                // Ensure the data has required fields
                if (!data.id) data.id = idCounter++;
                if (!data.category) data.category = category.name;
                if (!data.name) data.name = file.replace('.json', '').replace(/_/g, ' ');

                allData.push(data);
                console.log(`✅ Loaded: ${data.name} (${category.name})`);
            } catch (error) {
                console.error(`❌ Error loading ${file}:`, error.message);
            }
        });
    });

    return allData;
}

// Convert data to match our simplified schema
function convertToSimplifiedSchema(item) {
    // Map difficulty levels to match our enum
    const difficultyMap = {
        'Easy': 'Easy',
        'Moderate': 'Moderate',
        'Hard': 'Difficult',
        'Difficult': 'Difficult',
        'Expert': 'Expert'
    };

    // Extract coordinates - handle multiple possible structures
    let lat = 0, lng = 0;

    if (item.startingPoint?.coordinates) {
        lat = item.startingPoint.coordinates.latitude || 0;
        lng = item.startingPoint.coordinates.longitude || 0;
    } else if (item.coordinates) {
        lat = item.coordinates.latitude || 0;
        lng = item.coordinates.longitude || 0;
    } else if (item.location?.coordinates) {
        lat = item.location.coordinates.latitude || 0;
        lng = item.location.coordinates.longitude || 0;
    } else if (typeof item.latitude === 'number' && typeof item.longitude === 'number') {
        lat = item.latitude;
        lng = item.longitude;
    }

    // Convert safety data to simplified JSONB structure
    const safety = {
        riskLevel: item.safety?.riskLevel || item.riskLevel || 'Moderate',
        commonRisks: item.safety?.commonRisks || item.commonRisks || [],
        precautions: item.safety?.precautions || item.precautions || [],
        rescuePoints: item.safety?.rescuePoints || item.rescuePoints || [],
        nearestHospital: item.safety?.nearestHospital || item.nearestHospital || {},
        emergencyNumbers: item.safety?.emergencyNumbers || item.emergencyNumbers || { ambulance: "108", police: "112" }
    };
    
    return {
        id: item.id,
        name: item.name,
        category: item.category,
        location: item.location,
        difficulty: difficultyMap[item.difficulty] || 'Moderate',
        duration: item.duration || 'Not specified',
        elevation: item.elevation || 'Not specified',
        description: item.description || '',
        starting_point_name: item.startingPoint?.name || 'Base village',
        starting_point_latitude: lat,
        starting_point_longitude: lng,
        starting_point_facilities: item.startingPoint?.facilities || [],
        starting_point_description: item.startingPoint?.description || '',
        latitude: lat,
        longitude: lng,
        featured: item.featured || false,
        rating: item.rating || 4.0,
        review_count: item.reviewCount || 0,
        images: item.images || [],
        videos: item.videos || [],
        image_key: item.imageKey || null,
        best_time_to_visit: item.bestTimeToVisit || 'October to March',
        network_availability: item.networkAvailability || {},
        food_and_water: item.foodAndWater || {},
        accommodation: item.accommodation || {},
        permits: item.permits || {},
        safety: safety,
        weather: item.weather || {},
        trek_route: item.trekRoute || {},
        how_to_reach: item.howToReach || {},
        local_contacts: item.localContacts || []
    };
}

// Generate SQL INSERT statement
function generateSQLInsert(items) {
    const columns = [
        'id', 'name', 'category', 'location', 'difficulty', 'duration', 'elevation', 'description',
        'starting_point_name', 'starting_point_latitude', 'starting_point_longitude',
        'starting_point_facilities', 'starting_point_description',
        'latitude', 'longitude', 'featured', 'rating', 'review_count',
        'images', 'videos', 'image_key', 'best_time_to_visit',
        'network_availability', 'food_and_water', 'accommodation', 'permits',
        'safety', 'weather', 'trek_route', 'how_to_reach', 'local_contacts'
    ];
    
    let sql = `-- Complete Data Migration for Maharashtra Trek App
-- Generated from all.json with ${items.length} entries
-- Run this AFTER running fresh_start.sql

INSERT INTO treks (
    ${columns.join(',\n    ')}
) VALUES\n`;
    
    const values = items.map((item, index) => {
        const row = [
            item.id,
            `'${item.name.replace(/'/g, "''")}'`,
            `'${item.category}'`,
            `'${item.location.replace(/'/g, "''")}'`,
            `'${item.difficulty}'`,
            `'${item.duration.replace(/'/g, "''")}'`,
            `'${item.elevation.replace(/'/g, "''")}'`,
            `'${item.description.replace(/'/g, "''")}'`,
            `'${item.starting_point_name.replace(/'/g, "''")}'`,
            item.starting_point_latitude,
            item.starting_point_longitude,
            `ARRAY[${item.starting_point_facilities.map(f => `'${f.replace(/'/g, "''")}'`).join(', ')}]`,
            `'${item.starting_point_description.replace(/'/g, "''")}'`,
            item.latitude,
            item.longitude,
            item.featured,
            item.rating,
            item.review_count,
            `ARRAY[${item.images.map(img => `'${img}'`).join(', ')}]`,
            `ARRAY[${item.videos.map(vid => `'${vid}'`).join(', ')}]`,
            item.image_key ? `'${item.image_key}'` : 'NULL',
            `'${item.best_time_to_visit.replace(/'/g, "''")}'`,
            `'${JSON.stringify(item.network_availability).replace(/'/g, "''")}'::jsonb`,
            `'${JSON.stringify(item.food_and_water).replace(/'/g, "''")}'::jsonb`,
            `'${JSON.stringify(item.accommodation).replace(/'/g, "''")}'::jsonb`,
            `'${JSON.stringify(item.permits).replace(/'/g, "''")}'::jsonb`,
            `'${JSON.stringify(item.safety).replace(/'/g, "''")}'::jsonb`,
            `'${JSON.stringify(item.weather).replace(/'/g, "''")}'::jsonb`,
            `'${JSON.stringify(item.trek_route).replace(/'/g, "''")}'::jsonb`,
            `'${JSON.stringify(item.how_to_reach).replace(/'/g, "''")}'::jsonb`,
            `'${JSON.stringify(item.local_contacts).replace(/'/g, "''")}'::jsonb`
        ];
        
        const isLast = index === items.length - 1;
        return `(${row.join(', ')})${isLast ? '' : ','}`;
    });

    sql += values.join('\n\n');

    // Add conflict resolution
    sql += `\n\nON CONFLICT (id) DO UPDATE SET
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
    updated_at = NOW();`;
    
    // Add verification queries
    sql += `\n\n-- Verification queries
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

-- Test search function
SELECT name, category, difficulty, rating 
FROM search_treks('fort') 
LIMIT 5;

-- Success message
SELECT 'Complete data migration finished successfully! All ${items.length} entries loaded.' as status;`;
    
    return sql;
}

// Main execution
function main() {
    try {
        console.log('🚀 Starting complete data migration generation...');
        
        // Load data
        console.log('📖 Loading data from all.json...');
        const rawData = loadAllData();
        console.log(`✅ Loaded ${rawData.length} entries`);
        
        // Convert data
        console.log('🔄 Converting data to simplified schema...');
        const convertedData = rawData.map(convertToSimplifiedSchema);
        console.log('✅ Data conversion completed');
        
        // Generate SQL
        console.log('📝 Generating SQL migration...');
        const sql = generateSQLInsert(convertedData);
        
        // Write to file
        const outputPath = path.join(__dirname, '..', 'database', 'complete_data_migration.sql');
        fs.writeFileSync(outputPath, sql);
        
        console.log(`✅ Complete migration generated: ${outputPath}`);
        console.log(`📊 Total entries: ${convertedData.length}`);
        
        // Show category breakdown
        const categories = {};
        convertedData.forEach(item => {
            categories[item.category] = (categories[item.category] || 0) + 1;
        });
        
        console.log('📈 Category breakdown:');
        Object.entries(categories).forEach(([cat, count]) => {
            console.log(`   ${cat}: ${count} entries`);
        });
        
        console.log('\n🎯 Next steps:');
        console.log('1. Run database/fresh_start.sql in Supabase SQL Editor');
        console.log('2. Run database/complete_data_migration.sql in Supabase SQL Editor');
        console.log('3. Your app will have all 20+ trek entries working!');
        
    } catch (error) {
        console.error('❌ Error generating migration:', error.message);
        process.exit(1);
    }
}

// Run the script
if (require.main === module) {
    main();
}

module.exports = { loadAllData, convertToSimplifiedSchema, generateSQLInsert };
