import { useState, useEffect, useCallback } from 'react';
import SupabaseService from '../services/SupabaseService';

/**
 * Custom hook for accessing trek data with loading states and error handling
 */
export const useDataService = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleAsyncOperation = useCallback(async (operation) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await operation();
      return result;
    } catch (err) {
      setError(err.message || 'An error occurred');
      console.error('DataService operation failed:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    getAllTreks: useCallback((forceRefresh = false) =>
      handleAsyncOperation(() => SupabaseService.getAllTreks(forceRefresh)), [handleAsyncOperation]),

    getTreksByCategory: useCallback((category, forceRefresh = false) =>
      handleAsyncOperation(() => SupabaseService.getTreksByCategory(category, forceRefresh)), [handleAsyncOperation]),

    getFeaturedTreks: useCallback((forceRefresh = false) =>
      handleAsyncOperation(() => SupabaseService.getFeaturedTreks(forceRefresh)), [handleAsyncOperation]),

    getTrekById: useCallback((id) =>
      handleAsyncOperation(() => SupabaseService.getTrekById(id)), [handleAsyncOperation]),

    searchTreks: useCallback((query, category = null) =>
      handleAsyncOperation(() => SupabaseService.searchTreks(query, category)), [handleAsyncOperation]),

    getTreksByDifficulty: useCallback((difficulty, forceRefresh = false) =>
      handleAsyncOperation(() => SupabaseService.getTreksByDifficulty(difficulty, forceRefresh)), [handleAsyncOperation]),

    getNearbyTreks: useCallback((latitude, longitude, radiusKm = 50, limit = 10) =>
      handleAsyncOperation(() => SupabaseService.getNearbyTreks(latitude, longitude, radiusKm, limit)), [handleAsyncOperation]),

    getMetadata: useCallback((forceRefresh = false) =>
      handleAsyncOperation(() => SupabaseService.getMetadata(forceRefresh)), [handleAsyncOperation]),

    refreshAllData: useCallback(() =>
      handleAsyncOperation(() => SupabaseService.clearCache()), [handleAsyncOperation]),

    clearCache: useCallback(() =>
      handleAsyncOperation(() => SupabaseService.clearCache()), [handleAsyncOperation])
  };
};

/**
 * Hook for getting all treks with automatic loading
 */
export const useAllTreks = (forceRefresh = false) => {
  const [treks, setTreks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadTreks = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const data = await SupabaseService.getAllTreks(forceRefresh);
        setTreks(data || []);
      } catch (err) {
        setError(err.message || 'Failed to load treks');
        console.error('Failed to load all treks:', err);
      } finally {
        setLoading(false);
      }
    };

    loadTreks();
  }, [forceRefresh]);

  return { treks, loading, error, refresh: () => loadTreks() };
};

/**
 * Hook for getting featured treks
 */
export const useFeaturedTreks = (forceRefresh = false) => {
  const [featuredTreks, setFeaturedTreks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadFeaturedTreks = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const data = await SupabaseService.getFeaturedTreks(forceRefresh);
        setFeaturedTreks(data || []);
      } catch (err) {
        setError(err.message || 'Failed to load featured treks');
        console.error('Failed to load featured treks:', err);
      } finally {
        setLoading(false);
      }
    };

    loadFeaturedTreks();
  }, [forceRefresh]);

  return { featuredTreks, loading, error };
};

/**
 * Hook for getting treks by category
 */
export const useTreksByCategory = (category, forceRefresh = false) => {
  const [treks, setTreks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!category) {
      setTreks([]);
      setLoading(false);
      return;
    }

    const loadTreks = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const data = await SupabaseService.getTreksByCategory(category, forceRefresh);
        setTreks(data || []);
      } catch (err) {
        setError(err.message || `Failed to load ${category} treks`);
        console.error(`Failed to load ${category} treks:`, err);
      } finally {
        setLoading(false);
      }
    };

    loadTreks();
  }, [category, forceRefresh]);

  return { treks, loading, error };
};

/**
 * Hook for searching treks
 */
export const useSearchTreks = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const search = useCallback(async (query, category = null) => {
    if (!query || query.trim().length < 2) {
      setResults([]);
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const data = await SupabaseService.searchTreks(query.trim(), category);
      setResults(data || []);
    } catch (err) {
      setError(err.message || 'Search failed');
      console.error('Search failed:', err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearResults = useCallback(() => {
    setResults([]);
    setError(null);
  }, []);

  return { results, loading, error, search, clearResults };
};

/**
 * Hook for getting data metadata
 */
export const useDataMetadata = () => {
  const [metadata, setMetadata] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadMetadata = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const data = await SupabaseService.getMetadata();
        setMetadata(data);
      } catch (err) {
        setError(err.message || 'Failed to load metadata');
        console.error('Failed to load metadata:', err);
      } finally {
        setLoading(false);
      }
    };

    loadMetadata();
  }, []);

  return { metadata, loading, error };
};

/**
 * Hook for getting nearby treks based on location
 */
export const useNearbyTreks = (latitude, longitude, radiusKm = 50, limit = 10) => {
  const [nearbyTreks, setNearbyTreks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!latitude || !longitude) {
      setNearbyTreks([]);
      setLoading(false);
      return;
    }

    const loadNearbyTreks = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await SupabaseService.getNearbyTreks(latitude, longitude, radiusKm, limit);
        setNearbyTreks(data || []);
      } catch (err) {
        setError(err.message || 'Failed to load nearby treks');
        console.error('Failed to load nearby treks:', err);
      } finally {
        setLoading(false);
      }
    };

    loadNearbyTreks();
  }, [latitude, longitude, radiusKm, limit]);

  return { nearbyTreks, loading, error };
};
