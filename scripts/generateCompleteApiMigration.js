#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Read all data from API JSON files
function loadAllApiData() {
    const apiDir = path.join(__dirname, '..', 'api');
    const allData = [];
    let idCounter = 1;

    // API files to process
    const apiFiles = [
        { file: 'treks.json', category: 'trek' },
        { file: 'forts.json', category: 'fort' },
        { file: 'waterfalls.json', category: 'waterfall' },
        { file: 'caves.json', category: 'cave' },
        { file: 'easy.json', category: null }, // Mixed categories
        { file: 'moderate.json', category: null }, // Mixed categories
        { file: 'difficult.json', category: null }, // Mixed categories
        { file: 'featured.json', category: null } // Mixed categories
    ];

    apiFiles.forEach(({ file, category }) => {
        const filePath = path.join(apiDir, file);
        
        if (!fs.existsSync(filePath)) {
            console.warn(`⚠️ File not found: ${filePath}`);
            return;
        }

        try {
            const rawData = fs.readFileSync(filePath, 'utf8');
            const data = JSON.parse(rawData);
            
            // Handle both array and single object formats
            const items = Array.isArray(data) ? data : [data];
            
            items.forEach(item => {
                // Ensure the data has required fields
                if (!item.id) item.id = idCounter++;
                if (!item.category) item.category = category;
                
                allData.push(item);
                console.log(`✅ Loaded: ${item.name} (${category})`);
            });
            
        } catch (error) {
            console.error(`❌ Error loading ${file}:`, error.message);
        }
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
-- Generated from API files with ${items.length} entries

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
    return sql;
}

// Main execution
function main() {
    try {
        console.log('🚀 Starting complete API data migration generation...');
        
        // Load data from API files
        console.log('📖 Loading data from API files...');
        const rawData = loadAllApiData();
        console.log(`✅ Loaded ${rawData.length} entries`);
        
        // Convert data
        console.log('🔄 Converting data to database schema...');
        const convertedData = rawData.map(convertToDbSchema);
        console.log('✅ Data conversion completed');
        
        // Generate SQL
        console.log('📝 Generating SQL migration...');
        const sql = generateSQLInsert(convertedData);
        
        // Write to file
        const outputPath = path.join(__dirname, '..', 'database', 'complete_api_migration.sql');
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
        
    } catch (error) {
        console.error('❌ Error generating migration:', error.message);
        process.exit(1);
    }
}

// Run the script
if (require.main === module) {
    main();
}

module.exports = { loadAllApiData, convertToDbSchema, generateSQLInsert };
