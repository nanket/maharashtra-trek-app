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
import treksData from '../data/treksData.json';

const { width, height } = Dimensions.get('window');

const HomeScreen = ({ navigation }) => {
  const [searchText, setSearchText] = useState('');

  // Get featured treks (Top DIY Treks)
  const topTreks = treksData.filter(trek => trek.featured);

  // Popular nearby treks (circular images)
  const popularNearby = treksData.slice(0, 4).map(trek => ({
    ...trek,
    shortName: trek.name.split(' ')[0], // First word for display
  }));

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
            <Text style={styles.greeting}>Good morning 👋</Text>
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
            />
          </View>
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Categories - Clean Icons */}
        <View style={styles.categoriesSection}>
          <View style={styles.categoriesGrid}>
            {[
              { id: 'forts', title: 'Forts', icon: '🏰', color: COLORS.fort },
              { id: 'waterfalls', title: 'Waterfalls', icon: '💧', color: COLORS.waterfall },
              { id: 'treks', title: 'Treks', icon: '🥾', color: COLORS.trek },
              { id: 'temples', title: 'Temples', icon: '🛕', color: COLORS.accent },
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

        {/* Popular This Week - Enhanced Design */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Popular This Week</Text>
            <TouchableOpacity onPress={handleViewAllPress}>
              <Text style={styles.viewAllText}>View all</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={popularNearby}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.popularCard}
                onPress={() => handleTrekPress(item)}
                activeOpacity={0.8}
              >
                <Image
                  source={getImageSource(item)}
                  style={styles.popularImage}
                />
                <View style={styles.popularContent}>
                  <View style={styles.popularHeader}>
                    <Text style={styles.popularName}>{item.name}</Text>
                    <View style={styles.popularRatingContainer}>
                      <Text style={styles.popularRating}>⭐ {item.rating}</Text>
                    </View>
                  </View>
                  <Text style={styles.popularLocation}>{item.location}</Text>
                  <View style={styles.popularFooter}>
                    <Text style={styles.popularDifficulty}>{item.difficulty}</Text>
                    <Text style={styles.popularDuration}>{item.duration}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            )}
            keyExtractor={(item) => item.id.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.popularList}
          />
        </View>

        {/* Simple CTA */}
        <View style={styles.ctaSection}>
          <Text style={styles.ctaTitle}>Ready to explore?</Text>
          <Text style={styles.ctaSubtitle}>Discover 65+ amazing destinations across Maharashtra</Text>
          <TouchableOpacity style={styles.ctaButton} onPress={handleViewAllPress}>
            <Text style={styles.ctaButtonText}>View All Destinations</Text>
          </TouchableOpacity>
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

  // Enhanced Popular Section Styles
  popularList: {
    paddingLeft: SPACING.xl,
  },
  popularCard: {
    width: width * 0.65, // Larger cards for better visual appeal
    marginRight: SPACING.lg,
    backgroundColor: COLORS.backgroundCard,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    ...SHADOWS.medium, // Better shadow for depth
  },
  popularImage: {
    width: '100%',
    height: 120, // Larger image for better visual impact
    backgroundColor: COLORS.backgroundSecondary,
  },
  popularContent: {
    padding: SPACING.lg, // Generous padding for breathing room
  },
  popularHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  popularName: {
    ...createTextStyle(15, 'bold'), // Larger, bolder text
    color: COLORS.text,
    flex: 1,
    marginRight: SPACING.sm,
    lineHeight: 20,
  },
  popularRatingContainer: {
    backgroundColor: COLORS.backgroundSecondary,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
  },
  popularRating: {
    ...createTextStyle(11, 'medium'),
    color: COLORS.text,
  },
  popularLocation: {
    ...createTextStyle(12, 'regular'),
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
    lineHeight: 16,
  },
  popularFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  popularDifficulty: {
    ...createTextStyle(11, 'medium'),
    color: COLORS.success,
    backgroundColor: COLORS.success + '15',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
  },
  popularDuration: {
    ...createTextStyle(11, 'regular'),
    color: COLORS.textSecondary,
  },

  // CTA Section Styles
  ctaSection: {
    backgroundColor: COLORS.backgroundCard,
    marginHorizontal: SPACING.xl,
    marginBottom: SPACING.xl,
    padding: SPACING.xl,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    ...SHADOWS.small,
  },
  ctaTitle: {
    ...createTextStyle(20, 'bold'),
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  ctaSubtitle: {
    ...createTextStyle(14, 'regular'),
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
    lineHeight: 20,
  },
  ctaButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
  },
  ctaButtonText: {
    ...createTextStyle(14, 'medium'),
    color: COLORS.textInverse,
    textAlign: 'center',
  },

  // Bottom Spacing
  bottomSpacing: {
    height: SPACING.xl,
  },
});

export default HomeScreen;
