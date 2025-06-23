import AsyncStorage from '@react-native-async-storage/async-storage';
import { getDataConfig, validateDataConfig } from '../config/dataConfig';

class DataService {
  constructor() {
    this.localData = null;
    this.isInitialized = false;
    this.config = getDataConfig();
    this.isConfigValid = validateDataConfig();
  }

  /**
   * Initialize the service with local fallback data
   */
  async initialize() {
    if (this.isInitialized) return;

    try {
      // Load local fallback data
      const localTreksData = require('../data/treksData.json');
      this.localData = localTreksData;
      this.isInitialized = true;
      console.log('✅ DataService initialized with local data');
    } catch (error) {
      console.error('❌ Failed to initialize DataService:', error);
      throw new Error('Failed to initialize data service');
    }
  }

  /**
   * Check if cached data is still valid
   */
  async isCacheValid(cacheKey) {
    try {
      const lastUpdate = await AsyncStorage.getItem(`${cacheKey}_timestamp`);
      if (!lastUpdate) return false;

      const cacheAge = Date.now() - parseInt(lastUpdate);
      return cacheAge < this.config.CACHE_DURATION;
    } catch (error) {
      console.error('Error checking cache validity:', error);
      return false;
    }
  }

  /**
   * Get cached data
   */
  async getCachedData(cacheKey) {
    try {
      const cachedData = await AsyncStorage.getItem(cacheKey);
      return cachedData ? JSON.parse(cachedData) : null;
    } catch (error) {
      console.error('Error getting cached data:', error);
      return null;
    }
  }

  /**
   * Cache data with timestamp
   */
  async setCachedData(cacheKey, data) {
    try {
      await AsyncStorage.setItem(cacheKey, JSON.stringify(data));
      await AsyncStorage.setItem(`${cacheKey}_timestamp`, Date.now().toString());
    } catch (error) {
      console.error('Error caching data:', error);
    }
  }

  /**
   * Fetch data from remote URL with fallback
   */
  async fetchWithFallback(endpoint, fallbackData) {
    // If config is not valid, use local fallback immediately
    if (!this.isConfigValid) {
      if (this.config.USE_LOCAL_FALLBACK && fallbackData) {
        console.log(`📁 Using local fallback for ${endpoint} (config not valid)`);
        return fallbackData;
      }
      throw new Error('Remote data not available and no local fallback');
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.config.REQUEST_TIMEOUT);

      const response = await fetch(`${this.config.BASE_URL}/${endpoint}`, {
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log(`✅ Fetched ${endpoint} from remote`);
      return data;

    } catch (error) {
      console.warn(`⚠️ Failed to fetch ${endpoint} from remote:`, error.message);

      if (this.config.USE_LOCAL_FALLBACK && fallbackData) {
        console.log(`📁 Using local fallback for ${endpoint}`);
        return fallbackData;
      }

      throw error;
    }
  }

  /**
   * Get all treks data
   */
  async getAllTreks(forceRefresh = false) {
    await this.initialize();

    const cacheKey = this.config.CACHE_KEYS.ALL_TREKS;

    // Check cache first
    if (!forceRefresh && await this.isCacheValid(cacheKey)) {
      const cachedData = await this.getCachedData(cacheKey);
      if (cachedData) {
        console.log('📱 Using cached all treks data');
        return cachedData;
      }
    }

    try {
      const data = await this.fetchWithFallback(this.config.ENDPOINTS.ALL, this.localData);
      await this.setCachedData(cacheKey, data);
      return data;
    } catch (error) {
      console.error('Failed to get all treks:', error);
      return this.localData || [];
    }
  }

  /**
   * Get treks by category
   */
  async getTreksByCategory(category, forceRefresh = false) {
    await this.initialize();

    const cacheKey = this.config.CACHE_KEYS[category.toUpperCase()];
    const endpoint = this.config.ENDPOINTS[category.toUpperCase()] || `${category}s.json`;

    // Check cache first
    if (!forceRefresh && await this.isCacheValid(cacheKey)) {
      const cachedData = await this.getCachedData(cacheKey);
      if (cachedData) {
        console.log(`📱 Using cached ${category} data`);
        return cachedData;
      }
    }

    try {
      const fallbackData = this.localData ?
        this.localData.filter(item => item.category === category) : [];

      const data = await this.fetchWithFallback(endpoint, fallbackData);
      await this.setCachedData(cacheKey, data);
      return data;
    } catch (error) {
      console.error(`Failed to get ${category} data:`, error);
      return this.localData ?
        this.localData.filter(item => item.category === category) : [];
    }
  }

  /**
   * Get featured treks
   */
  async getFeaturedTreks(forceRefresh = false) {
    await this.initialize();

    const cacheKey = this.config.CACHE_KEYS.FEATURED;

    // Check cache first
    if (!forceRefresh && await this.isCacheValid(cacheKey)) {
      const cachedData = await this.getCachedData(cacheKey);
      if (cachedData) {
        console.log('📱 Using cached featured data');
        return cachedData;
      }
    }

    try {
      const fallbackData = this.localData ?
        this.localData.filter(item => item.featured) : [];

      const data = await this.fetchWithFallback(this.config.ENDPOINTS.FEATURED, fallbackData);
      await this.setCachedData(cacheKey, data);
      return data;
    } catch (error) {
      console.error('Failed to get featured treks:', error);
      return this.localData ?
        this.localData.filter(item => item.featured) : [];
    }
  }

  /**
   * Get trek by ID
   */
  async getTrekById(id) {
    const allTreks = await this.getAllTreks();
    return allTreks.find(trek => trek.id === id) || null;
  }

  /**
   * Search treks
   */
  async searchTreks(query, category = null) {
    const allTreks = await this.getAllTreks();
    const searchQuery = query.toLowerCase();

    return allTreks.filter(trek => {
      const matchesQuery = trek.name.toLowerCase().includes(searchQuery) ||
                          trek.location.toLowerCase().includes(searchQuery) ||
                          trek.description.toLowerCase().includes(searchQuery);

      const matchesCategory = !category || trek.category === category;

      return matchesQuery && matchesCategory;
    });
  }

  /**
   * Get metadata about the data
   */
  async getMetadata(forceRefresh = false) {
    const cacheKey = this.config.CACHE_KEYS.METADATA;

    // Check cache first
    if (!forceRefresh && await this.isCacheValid(cacheKey)) {
      const cachedData = await this.getCachedData(cacheKey);
      if (cachedData) {
        return cachedData;
      }
    }

    try {
      const data = await this.fetchWithFallback(this.config.ENDPOINTS.METADATA, {
        lastUpdated: new Date().toISOString(),
        totalCount: this.localData?.length || 0,
        version: '1.0.0',
        source: 'local'
      });

      await this.setCachedData(cacheKey, data);
      return data;
    } catch (error) {
      console.error('Failed to get metadata:', error);
      return {
        lastUpdated: new Date().toISOString(),
        totalCount: this.localData?.length || 0,
        version: '1.0.0',
        source: 'local'
      };
    }
  }

  /**
   * Clear all cached data
   */
  async clearCache() {
    try {
      const keys = Object.values(this.config.CACHE_KEYS);
      const timestampKeys = keys.map(key => `${key}_timestamp`);
      await AsyncStorage.multiRemove([...keys, ...timestampKeys]);
      console.log('✅ Cache cleared successfully');
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  }

  /**
   * Force refresh all data
   */
  async refreshAllData() {
    await this.clearCache();

    // Pre-load commonly used data
    await Promise.all([
      this.getAllTreks(true),
      this.getFeaturedTreks(true),
      this.getTreksByCategory('fort', true),
      this.getMetadata(true)
    ]);

    console.log('✅ All data refreshed');
  }
}

// Export singleton instance
export default new DataService();
