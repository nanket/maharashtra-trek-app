import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Dimensions,
  TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import TrekCard from '../components/TrekCard';
import { COLORS, CATEGORIES, CATEGORY_COLORS, SHADOWS, SPACING, BORDER_RADIUS, createTextStyle } from '../utils/constants';
import LocalDataService from '../services/LocalDataService';

const { width } = Dimensions.get('window');

const TrekListScreen = ({ navigation, route }) => {
  const { category, searchQuery, nearbyTreks, userLocation, maxDistance, allTreks, selectionMode } = route.params || {};
  const [filteredTreks, setFilteredTreks] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState(category || 'all');
  const [searchText, setSearchText] = useState(searchQuery || '');
  const [isSearchMode, setIsSearchMode] = useState(!!searchQuery);
  const searchInputRef = useRef(null);
  const searchTimeoutRef = useRef(null);

  // Store the original category to maintain context during filtering
  const originalCategory = useRef(category || 'all');

  // Initial data loading
  useEffect(() => {
    // Load initial data based on route params
    if (searchQuery) {
      // If we have a search query from navigation, perform search
      setIsSearchMode(true);
      performSearch(searchQuery);
    } else {
      // Otherwise, filter by selected category
      filterTreks(selectedFilter);
    }
  }, []); // Only run on mount

  useEffect(() => {
    if (searchText.trim().length >= 2) {
      // Auto-search when user types 2+ characters
      setIsSearchMode(true);
      debouncedSearch(searchText);
    } else if (searchText.trim().length === 0) {
      // Clear search when text is empty
      setIsSearchMode(false);
      filterTreks(selectedFilter);
    } else {
      // For single character, just filter normally without search mode
      filterTreks(selectedFilter);
    }
  }, [selectedFilter, searchText, debouncedSearch, filterTreks]);

  // Cleanup timeout on unmount - no dependencies to avoid re-renders
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  const performSearch = useCallback((query) => {
    if (!query || query.trim().length < 2) {
      setFilteredTreks([]);
      return;
    }

    console.log('🔍 Searching for:', query, 'in category:', selectedFilter);
    let searchResults = LocalDataService.searchData(query);

    // If we're in a specific category filter, filter results by that category
    if (selectedFilter !== 'all' && selectedFilter !== 'nearby') {
      // Check if it's a difficulty filter
      const difficultyMapping = {
        'beginner': ['Easy'],
        'intermediate': ['Moderate', 'Easy to Moderate'],
        'advanced': ['Difficult', 'Very difficult with rock climbing', 'Moderate to difficult']
      };

      if (difficultyMapping[selectedFilter]) {
        searchResults = searchResults.filter(trek =>
          difficultyMapping[selectedFilter].some(difficulty =>
            trek.difficulty && trek.difficulty.toLowerCase().includes(difficulty.toLowerCase())
          )
        );
      } else {
        // Category filter (fort, trek, waterfall, cave)
        searchResults = searchResults.filter(item => item.category === selectedFilter);
      }
    }

    console.log('🔍 Filtered search results:', searchResults.length, 'items found for category:', selectedFilter);
    console.log('📱 About to update filteredTreks state - this might cause re-render');
    setFilteredTreks(searchResults);
  }, [selectedFilter]);

  const debouncedSearch = useCallback((query) => {
    // Clear existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Set new timeout for debounced search
    searchTimeoutRef.current = setTimeout(() => {
      performSearch(query);
    }, 300); // 300ms delay
  }, [performSearch]);

  const filterTreks = useCallback((filter) => {
    // Handle nearby category specially
    if (filter === 'nearby') {
      if (nearbyTreks && nearbyTreks.length > 0) {
        // Use the passed nearby treks data
        setFilteredTreks(nearbyTreks);
      } else if (userLocation && allTreks) {
        // Calculate nearby treks if we have location and all treks data
        const LocationService = require('../services/LocationService').default;
        const nearby = LocationService.findNearbyTreks(allTreks, maxDistance || 100, 50); // Show more in list view
        setFilteredTreks(nearby);
      } else {
        // Fallback to featured treks if no location data
        const allData = LocalDataService.getAllData();
        const featuredTreks = allData
          .filter(trek => trek.featured || trek.rating >= 4.0)
          .sort((a, b) => (b.rating || 0) - (a.rating || 0))
          .map(trek => ({ ...trek, distance: null, distanceText: null, showAsFeatured: true }));
        setFilteredTreks(featuredTreks);
      }
      return;
    }

    // Get base data - either all data or category-specific data
    let baseData;
    if (originalCategory.current === 'all') {
      baseData = LocalDataService.getAllData();
    } else {
      // If we have an original category, always filter by that category first
      baseData = LocalDataService.getDataByCategory(originalCategory.current);
    }

    if (filter === 'all') {
      // When "All" is selected, show all data from the original category context
      setFilteredTreks(baseData);
    } else {
      // Map difficulty levels to filter criteria
      const difficultyMapping = {
        'beginner': ['Easy'],
        'intermediate': ['Moderate', 'Easy to Moderate'],
        'advanced': ['Difficult', 'Very difficult with rock climbing', 'Moderate to difficult']
      };

      if (difficultyMapping[filter]) {
        // Apply difficulty filter to the base category data
        const filteredByDifficulty = baseData.filter(trek =>
          difficultyMapping[filter].some(difficulty =>
            trek.difficulty.toLowerCase().includes(difficulty.toLowerCase())
          )
        );
        setFilteredTreks(filteredByDifficulty);
      } else {
        // This is a category filter - update the original category and filter accordingly
        originalCategory.current = filter;
        const categoryData = LocalDataService.getDataByCategory(filter);
        setFilteredTreks(categoryData);
      }
    }
  }, [nearbyTreks, userLocation, allTreks, maxDistance]);

  const handleTrekPress = useCallback((trek) => {
    if (selectionMode) {
      // In selection mode, navigate back to TrekPlanner with selected trek
      navigation.navigate('TrekPlanner', { selectedTrek: trek });
    } else {
      // Normal mode, navigate to trek details
      navigation.navigate('TrekDetails', { trek });
    }
  }, [navigation, selectionMode]);

  const handleFilterPress = (filter) => {
    setSelectedFilter(filter);
    setIsSearchMode(false);
    setSearchText('');
    // Let keyboard dismiss naturally when user switches filters
  };

  const handleSearchSubmit = () => {
    if (searchText.trim()) {
      setIsSearchMode(true);
      performSearch(searchText);
    }
  };

  const handleSearchClear = () => {
    setSearchText('');
    setIsSearchMode(false);
    filterTreks(selectedFilter);
    // Don't automatically focus - let user tap to search again naturally
  };

  // Memoized search text change handler to prevent unnecessary re-renders
  const handleSearchTextChange = useCallback((text) => {
    console.log('🔤 Search text changed:', text);
    setSearchText(text);
  }, []);

  // Removed focus/blur handlers to match HomeScreen's natural behavior
  // Search mode is now managed purely by text content and user actions

  const getScreenTitle = () => {
    if (selectionMode) {
      return '🎯 Select a Trek';
    }

    if (isSearchMode && searchText) {
      const categoryName = selectedFilter === 'fort' ? 'Forts' :
                          selectedFilter === 'trek' ? 'Treks' :
                          selectedFilter === 'waterfall' ? 'Waterfalls' :
                          selectedFilter === 'cave' ? 'Caves' : '';
      return `🔍 Search${categoryName ? ` in ${categoryName}` : ' Results'}`;
    }

    switch (selectedFilter) {
      case 'beginner':
        return '🌱 Beginner Treks';
      case 'intermediate':
        return '⛰️ Intermediate Treks';
      case 'advanced':
        return '🏔️ Advanced Treks';
      case CATEGORIES.FORT:
        return 'Forts';
      case CATEGORIES.WATERFALL:
        return 'Waterfalls';
      case CATEGORIES.TREK:
        return 'Treks';
      case CATEGORIES.CAVE:
        return 'Caves';
      default:
        return 'All Destinations';
    }
  };

  const searchPlaceholder = useMemo(() => {
    const placeholders = {
      'fort': 'Search forts (e.g., Raigad, Sinhagad)...',
      'trek': 'Search treks (e.g., Kalsubai, Andharban)...',
      'waterfall': 'Search waterfalls (e.g., Kune, Lingmala)...',
      'cave': 'Search caves (e.g., Bhaja, Karla)...',
      'all': 'Search treks, forts, waterfalls...'
    };

    return placeholders[selectedFilter] || placeholders['all'];
  }, [selectedFilter]);

  const getScreenSubtitle = () => {
    if (selectionMode) {
      return 'Tap on any trek to add it to your plan';
    }

    if (isSearchMode && searchText) {
      return `Results for "${searchText}"`;
    }

    switch (selectedFilter) {
      case 'nearby':
        return userLocation ?
          `Treks within ${maxDistance || 100}km of your location` :
          'Featured destinations (location not available)';
      case 'beginner':
        return 'Perfect for first-time trekkers';
      case 'intermediate':
        return 'For experienced adventurers';
      case 'advanced':
        return 'Challenge yourself with expert-level treks';
      default:
        return `${filteredTreks.length} destination${filteredTreks.length !== 1 ? 's' : ''} found`;
    }
  };

  const getFilters = () => {
    const baseFilters = [
      { id: 'all', label: 'All', icon: '🗺️', color: COLORS.primary, gradient: [COLORS.primary, COLORS.primaryLight] },
      { id: 'beginner', label: 'Beginner', icon: '🌱', color: COLORS.success, gradient: ['#10B981', '#059669'] },
      { id: 'intermediate', label: 'Intermediate', icon: '⛰️', color: COLORS.warning, gradient: ['#F59E0B', '#D97706'] },
      { id: 'advanced', label: 'Advanced', icon: '🏔️', color: COLORS.error, gradient: ['#EF4444', '#DC2626'] },
    ];

    // Add nearby filter if we're in nearby category
    if (category === 'nearby') {
      return [
        { id: 'nearby', label: 'Nearby', icon: '📍', color: COLORS.info, gradient: ['#3B82F6', '#2563EB'] },
        ...baseFilters
      ];
    }

    return baseFilters;
  };

  const filters = getFilters();

  const renderTrekCard = useCallback(({ item }) => (
    <TrekCard trek={item} onPress={handleTrekPress} />
  ), [handleTrekPress]);

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      {/* Modern Header with Clean Design */}
      <View style={styles.modernHeader}>
        <View style={styles.headerTextContainer}>
          <Text style={styles.modernTitle}>{getScreenTitle()}</Text>
          <Text style={styles.modernSubtitle}>{getScreenSubtitle()}</Text>
        </View>

        {/* Stats Card */}
        <View style={styles.statsCard}>
          <Text style={styles.statsNumber}>{filteredTreks.length}</Text>
          <Text style={styles.statsLabel}>Destinations</Text>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            key="search-input"
            ref={searchInputRef}
            style={styles.searchInput}
            placeholder={searchPlaceholder}
            placeholderTextColor={COLORS.textSecondary}
            value={searchText}
            onChangeText={handleSearchTextChange}
            onSubmitEditing={handleSearchSubmit}
            returnKeyType="search"
            blurOnSubmit={false}
            autoCorrect={false}
            autoCapitalize="none"
            keyboardType="default"
            clearButtonMode="while-editing"
            multiline={false}
            numberOfLines={1}
            textContentType="none"
            autoComplete="off"
            spellCheck={false}
          />
          {searchText.length > 0 && (
            <TouchableOpacity onPress={handleSearchClear} style={styles.clearButton}>
              <Text style={styles.clearIcon}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Modern Filter Tabs - Hide when in search mode */}
      {!isSearchMode && (
        <View style={styles.modernFiltersContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filtersScrollContent}
            keyboardShouldPersistTaps="handled"
          >
            {filters.map((filter) => (
              <TouchableOpacity
                key={filter.id}
                style={[
                  styles.modernFilterButton,
                  selectedFilter === filter.id && styles.modernFilterButtonActive
                ]}
                onPress={() => handleFilterPress(filter.id)}
                activeOpacity={0.7}
              >
                {selectedFilter === filter.id ? (
                  <LinearGradient
                    colors={filter.gradient}
                    style={styles.modernFilterGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <Text style={styles.modernFilterIcon}>{filter.icon}</Text>
                    <Text style={styles.modernFilterTextActive}>{filter.label}</Text>
                  </LinearGradient>
                ) : (
                  <View style={styles.modernFilterContent}>
                    <Text style={styles.modernFilterIconInactive}>{filter.icon}</Text>
                    <Text style={styles.modernFilterTextInactive}>{filter.label}</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Fixed Header with Search - Outside FlatList */}
      <View style={styles.fixedHeader}>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

        {/* Header Title */}
        <View style={styles.headerTitleContainer}>
          <Text style={styles.screenTitle}>{getScreenTitle()}</Text>
          <Text style={styles.screenSubtitle}>
            {isSearchMode && searchText ?
              `${filteredTreks.length} results found` :
              `${filteredTreks.length} destinations available`
            }
          </Text>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              key="search-input"
              ref={searchInputRef}
              style={styles.searchInput}
              placeholder={searchPlaceholder}
              placeholderTextColor={COLORS.textSecondary}
              value={searchText}
              onChangeText={handleSearchTextChange}
              onSubmitEditing={handleSearchSubmit}
              returnKeyType="search"
              blurOnSubmit={false}
              autoCorrect={false}
              autoCapitalize="none"
              keyboardType="default"
              clearButtonMode="while-editing"
              multiline={false}
              numberOfLines={1}
              textContentType="none"
              autoComplete="off"
              spellCheck={false}
            />
            {searchText.length > 0 && (
              <TouchableOpacity onPress={handleSearchClear} style={styles.clearButton}>
                <Text style={styles.clearIcon}>✕</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Modern Filter Tabs - Hide when in search mode */}
        {!isSearchMode && (
          <View style={styles.modernFiltersContainer}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filtersScrollContent}
              keyboardShouldPersistTaps="handled"
            >
              {filters.map((filter) => (
                <TouchableOpacity
                  key={filter.id}
                  style={[
                    styles.modernFilterButton,
                    selectedFilter === filter.id && styles.modernFilterButtonActive
                  ]}
                  onPress={() => handleFilterPress(filter.id)}
                  activeOpacity={0.7}
                >
                  {selectedFilter === filter.id ? (
                    <LinearGradient
                      colors={filter.gradient}
                      style={styles.modernFilterGradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                    >
                      <Text style={styles.modernFilterIcon}>{filter.icon}</Text>
                      <Text style={styles.modernFilterTextActive}>{filter.label}</Text>
                    </LinearGradient>
                  ) : (
                    <View style={styles.modernFilterContent}>
                      <Text style={styles.modernFilterIconInactive}>{filter.icon}</Text>
                      <Text style={styles.modernFilterTextInactive}>{filter.label}</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
      </View>

      {/* FlatList without header */}
      <FlatList
        data={filteredTreks}
        renderItem={renderTrekCard}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="always"
        keyboardDismissMode="none"
        style={styles.treksList}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  listContainer: {
    paddingBottom: SPACING.xl,
  },

  // Modern Header Styles
  headerContainer: {
    backgroundColor: COLORS.background,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  modernHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: SPACING.xl,
    marginBottom: SPACING.lg,
  },
  headerTextContainer: {
    flex: 1,
    marginRight: SPACING.md,
  },
  modernTitle: {
    ...createTextStyle(28, 'bold'),
    color: COLORS.text,
    marginBottom: SPACING.xs,
    lineHeight: 34,
  },
  modernSubtitle: {
    ...createTextStyle(14, 'regular'),
    color: COLORS.textSecondary,
    lineHeight: 20,
  },

  // Stats Card
  statsCard: {
    backgroundColor: COLORS.backgroundCard,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    minWidth: 80,
    ...SHADOWS.small,
  },
  statsNumber: {
    ...createTextStyle(24, 'bold'),
    color: COLORS.primary,
    lineHeight: 28,
  },
  statsLabel: {
    ...createTextStyle(11, 'medium'),
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // Search Bar Styles
  searchContainer: {
    paddingHorizontal: SPACING.xl,
    marginBottom: SPACING.lg,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundCard,
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
    ...SHADOWS.small,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: SPACING.sm,
    color: COLORS.textSecondary,
  },
  searchInput: {
    flex: 1,
    ...createTextStyle(16, 'regular'),
    color: COLORS.text,
    paddingVertical: SPACING.xs,
  },
  clearButton: {
    padding: SPACING.xs,
  },
  clearIcon: {
    fontSize: 16,
    color: COLORS.textSecondary,
    fontWeight: 'bold',
  },

  // Modern Filter Styles
  modernFiltersContainer: {
    paddingHorizontal: SPACING.xl,
  },
  filtersScrollContent: {
    paddingRight: SPACING.xl,
  },
  modernFilterButton: {
    marginRight: SPACING.sm,
    borderRadius: BORDER_RADIUS.xl,
    overflow: 'hidden',
    backgroundColor: COLORS.backgroundCard,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
    ...SHADOWS.small,
  },
  modernFilterButtonActive: {
    borderColor: 'transparent',
    transform: [{ scale: 1.02 }],
    ...SHADOWS.medium,
  },
  modernFilterGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    minWidth: 100,
  },
  modernFilterContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    minWidth: 100,
  },
  modernFilterIcon: {
    fontSize: 16,
    marginRight: SPACING.sm,
  },
  modernFilterIconInactive: {
    fontSize: 16,
    marginRight: SPACING.sm,
    opacity: 0.6,
  },
  modernFilterTextActive: {
    ...createTextStyle(13, 'bold'),
    color: COLORS.textInverse,
    textAlign: 'center',
  },
  modernFilterTextInactive: {
    ...createTextStyle(13, 'medium'),
    color: COLORS.text,
    textAlign: 'center',
  },
  // Fixed Header Styles
  fixedHeader: {
    backgroundColor: COLORS.background,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceBorder,
  },
  headerTitleContainer: {
    paddingHorizontal: SPACING.xl,
    marginBottom: SPACING.md,
  },
  modernFilterText: {
    ...createTextStyle(13, 'medium'),
    color: COLORS.text,
    textAlign: 'center',
  },
  activeModernFilterText: {
    color: COLORS.white,
  },
  treksList: {
    flex: 1,
  },
});

export default TrekListScreen;
