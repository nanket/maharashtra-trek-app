#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Migration script to help update components to use the new DataService
 * This script identifies files that need to be updated and provides suggestions
 */

const PATTERNS_TO_FIND = [
  {
    pattern: /import\s+.*treksData.*from\s+['"].*treksData\.json['"];?/g,
    description: 'Direct import of treksData.json',
    suggestion: 'Replace with: import { useAllTreks } from \'../hooks/useDataService\';'
  },
  {
    pattern: /require\(['"].*treksData\.json['"]\)/g,
    description: 'Require of treksData.json',
    suggestion: 'Replace with DataService.getAllTreks() call'
  },
  {
    pattern: /treksData\.filter\(/g,
    description: 'Direct filtering of treksData',
    suggestion: 'Use specific hooks like useTreksByCategory() or useSearchTreks()'
  },
  {
    pattern: /treksData\.find\(/g,
    description: 'Direct find on treksData',
    suggestion: 'Use DataService.getTrekById() or search functionality'
  },
  {
    pattern: /import\s+.*from\s+['"].*\/data\/.*\.json['"];?/g,
    description: 'Import of individual data files',
    suggestion: 'Replace with DataService calls'
  }
];

function scanFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const findings = [];
    
    PATTERNS_TO_FIND.forEach(({ pattern, description, suggestion }) => {
      const matches = content.match(pattern);
      if (matches) {
        findings.push({
          pattern: pattern.toString(),
          description,
          suggestion,
          matches: matches.length,
          examples: matches.slice(0, 3) // Show first 3 matches
        });
      }
    });
    
    return findings;
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error.message);
    return [];
  }
}

function scanDirectory(dirPath, extensions = ['.js', '.jsx', '.ts', '.tsx']) {
  const results = {};
  
  function scanRecursive(currentPath) {
    const items = fs.readdirSync(currentPath);
    
    items.forEach(item => {
      const itemPath = path.join(currentPath, item);
      const stat = fs.statSync(itemPath);
      
      if (stat.isDirectory()) {
        // Skip node_modules and other irrelevant directories
        if (!['node_modules', '.git', 'android', 'ios', '.expo'].includes(item)) {
          scanRecursive(itemPath);
        }
      } else if (stat.isFile()) {
        const ext = path.extname(item);
        if (extensions.includes(ext)) {
          const findings = scanFile(itemPath);
          if (findings.length > 0) {
            results[itemPath] = findings;
          }
        }
      }
    });
  }
  
  scanRecursive(dirPath);
  return results;
}

function generateMigrationReport(results) {
  console.log('🔍 DataService Migration Analysis Report\n');
  console.log('=' .repeat(60));
  
  const totalFiles = Object.keys(results).length;
  let totalIssues = 0;
  
  if (totalFiles === 0) {
    console.log('✅ No files found that need migration to DataService!');
    return;
  }
  
  console.log(`📁 Found ${totalFiles} files that need migration:\n`);
  
  Object.entries(results).forEach(([filePath, findings]) => {
    const relativePath = path.relative(process.cwd(), filePath);
    console.log(`📄 ${relativePath}`);
    console.log('-'.repeat(relativePath.length + 2));
    
    findings.forEach(finding => {
      totalIssues += finding.matches;
      console.log(`  ⚠️  ${finding.description} (${finding.matches} occurrence${finding.matches > 1 ? 's' : ''})`);
      console.log(`      💡 ${finding.suggestion}`);
      
      if (finding.examples.length > 0) {
        console.log(`      📝 Examples:`);
        finding.examples.forEach(example => {
          console.log(`         ${example.trim()}`);
        });
      }
      console.log('');
    });
    
    console.log('');
  });
  
  console.log('=' .repeat(60));
  console.log(`📊 Summary: ${totalIssues} issues found in ${totalFiles} files\n`);
  
  // Generate migration checklist
  console.log('📋 Migration Checklist:\n');
  console.log('1. ✅ Set up data repository with GitHub Actions');
  console.log('2. ✅ Configure GitHub Pages for data hosting');
  console.log('3. ✅ Update src/config/dataConfig.js with your GitHub Pages URL');
  console.log('4. 🔄 Update the following files:\n');
  
  Object.keys(results).forEach(filePath => {
    const relativePath = path.relative(process.cwd(), filePath);
    console.log(`   - ${relativePath}`);
  });
  
  console.log('\n5. 🧪 Test each updated component');
  console.log('6. 🚀 Deploy and verify remote data loading\n');
  
  // Generate specific migration examples
  console.log('🔧 Common Migration Patterns:\n');
  
  console.log('Before:');
  console.log('```javascript');
  console.log('import treksData from \'../data/treksData.json\';');
  console.log('const featuredTreks = treksData.filter(trek => trek.featured);');
  console.log('```\n');
  
  console.log('After:');
  console.log('```javascript');
  console.log('import { useFeaturedTreks } from \'../hooks/useDataService\';');
  console.log('const { featuredTreks, loading, error } = useFeaturedTreks();');
  console.log('```\n');
  
  console.log('Before:');
  console.log('```javascript');
  console.log('const forts = treksData.filter(trek => trek.category === \'fort\');');
  console.log('```\n');
  
  console.log('After:');
  console.log('```javascript');
  console.log('import { useTreksByCategory } from \'../hooks/useDataService\';');
  console.log('const { treks: forts, loading } = useTreksByCategory(\'fort\');');
  console.log('```\n');
}

function main() {
  const projectRoot = process.cwd();
  const srcPath = path.join(projectRoot, 'src');
  
  console.log('🔍 Scanning project for DataService migration opportunities...\n');
  
  if (!fs.existsSync(srcPath)) {
    console.error('❌ src directory not found. Please run this script from the project root.');
    process.exit(1);
  }
  
  const results = scanDirectory(srcPath);
  generateMigrationReport(results);
  
  // Check if DataService files exist
  const dataServicePath = path.join(srcPath, 'services', 'DataService.js');
  const hooksPath = path.join(srcPath, 'hooks', 'useDataService.js');
  const configPath = path.join(srcPath, 'config', 'dataConfig.js');
  
  console.log('📦 DataService Setup Status:');
  console.log(`   DataService.js: ${fs.existsSync(dataServicePath) ? '✅' : '❌'}`);
  console.log(`   useDataService.js: ${fs.existsSync(hooksPath) ? '✅' : '❌'}`);
  console.log(`   dataConfig.js: ${fs.existsSync(configPath) ? '✅' : '❌'}`);
  
  if (!fs.existsSync(dataServicePath) || !fs.existsSync(hooksPath) || !fs.existsSync(configPath)) {
    console.log('\n⚠️  Some DataService files are missing. Please ensure all files are created first.');
  }
  
  console.log('\n📚 For detailed setup instructions, see: DATA_SERVICE_SETUP.md');
}

main();
