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
import { COLORS, CATEGORIES, CATEGORY_COLORS, SHADOWS, SPACING, BORDER_RADIUS, IMAGES } from '../utils/constants';
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

      {/* Header with App Name and Profile */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.appName}>TREK</Text>
          <Text style={styles.appNameHighlight}>MATE</Text>
        </View>
        <TouchableOpacity style={styles.profileButton}>
          <Image
            source={IMAGES.defaultImage}
            style={styles.profileImage}
          />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search for treks, kits and more"
            placeholderTextColor={COLORS.textSecondary}
            value={searchText}
            onChangeText={setSearchText}
            onSubmitEditing={handleSearchPress}
          />
          <TouchableOpacity style={styles.micButton}>
            <Text style={styles.micIcon}>🎤</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Top DIY Treks Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Top DIY Treks</Text>
            <TouchableOpacity onPress={handleViewAllPress}>
              <Text style={styles.exploreAllButton}>Explore all</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={topTreks}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.trekCard}
                onPress={() => handleTrekPress(item)}
                activeOpacity={0.9}
              >
                <Image
                  source={getImageSource(item)}
                  style={styles.trekCardImage}
                />
                <View style={styles.trekCardOverlay}>
                  <View style={styles.trekCardRating}>
                    <Text style={styles.ratingIcon}>⭐</Text>
                    <Text style={styles.ratingText}>{item.rating}</Text>
                    <Text style={styles.reviewCount}>({item.reviewCount})</Text>
                  </View>
                </View>
                <View style={styles.trekCardContent}>
                  <Text style={styles.trekCardTitle}>{item.name}</Text>
                  <View style={styles.trekCardMeta}>
                    <Text style={styles.trekCardDifficulty}>{item.difficulty}</Text>
                    <Text style={styles.trekCardLocation}>{item.location}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            )}
            keyExtractor={(item) => item.id.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.trekCardsList}
          />
        </View>

        {/* Popular near you Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Popular near you</Text>
            <TouchableOpacity onPress={handleViewAllPress}>
              <Text style={styles.viewAllText}>View all</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.popularGrid}>
            {popularNearby.map((item, index) => (
              <TouchableOpacity
                key={item.id}
                style={styles.popularItem}
                onPress={() => handleTrekPress(item)}
                activeOpacity={0.8}
              >
                <Image
                  source={getImageSource(item)}
                  style={styles.popularImage}
                />
                <Text style={styles.popularName}>{item.shortName}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Referral Section */}
        <View style={styles.referralSection}>
          <Text style={styles.referralText}>
            Refer the app to your friends and get Rs. 100 off on your next booking.{' '}
            <Text style={styles.learnMoreText}>Learn more</Text>
          </Text>
        </View>

        {/* Resources Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Resources for you</Text>
          <View style={styles.resourcesContainer}>
            <View style={styles.resourceItem}>
              <View style={styles.resourceIcon}>
                <Text style={styles.resourceEmoji}>📚</Text>
              </View>
              <Text style={styles.resourceText}>Trek Guides</Text>
            </View>
            <View style={styles.resourceItem}>
              <View style={styles.resourceIcon}>
                <Text style={styles.resourceEmoji}>🎒</Text>
              </View>
              <Text style={styles.resourceText}>Gear Lists</Text>
            </View>
            <View style={styles.resourceItem}>
              <View style={styles.resourceIcon}>
                <Text style={styles.resourceEmoji}>🗺️</Text>
              </View>
              <Text style={styles.resourceText}>Maps</Text>
            </View>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  // Header Styles
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.md,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  appName: {
    fontSize: 24,
    fontWeight: '900',
    color: COLORS.text,
    letterSpacing: 1,
  },
  appNameHighlight: {
    fontSize: 24,
    fontWeight: '900',
    color: COLORS.primary,
    letterSpacing: 1,
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

  // Search Styles
  searchContainer: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.lg,
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
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: COLORS.text,
    paddingVertical: SPACING.xs,
  },
  micButton: {
    padding: SPACING.xs,
  },
  micIcon: {
    fontSize: 16,
  },

  // Content Styles
  scrollView: {
    flex: 1,
  },
  section: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
  },
  exploreAllButton: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
    backgroundColor: COLORS.primary + '15',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },

  // Trek Cards Styles
  trekCardsList: {
    paddingLeft: SPACING.lg,
  },
  trekCard: {
    width: width * 0.4,
    marginRight: SPACING.md,
    backgroundColor: COLORS.backgroundCard,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    ...SHADOWS.medium,
  },
  trekCardImage: {
    width: '100%',
    height: 120,
    backgroundColor: COLORS.backgroundSecondary,
  },
  trekCardOverlay: {
    position: 'absolute',
    top: SPACING.sm,
    left: SPACING.sm,
  },
  trekCardRating: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
  },
  ratingIcon: {
    fontSize: 12,
    marginRight: SPACING.xs,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textInverse,
    marginRight: SPACING.xs,
  },
  reviewCount: {
    fontSize: 10,
    color: COLORS.textInverse,
    opacity: 0.8,
  },
  trekCardContent: {
    padding: SPACING.md,
  },
  trekCardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  trekCardMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  trekCardDifficulty: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.success,
    backgroundColor: COLORS.success + '15',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
  },
  trekCardLocation: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },

  // Popular Section Styles
  popularGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: SPACING.md,
  },
  popularItem: {
    alignItems: 'center',
    flex: 1,
  },
  popularImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.backgroundSecondary,
    marginBottom: SPACING.sm,
  },
  popularName: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'center',
  },

  // Referral Section Styles
  referralSection: {
    backgroundColor: COLORS.backgroundCard,
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.xl,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
  },
  referralText: {
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 20,
    fontWeight: '500',
  },
  learnMoreText: {
    color: COLORS.primary,
    fontWeight: '700',
  },

  // Resources Section Styles
  resourcesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: SPACING.md,
  },
  resourceItem: {
    alignItems: 'center',
    flex: 1,
  },
  resourceIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.backgroundCard,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
    ...SHADOWS.small,
  },
  resourceEmoji: {
    fontSize: 20,
  },
  resourceText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'center',
  },
});

export default HomeScreen;
