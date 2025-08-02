#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Read all data from src/data folder structure
function loadAllDataFromFolders() {
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

// Convert data to match database schema with individual safety columns
function convertToDbSchema(item) {
    // Map difficulty levels
    const difficultyMap = {
        'Easy': 'Easy',
        'Moderate': 'Moderate', 
        'Hard': 'Difficult',
        'Difficult': 'Difficult',
        'Expert': 'Expert'
    };

    // Extract coordinates
    let lat = 0, lng = 0;
    if (item.startingPoint?.coordinates) {
        lat = item.startingPoint.coordinates.latitude || 0;
        lng = item.startingPoint.coordinates.longitude || 0;
    } else if (item.coordinates) {
        lat = item.coordinates.latitude || 0;
        lng = item.coordinates.longitude || 0;
    } else if (typeof item.latitude === 'number' && typeof item.longitude === 'number') {
        lat = item.latitude;
        lng = item.longitude;
    }

    // Extract safety data for individual columns
    const safety = item.safety || {};
    
    return {
        id: item.id,
        name: item.name || 'Unknown Trek',
        category: item.category,
        location: item.location || 'Maharashtra',
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
        review_count: item.reviewCount || item.review_count || 0,
        images: item.images || [],
        videos: item.videos || [],
        image_key: item.imageKey || item.image_key || null,
        best_time_to_visit: item.bestTimeToVisit || item.best_time_to_visit || 'October to March',
        network_availability: item.networkAvailability || item.network_availability || {},
        food_and_water: item.foodAndWater || item.food_and_water || {},
        accommodation: item.accommodation || {},
        permits: item.permits || {},
        safety_risk_level: safety.riskLevel || safety.risk_level || 'Moderate',
        safety_common_risks: safety.commonRisks || safety.common_risks || [],
        safety_precautions: safety.precautions || [],
        safety_rescue_points: safety.rescuePoints || safety.rescue_points || [],
        safety_nearest_hospital: safety.nearestHospital || safety.nearest_hospital || {},
        safety_emergency_numbers: safety.emergencyNumbers || safety.emergency_numbers || { ambulance: "108", police: "112" },
        weather: item.weather || {},
        trek_route: item.trekRoute || item.trek_route || {},
        how_to_reach: item.howToReach || item.how_to_reach || {},
        local_contacts: item.localContacts || item.local_contacts || []
    };
}

// Generate SQL INSERT statement with individual safety columns
function generateSQLInsert(items) {
    const columns = [
        'id', 'name', 'category', 'location', 'difficulty', 'duration', 'elevation', 'description',
        'starting_point_name', 'starting_point_latitude', 'starting_point_longitude',
        'starting_point_facilities', 'starting_point_description',
        'latitude', 'longitude', 'featured', 'rating', 'review_count',
        'images', 'videos', 'image_key', 'best_time_to_visit',
        'network_availability', 'food_and_water', 'accommodation', 'permits',
        'safety_risk_level', 'safety_common_risks', 'safety_precautions', 
        'safety_rescue_points', 'safety_nearest_hospital', 'safety_emergency_numbers',
        'weather', 'trek_route', 'how_to_reach', 'local_contacts'
    ];
    
    let sql = `-- Complete Data Migration for Maharashtra Trek App
-- Generated from src/data folders with ${items.length} entries

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
            item.videos.length > 0 ? `ARRAY[${item.videos.map(vid => `'${vid}'`).join(', ')}]` : 'ARRAY[]::text[]',
            item.image_key ? `'${item.image_key}'` : 'NULL',
            `'${item.best_time_to_visit.replace(/'/g, "''")}'`,
            `'${JSON.stringify(item.network_availability).replace(/'/g, "''")}'::jsonb`,
            `'${JSON.stringify(item.food_and_water).replace(/'/g, "''")}'::jsonb`,
            `'${JSON.stringify(item.accommodation).replace(/'/g, "''")}'::jsonb`,
            `'${JSON.stringify(item.permits).replace(/'/g, "''")}'::jsonb`,
            `'${item.safety_risk_level}'`,
            `ARRAY[${item.safety_common_risks.map(r => `'${r.replace(/'/g, "''")}'`).join(', ')}]`,
            `ARRAY[${item.safety_precautions.map(p => `'${p.replace(/'/g, "''")}'`).join(', ')}]`,
            `ARRAY[${item.safety_rescue_points.map(rp => `'${rp.replace(/'/g, "''")}'`).join(', ')}]`,
            `'${JSON.stringify(item.safety_nearest_hospital).replace(/'/g, "''")}'::jsonb`,
            `'${JSON.stringify(item.safety_emergency_numbers).replace(/'/g, "''")}'::jsonb`,
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
    safety_risk_level = EXCLUDED.safety_risk_level,
    safety_common_risks = EXCLUDED.safety_common_risks,
    safety_precautions = EXCLUDED.safety_precautions,
    safety_rescue_points = EXCLUDED.safety_rescue_points,
    safety_nearest_hospital = EXCLUDED.safety_nearest_hospital,
    safety_emergency_numbers = EXCLUDED.safety_emergency_numbers,
    weather = EXCLUDED.weather,
    trek_route = EXCLUDED.trek_route,
    how_to_reach = EXCLUDED.how_to_reach,
    local_contacts = EXCLUDED.local_contacts,
    updated_at = NOW();`;
    
    return sql;
}

// Main execution
function main() {
    try {
        console.log('🚀 Starting complete data folder migration generation...');
        
        // Load data from src/data folders
        console.log('📖 Loading data from src/data folders...');
        const rawData = loadAllDataFromFolders();
        console.log(`✅ Loaded ${rawData.length} entries`);
        
        // Convert data
        console.log('🔄 Converting data to database schema...');
        const convertedData = rawData.map(convertToDbSchema);
        console.log('✅ Data conversion completed');
        
        // Generate SQL
        console.log('📝 Generating SQL migration...');
        const sql = generateSQLInsert(convertedData);
        
        // Write to file
        const outputPath = path.join(__dirname, '..', 'database', 'complete_32_entries_migration.sql');
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
        console.log('1. Run this SQL file in your Supabase SQL Editor');
        console.log('2. All 32 trek entries will be inserted/updated in your database');
        
    } catch (error) {
        console.error('❌ Error generating migration:', error.message);
        process.exit(1);
    }
}

// Run the script
if (require.main === module) {
    main();
}

module.exports = { loadAllDataFromFolders, convertToDbSchema, generateSQLInsert };
