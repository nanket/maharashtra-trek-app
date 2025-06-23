#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Data validation schema
const REQUIRED_FIELDS = [
  'id', 'name', 'category', 'location', 'difficulty', 'duration', 
  'elevation', 'description', 'startingPoint', 'coordinates'
];

const VALID_CATEGORIES = ['fort', 'waterfall', 'cave', 'trek'];
const VALID_DIFFICULTIES = ['Easy', 'Moderate', 'Difficult', 'Easy to Moderate'];

const STARTING_POINT_FIELDS = ['name', 'coordinates', 'facilities', 'description'];
const COORDINATE_FIELDS = ['latitude', 'longitude'];

function validateTrekData(data, filename) {
  const errors = [];
  
  // Check required fields
  REQUIRED_FIELDS.forEach(field => {
    if (!data.hasOwnProperty(field)) {
      errors.push(`Missing required field: ${field}`);
    }
  });
  
  // Validate ID
  if (data.id && (typeof data.id !== 'number' || data.id <= 0)) {
    errors.push('ID must be a positive number');
  }
  
  // Validate category
  if (data.category && !VALID_CATEGORIES.includes(data.category)) {
    errors.push(`Invalid category: ${data.category}. Must be one of: ${VALID_CATEGORIES.join(', ')}`);
  }
  
  // Validate difficulty
  if (data.difficulty && !VALID_DIFFICULTIES.includes(data.difficulty)) {
    errors.push(`Invalid difficulty: ${data.difficulty}. Must be one of: ${VALID_DIFFICULTIES.join(', ')}`);
  }
  
  // Validate starting point
  if (data.startingPoint) {
    STARTING_POINT_FIELDS.forEach(field => {
      if (!data.startingPoint.hasOwnProperty(field)) {
        errors.push(`Missing startingPoint field: ${field}`);
      }
    });
    
    // Validate coordinates in starting point
    if (data.startingPoint.coordinates) {
      COORDINATE_FIELDS.forEach(field => {
        if (!data.startingPoint.coordinates.hasOwnProperty(field)) {
          errors.push(`Missing startingPoint.coordinates field: ${field}`);
        } else if (typeof data.startingPoint.coordinates[field] !== 'number') {
          errors.push(`startingPoint.coordinates.${field} must be a number`);
        }
      });
    }
  }
  
  // Validate main coordinates
  if (data.coordinates) {
    COORDINATE_FIELDS.forEach(field => {
      if (!data.coordinates.hasOwnProperty(field)) {
        errors.push(`Missing coordinates field: ${field}`);
      } else if (typeof data.coordinates[field] !== 'number') {
        errors.push(`coordinates.${field} must be a number`);
      }
    });
  }
  
  // Validate rating if present
  if (data.rating && (typeof data.rating !== 'number' || data.rating < 0 || data.rating > 5)) {
    errors.push('Rating must be a number between 0 and 5');
  }
  
  // Validate review count if present
  if (data.reviewCount && (typeof data.reviewCount !== 'number' || data.reviewCount < 0)) {
    errors.push('Review count must be a non-negative number');
  }
  
  // Validate local contacts if present
  if (data.localContacts && Array.isArray(data.localContacts)) {
    data.localContacts.forEach((contact, index) => {
      if (!contact.name || !contact.phone || !contact.service) {
        errors.push(`Local contact ${index + 1} missing required fields (name, phone, service)`);
      }
    });
  }
  
  // Validate videos if present
  if (data.videos && Array.isArray(data.videos)) {
    data.videos.forEach((video, index) => {
      if (typeof video !== 'string' || !video.startsWith('http')) {
        errors.push(`Video ${index + 1} must be a valid URL`);
      }
    });
  }
  
  return errors;
}

function validateAllData() {
  const dataDir = path.join(__dirname, '../src/data');
  const files = fs.readdirSync(dataDir).filter(f => f.endsWith('.json') && f !== 'treksData.json');
  
  let totalErrors = 0;
  const allIds = new Set();
  const duplicateIds = [];
  
  console.log('🔍 Validating trek data files...\n');
  
  files.forEach(filename => {
    const filepath = path.join(dataDir, filename);
    
    try {
      const data = JSON.parse(fs.readFileSync(filepath, 'utf8'));
      const errors = validateTrekData(data, filename);
      
      // Check for duplicate IDs
      if (data.id) {
        if (allIds.has(data.id)) {
          duplicateIds.push({ file: filename, id: data.id });
        } else {
          allIds.add(data.id);
        }
      }
      
      if (errors.length > 0) {
        console.log(`❌ ${filename}:`);
        errors.forEach(error => console.log(`   - ${error}`));
        console.log('');
        totalErrors += errors.length;
      } else {
        console.log(`✅ ${filename} - Valid`);
      }
      
    } catch (error) {
      console.log(`❌ ${filename}: Invalid JSON - ${error.message}`);
      totalErrors++;
    }
  });
  
  // Check for duplicate IDs
  if (duplicateIds.length > 0) {
    console.log('\n❌ Duplicate IDs found:');
    duplicateIds.forEach(({ file, id }) => {
      console.log(`   - ID ${id} in ${file}`);
    });
    totalErrors += duplicateIds.length;
  }
  
  // Validate consolidated treksData.json
  const treksDataPath = path.join(dataDir, 'treksData.json');
  if (fs.existsSync(treksDataPath)) {
    try {
      const treksData = JSON.parse(fs.readFileSync(treksDataPath, 'utf8'));
      if (!Array.isArray(treksData)) {
        console.log('❌ treksData.json: Must be an array');
        totalErrors++;
      } else {
        console.log(`✅ treksData.json - Contains ${treksData.length} items`);
      }
    } catch (error) {
      console.log(`❌ treksData.json: Invalid JSON - ${error.message}`);
      totalErrors++;
    }
  }
  
  console.log(`\n📊 Validation Summary:`);
  console.log(`   - Files processed: ${files.length + 1}`);
  console.log(`   - Total errors: ${totalErrors}`);
  console.log(`   - Unique IDs: ${allIds.size}`);
  
  if (totalErrors > 0) {
    console.log('\n❌ Validation failed! Please fix the errors above.');
    process.exit(1);
  } else {
    console.log('\n✅ All data files are valid!');
  }
}

// Run validation
validateAllData();
