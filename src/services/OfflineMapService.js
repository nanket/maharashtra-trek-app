import AsyncStorage from '@react-native-async-storage/async-storage';
import { MAPBOX_CONFIG, MAHARASHTRA_BOUNDS } from '../config/mapbox';

// Safely import Mapbox with error handling
let Mapbox = null;
let isMapboxAvailable = false;

try {
  Mapbox = require('@rnmapbox/maps').default;
  isMapboxAvailable = !!(Mapbox && Mapbox.offlineManager);
} catch (error) {
  console.warn('Mapbox not available in this environment:', error.message);
  isMapboxAvailable = false;
}

class OfflineMapService {
  static instance = null;
  
  constructor() {
    if (OfflineMapService.instance) {
      return OfflineMapService.instance;
    }
    
    this.downloadedRegions = [];
    this.isInitialized = false;
    OfflineMapService.instance = this;
  }

  static getInstance() {
    if (!OfflineMapService.instance) {
      OfflineMapService.instance = new OfflineMapService();
    }
    return OfflineMapService.instance;
  }

  // Initialize the service
  async initialize() {
    try {
      if (this.isInitialized) return;

      // Set Mapbox access token if available
      if (isMapboxAvailable && Mapbox?.setAccessToken) {
        Mapbox.setAccessToken(MAPBOX_CONFIG.accessToken);
      }

      // Load downloaded regions
      await this.loadDownloadedRegions();

      this.isInitialized = true;
      console.log('OfflineMapService initialized successfully');
    } catch (error) {
      console.error('Error initializing OfflineMapService:', error);
      // Don't throw error, just log it
      this.isInitialized = true; // Mark as initialized even if Mapbox is not available
    }
  }

  // Load downloaded regions from storage
  async loadDownloadedRegions() {
    try {
      if (!isMapboxAvailable || !Mapbox?.offlineManager) {
        // Fallback to AsyncStorage only
        const stored = await AsyncStorage.getItem('offline_regions');
        this.downloadedRegions = stored ? JSON.parse(stored) : [];
        return this.downloadedRegions;
      }

      const regions = await Mapbox.offlineManager.getPacks();
      this.downloadedRegions = regions || [];

      // Save to AsyncStorage for quick access
      await AsyncStorage.setItem(
        'offline_regions',
        JSON.stringify(this.downloadedRegions)
      );

      return this.downloadedRegions;
    } catch (error) {
      console.warn('Error loading downloaded regions:', error);

      // Fallback to AsyncStorage
      try {
        const stored = await AsyncStorage.getItem('offline_regions');
        this.downloadedRegions = stored ? JSON.parse(stored) : [];
      } catch (storageError) {
        console.warn('Error loading from AsyncStorage:', storageError);
        this.downloadedRegions = [];
      }

      return this.downloadedRegions;
    }
  }

  // Check if a location is covered by offline maps
  async isLocationOfflineAvailable(latitude, longitude) {
    try {
      await this.loadDownloadedRegions();
      
      return this.downloadedRegions.some(region => {
        if (!region.bounds) return false;
        
        const [sw, ne] = region.bounds;
        return (
          longitude >= sw[0] && longitude <= ne[0] &&
          latitude >= sw[1] && latitude <= ne[1]
        );
      });
    } catch (error) {
      console.warn('Error checking offline availability:', error);
      return false;
    }
  }

  // Download a region for offline use
  async downloadRegion(regionConfig, progressCallback, errorCallback, completeCallback) {
    try {
      const options = {
        name: regionConfig.name,
        styleURL: regionConfig.styleURL || MAPBOX_CONFIG.defaultStyle,
        bounds: regionConfig.bounds,
        minZoom: regionConfig.minZoom || MAPBOX_CONFIG.offline.minZoom,
        maxZoom: regionConfig.maxZoom || MAPBOX_CONFIG.offline.maxZoom,
        metadata: {
          name: regionConfig.displayName || regionConfig.name,
          description: regionConfig.description || '',
          downloadDate: new Date().toISOString(),
          version: '1.0',
        },
      };

      // Progress listener
      const onProgress = (offlineRegion, status) => {
        const progress = {
          percentage: status.percentage,
          completedResourceCount: status.completedResourceCount,
          requiredResourceCount: status.requiredResourceCount,
          completedResourceSize: status.completedResourceSize,
          completedTileCount: status.completedTileCount,
          requiredTileCount: status.requiredTileCount,
        };
        
        if (progressCallback) {
          progressCallback(progress);
        }
      };

      // Error listener
      const onError = (offlineRegion, error) => {
        console.error('Offline download error:', error);
        if (errorCallback) {
          errorCallback(error);
        }
      };

      // Complete listener
      const onComplete = (offlineRegion) => {
        console.log('Offline download completed:', offlineRegion);
        this.loadDownloadedRegions(); // Refresh the list
        if (completeCallback) {
          completeCallback(offlineRegion);
        }
      };

      // Start download
      const offlineRegion = await Mapbox.offlineManager.createPack(
        options,
        onProgress,
        onError,
        onComplete
      );

      return offlineRegion;
    } catch (error) {
      console.error('Error downloading region:', error);
      throw error;
    }
  }

  // Delete an offline region
  async deleteRegion(regionName) {
    try {
      await Mapbox.offlineManager.deletePack(regionName);
      await this.loadDownloadedRegions(); // Refresh the list
      return true;
    } catch (error) {
      console.error('Error deleting region:', error);
      throw error;
    }
  }

  // Get all downloaded regions
  getDownloadedRegions() {
    return this.downloadedRegions;
  }

  // Get total storage used by offline maps
  getTotalStorageUsed() {
    return this.downloadedRegions.reduce((total, region) => {
      return total + (region.size || 0);
    }, 0);
  }

  // Check if device is online
  async isOnline() {
    try {
      // Simple network check - you might want to use a more robust solution
      const response = await fetch('https://api.mapbox.com/v1/ping', {
        method: 'HEAD',
        timeout: 5000,
      });
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  // Get appropriate map style based on offline availability
  async getMapStyle(latitude, longitude) {
    const isOfflineAvailable = await this.isLocationOfflineAvailable(latitude, longitude);
    const isOnline = await this.isOnline();
    
    if (isOfflineAvailable && !isOnline) {
      // Use offline style
      return MAPBOX_CONFIG.styles.outdoors;
    } else if (isOnline) {
      // Use online style
      return MAPBOX_CONFIG.defaultStyle;
    } else {
      // Fallback to basic style
      return MAPBOX_CONFIG.styles.light;
    }
  }

  // Search for locations within offline regions
  async searchOfflineLocations(query, locations) {
    try {
      const offlineLocations = [];
      
      for (const location of locations) {
        const isOffline = await this.isLocationOfflineAvailable(
          location.coordinates.latitude,
          location.coordinates.longitude
        );
        
        if (isOffline) {
          const matchesQuery = location.name.toLowerCase().includes(query.toLowerCase()) ||
                              location.location.toLowerCase().includes(query.toLowerCase()) ||
                              location.category.toLowerCase().includes(query.toLowerCase());
          
          if (matchesQuery) {
            offlineLocations.push({
              ...location,
              isOfflineAvailable: true,
            });
          }
        }
      }
      
      return offlineLocations;
    } catch (error) {
      console.warn('Error searching offline locations:', error);
      return [];
    }
  }

  // Get region info for a specific location
  async getRegionForLocation(latitude, longitude) {
    try {
      await this.loadDownloadedRegions();
      
      return this.downloadedRegions.find(region => {
        if (!region.bounds) return false;
        
        const [sw, ne] = region.bounds;
        return (
          longitude >= sw[0] && longitude <= ne[0] &&
          latitude >= sw[1] && latitude <= ne[1]
        );
      });
    } catch (error) {
      console.warn('Error getting region for location:', error);
      return null;
    }
  }

  // Clear all offline data
  async clearAllOfflineData() {
    try {
      const regions = await this.loadDownloadedRegions();
      
      for (const region of regions) {
        await this.deleteRegion(region.name);
      }
      
      await AsyncStorage.removeItem('offline_regions');
      this.downloadedRegions = [];
      
      return true;
    } catch (error) {
      console.error('Error clearing offline data:', error);
      throw error;
    }
  }

  // Get offline statistics
  getOfflineStats() {
    const totalSize = this.getTotalStorageUsed();
    const regionCount = this.downloadedRegions.length;
    
    return {
      totalSize,
      regionCount,
      regions: this.downloadedRegions.map(region => ({
        name: region.metadata?.name || region.name,
        size: region.size || 0,
        downloadDate: region.metadata?.downloadDate,
      })),
    };
  }
}

export default OfflineMapService;
