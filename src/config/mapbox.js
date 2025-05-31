import { Platform } from 'react-native';

// Mapbox configuration
export const MAPBOX_CONFIG = {
  // Access token from environment variables
  accessToken: process.env.MAPBOX_ACCESS_TOKEN || 'sk.eyJ1IjoiaXJlYWN0bmluamEiLCJhIjoiY21iYnVkanJuMDRpYTJpcjB2bXgyYzE5NyJ9.0gNVm3mH-j6LCFuqCQaCpQ',
  
  // Default map settings
  defaultZoom: 10,
  defaultCenter: [73.8567, 18.5204], // Pune, Maharashtra coordinates [longitude, latitude]
  
  // Map styles
  styles: {
    street: 'mapbox://styles/mapbox/streets-v12',
    satellite: 'mapbox://styles/mapbox/satellite-streets-v12',
    outdoors: 'mapbox://styles/mapbox/outdoors-v12',
    light: 'mapbox://styles/mapbox/light-v11',
    dark: 'mapbox://styles/mapbox/dark-v11',
  },
  
  // Default style
  defaultStyle: 'mapbox://styles/mapbox/outdoors-v12',
  
  // Offline map settings
  offline: {
    maxZoom: 16,
    minZoom: 8,
    tileCachePath: Platform.OS === 'ios' ? 'Documents/mapbox-cache' : 'mapbox-cache',
  },
  
  // Animation settings
  animation: {
    duration: 1000,
    easing: 'easeInOutCubic',
  },
  
  // Clustering settings
  clustering: {
    enabled: true,
    radius: 50,
    maxZoom: 14,
  },
};

// Maharashtra bounds for offline downloads
export const MAHARASHTRA_BOUNDS = {
  northeast: [80.8826, 22.0278],
  southwest: [72.6589, 15.6017],
};

// Popular trek regions for offline downloads
export const TREK_REGIONS = {
  pune: {
    name: 'Pune Region',
    bounds: {
      northeast: [74.2, 19.2],
      southwest: [73.4, 18.0],
    },
  },
  mumbai: {
    name: 'Mumbai Region', 
    bounds: {
      northeast: [73.2, 19.4],
      southwest: [72.7, 18.8],
    },
  },
  nashik: {
    name: 'Nashik Region',
    bounds: {
      northeast: [74.2, 20.2],
      southwest: [73.4, 19.8],
    },
  },
  kolhapur: {
    name: 'Kolhapur Region',
    bounds: {
      northeast: [74.8, 17.0],
      southwest: [73.8, 16.2],
    },
  },
};

// Location categories with map styling
export const LOCATION_CATEGORIES = {
  fort: {
    color: '#8B4513',
    icon: 'castle',
    size: 1.2,
    priority: 1,
  },
  waterfall: {
    color: '#1E40AF',
    icon: 'water',
    size: 1.1,
    priority: 2,
  },
  trek: {
    color: '#059669',
    icon: 'mountain',
    size: 1.0,
    priority: 3,
  },
};

// Map layer configurations
export const MAP_LAYERS = {
  locations: 'locations-layer',
  clusters: 'clusters-layer',
  routes: 'routes-layer',
  userLocation: 'user-location-layer',
};

export default MAPBOX_CONFIG;
