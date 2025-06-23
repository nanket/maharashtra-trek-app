/**
 * Data Service Configuration
 * 
 * This file contains configuration for the remote data service.
 * Update the BASE_URL with your actual GitHub Pages URL after setting up the repository.
 */

export const DATA_CONFIG = {
  // GitHub Pages URL - UPDATE THIS WITH YOUR ACTUAL URL
  BASE_URL: 'https://your-username.github.io/maharashtra-trek-data/api',
  
  // Alternative: GitHub Raw URLs (if not using GitHub Pages)
  // BASE_URL: 'https://raw.githubusercontent.com/your-username/maharashtra-trek-data/main/api',
  
  // Fallback configuration
  USE_LOCAL_FALLBACK: true,
  
  // Cache settings
  CACHE_DURATION: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
  
  // Retry settings
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000, // 1 second
  
  // Timeout settings
  REQUEST_TIMEOUT: 10000, // 10 seconds
  
  // Cache keys
  CACHE_KEYS: {
    METADATA: 'trek_metadata',
    ALL_TREKS: 'all_treks',
    FORTS: 'forts_data',
    WATERFALLS: 'waterfalls_data',
    CAVES: 'caves_data',
    TREKS: 'treks_data',
    FEATURED: 'featured_data',
    LAST_UPDATE: 'data_last_update'
  },
  
  // API endpoints
  ENDPOINTS: {
    ALL: 'all.json',
    FORTS: 'forts.json',
    WATERFALLS: 'waterfalls.json',
    CAVES: 'caves.json',
    TREKS: 'treks.json',
    FEATURED: 'featured.json',
    METADATA: 'metadata.json',
    EASY: 'easy.json',
    MODERATE: 'moderate.json',
    DIFFICULT: 'difficult.json'
  }
};

/**
 * Environment-specific configuration
 */
export const getDataConfig = () => {
  // You can add environment-specific logic here
  const isDevelopment = __DEV__;
  
  if (isDevelopment) {
    return {
      ...DATA_CONFIG,
      // Use local data more aggressively in development
      USE_LOCAL_FALLBACK: true,
      CACHE_DURATION: 5 * 60 * 1000, // 5 minutes in development
    };
  }
  
  return DATA_CONFIG;
};

/**
 * Validation helpers
 */
export const validateDataConfig = () => {
  const config = getDataConfig();
  
  if (!config.BASE_URL || config.BASE_URL.includes('your-username')) {
    console.warn('⚠️ Data service BASE_URL not configured. Using local data only.');
    return false;
  }
  
  return true;
};
