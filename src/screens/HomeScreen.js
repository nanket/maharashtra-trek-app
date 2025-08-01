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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, CATEGORIES, CATEGORY_COLORS, SHADOWS, SPACING, BORDER_RADIUS, IMAGES, FONTS, TYPOGRAPHY, createTextStyle } from '../utils/constants';
import LocalDataService from '../services/LocalDataService';
import NearbyTreks from '../components/NearbyTreks';

const { width, height } = Dimensions.get('window');

const HomeScreen = ({ navigation }) => {
  const [searchText, setSearchText] = useState('');

  // Dynamic greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) {
      return 'Good morning 👋';
    } else if (hour < 17) {
      return 'Good afternoon ☀️';
    } else if (hour < 21) {
      return 'Good evening 🌅';
    } else {
      return 'Good night 🌙';
    }
  };

  // Get data from LocalDataService
  const allData = LocalDataService.getAllData();
  const topTreks = LocalDataService.getFeaturedData(5);

  // Get dynamic waterfall data - prioritize top rated, fallback to all waterfalls
  const getWaterfallData = () => {
    const topRated = LocalDataService.getTopRatedByCategory('waterfall', 5);
    if (topRated.length > 0) {
      return topRated;
    }
    // Fallback to all waterfalls if no ratings available
    return LocalDataService.getDataByCategory('waterfall').slice(0, 5);
  };

  const waterfallTreks = getWaterfallData();

  const handleTrekPress = (trek) => {
    navigation.navigate('TrekDetails', { trek });
  };

  const handleViewAllPress = () => {
    navigation.navigate('TrekList', { category: null });
  };

  const handleSearchPress = () => {
    // Navigate to search screen or show search results
    navigation.navigate('TrekList', { searchQuery: searchText });
  };

  const getImageSource = (trek) => {
    return IMAGES[trek.imageKey] || IMAGES.defaultImage;
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty.toLowerCase()) {
      case 'easy': return COLORS.success;
      case 'moderate': return COLORS.warning;
      case 'difficult': return COLORS.error;
      default: return COLORS.textSecondary;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      {/* Clean Modern Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.greeting}>{getGreeting()}</Text>
            <Text style={styles.appName}>Explore Maharashtra</Text>
          </View>
          <TouchableOpacity style={styles.profileButton}>
            <Image
              source={IMAGES.defaultImage}
              style={styles.profileImage}
            />
          </TouchableOpacity>
        </View>

        {/* Clean Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Search treks, forts, waterfalls..."
              placeholderTextColor={COLORS.textLight}
              value={searchText}
              onChangeText={setSearchText}
              onSubmitEditing={handleSearchPress}
              returnKeyType="search"
              blurOnSubmit={false}
            />
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >

        {/* Categories - Clean Icons */}
        <View style={styles.categoriesSection}>
          <Text style={styles.sectionTitle}>Explore Maharashtra</Text>
          <View style={styles.categoriesGrid}>
            {[
              { id: 'fort', title: 'Forts', icon: '🏰', color: COLORS.fort },
              { id: 'waterfall', title: 'Waterfalls', icon: '💧', color: COLORS.waterfall },
              { id: 'trek', title: 'Treks', icon: '🥾', color: COLORS.trek },
              { id: 'cave', title: 'Caves', icon: '🕳️', color: COLORS.cave },
            ].map((category, index) => (
              <TouchableOpacity
                key={category.id}
                style={styles.categoryItem}
                onPress={() => navigation.navigate('TrekList', { category: category.id })}
                activeOpacity={0.7}
              >
                <View style={[styles.categoryIconContainer, { backgroundColor: category.color + '15' }]}>
                  <Text style={styles.categoryIcon}>{category.icon}</Text>
                </View>
                <Text style={styles.categoryLabel}>{category.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Nearby Treks */}
        <NearbyTreks
          treks={allData}
          navigation={navigation}
          maxDistance={100}
          limit={6}
        />

        {/* Featured Destinations - Clean Cards */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Featured Destinations</Text>
            <TouchableOpacity onPress={handleViewAllPress}>
              <Text style={styles.viewAllText}>View all</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={topTreks}
            renderItem={({ item }) => (
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
            )}
            keyExtractor={(item) => item.id.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.featuredList}
          />
        </View>

        {/* Popular Waterfalls - Clean Cards */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>🏞️ Top Rated Waterfalls</Text>
            <TouchableOpacity onPress={() => navigation.navigate('TrekList', { category: 'waterfall' })}>
              <Text style={styles.viewAllText}>View all</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={waterfallTreks}
            renderItem={({ item }) => (
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
            )}
            keyExtractor={(item) => item.id.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.featuredList}
          />
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsSection}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            <TouchableOpacity
              style={styles.quickActionCard}
              onPress={() => navigation.navigate('TrekPlanner')}
              activeOpacity={0.8}
            >
              <View style={styles.quickActionIcon}>
                <Text style={styles.quickActionEmoji}>🧭</Text>
              </View>
              <Text style={styles.quickActionTitle}>Plan Trek</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickActionCard}
              onPress={() => navigation.navigate('Map')}
              activeOpacity={0.8}
            >
              <View style={styles.quickActionIcon}>
                <Text style={styles.quickActionEmoji}>🗺️</Text>
              </View>
              <Text style={styles.quickActionTitle}>Explore Map</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickActionCard}
              onPress={() => navigation.navigate('Emergency')}
              activeOpacity={0.8}
            >
              <View style={styles.quickActionIcon}>
                <Text style={styles.quickActionEmoji}>🚨</Text>
              </View>
              <Text style={styles.quickActionTitle}>Emergency</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickActionCard}
              onPress={() => navigation.navigate('My Treks')}
              activeOpacity={0.8}
            >
              <View style={styles.quickActionIcon}>
                <Text style={styles.quickActionEmoji}>📋</Text>
              </View>
              <Text style={styles.quickActionTitle}>My Treks</Text>
            </TouchableOpacity>
          </View>
        </View>



        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  // Clean Header Styles
  header: {
    backgroundColor: COLORS.background,
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.lg,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.lg,
  },
  greeting: {
    ...createTextStyle(14, 'regular'),
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  appName: {
    ...createTextStyle(28, 'bold'),
    color: COLORS.text,
    letterSpacing: -0.5,
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },

  // Clean Search Styles
  searchContainer: {
    marginTop: SPACING.sm,
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
    fontSize: 16,
    color: COLORS.textLight,
    marginRight: SPACING.md,
  },
  searchInput: {
    flex: 1,
    ...createTextStyle(16, 'regular'),
    color: COLORS.text,
    paddingVertical: 0,
  },

  // Content Styles
  scrollView: {
    flex: 1,
  },

  // Categories Section
  categoriesSection: {
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.xl,
  },
  categoriesGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  categoryItem: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: SPACING.xs,
  },
  categoryIconContainer: {
    width: 56,
    height: 56,
    borderRadius: BORDER_RADIUS.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  categoryIcon: {
    fontSize: 24,
  },
  categoryLabel: {
    ...createTextStyle(12, 'medium'),
    color: COLORS.text,
    textAlign: 'center',
  },



  // Section Styles
  section: {
    paddingHorizontal: SPACING.xl,
    marginBottom: SPACING.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    ...createTextStyle(20, 'bold'),
    color: COLORS.text,
  },
  viewAllText: {
    ...createTextStyle(14, 'medium'),
    color: COLORS.primary,
  },

  // Featured Cards Styles
  featuredList: {
    paddingLeft: SPACING.xl,
  },
  featuredCard: {
    width: width * 0.7,
    marginRight: SPACING.lg,
    backgroundColor: COLORS.backgroundCard,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    ...SHADOWS.medium,
  },
  featuredImage: {
    width: '100%',
    height: 140,
    backgroundColor: COLORS.backgroundSecondary,
  },
  featuredContent: {
    padding: SPACING.lg,
  },
  featuredHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  featuredTitle: {
    ...createTextStyle(16, 'bold'),
    color: COLORS.text,
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
    ...createTextStyle(12, 'medium'),
    color: COLORS.text,
  },
  featuredLocation: {
    ...createTextStyle(13, 'regular'),
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },
  featuredFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  featuredDifficulty: {
    ...createTextStyle(12, 'medium'),
    color: COLORS.success,
    backgroundColor: COLORS.success + '15',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
  },
  featuredDuration: {
    ...createTextStyle(12, 'regular'),
    color: COLORS.textSecondary,
  },

  // Quick Actions Section
  quickActionsSection: {
    paddingHorizontal: SPACING.xl,
    marginBottom: SPACING.xl,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickActionCard: {
    width: (width - SPACING.xl * 2 - SPACING.md) / 2,
    backgroundColor: COLORS.backgroundCard,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    alignItems: 'center',
    marginBottom: SPACING.md,
    ...SHADOWS.small,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: COLORS.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  quickActionEmoji: {
    fontSize: 24,
  },
  quickActionTitle: {
    ...createTextStyle(14, 'medium'),
    color: COLORS.text,
    textAlign: 'center',
  },



  // Bottom Spacing
  bottomSpacing: {
    height: SPACING.xl,
  },
});

export default HomeScreen;
