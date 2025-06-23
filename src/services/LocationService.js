import * as Location from 'expo-location';

/**
 * LocationService - Handles location-based functionality
 *
 * Features:
 * - Get user's current location
 * - Calculate distances between coordinates
 * - Find nearby treks based on user location
 * - Handle location permissions gracefully
 */
class LocationService {
  static userLocation = null;
  static locationPermission = false;

  /**
   * Request location permission and get current location
   */
  static async requestLocationPermission() {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      this.locationPermission = status === 'granted';

      if (this.locationPermission) {
        await this.getCurrentLocation();
      }

      return this.locationPermission;
    } catch (error) {
      console.warn('Error requesting location permission:', error);
      return false;
    }
  }

  /**
   * Get user's current location
   */
  static async getCurrentLocation() {
    try {
      if (!this.locationPermission) {
        console.log('📍 LocationService: No location permission');
        return null;
      }

      console.log('📍 LocationService: Getting current location...');
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High, // Use high accuracy for better distance calculations
        timeout: 20000, // 20 second timeout
        maximumAge: 60000, // Accept cached location up to 1 minute old
      });

      this.userLocation = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy, // GPS accuracy in meters
        isReal: true, // Flag to indicate this is real user location
        timestamp: new Date().toISOString(),
      };

      console.log('📍 LocationService: Real location obtained:', {
        lat: this.userLocation.latitude.toFixed(4),
        lng: this.userLocation.longitude.toFixed(4)
      });

      return this.userLocation;
    } catch (error) {
      console.warn('📍 LocationService: Error getting real location:', error.message);
      // Fallback to Pune, Maharashtra for development/demo
      this.userLocation = {
        latitude: 18.5204,
        longitude: 73.8567,
        isReal: false, // Flag to indicate this is fallback location
        fallbackReason: error.message || 'Location unavailable'
      };

      console.log('📍 LocationService: Using fallback location (Pune, Maharashtra)');
      return this.userLocation;
    }
  }

  /**
   * Calculate distance between two coordinates using Haversine formula
   * @param {Object} coord1 - {latitude, longitude}
   * @param {Object} coord2 - {latitude, longitude}
   * @returns {number} Distance in kilometers
   */
  static calculateDistance(coord1, coord2) {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(coord2.latitude - coord1.latitude);
    const dLon = this.toRadians(coord2.longitude - coord1.longitude);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(coord1.latitude)) *
      Math.cos(this.toRadians(coord2.latitude)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return Math.round(distance * 10) / 10; // Round to 1 decimal place
  }

  /**
   * Convert degrees to radians
   */
  static toRadians(degrees) {
    return degrees * (Math.PI / 180);
  }

  /**
   * Find nearby treks based on user location
   * @param {Array} treks - Array of trek objects
   * @param {number} maxDistance - Maximum distance in kilometers (default: 100km)
   * @param {number} limit - Maximum number of treks to return (default: 6)
   * @returns {Array} Array of nearby treks with distance information
   */
  static findNearbyTreks(treks, maxDistance = 100, limit = 6) {
    if (!this.userLocation || !treks || treks.length === 0) {
      console.log('📍 LocationService: Cannot find nearby treks - no location or treks data');
      return [];
    }

    console.log(`📍 LocationService: Finding nearby treks from ${this.userLocation.isReal ? 'real' : 'fallback'} location`);

    // Calculate distance for each trek and filter by maxDistance
    const treksWithDistance = treks
      .filter(trek => trek.coordinates && trek.coordinates.latitude && trek.coordinates.longitude)
      .map(trek => {
        const distance = this.calculateDistance(
          this.userLocation,
          trek.coordinates
        );

        return {
          ...trek,
          distance,
          distanceText: this.formatDistance(distance),
          calculatedFromFallback: !this.userLocation.isReal, // Flag to indicate if distance is from fallback location
        };
      })
      .filter(trek => trek.distance <= maxDistance)
      .sort((a, b) => a.distance - b.distance) // Sort by distance (closest first)
      .slice(0, limit); // Limit results

    console.log(`📍 LocationService: Found ${treksWithDistance.length} nearby treks within ${maxDistance}km`);

    return treksWithDistance;
  }

  /**
   * Format distance for display
   * @param {number} distance - Distance in kilometers
   * @returns {string} Formatted distance string
   */
  static formatDistance(distance) {
    if (distance < 1) {
      return `${Math.round(distance * 1000)}m`;
    } else if (distance < 10) {
      return `${distance.toFixed(1)}km`;
    } else {
      return `${Math.round(distance)}km`;
    }
  }

  /**
   * Get user's current city/area name (reverse geocoding)
   */
  static async getCurrentLocationName() {
    try {
      if (!this.userLocation) {
        await this.getCurrentLocation();
      }

      if (!this.userLocation) {
        return 'Unknown Location';
      }

      const reverseGeocode = await Location.reverseGeocodeAsync(this.userLocation);

      if (reverseGeocode && reverseGeocode.length > 0) {
        const location = reverseGeocode[0];
        return location.city || location.district || location.region || 'Your Location';
      }

      return 'Your Location';
    } catch (error) {
      console.warn('Error getting location name:', error);
      return 'Your Location';
    }
  }

  /**
   * Check if location services are available and enabled
   */
  static async isLocationAvailable() {
    try {
      const isEnabled = await Location.hasServicesEnabledAsync();
      return isEnabled && this.locationPermission;
    } catch (error) {
      console.warn('Error checking location availability:', error);
      return false;
    }
  }

  /**
   * Get location status for UI display
   */
  static getLocationStatus() {
    if (!this.locationPermission) {
      return {
        available: false,
        message: 'Location permission required',
        action: 'Enable Location',
      };
    }

    if (!this.userLocation) {
      return {
        available: false,
        message: 'Getting your location...',
        action: 'Retry',
      };
    }

    return {
      available: true,
      message: 'Location found',
      action: null,
    };
  }

  /**
   * Get location accuracy information for UI display
   */
  static getLocationAccuracy() {
    if (!this.userLocation) {
      return { status: 'unavailable', message: 'Location not available' };
    }

    if (!this.userLocation.isReal) {
      return {
        status: 'fallback',
        message: 'Using approximate location (Pune area)',
        accuracy: null
      };
    }

    const accuracy = this.userLocation.accuracy;
    if (!accuracy) {
      return {
        status: 'unknown',
        message: 'Location accuracy unknown',
        accuracy: null
      };
    }

    if (accuracy <= 10) {
      return {
        status: 'excellent',
        message: 'Very accurate location',
        accuracy: Math.round(accuracy)
      };
    } else if (accuracy <= 50) {
      return {
        status: 'good',
        message: 'Good location accuracy',
        accuracy: Math.round(accuracy)
      };
    } else if (accuracy <= 100) {
      return {
        status: 'fair',
        message: 'Fair location accuracy',
        accuracy: Math.round(accuracy)
      };
    } else {
      return {
        status: 'poor',
        message: 'Poor location accuracy',
        accuracy: Math.round(accuracy)
      };
    }
  }

  /**
   * Initialize location service
   */
  static async initialize() {
    try {
      const hasPermission = await this.requestLocationPermission();
      if (hasPermission) {
        await this.getCurrentLocation();
      }
      return hasPermission;
    } catch (error) {
      console.warn('Error initializing location service:', error);
      return false;
    }
  }
}

export default LocationService;
