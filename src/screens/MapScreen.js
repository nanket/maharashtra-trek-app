import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  Alert,
  Linking,
  Switch,
  ScrollView,
} from 'react-native';
import MapView from '../components/MapView';
import MapboxMapView from '../components/MapboxMapView';
import LocationDetailsModal from '../components/LocationDetailsModal';
import OfflineMapManager from '../components/OfflineMapManager';
import MapboxOfflineManager from '../components/MapboxOfflineManager';
import OfflineMapService from '../services/OfflineMapService';
import LocalDataService from '../services/LocalDataService';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../utils/constants';
// Map configuration
const MAP_CONFIG = {
  defaultRegion: {
    latitude: 18.5204,
    longitude: 73.8567,
    latitudeDelta: 2.0,
    longitudeDelta: 2.0,
  },
  mapTypes: ['standard', 'satellite', 'hybrid', 'terrain'],
};

const MapScreen = ({ navigation }) => {
  const allData = LocalDataService.getAllData();
  const [locations] = useState(allData);
  const [filteredLocations, setFilteredLocations] = useState(allData);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [offlineModalVisible, setOfflineModalVisible] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [mapType, setMapType] = useState('standard');
  const [useMapbox, setUseMapbox] = useState(false);
  const [offlineService, setOfflineService] = useState(null);
  const [isOfflineMode, setIsOfflineMode] = useState(false);

  // Initialize offline service
  useEffect(() => {
    const initOfflineService = async () => {
      try {
        const service = OfflineMapService.getInstance();
        await service.initialize();
        setOfflineService(service);

        // Check if we have offline regions
        const regions = await service.loadDownloadedRegions();
        setIsOfflineMode(regions.length > 0);
      } catch (error) {
        console.warn('Error initializing offline service:', error);
        // Don't fail, just continue without offline service
        setOfflineService(null);
        setIsOfflineMode(false);
      }
    };

    initOfflineService();
  }, []);

  // Filter locations based on search and category
  useEffect(() => {
    let filtered = locations;

    // Filter by category
    if (activeFilter !== 'all') {
      filtered = filtered.filter(location => location.category === activeFilter);
    }

    // Filter by search text
    if (searchText.trim()) {
      filtered = filtered.filter(location =>
        location.name.toLowerCase().includes(searchText.toLowerCase()) ||
        location.location.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    setFilteredLocations(filtered);
  }, [searchText, activeFilter, locations]);

  const handleLocationPress = (location) => {
    setSelectedLocation(location);
    setModalVisible(true);
  };

  const handleNavigate = (location) => {
    const { latitude, longitude } = location.coordinates;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;

    Linking.canOpenURL(url)
      .then(supported => {
        if (supported) {
          Linking.openURL(url);
        } else {
          Alert.alert('Error', 'Unable to open navigation app');
        }
      })
      .catch(err => {
        console.error('Navigation error:', err);
        Alert.alert('Error', 'Unable to open navigation app');
      });
  };

  const handleViewDetails = (location) => {
    navigation.navigate('TrekDetails', { trek: location });
  };

  const toggleMapType = () => {
    const types = MAP_CONFIG.mapTypes;
    const currentIndex = types.indexOf(mapType);
    const nextIndex = (currentIndex + 1) % types.length;
    setMapType(types[nextIndex]);
  };

  const getTypeName = () => {
    const typeNames = {
      standard: 'Standard',
      satellite: 'Satellite',
      hybrid: 'Hybrid',
      terrain: 'Terrain',
    };
    return typeNames[mapType] || 'Standard';
  };

  const renderFilterButton = (filter, label, icon) => (
    <TouchableOpacity
      key={filter}
      style={[
        styles.filterButton,
        activeFilter === filter && styles.activeFilterButton,
      ]}
      onPress={() => setActiveFilter(filter)}
    >
      <Text style={[
        styles.filterIcon,
        activeFilter === filter && styles.activeFilterIcon,
      ]}>
        {icon}
      </Text>
      <Text style={[
        styles.filterText,
        activeFilter === filter && styles.activeFilterText,
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Explore Maharashtra</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={styles.offlineButton}
            onPress={() => setOfflineModalVisible(true)}
          >
            <Text style={styles.offlineButtonText}>
              {isOfflineMode ? '📱 Offline' : '📱 Download'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.mapToggleButton} onPress={() => setUseMapbox(!useMapbox)}>
            <Text style={styles.mapToggleText}>
              {useMapbox ? 'Mapbox' : 'Google'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.styleButton} onPress={toggleMapType}>
            <Text style={styles.styleButtonText}>{getTypeName()}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search locations..."
            placeholderTextColor={COLORS.textSecondary}
            value={searchText}
            onChangeText={setSearchText}
            returnKeyType="search"
            blurOnSubmit={false}
          />
          {searchText.length > 0 && (
            <TouchableOpacity onPress={() => setSearchText('')}>
              <Text style={styles.clearIcon}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Filter Buttons */}
      <View style={styles.filtersContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersScrollContent}
        >
          {renderFilterButton('all', 'All', '🗺️')}
          {renderFilterButton('fort', 'Forts', '🏰')}
          {renderFilterButton('waterfall', 'Waterfalls', '💧')}
          {renderFilterButton('trek', 'Treks', '⛰️')}
          {renderFilterButton('cave', 'Caves', '🕳️')}
        </ScrollView>
      </View>

      {/* Map */}
      <View style={styles.mapContainer}>
        {useMapbox ? (
          <MapboxMapView
            locations={filteredLocations}
            selectedLocation={selectedLocation}
            onLocationPress={handleLocationPress}
            showUserLocation={true}
            initialCenter={MAP_CONFIG.defaultRegion}
          />
        ) : (
          <MapView
            locations={filteredLocations}
            selectedLocation={selectedLocation}
            onLocationPress={handleLocationPress}
            mapType={mapType}
            showUserLocation={true}
            initialCenter={MAP_CONFIG.defaultRegion}
          />
        )}
      </View>

      {/* Results Count */}
      <View style={styles.resultsContainer}>
        <Text style={styles.resultsText}>
          {filteredLocations.length} location{filteredLocations.length !== 1 ? 's' : ''} found
        </Text>
      </View>

      {/* Location Details Modal */}
      <LocationDetailsModal
        visible={modalVisible}
        location={selectedLocation}
        onClose={() => setModalVisible(false)}
        onNavigate={handleNavigate}
        onViewDetails={handleViewDetails}
      />

      {/* Offline Map Manager */}
      {useMapbox ? (
        <MapboxOfflineManager
          visible={offlineModalVisible}
          onClose={() => setOfflineModalVisible(false)}
        />
      ) : (
        <OfflineMapManager
          visible={offlineModalVisible}
          onClose={() => setOfflineModalVisible(false)}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.background,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.backgroundSecondary,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.text,
  },
  headerButtons: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  offlineButton: {
    backgroundColor: COLORS.backgroundCard,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.primary,
    ...SHADOWS.small,
  },
  offlineButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },
  mapToggleButton: {
    backgroundColor: COLORS.backgroundCard,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.success,
    ...SHADOWS.small,
  },
  mapToggleText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.success,
  },
  styleButton: {
    backgroundColor: COLORS.backgroundCard,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    ...SHADOWS.small,
  },
  styleButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },
  searchContainer: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundCard,
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    ...SHADOWS.small,
  },
  searchIcon: {
    fontSize: 18,
    marginRight: SPACING.md,
    color: COLORS.textSecondary,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: COLORS.text,
    fontWeight: '500',
  },
  clearIcon: {
    fontSize: 16,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  filtersContainer: {
    paddingBottom: SPACING.md,
  },
  filtersScrollContent: {
    paddingHorizontal: SPACING.lg,
    gap: SPACING.sm,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundCard,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.backgroundSecondary,
    marginRight: SPACING.sm,
  },
  activeFilterButton: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterIcon: {
    fontSize: 16,
    marginRight: SPACING.xs,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  activeFilterIcon: {
    color: COLORS.textInverse,
  },
  activeFilterText: {
    color: COLORS.textInverse,
  },
  mapContainer: {
    flex: 1,
    margin: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    ...SHADOWS.medium,
  },
  resultsContainer: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.backgroundCard,
    borderTopWidth: 1,
    borderTopColor: COLORS.backgroundSecondary,
  },
  resultsText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '500',
    textAlign: 'center',
  },
});

export default MapScreen;
