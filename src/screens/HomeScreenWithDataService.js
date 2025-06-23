import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  StatusBar,
  FlatList,
  Image,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, CATEGORIES, CATEGORY_COLORS, SHADOWS, SPACING, BORDER_RADIUS, IMAGES, FONTS, TYPOGRAPHY, createTextStyle } from '../utils/constants';
import { useFeaturedTreks, useTreksByCategory, useDataService } from '../hooks/useDataService';
import TrekPlannerQuickStart from '../components/TrekPlannerQuickStart';

const { width, height } = Dimensions.get('window');

const HomeScreen = ({ navigation }) => {
  const [searchText, setSearchText] = useState('');
  
  // Use data service hooks
  const { featuredTreks: topTreks, loading: featuredLoading, error: featuredError } = useFeaturedTreks();
  const { treks: waterfallTreks, loading: waterfallLoading } = useTreksByCategory('waterfall');
  const { treks: caveTreks, loading: caveLoading } = useTreksByCategory('cave');
  const { treks: allTreks, loading: allTreksLoading } = useTreksByCategory('fort'); // For popular nearby
  const { refreshAllData, loading: refreshLoading } = useDataService();

  // Derived data
  const popularNearby = allTreks.slice(0, 4).map(trek => ({
    ...trek,
    shortName: trek.name.split(' ')[0], // First word for display
  }));

  const featuredWaterfalls = waterfallTreks.filter(trek => trek.featured);
  const popularWaterfalls = waterfallTreks.slice(0, 4);
  const featuredCaves = caveTreks.filter(trek => trek.featured);
  const popularCaves = caveTreks.slice(0, 4);

  const handleTrekPress = (trek) => {
    navigation.navigate('TrekDetails', { trek });
  };

  const handleViewAllPress = () => {
    navigation.navigate('TrekList', { category: null });
  };

  const handleSearchPress = () => {
    navigation.navigate('TrekList', { searchQuery: searchText });
  };

  const handleRefreshData = async () => {
    try {
      await refreshAllData();
      Alert.alert('Success', 'Data refreshed successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to refresh data. Using cached data.');
    }
  };

  const getImageSource = (trek) => {
    return IMAGES[trek.imageKey] || IMAGES.defaultImage;
  };

  // Loading state for critical data
  if (featuredLoading && topTreks.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading trek data...</Text>
          {featuredError && (
            <Text style={styles.errorText}>Using offline data</Text>
          )}
        </View>
      </SafeAreaView>
    );
  }

  const renderFeaturedCard = ({ item }) => (
    <TouchableOpacity
      style={styles.featuredCard}
      onPress={() => handleTrekPress(item)}
      activeOpacity={0.8}
    >
      <Image
        source={getImageSource(item)}
        style={styles.featuredImage}
      />
      <View style={styles.featuredContent}>
        <View style={styles.featuredHeader}>
          <Text style={styles.featuredTitle}>{item.name}</Text>
          <View style={styles.ratingContainer}>
            <Text style={styles.ratingText}>⭐ {item.rating}</Text>
          </View>
        </View>
        <Text style={styles.featuredLocation}>{item.location}</Text>
        <View style={styles.featuredFooter}>
          <Text style={styles.featuredDifficulty}>{item.difficulty}</Text>
          <Text style={styles.featuredDuration}>{item.duration}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderPopularItem = ({ item }) => (
    <TouchableOpacity
      style={styles.popularItem}
      onPress={() => handleTrekPress(item)}
      activeOpacity={0.8}
    >
      <View style={styles.popularImageContainer}>
        <Image
          source={getImageSource(item)}
          style={styles.popularImage}
        />
      </View>
      <Text style={styles.popularName}>{item.shortName}</Text>
      <Text style={styles.popularDistance}>{item.duration}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <LinearGradient
          colors={[COLORS.primary, COLORS.primaryDark]}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <View style={styles.headerTop}>
              <View>
                <Text style={styles.greeting}>Discover</Text>
                <Text style={styles.title}>Maharashtra Treks</Text>
              </View>
              <TouchableOpacity 
                style={styles.refreshButton}
                onPress={handleRefreshData}
                disabled={refreshLoading}
              >
                <Text style={styles.refreshButtonText}>
                  {refreshLoading ? '⟳' : '↻'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Search Bar */}
            <View style={styles.searchContainer}>
              <TextInput
                style={styles.searchInput}
                placeholder="Search forts, waterfalls, caves..."
                placeholderTextColor={COLORS.textSecondary}
                value={searchText}
                onChangeText={setSearchText}
                onSubmitEditing={handleSearchPress}
              />
              <TouchableOpacity style={styles.searchButton} onPress={handleSearchPress}>
                <Text style={styles.searchIcon}>🔍</Text>
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>

        {/* Quick Trek Planner */}
        <TrekPlannerQuickStart navigation={navigation} />

        {/* Featured Treks Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Top DIY Treks</Text>
            <TouchableOpacity onPress={handleViewAllPress}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>

          {featuredLoading && topTreks.length === 0 ? (
            <View style={styles.loadingSection}>
              <ActivityIndicator color={COLORS.primary} />
            </View>
          ) : (
            <FlatList
              data={topTreks}
              renderItem={renderFeaturedCard}
              keyExtractor={(item) => item.id.toString()}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.featuredList}
            />
          )}
        </View>

        {/* Popular Nearby Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Popular Nearby</Text>
          
          {allTreksLoading ? (
            <View style={styles.loadingSection}>
              <ActivityIndicator color={COLORS.primary} />
            </View>
          ) : (
            <FlatList
              data={popularNearby}
              renderItem={renderPopularItem}
              keyExtractor={(item) => item.id.toString()}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.popularList}
            />
          )}
        </View>

        {/* Waterfalls Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>🏞️ Waterfalls</Text>
            <TouchableOpacity onPress={() => navigation.navigate('TrekList', { category: 'waterfall' })}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>

          {/* Featured Waterfalls */}
          {featuredWaterfalls.length > 0 && (
            <>
              <Text style={styles.subsectionTitle}>Featured</Text>
              <FlatList
                data={featuredWaterfalls}
                renderItem={renderFeaturedCard}
                keyExtractor={(item) => item.id.toString()}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.featuredList}
              />
            </>
          )}

          {/* Popular Waterfalls */}
          <Text style={styles.subsectionTitle}>Popular</Text>
          {waterfallLoading ? (
            <View style={styles.loadingSection}>
              <ActivityIndicator color={COLORS.primary} />
            </View>
          ) : (
            <FlatList
              data={popularWaterfalls}
              renderItem={renderPopularItem}
              keyExtractor={(item) => item.id.toString()}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.popularList}
            />
          )}
        </View>

        {/* Caves Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>🕳️ Caves</Text>
            <TouchableOpacity onPress={() => navigation.navigate('TrekList', { category: 'cave' })}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>

          {/* Featured Caves */}
          {featuredCaves.length > 0 && (
            <>
              <Text style={styles.subsectionTitle}>Featured</Text>
              <FlatList
                data={featuredCaves}
                renderItem={renderFeaturedCard}
                keyExtractor={(item) => item.id.toString()}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.featuredList}
              />
            </>
          )}

          {/* Popular Caves */}
          <Text style={styles.subsectionTitle}>Popular</Text>
          {caveLoading ? (
            <View style={styles.loadingSection}>
              <ActivityIndicator color={COLORS.primary} />
            </View>
          ) : (
            <FlatList
              data={popularCaves}
              renderItem={renderPopularItem}
              keyExtractor={(item) => item.id.toString()}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.popularList}
            />
          )}
        </View>

        {/* Data Status */}
        {(featuredError || waterfallLoading || caveLoading) && (
          <View style={styles.statusContainer}>
            <Text style={styles.statusText}>
              {featuredError ? '📱 Using offline data' : '🔄 Loading latest data...'}
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

// Styles remain the same as original HomeScreen
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  loadingText: {
    ...createTextStyle(FONTS.medium, 16, COLORS.text),
    marginTop: SPACING.md,
    textAlign: 'center',
  },
  errorText: {
    ...createTextStyle(FONTS.regular, 14, COLORS.textSecondary),
    marginTop: SPACING.sm,
    textAlign: 'center',
  },
  loadingSection: {
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  refreshButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  refreshButtonText: {
    fontSize: 20,
    color: COLORS.white,
  },
  statusContainer: {
    padding: SPACING.md,
    margin: SPACING.md,
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
  },
  statusText: {
    ...createTextStyle(FONTS.regular, 14, COLORS.textSecondary),
  },
  // ... (include all other styles from original HomeScreen)
  scrollView: {
    flex: 1,
  },
  header: {
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.xl,
    borderBottomLeftRadius: BORDER_RADIUS.xl,
    borderBottomRightRadius: BORDER_RADIUS.xl,
  },
  headerContent: {
    paddingHorizontal: SPACING.lg,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.lg,
  },
  greeting: {
    ...createTextStyle(FONTS.regular, 16, COLORS.white),
    opacity: 0.9,
  },
  title: {
    ...createTextStyle(FONTS.bold, 28, COLORS.white),
    marginTop: SPACING.xs,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: SPACING.md,
    ...SHADOWS.medium,
  },
  searchInput: {
    flex: 1,
    ...createTextStyle(FONTS.regular, 16, COLORS.text),
    paddingVertical: SPACING.md,
  },
  searchButton: {
    padding: SPACING.sm,
  },
  searchIcon: {
    fontSize: 20,
  },
  section: {
    marginTop: SPACING.xl,
    paddingHorizontal: SPACING.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    ...createTextStyle(FONTS.bold, 22, COLORS.text),
  },
  subsectionTitle: {
    ...createTextStyle(FONTS.medium, 18, COLORS.text),
    marginTop: SPACING.lg,
    marginBottom: SPACING.md,
  },
  viewAllText: {
    ...createTextStyle(FONTS.medium, 16, COLORS.primary),
  },
  featuredList: {
    paddingRight: SPACING.lg,
  },
  featuredCard: {
    width: width * 0.75,
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    marginRight: SPACING.md,
    overflow: 'hidden',
    ...SHADOWS.medium,
  },
  featuredImage: {
    width: '100%',
    height: 180,
    resizeMode: 'cover',
  },
  featuredContent: {
    padding: SPACING.md,
  },
  featuredHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.xs,
  },
  featuredTitle: {
    ...createTextStyle(FONTS.bold, 18, COLORS.text),
    flex: 1,
    marginRight: SPACING.sm,
  },
  ratingContainer: {
    backgroundColor: COLORS.backgroundSecondary,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
  },
  ratingText: {
    ...createTextStyle(FONTS.medium, 14, COLORS.text),
  },
  featuredLocation: {
    ...createTextStyle(FONTS.regular, 14, COLORS.textSecondary),
    marginBottom: SPACING.sm,
  },
  featuredFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  featuredDifficulty: {
    ...createTextStyle(FONTS.medium, 14, COLORS.primary),
  },
  featuredDuration: {
    ...createTextStyle(FONTS.regular, 14, COLORS.textSecondary),
  },
  popularList: {
    paddingRight: SPACING.lg,
  },
  popularItem: {
    alignItems: 'center',
    marginRight: SPACING.lg,
    width: 80,
  },
  popularImageContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    overflow: 'hidden',
    marginBottom: SPACING.sm,
    ...SHADOWS.small,
  },
  popularImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  popularName: {
    ...createTextStyle(FONTS.medium, 14, COLORS.text),
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  popularDistance: {
    ...createTextStyle(FONTS.regular, 12, COLORS.textSecondary),
    textAlign: 'center',
  },
});

export default HomeScreen;
