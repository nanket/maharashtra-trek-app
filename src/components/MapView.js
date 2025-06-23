import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  Alert,
  Platform,
} from 'react-native';
import RNMapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { LOCATION_CATEGORIES } from '../config/mapbox';
import { COLORS, SHADOWS } from '../utils/constants';

const MapView = (props = {}) => {
  const {
    locations = [],
    selectedLocation = null,
    onLocationPress = () => {},
    onMapPress = () => {},
    showUserLocation = true,
    style = {},
    initialCenter = { latitude: 18.5204, longitude: 73.8567 }, // Pune, Maharashtra
    initialZoom = 10,
    mapType = 'standard',
  } = props;
  const mapRef = useRef(null);
  const [userLocation, setUserLocation] = useState(null);
  const [locationPermission, setLocationPermission] = useState(false);
  const [region, setRegion] = useState({
    latitude: initialCenter.latitude,
    longitude: initialCenter.longitude,
    latitudeDelta: 0.5,
    longitudeDelta: 0.5,
  });

  // Request location permissions
  useEffect(() => {
    requestLocationPermission();
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
          'Location permission is required to show your current position on the map.',
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
        accuracy: Location.Accuracy.Balanced,
      });
      setUserLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
    } catch (error) {
      console.warn('Error getting current location:', error);
    }
  };

  // Animate to location
  const animateToLocation = (coordinates, zoom = 0.01) => {
    if (mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: coordinates.latitude,
        longitude: coordinates.longitude,
        latitudeDelta: zoom,
        longitudeDelta: zoom,
      }, 1000);
    }
  };

  // Handle location marker press
  const handleMarkerPress = (location) => {
    onLocationPress(location);
    animateToLocation(location.coordinates);
  };

  // Create marker for location
  const renderLocationMarker = (location, index) => {
    // Validate location data
    if (!location || !location.coordinates ||
        typeof location.coordinates.latitude !== 'number' ||
        typeof location.coordinates.longitude !== 'number') {
      console.warn('Invalid location data:', location);
      return null;
    }

    const category = LOCATION_CATEGORIES[location.category] || LOCATION_CATEGORIES.trek;
    const isSelected = selectedLocation?.id === location.id;
    // Create unique key combining category, id, and index to prevent duplicates
    const uniqueKey = `${location.category || 'unknown'}-${location.id || index}-${index}`;

    return (
      <Marker
        key={uniqueKey}
        coordinate={{
          latitude: location.coordinates.latitude,
          longitude: location.coordinates.longitude,
        }}
        onPress={() => handleMarkerPress(location)}
        title={location.name || 'Unknown Location'}
        description={location.location || 'No description'}
      >
        <View style={[
          styles.markerContainer,
          { backgroundColor: category.color },
          isSelected && styles.selectedMarker,
        ]}>
          <View style={styles.markerInner}>
            <View style={[styles.markerDot, { backgroundColor: category.color }]} />
          </View>
        </View>
      </Marker>
    );
  };

  return (
    <View style={[styles.container, style]}>
      <RNMapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        mapType={mapType}
        region={region}
        onRegionChangeComplete={setRegion}
        onPress={onMapPress}
        showsUserLocation={showUserLocation && locationPermission}
        showsMyLocationButton={true}
        showsCompass={true}
        showsScale={true}
        loadingEnabled={true}
        loadingIndicatorColor={COLORS.primary}
        loadingBackgroundColor={COLORS.background}
      >
        {/* Render location markers */}
        {Array.isArray(locations) && locations
          .filter(location => location && location.coordinates)
          .map((location, index) => renderLocationMarker(location, index))
          .filter(marker => marker !== null)}
      </RNMapView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  markerContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: COLORS.background,
    ...SHADOWS.medium,
  },
  selectedMarker: {
    transform: [{ scale: 1.3 }],
    borderColor: COLORS.primary,
    borderWidth: 4,
  },
  markerInner: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  markerDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
});

export default MapView;
