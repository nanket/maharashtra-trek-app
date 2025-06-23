import { useState, useEffect, useCallback } from 'react';
import DataService from '../services/DataService';

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
      handleAsyncOperation(() => DataService.getAllTreks(forceRefresh)), [handleAsyncOperation]),
    
    getTreksByCategory: useCallback((category, forceRefresh = false) => 
      handleAsyncOperation(() => DataService.getTreksByCategory(category, forceRefresh)), [handleAsyncOperation]),
    
    getFeaturedTreks: useCallback((forceRefresh = false) => 
      handleAsyncOperation(() => DataService.getFeaturedTreks(forceRefresh)), [handleAsyncOperation]),
    
    getTrekById: useCallback((id) => 
      handleAsyncOperation(() => DataService.getTrekById(id)), [handleAsyncOperation]),
    
    searchTreks: useCallback((query, category = null) => 
      handleAsyncOperation(() => DataService.searchTreks(query, category)), [handleAsyncOperation]),
    
    getMetadata: useCallback((forceRefresh = false) => 
      handleAsyncOperation(() => DataService.getMetadata(forceRefresh)), [handleAsyncOperation]),
    
    refreshAllData: useCallback(() => 
      handleAsyncOperation(() => DataService.refreshAllData()), [handleAsyncOperation]),
    
    clearCache: useCallback(() => 
      handleAsyncOperation(() => DataService.clearCache()), [handleAsyncOperation])
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
        const data = await DataService.getAllTreks(forceRefresh);
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
        const data = await DataService.getFeaturedTreks(forceRefresh);
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
        const data = await DataService.getTreksByCategory(category, forceRefresh);
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
      const data = await DataService.searchTreks(query.trim(), category);
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
        const data = await DataService.getMetadata();
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
