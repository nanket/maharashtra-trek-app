import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  Alert,
  Platform,
  Text,
  TouchableOpacity,
} from 'react-native';
import * as Location from 'expo-location';
import { MAPBOX_CONFIG, LOCATION_CATEGORIES } from '../config/mapbox';
import { COLORS, SHADOWS } from '../utils/constants';

// Category-specific icons for map markers
const getCategoryIcon = (category) => {
  const icons = {
    fort: '🏰',      // Fort/Castle icon
    waterfall: '💧', // Waterfall icon
    trek: '🥾',      // Hiking boot icon
    cave: '🕳️',      // Cave icon
  };
  return icons[category] || '📍'; // Default location pin
};

// Safely import Mapbox with error handling
let Mapbox = null;
let isMapboxAvailable = false;

try {
  Mapbox = require('@rnmapbox/maps').default;
  if (Mapbox && Mapbox.setAccessToken) {
    Mapbox.setAccessToken(MAPBOX_CONFIG.accessToken);
    isMapboxAvailable = true;
  }
} catch (error) {
  console.warn('Mapbox not available in this environment:', error.message);
  isMapboxAvailable = false;
}

const MapboxMapView = ({
  locations = [],
  selectedLocation = null,
  onLocationPress = () => {},
  onMapPress = () => {},
  showUserLocation = true,
  style = {},
  initialCenter = { latitude: 18.5204, longitude: 73.8567 }, // Pune, Maharashtra
  initialZoom = 10,
  mapStyle = MAPBOX_CONFIG.defaultStyle,
  offlineRegions = [],
}) => {
  const mapRef = useRef(null);
  const cameraRef = useRef(null);
  const [userLocation, setUserLocation] = useState(null);
  const [locationPermission, setLocationPermission] = useState(false);
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [downloadedRegions, setDownloadedRegions] = useState(offlineRegions);

  // Request location permissions
  useEffect(() => {
    requestLocationPermission();
    if (isMapboxAvailable) {
      checkOfflineRegions();
    }
  }, []);

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        setLocationPermission(true);
        getCurrentLocation();
      } else {
        Alert.alert(
          'Location Permission',
          'Location permission is required to show your position on the map.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.warn('Error requesting location permission:', error);
    }
  };

  const getCurrentLocation = async () => {
    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      setUserLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
    } catch (error) {
      console.warn('Error getting current location:', error);
    }
  };

  const checkOfflineRegions = async () => {
    try {
      if (!isMapboxAvailable || !Mapbox?.offlineManager) {
        return;
      }
      const regions = await Mapbox.offlineManager.getPacks();
      setDownloadedRegions(regions || []);
      setIsOfflineMode(regions && regions.length > 0);
    } catch (error) {
      console.warn('Error checking offline regions:', error);
    }
  };

  const handleMarkerPress = (location) => {
    onLocationPress(location);
    // Center map on selected location
    if (cameraRef.current) {
      cameraRef.current.setCamera({
        centerCoordinate: [location.coordinates.longitude, location.coordinates.latitude],
        zoomLevel: 14,
        animationDuration: 1000,
      });
    }
  };

  const handleMapPress = (feature) => {
    onMapPress(feature);
  };

  // Create marker for location
  const renderLocationMarker = (location, index) => {
    const category = LOCATION_CATEGORIES[location.category] || LOCATION_CATEGORIES.trek;
    const isSelected = selectedLocation?.id === location.id;
    const categoryIcon = getCategoryIcon(location.category);

    // Create unique key and id combining category, id, and index to prevent duplicates
    const uniqueKey = `${location.category}-${location.id}-${index}`;
    const uniqueId = `marker-${location.category}-${location.id}-${index}`;

    return (
      <Mapbox.PointAnnotation
        key={uniqueKey}
        id={uniqueId}
        coordinate={[location.coordinates.longitude, location.coordinates.latitude]}
        onSelected={() => handleMarkerPress(location)}
      >
        <View style={[
          styles.markerContainer,
          { backgroundColor: category.color },
          isSelected && styles.selectedMarker,
        ]}>
          {isSelected && (
            <View style={[
              styles.selectionRing,
              { borderColor: category.color }
            ]} />
          )}
          <Text style={[
            styles.markerIcon,
            isSelected && styles.selectedMarkerIcon
          ]}>
            {categoryIcon}
          </Text>
        </View>

        <Mapbox.Callout title={location.name} />
      </Mapbox.PointAnnotation>
    );
  };

  // Render offline status indicator
  const renderOfflineStatus = () => {
    if (!isOfflineMode) return null;

    return (
      <View style={styles.offlineIndicator}>
        <View style={styles.offlineDot} />
        <Text style={styles.offlineText}>Offline Mode</Text>
      </View>
    );
  };

  // Render fallback when Mapbox is not available
  if (!isMapboxAvailable || !Mapbox) {
    return (
      <View style={[styles.container, style]}>
        <View style={styles.fallbackContainer}>
          <Text style={styles.fallbackTitle}>📱 Development Build Required</Text>
          <Text style={styles.fallbackText}>
            Mapbox offline maps require a development build.{'\n\n'}
            Run: expo run:android or expo run:ios{'\n\n'}
            Currently using Google Maps fallback.
          </Text>
          <TouchableOpacity
            style={styles.fallbackButton}
            onPress={() => Alert.alert(
              'Mapbox Offline Maps',
              'To use Mapbox offline maps:\n\n1. Create a development build:\n   expo run:android\n   expo run:ios\n\n2. Install on device/simulator\n3. Toggle to Mapbox provider\n\nCurrently using Google Maps as fallback.',
              [{ text: 'OK' }]
            )}
          >
            <Text style={styles.fallbackButtonText}>Learn More</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      <Mapbox.MapView
        ref={mapRef}
        style={styles.map}
        styleURL={mapStyle}
        onPress={handleMapPress}
        compassEnabled={true}
        scaleBarEnabled={true}
        attributionEnabled={false}
        logoEnabled={false}
      >
        <Mapbox.Camera
          ref={cameraRef}
          centerCoordinate={[initialCenter.longitude, initialCenter.latitude]}
          zoomLevel={initialZoom}
          animationMode="flyTo"
          animationDuration={1000}
        />

        {/* User Location */}
        {showUserLocation && locationPermission && (
          <Mapbox.UserLocation
            visible={true}
            showsUserHeadingIndicator={true}
            minDisplacement={10}
          />
        )}

        {/* Location markers */}
        {locations.map((location, index) => renderLocationMarker(location, index))}
      </Mapbox.MapView>

      {/* Offline Status */}
      {renderOfflineStatus()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  map: {
    flex: 1,
  },
  markerContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: COLORS.background,
    ...SHADOWS.medium,
  },
  selectedMarker: {
    transform: [{ scale: 1.3 }],
    backgroundColor: COLORS.white,
    borderColor: COLORS.white,
    borderWidth: 3,
    shadowColor: COLORS.text,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 15,
  },
  selectionRing: {
    position: 'absolute',
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 3,
    top: -8,
    left: -8,
    backgroundColor: 'transparent',
  },
  markerIcon: {
    fontSize: 20,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  selectedMarkerIcon: {
    fontSize: 24,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  offlineIndicator: {
    position: 'absolute',
    top: 50,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.success,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    ...SHADOWS.small,
  },
  offlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.white,
    marginRight: 6,
  },
  offlineText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '600',
  },
  fallbackContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: COLORS.backgroundSecondary,
  },
  fallbackTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 16,
  },
  fallbackText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  fallbackButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    ...SHADOWS.small,
  },
  fallbackButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '600',
  },
});

export default MapboxMapView;
