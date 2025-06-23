const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add support for additional asset extensions
config.resolver.assetExts.push(
  // Adds support for `.db` files for SQLite databases
  'db',
  // Add other extensions if needed
);

// Add support for additional source extensions
config.resolver.sourceExts.push(
  // Adds support for `.sql` files
  'sql',
  // Add other extensions if needed
);

module.exports = config;
