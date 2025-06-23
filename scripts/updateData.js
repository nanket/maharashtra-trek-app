#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Recursively find all JSON files in subdirectories
 */
function findAllJsonFiles(dir, excludeFiles = ['treksData.json']) {
  const files = [];

  function scanDirectory(currentDir) {
    const items = fs.readdirSync(currentDir);

    items.forEach(item => {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        scanDirectory(fullPath);
      } else if (item.endsWith('.json') && !excludeFiles.includes(item)) {
        files.push(fullPath);
      }
    });
  }

  scanDirectory(dir);
  return files;
}

/**
 * Updates the consolidated treksData.json from individual data files
 */
function updateConsolidatedData() {
  const dataDir = path.join(__dirname, '../src/data');
  const files = findAllJsonFiles(dataDir);

  console.log('🔄 Updating consolidated trek data...\n');

  const allTreks = [];
  const processedIds = new Set();

  files.forEach(filepath => {
    const filename = path.basename(filepath);

    try {
      const data = JSON.parse(fs.readFileSync(filepath, 'utf8'));

      // Validate basic structure
      if (!data.id || !data.name || !data.category) {
        console.log(`⚠️  Skipping ${filename}: Missing required fields (id, name, category)`);
        return;
      }

      // Check for duplicate IDs
      if (processedIds.has(data.id)) {
        console.log(`⚠️  Skipping ${filename}: Duplicate ID ${data.id}`);
        return;
      }

      processedIds.add(data.id);
      allTreks.push(data);
      console.log(`✅ Added ${data.name} (ID: ${data.id})`);

    } catch (error) {
      console.log(`❌ Error processing ${filename}: ${error.message}`);
    }
  });

  // Sort by ID
  allTreks.sort((a, b) => a.id - b.id);

  // Write consolidated file
  const outputPath = path.join(dataDir, 'treksData.json');
  fs.writeFileSync(outputPath, JSON.stringify(allTreks, null, 2));

  console.log(`\n📊 Update Summary:`);
  console.log(`   - Individual files processed: ${files.length}`);
  console.log(`   - Total treks added: ${allTreks.length}`);
  console.log(`   - Output file: treksData.json`);

  // Generate category breakdown
  const categories = {};
  allTreks.forEach(trek => {
    categories[trek.category] = (categories[trek.category] || 0) + 1;
  });

  console.log(`\n📈 Category Breakdown:`);
  Object.entries(categories).forEach(([category, count]) => {
    console.log(`   - ${category}: ${count} items`);
  });

  console.log('\n✅ Consolidated data updated successfully!');
}

/**
 * Generates API-ready data files for different endpoints
 */
function generateAPIFiles() {
  const dataDir = path.join(__dirname, '../src/data');
  const apiDir = path.join(__dirname, '../api');

  // Create API directory if it doesn't exist
  if (!fs.existsSync(apiDir)) {
    fs.mkdirSync(apiDir, { recursive: true });
  }

  console.log('\n🔄 Generating API files...\n');

  try {
    const treksData = JSON.parse(fs.readFileSync(path.join(dataDir, 'treksData.json'), 'utf8'));

    // Generate category-specific files
    const categories = ['fort', 'waterfall', 'cave', 'trek'];
    categories.forEach(category => {
      const categoryData = treksData.filter(item => item.category === category);
      const filename = `${category}s.json`;
      fs.writeFileSync(
        path.join(apiDir, filename),
        JSON.stringify(categoryData, null, 2)
      );
      console.log(`✅ Generated ${filename} (${categoryData.length} items)`);
    });

    // Generate featured items
    const featuredData = treksData.filter(item => item.featured);
    fs.writeFileSync(
      path.join(apiDir, 'featured.json'),
      JSON.stringify(featuredData, null, 2)
    );
    console.log(`✅ Generated featured.json (${featuredData.length} items)`);

    // Generate difficulty-based files
    const difficulties = ['Easy', 'Moderate', 'Difficult'];
    difficulties.forEach(difficulty => {
      const difficultyData = treksData.filter(item =>
        item.difficulty === difficulty || item.difficulty === `${difficulty} to Moderate`
      );
      const filename = `${difficulty.toLowerCase()}.json`;
      fs.writeFileSync(
        path.join(apiDir, filename),
        JSON.stringify(difficultyData, null, 2)
      );
      console.log(`✅ Generated ${filename} (${difficultyData.length} items)`);
    });

    // Generate metadata
    const metadata = {
      lastUpdated: new Date().toISOString(),
      totalCount: treksData.length,
      categories: categories.map(cat => ({
        name: cat,
        count: treksData.filter(item => item.category === cat).length
      })),
      difficulties: difficulties.map(diff => ({
        name: diff,
        count: treksData.filter(item =>
          item.difficulty === diff || item.difficulty === `${diff} to Moderate`
        ).length
      })),
      featured: featuredData.length,
      version: '1.0.0'
    };

    fs.writeFileSync(
      path.join(apiDir, 'metadata.json'),
      JSON.stringify(metadata, null, 2)
    );
    console.log(`✅ Generated metadata.json`);

    // Copy complete dataset
    fs.writeFileSync(
      path.join(apiDir, 'all.json'),
      JSON.stringify(treksData, null, 2)
    );
    console.log(`✅ Generated all.json (${treksData.length} items)`);

    console.log('\n✅ API files generated successfully!');

  } catch (error) {
    console.error('❌ Error generating API files:', error.message);
    process.exit(1);
  }
}

// Main execution
function main() {
  const args = process.argv.slice(2);

  if (args.includes('--api-only')) {
    generateAPIFiles();
  } else if (args.includes('--consolidate-only')) {
    updateConsolidatedData();
  } else {
    // Run both by default
    updateConsolidatedData();
    generateAPIFiles();
  }
}

main();
