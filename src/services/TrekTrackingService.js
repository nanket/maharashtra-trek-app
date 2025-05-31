import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

const LOCATION_TASK_NAME = 'background-location-task';
const TRACKING_STORAGE_KEY = '@trek_tracking_data';

class TrekTrackingService {
  static isTracking = false;
  static currentTrek = null;
  static trackingData = {
    startTime: null,
    endTime: null,
    totalDistance: 0,
    elevationGain: 0,
    elevationLoss: 0,
    maxElevation: 0,
    minElevation: 0,
    averageSpeed: 0,
    maxSpeed: 0,
    waypoints: [],
    restStops: [],
    photos: [],
  };

  // Start trek tracking
  static async startTracking(trek) {
    try {
      // Request location permissions
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Location permission denied');
      }

      const backgroundStatus = await Location.requestBackgroundPermissionsAsync();
      if (backgroundStatus.status !== 'granted') {
        Alert.alert(
          'Background Location',
          'Background location access is recommended for continuous tracking during your trek.',
          [{ text: 'OK' }]
        );
      }

      // Initialize tracking data
      this.currentTrek = trek;
      this.trackingData = {
        trekId: trek.id,
        trekName: trek.name,
        startTime: new Date().toISOString(),
        endTime: null,
        totalDistance: 0,
        elevationGain: 0,
        elevationLoss: 0,
        maxElevation: 0,
        minElevation: 0,
        averageSpeed: 0,
        maxSpeed: 0,
        waypoints: [],
        restStops: [],
        photos: [],
        checkpoints: [],
      };

      // Get initial location
      const initialLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const initialWaypoint = {
        id: Date.now(),
        latitude: initialLocation.coords.latitude,
        longitude: initialLocation.coords.longitude,
        altitude: initialLocation.coords.altitude || 0,
        timestamp: new Date().toISOString(),
        speed: initialLocation.coords.speed || 0,
        accuracy: initialLocation.coords.accuracy,
        type: 'start',
      };

      this.trackingData.waypoints.push(initialWaypoint);
      this.trackingData.maxElevation = initialWaypoint.altitude;
      this.trackingData.minElevation = initialWaypoint.altitude;

      // Start location tracking
      await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
        accuracy: Location.Accuracy.High,
        timeInterval: 5000, // Update every 5 seconds
        distanceInterval: 10, // Update every 10 meters
        deferredUpdatesInterval: 10000,
        foregroundService: {
          notificationTitle: 'Trek Tracking Active',
          notificationBody: `Tracking your ${trek.name} trek`,
          notificationColor: '#2196F3',
        },
      });

      this.isTracking = true;
      await this.saveTrackingData();

      return {
        success: true,
        message: 'Trek tracking started successfully',
        initialLocation: initialWaypoint,
      };
    } catch (error) {
      console.error('Error starting trek tracking:', error);
      throw error;
    }
  }

  // Stop trek tracking
  static async stopTracking() {
    try {
      if (!this.isTracking) {
        throw new Error('Tracking is not active');
      }

      // Stop location updates
      await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);

      // Add final waypoint
      const finalLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const finalWaypoint = {
        id: Date.now(),
        latitude: finalLocation.coords.latitude,
        longitude: finalLocation.coords.longitude,
        altitude: finalLocation.coords.altitude || 0,
        timestamp: new Date().toISOString(),
        speed: finalLocation.coords.speed || 0,
        accuracy: finalLocation.coords.accuracy,
        type: 'end',
      };

      this.trackingData.waypoints.push(finalWaypoint);
      this.trackingData.endTime = new Date().toISOString();

      // Calculate final statistics
      this.calculateTrekStatistics();

      // Save completed trek data
      await this.saveCompletedTrek();

      this.isTracking = false;
      this.currentTrek = null;

      return {
        success: true,
        message: 'Trek tracking completed',
        trekData: { ...this.trackingData },
      };
    } catch (error) {
      console.error('Error stopping trek tracking:', error);
      throw error;
    }
  }

  // Add rest stop
  static async addRestStop(notes = '') {
    try {
      if (!this.isTracking) {
        throw new Error('Tracking is not active');
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const restStop = {
        id: Date.now(),
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        altitude: location.coords.altitude || 0,
        timestamp: new Date().toISOString(),
        notes,
        duration: 0, // Will be calculated when rest ends
      };

      this.trackingData.restStops.push(restStop);
      await this.saveTrackingData();

      return restStop;
    } catch (error) {
      console.error('Error adding rest stop:', error);
      throw error;
    }
  }

  // Add checkpoint
  static async addCheckpoint(name, type = 'waypoint') {
    try {
      if (!this.isTracking) {
        throw new Error('Tracking is not active');
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const checkpoint = {
        id: Date.now(),
        name,
        type, // waypoint, summit, viewpoint, danger, water
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        altitude: location.coords.altitude || 0,
        timestamp: new Date().toISOString(),
      };

      this.trackingData.checkpoints.push(checkpoint);
      await this.saveTrackingData();

      return checkpoint;
    } catch (error) {
      console.error('Error adding checkpoint:', error);
      throw error;
    }
  }

  // Calculate trek statistics
  static calculateTrekStatistics() {
    const waypoints = this.trackingData.waypoints;
    if (waypoints.length < 2) return;

    let totalDistance = 0;
    let elevationGain = 0;
    let elevationLoss = 0;
    let maxElevation = waypoints[0].altitude;
    let minElevation = waypoints[0].altitude;
    let totalSpeed = 0;
    let maxSpeed = 0;

    for (let i = 1; i < waypoints.length; i++) {
      const prev = waypoints[i - 1];
      const curr = waypoints[i];

      // Calculate distance using Haversine formula
      const distance = this.calculateDistance(
        prev.latitude,
        prev.longitude,
        curr.latitude,
        curr.longitude
      );
      totalDistance += distance;

      // Calculate elevation changes
      const elevationChange = curr.altitude - prev.altitude;
      if (elevationChange > 0) {
        elevationGain += elevationChange;
      } else {
        elevationLoss += Math.abs(elevationChange);
      }

      // Track elevation extremes
      maxElevation = Math.max(maxElevation, curr.altitude);
      minElevation = Math.min(minElevation, curr.altitude);

      // Track speed
      if (curr.speed) {
        totalSpeed += curr.speed;
        maxSpeed = Math.max(maxSpeed, curr.speed);
      }
    }

    // Calculate average speed
    const averageSpeed = totalSpeed / (waypoints.length - 1);

    // Calculate total time
    const startTime = new Date(this.trackingData.startTime);
    const endTime = new Date(this.trackingData.endTime || new Date());
    const totalTimeMs = endTime - startTime;
    const totalTimeHours = totalTimeMs / (1000 * 60 * 60);

    this.trackingData.totalDistance = totalDistance;
    this.trackingData.elevationGain = elevationGain;
    this.trackingData.elevationLoss = elevationLoss;
    this.trackingData.maxElevation = maxElevation;
    this.trackingData.minElevation = minElevation;
    this.trackingData.averageSpeed = averageSpeed;
    this.trackingData.maxSpeed = maxSpeed;
    this.trackingData.totalTime = totalTimeHours;
  }

  // Calculate distance between two points (Haversine formula)
  static calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371000; // Earth's radius in meters
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) *
        Math.cos(this.toRadians(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  static toRadians(degrees) {
    return degrees * (Math.PI / 180);
  }

  // Save current tracking data
  static async saveTrackingData() {
    try {
      await AsyncStorage.setItem(TRACKING_STORAGE_KEY, JSON.stringify(this.trackingData));
    } catch (error) {
      console.error('Error saving tracking data:', error);
    }
  }

  // Load tracking data
  static async loadTrackingData() {
    try {
      const data = await AsyncStorage.getItem(TRACKING_STORAGE_KEY);
      if (data) {
        this.trackingData = JSON.parse(data);
        return this.trackingData;
      }
    } catch (error) {
      console.error('Error loading tracking data:', error);
    }
    return null;
  }

  // Save completed trek
  static async saveCompletedTrek() {
    try {
      const completedTreks = await AsyncStorage.getItem('@completed_treks');
      const treks = completedTreks ? JSON.parse(completedTreks) : [];
      
      treks.unshift({ ...this.trackingData }); // Add to beginning
      
      // Keep only last 100 treks
      if (treks.length > 100) {
        treks.splice(100);
      }

      await AsyncStorage.setItem('@completed_treks', JSON.stringify(treks));
    } catch (error) {
      console.error('Error saving completed trek:', error);
    }
  }

  // Get completed treks
  static async getCompletedTreks() {
    try {
      const data = await AsyncStorage.getItem('@completed_treks');
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting completed treks:', error);
      return [];
    }
  }

  // Get current tracking status
  static getTrackingStatus() {
    return {
      isTracking: this.isTracking,
      currentTrek: this.currentTrek,
      trackingData: { ...this.trackingData },
    };
  }

  // Check if user is off route (simplified)
  static checkRouteDeviation(currentLocation, plannedRoute, threshold = 100) {
    if (!plannedRoute || plannedRoute.length === 0) return false;

    // Find closest point on planned route
    let minDistance = Infinity;
    for (const point of plannedRoute) {
      const distance = this.calculateDistance(
        currentLocation.latitude,
        currentLocation.longitude,
        point.latitude,
        point.longitude
      );
      minDistance = Math.min(minDistance, distance);
    }

    return minDistance > threshold; // Return true if more than threshold meters off route
  }
}

// Background location task
TaskManager.defineTask(LOCATION_TASK_NAME, ({ data, error }) => {
  if (error) {
    console.error('Background location task error:', error);
    return;
  }

  if (data) {
    const { locations } = data;
    const location = locations[0];

    if (location && TrekTrackingService.isTracking) {
      const waypoint = {
        id: Date.now(),
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        altitude: location.coords.altitude || 0,
        timestamp: new Date().toISOString(),
        speed: location.coords.speed || 0,
        accuracy: location.coords.accuracy,
        type: 'tracking',
      };

      TrekTrackingService.trackingData.waypoints.push(waypoint);
      
      // Update elevation extremes
      if (waypoint.altitude > TrekTrackingService.trackingData.maxElevation) {
        TrekTrackingService.trackingData.maxElevation = waypoint.altitude;
      }
      if (waypoint.altitude < TrekTrackingService.trackingData.minElevation) {
        TrekTrackingService.trackingData.minElevation = waypoint.altitude;
      }

      // Save updated data
      TrekTrackingService.saveTrackingData();
    }
  }
});

export default TrekTrackingService;
