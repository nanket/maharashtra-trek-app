import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import LocationService from '../services/LocationService';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS, IMAGES, createTextStyle } from '../utils/constants';

const { width } = Dimensions.get('window');

// Cache for nearby treks to avoid repeated calculations
let nearbyTreksCache = {
  data: null,
  locationStatus: null,
  userLocationName: null,
  timestamp: null,
  treksHash: null,
  locationHash: null,
};

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * NearbyTreks Component
 *
 * Features:
 * - Shows treks near user's current location
 * - Displays distance from user location
 * - Handles location permissions gracefully
 * - Provides fallback when location is unavailable
 * - Refreshable content
 * - Caches results to avoid repeated API calls
 */
const NearbyTreks = ({ treks = [], navigation, maxDistance = 100, limit = 6 }) => {
  const [nearbyTreks, setNearbyTreks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [locationStatus, setLocationStatus] = useState({ available: false, message: 'Getting location...' });
  const [userLocationName, setUserLocationName] = useState('Your Location');
  const initializationRef = useRef(false);

  useEffect(() => {
    if (!initializationRef.current) {
      initializationRef.current = true;
      initializeLocation();
    }
  }, []);

  // Check if treks data changed and invalidate cache if needed
  useEffect(() => {
    const treksHash = JSON.stringify(treks.map(t => ({ id: t.id, coordinates: t.coordinates })));
    if (nearbyTreksCache.treksHash && nearbyTreksCache.treksHash !== treksHash) {
      console.log('📍 NearbyTreks: Treks data changed, invalidating cache');
      nearbyTreksCache = { data: null, locationStatus: null, userLocationName: null, timestamp: null, treksHash: null, locationHash: null };
      initializeLocation();
    }
  }, [treks]);

  const initializeLocation = async (forceRefresh = false) => {
    setLoading(true);

    try {
      // Create hashes for cache validation
      const treksHash = JSON.stringify(treks.map(t => ({ id: t.id, coordinates: t.coordinates })));
      const locationHash = LocationService.userLocation ?
        JSON.stringify({ lat: LocationService.userLocation.latitude, lng: LocationService.userLocation.longitude, isReal: LocationService.userLocation.isReal }) :
        null;

      // Check if we can use cached data
      if (!forceRefresh && nearbyTreksCache.data && nearbyTreksCache.timestamp) {
        const cacheAge = Date.now() - nearbyTreksCache.timestamp;
        const isCacheValid = cacheAge < CACHE_DURATION &&
                           nearbyTreksCache.treksHash === treksHash &&
                           nearbyTreksCache.locationHash === locationHash;

        if (isCacheValid) {
          console.log('📍 NearbyTreks: Using cached data');
          setNearbyTreks(nearbyTreksCache.data);
          setLocationStatus(nearbyTreksCache.locationStatus);
          setUserLocationName(nearbyTreksCache.userLocationName);
          setLoading(false);
          return;
        }
      }

      console.log('📍 NearbyTreks: Fetching fresh data');

      // Initialize location service
      const hasPermission = await LocationService.initialize();

      if (hasPermission) {
        // Get user location name
        const locationName = await LocationService.getCurrentLocationName();
        setUserLocationName(locationName);

        // Find nearby treks
        const nearby = LocationService.findNearbyTreks(treks, maxDistance, limit);
        setNearbyTreks(nearby);

        // Check if distances are calculated from real or fallback location
        const isUsingFallback = LocationService.userLocation && !LocationService.userLocation.isReal;
        const statusMessage = isUsingFallback
          ? `Found ${nearby.length} treks (distances from Pune area)`
          : `Found ${nearby.length} treks near you`;

        const newLocationStatus = {
          available: true,
          message: statusMessage,
          isUsingFallback,
        };

        setLocationStatus(newLocationStatus);

        // Cache the results
        nearbyTreksCache = {
          data: nearby,
          locationStatus: newLocationStatus,
          userLocationName: locationName,
          timestamp: Date.now(),
          treksHash,
          locationHash: LocationService.userLocation ?
            JSON.stringify({ lat: LocationService.userLocation.latitude, lng: LocationService.userLocation.longitude, isReal: LocationService.userLocation.isReal }) :
            null,
        };
      } else {
        // No permission - show featured/popular treks instead
        const featuredTreks = treks
          .filter(trek => trek.featured || trek.rating >= 4.0)
          .sort((a, b) => (b.rating || 0) - (a.rating || 0))
          .slice(0, limit)
          .map(trek => ({ ...trek, distance: null, distanceText: null, showAsFeatured: true }));

        const newLocationStatus = {
          available: false,
          message: 'Enable location to see nearby treks',
          action: 'Enable Location',
        };

        setNearbyTreks(featuredTreks);
        setLocationStatus(newLocationStatus);

        // Cache the fallback results
        nearbyTreksCache = {
          data: featuredTreks,
          locationStatus: newLocationStatus,
          userLocationName: 'Your Location',
          timestamp: Date.now(),
          treksHash,
          locationHash: null,
        };
      }
    } catch (error) {
      console.warn('Error initializing nearby treks:', error);
      setLocationStatus({
        available: false,
        message: 'Unable to get location',
        action: 'Retry',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLocationAction = () => {
    if (locationStatus.action === 'Enable Location') {
      Alert.alert(
        'Location Permission',
        'To show treks near you, please enable location permission in your device settings.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Retry', onPress: () => initializeLocation(true) },
        ]
      );
    } else if (locationStatus.action === 'Retry') {
      initializeLocation(true);
    }
  };

  const handleTrekPress = (trek) => {
    navigation.navigate('TrekDetails', { trek });
  };

  const handleViewAllNearby = () => {
    // Navigate to trek list with location filter and nearby treks data
    navigation.navigate('TrekList', {
      category: 'nearby',
      userLocation: LocationService.userLocation,
      title: `Near ${userLocationName}`,
      nearbyTreks: nearbyTreks,
      maxDistance: maxDistance,
      allTreks: treks
    });
  };

  const getImageSource = (trek) => {
    if (trek.imageKey && IMAGES[trek.imageKey]) {
      return IMAGES[trek.imageKey];
    }
    return IMAGES.defaultImage;
  };

  const renderTrekCard = ({ item: trek }) => (
    <TouchableOpacity
      style={styles.trekCard}
      onPress={() => handleTrekPress(trek)}
      activeOpacity={0.8}
    >
      <Image
        source={getImageSource(trek)}
        style={styles.trekImage}
        resizeMode="cover"
      />
      <View style={styles.trekContent}>
        <View style={styles.trekHeader}>
          <Text style={styles.trekName} numberOfLines={2}>
            {trek.name}
          </Text>
          {/* Only show distance container if we have distance data */}
          {trek.distanceText && (
            <View style={styles.distanceContainer}>
              <Text style={styles.distanceText}>
                {trek.distanceText}
              </Text>
            </View>
          )}
          {/* Show rating for featured treks when no location */}
          {trek.showAsFeatured && (
            <View style={styles.ratingContainer}>
              <Text style={styles.ratingText}>⭐ {trek.rating}</Text>
            </View>
          )}
        </View>

        <Text style={styles.trekLocation} numberOfLines={1}>
          📍 {trek.location}
        </Text>

        <View style={styles.trekFooter}>
          <View style={styles.difficultyContainer}>
            <Text style={styles.difficultyText}>{trek.difficulty}</Text>
          </View>
          {trek.duration && (
            <Text style={styles.durationText}>{trek.duration}</Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <View style={styles.titleContainer}>
        <Text style={styles.sectionTitle}>
          {locationStatus.available ? `Near ${userLocationName}` : 'Featured Destinations'}
        </Text>
        <View style={styles.headerActions}>
          {locationStatus.available && nearbyTreks.length > 0 && (
            <TouchableOpacity onPress={handleViewAllNearby} style={styles.viewAllButton}>
              <Text style={styles.viewAllButtonText}>View All</Text>
            </TouchableOpacity>
          )}
          {/* Refresh location button for accurate distances */}
          {locationStatus.available && (
            <TouchableOpacity onPress={() => initializeLocation(true)} style={styles.refreshButton}>
              <Text style={styles.refreshButtonText}>📍</Text>
            </TouchableOpacity>
          )}
          {locationStatus.action && (
            <TouchableOpacity onPress={handleLocationAction} style={styles.actionButton}>
              <Text style={styles.actionButtonText}>{locationStatus.action}</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <Text style={styles.statusText}>{locationStatus.message}</Text>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>🗺️</Text>
      <Text style={styles.emptyTitle}>No nearby treks found</Text>
      <Text style={styles.emptySubtitle}>
        Try expanding your search radius or check your location settings
      </Text>
      <TouchableOpacity style={styles.retryButton} onPress={() => initializeLocation(true)}>
        <Text style={styles.retryButtonText}>Retry</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        {renderHeader()}
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Finding treks near you...</Text>
        </View>
      </View>
    );
  }

  if (nearbyTreks.length === 0) {
    return (
      <View style={styles.container}>
        {renderHeader()}
        {renderEmptyState()}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {renderHeader()}
      <FlatList
        data={nearbyTreks}
        renderItem={renderTrekCard}
        keyExtractor={(item) => item.id.toString()}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.treksList}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.xl,
  },
  headerContainer: {
    paddingHorizontal: SPACING.xl,
    marginBottom: SPACING.lg,
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  sectionTitle: {
    ...createTextStyle(18, 'bold'),
    color: COLORS.text,
    flex: 1,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  viewAllButton: {
    backgroundColor: COLORS.backgroundSecondary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
  },
  viewAllButtonText: {
    ...createTextStyle(12, 'medium'),
    color: COLORS.text,
  },
  actionButton: {
    backgroundColor: COLORS.primary + '15',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
  },
  actionButtonText: {
    ...createTextStyle(12, 'medium'),
    color: COLORS.primary,
  },
  refreshButton: {
    backgroundColor: COLORS.success + '15',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    minWidth: 36,
    alignItems: 'center',
  },
  refreshButtonText: {
    fontSize: 14,
  },
  statusText: {
    ...createTextStyle(12, 'regular'),
    color: COLORS.textSecondary,
  },
  treksList: {
    paddingLeft: SPACING.xl,
  },
  trekCard: {
    width: width * 0.7,
    marginRight: SPACING.lg,
    backgroundColor: COLORS.backgroundCard,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    ...SHADOWS.medium,
  },
  trekImage: {
    width: '100%',
    height: 120,
    backgroundColor: COLORS.backgroundSecondary,
  },
  trekContent: {
    padding: SPACING.lg,
  },
  trekHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  trekName: {
    ...createTextStyle(15, 'bold'),
    color: COLORS.text,
    flex: 1,
    marginRight: SPACING.sm,
    lineHeight: 20,
  },
  distanceContainer: {
    backgroundColor: COLORS.primary + '15',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
  },
  distanceText: {
    ...createTextStyle(11, 'medium'),
    color: COLORS.primary,
  },
  trekLocation: {
    ...createTextStyle(12, 'regular'),
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },
  trekFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  difficultyContainer: {
    backgroundColor: COLORS.success + '15',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
  },
  difficultyText: {
    ...createTextStyle(11, 'medium'),
    color: COLORS.success,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    ...createTextStyle(11, 'medium'),
    color: COLORS.text,
  },
  durationText: {
    ...createTextStyle(11, 'medium'),
    color: COLORS.textSecondary,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  loadingText: {
    ...createTextStyle(14, 'regular'),
    color: COLORS.textSecondary,
    marginTop: SPACING.md,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
    paddingHorizontal: SPACING.xl,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: SPACING.md,
  },
  emptyTitle: {
    ...createTextStyle(16, 'bold'),
    color: COLORS.text,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  emptySubtitle: {
    ...createTextStyle(14, 'regular'),
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: SPACING.lg,
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
  },
  retryButtonText: {
    ...createTextStyle(14, 'medium'),
    color: COLORS.textInverse,
  },
});

export default NearbyTreks;
