/**
 * Network Utilities for handling online/offline states and network-aware operations
 */

import NetInfo from '@react-native-community/netinfo';
import { useState, useEffect } from 'react';

/**
 * Network status hook
 */
export const useNetworkStatus = () => {
  const [isConnected, setIsConnected] = useState(true);
  const [connectionType, setConnectionType] = useState('unknown');
  const [isInternetReachable, setIsInternetReachable] = useState(true);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected);
      setConnectionType(state.type);
      setIsInternetReachable(state.isInternetReachable);
    });

    return unsubscribe;
  }, []);

  return {
    isConnected,
    connectionType,
    isInternetReachable,
    isOnline: isConnected && isInternetReachable,
  };
};

/**
 * Check if device has a good network connection
 */
export const hasGoodConnection = (connectionType) => {
  return ['wifi', 'ethernet'].includes(connectionType);
};

/**
 * Check if device has limited connection (cellular)
 */
export const hasLimitedConnection = (connectionType) => {
  return ['cellular'].includes(connectionType);
};

/**
 * Network-aware data fetching utility
 */
export class NetworkAwareService {
  static async fetchWithNetworkCheck(fetchFunction, fallbackFunction = null) {
    try {
      const netInfo = await NetInfo.fetch();
      
      if (!netInfo.isConnected || !netInfo.isInternetReachable) {
        console.log('📱 Device offline, using fallback');
        return fallbackFunction ? await fallbackFunction() : null;
      }

      // If on cellular, add timeout for faster fallback
      if (netInfo.type === 'cellular') {
        return await Promise.race([
          fetchFunction(),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Cellular timeout')), 10000)
          )
        ]);
      }

      return await fetchFunction();
    } catch (error) {
      console.warn('Network fetch failed:', error.message);
      return fallbackFunction ? await fallbackFunction() : null;
    }
  }

  /**
   * Retry mechanism with exponential backoff
   */
  static async retryWithBackoff(
    fetchFunction, 
    maxRetries = 3, 
    baseDelay = 1000,
    fallbackFunction = null
  ) {
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        return await fetchFunction();
      } catch (error) {
        console.warn(`Attempt ${attempt + 1} failed:`, error.message);
        
        if (attempt === maxRetries - 1) {
          // Last attempt failed, use fallback
          return fallbackFunction ? await fallbackFunction() : null;
        }
        
        // Wait before retrying with exponential backoff
        const delay = baseDelay * Math.pow(2, attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
}

/**
 * Offline queue for storing failed operations
 */
export class OfflineQueue {
  static queue = [];
  static isProcessing = false;

  static addToQueue(operation) {
    this.queue.push({
      id: Date.now() + Math.random(),
      operation,
      timestamp: Date.now(),
      retries: 0,
    });
    
    console.log(`📝 Added operation to offline queue (${this.queue.length} items)`);
  }

  static async processQueue() {
    if (this.isProcessing || this.queue.length === 0) {
      return;
    }

    this.isProcessing = true;
    console.log(`🔄 Processing offline queue (${this.queue.length} items)`);

    const netInfo = await NetInfo.fetch();
    if (!netInfo.isConnected || !netInfo.isInternetReachable) {
      console.log('📱 Still offline, skipping queue processing');
      this.isProcessing = false;
      return;
    }

    const processedItems = [];
    
    for (const item of this.queue) {
      try {
        await item.operation();
        processedItems.push(item.id);
        console.log(`✅ Processed queued operation ${item.id}`);
      } catch (error) {
        item.retries++;
        console.warn(`❌ Failed to process operation ${item.id} (retry ${item.retries}):`, error.message);
        
        // Remove items that have failed too many times
        if (item.retries >= 3) {
          processedItems.push(item.id);
          console.log(`🗑️ Removing failed operation ${item.id} after 3 retries`);
        }
      }
    }

    // Remove processed items from queue
    this.queue = this.queue.filter(item => !processedItems.includes(item.id));
    this.isProcessing = false;
    
    console.log(`✅ Queue processing complete (${this.queue.length} items remaining)`);
  }

  static clearQueue() {
    this.queue = [];
    console.log('🗑️ Offline queue cleared');
  }

  static getQueueSize() {
    return this.queue.length;
  }
}

/**
 * Hook for managing offline queue
 */
export const useOfflineQueue = () => {
  const [queueSize, setQueueSize] = useState(OfflineQueue.getQueueSize());
  const { isOnline } = useNetworkStatus();

  useEffect(() => {
    if (isOnline) {
      OfflineQueue.processQueue();
    }
  }, [isOnline]);

  useEffect(() => {
    // Update queue size periodically
    const interval = setInterval(() => {
      setQueueSize(OfflineQueue.getQueueSize());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return {
    queueSize,
    addToQueue: OfflineQueue.addToQueue,
    processQueue: OfflineQueue.processQueue,
    clearQueue: OfflineQueue.clearQueue,
  };
};

/**
 * Smart cache invalidation based on network conditions
 */
export const shouldRefreshCache = (lastUpdate, networkType) => {
  if (!lastUpdate) return true;
  
  const now = Date.now();
  const timeSinceUpdate = now - lastUpdate;
  
  // On WiFi, refresh more frequently
  if (networkType === 'wifi') {
    return timeSinceUpdate > (6 * 60 * 60 * 1000); // 6 hours
  }
  
  // On cellular, be more conservative
  if (networkType === 'cellular') {
    return timeSinceUpdate > (24 * 60 * 60 * 1000); // 24 hours
  }
  
  // Default behavior
  return timeSinceUpdate > (12 * 60 * 60 * 1000); // 12 hours
};

/**
 * Data sync status
 */
export const useSyncStatus = () => {
  const [lastSync, setLastSync] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const { isOnline } = useNetworkStatus();

  const updateSyncStatus = (timestamp = Date.now()) => {
    setLastSync(timestamp);
  };

  const setSyncing = (syncing) => {
    setIsSyncing(syncing);
  };

  return {
    lastSync,
    isSyncing,
    isOnline,
    updateSyncStatus,
    setSyncing,
  };
};
