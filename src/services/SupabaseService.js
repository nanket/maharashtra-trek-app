/**
 * SupabaseService - Database service for trek data using Supabase
 * 
 * This service replaces the local JSON data loading with Supabase database queries.
 * It provides the same interface as DataService but fetches data from Supabase.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase, TABLES, SUPABASE_CONFIG, validateSupabaseConfig } from '../config/supabaseConfig';
import { NetworkAwareService, shouldRefreshCache } from '../utils/NetworkUtils';
import NetInfo from '@react-native-community/netinfo';

class SupabaseService {
  constructor() {
    this.localData = null;
    this.isInitialized = false;
    this.isConfigValid = validateSupabaseConfig();
  }

  /**
   * Initialize the service with local fallback data
   */
  async initialize() {
    if (this.isInitialized) return;

    try {
      // Load local fallback data if Supabase is not available
      if (!this.isConfigValid || !(await this.testConnection())) {
        console.warn('⚠️ Supabase not available, loading local fallback data');
        const localTreksData = require('../data/treksData.json');
        this.localData = localTreksData;
      }
      
      this.isInitialized = true;
      console.log('✅ SupabaseService initialized');
    } catch (error) {
      console.error('❌ Failed to initialize SupabaseService:', error);
      throw new Error('Failed to initialize Supabase service');
    }
  }

  /**
   * Test connection to Supabase
   */
  async testConnection() {
    try {
      const { data, error } = await supabase
        .from('treks')
        .select('count')
        .limit(1);
      
      return !error;
    } catch (error) {
      return false;
    }
  }

  /**
   * Check if cached data is still valid (network-aware)
   */
  async isCacheValid(cacheKey) {
    try {
      const timestamp = await AsyncStorage.getItem(`${cacheKey}_timestamp`);
      if (!timestamp) return false;

      // Get current network info for smart cache invalidation
      const netInfo = await NetInfo.fetch();
      return !shouldRefreshCache(parseInt(timestamp), netInfo.type);
    } catch (error) {
      return false;
    }
  }

  /**
   * Get cached data
   */
  async getCachedData(cacheKey) {
    try {
      const data = await AsyncStorage.getItem(cacheKey);
      return data ? JSON.parse(data) : null;
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
   * Fetch data from Supabase with network-aware fallback
   */
  async fetchWithFallback(query, fallbackData) {
    if (!this.isConfigValid) {
      if (fallbackData) {
        console.log('📁 Using local fallback (config not valid)');
        return fallbackData;
      }
      throw new Error('Supabase not available and no local fallback');
    }

    // Use network-aware fetching
    return await NetworkAwareService.fetchWithNetworkCheck(
      async () => {
        const { data, error } = await query;

        if (error) {
          throw new Error(`Supabase error: ${error.message}`);
        }

        console.log('✅ Fetched data from Supabase');
        return data;
      },
      async () => {
        if (SUPABASE_CONFIG.USE_LOCAL_FALLBACK && fallbackData) {
          console.log('📁 Using local fallback');
          return fallbackData;
        }
        return null;
      }
    );
  }

  /**
   * Get all treks data
   */
  async getAllTreks(forceRefresh = false) {
    await this.initialize();

    const cacheKey = SUPABASE_CONFIG.CACHE_KEYS.ALL_DATA;

    // Check cache first
    if (!forceRefresh && await this.isCacheValid(cacheKey)) {
      const cachedData = await this.getCachedData(cacheKey);
      if (cachedData) {
        console.log('📱 Using cached all treks data');
        return cachedData;
      }
    }

    try {
      const query = supabase
        .from('treks')
        .select('*')
        .order('name');

      const data = await this.fetchWithFallback(query, this.localData);
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

    const cacheKey = SUPABASE_CONFIG.CACHE_KEYS[category.toUpperCase()];

    // Check cache first
    if (!forceRefresh && await this.isCacheValid(cacheKey)) {
      const cachedData = await this.getCachedData(cacheKey);
      if (cachedData) {
        console.log(`📱 Using cached ${category} data`);
        return cachedData;
      }
    }

    try {
      const query = supabase
        .from('treks')
        .select('*')
        .eq('category', category)
        .order('name');

      const fallbackData = this.localData ?
        this.localData.filter(item => item.category === category) : [];

      const data = await this.fetchWithFallback(query, fallbackData);
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

    const cacheKey = SUPABASE_CONFIG.CACHE_KEYS.FEATURED;

    // Check cache first
    if (!forceRefresh && await this.isCacheValid(cacheKey)) {
      const cachedData = await this.getCachedData(cacheKey);
      if (cachedData) {
        console.log('📱 Using cached featured treks data');
        return cachedData;
      }
    }

    try {
      const query = supabase
        .from('treks')
        .select('*')
        .eq('featured', true)
        .order('rating', { ascending: false })
        .order('review_count', { ascending: false });

      const fallbackData = this.localData ?
        this.localData.filter(item => item.featured) : [];

      const data = await this.fetchWithFallback(query, fallbackData);
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
    await this.initialize();

    try {
      const query = supabase
        .from('treks')
        .select('*')
        .eq('id', id)
        .single();

      const fallbackData = this.localData ?
        this.localData.find(item => item.id === id) : null;

      return await this.fetchWithFallback(query, fallbackData);
    } catch (error) {
      console.error(`Failed to get trek ${id}:`, error);
      return this.localData ?
        this.localData.find(item => item.id === id) : null;
    }
  }

  /**
   * Search treks
   */
  async searchTreks(query, category = null) {
    await this.initialize();

    try {
      // Use the database search function
      const { data, error } = await supabase
        .rpc('search_treks', {
          search_query: query,
          search_category: category
        });

      if (error) {
        throw new Error(`Search error: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Failed to search treks:', error);
      
      // Fallback to local search
      if (this.localData) {
        const searchLower = query.toLowerCase();
        return this.localData.filter(item => {
          const matchesCategory = !category || item.category === category;
          const matchesQuery = 
            item.name.toLowerCase().includes(searchLower) ||
            item.location.toLowerCase().includes(searchLower) ||
            item.description.toLowerCase().includes(searchLower);
          
          return matchesCategory && matchesQuery;
        });
      }
      
      return [];
    }
  }

  /**
   * Get nearby treks based on coordinates
   */
  async getNearbyTreks(latitude, longitude, radiusKm = 50, limit = 10) {
    await this.initialize();

    try {
      const { data, error } = await supabase
        .rpc('get_nearby_treks', {
          user_lat: latitude,
          user_lng: longitude,
          radius_km: radiusKm,
          limit_count: limit
        });

      if (error) {
        throw new Error(`Nearby search error: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Failed to get nearby treks:', error);
      
      // Fallback to featured treks
      return await this.getFeaturedTreks();
    }
  }

  /**
   * Get treks by difficulty
   */
  async getTreksByDifficulty(difficulty, forceRefresh = false) {
    await this.initialize();

    try {
      const query = supabase
        .from('treks')
        .select('*')
        .eq('difficulty', difficulty)
        .order('rating', { ascending: false });

      const fallbackData = this.localData ?
        this.localData.filter(item => item.difficulty === difficulty) : [];

      return await this.fetchWithFallback(query, fallbackData);
    } catch (error) {
      console.error(`Failed to get ${difficulty} treks:`, error);
      return this.localData ?
        this.localData.filter(item => item.difficulty === difficulty) : [];
    }
  }

  /**
   * Clear all cached data
   */
  async clearCache() {
    try {
      const keys = Object.values(SUPABASE_CONFIG.CACHE_KEYS);
      const timestampKeys = keys.map(key => `${key}_timestamp`);
      
      await AsyncStorage.multiRemove([...keys, ...timestampKeys]);
      console.log('✅ Cache cleared');
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  }

  /**
   * Get metadata about the data
   */
  async getMetadata(forceRefresh = false) {
    const cacheKey = SUPABASE_CONFIG.CACHE_KEYS.METADATA;

    // Check cache first
    if (!forceRefresh && await this.isCacheValid(cacheKey)) {
      const cachedData = await this.getCachedData(cacheKey);
      if (cachedData) {
        return cachedData;
      }
    }

    try {
      const { data, error } = await supabase
        .from('treks')
        .select('category, count(*)')
        .group('category');

      if (error) {
        throw new Error(`Metadata error: ${error.message}`);
      }

      const metadata = {
        lastUpdated: new Date().toISOString(),
        totalCount: data.reduce((sum, item) => sum + item.count, 0),
        categories: data.reduce((acc, item) => {
          acc[item.category] = item.count;
          return acc;
        }, {}),
        version: '2.0.0',
        source: 'supabase'
      };

      await this.setCachedData(cacheKey, metadata);
      return metadata;
    } catch (error) {
      console.error('Failed to get metadata:', error);
      return {
        lastUpdated: new Date().toISOString(),
        totalCount: this.localData?.length || 0,
        version: '2.0.0',
        source: 'local'
      };
    }
  }
}

// Export singleton instance
export default new SupabaseService();
