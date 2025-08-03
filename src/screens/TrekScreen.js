import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  FlatList,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import TrekCard from '../components/TrekCard';
import { COLORS, SHADOWS, SPACING, BORDER_RADIUS, createTextStyle } from '../utils/constants';
import LocalDataService from '../services/LocalDataService';

const { width } = Dimensions.get('window');

const TrekScreen = ({ navigation }) => {
  const [selectedDifficulty, setSelectedDifficulty] = useState(null);
  const [filteredTreks, setFilteredTreks] = useState([]);
  const [trekStats, setTrekStats] = useState({
    total: 0,
    beginner: 0,
    intermediate: 0,
    advanced: 0,
  });
  const [difficulties, setDifficulties] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (selectedDifficulty) {
      filterTreksByDifficulty(selectedDifficulty);
    }
  }, [selectedDifficulty]);

  useEffect(() => {
    // Initialize data when component mounts
    initializeData();
  }, []);

  const initializeData = () => {
    // Get data from LocalDataService
    const allData = LocalDataService.getAllData();

    // Calculate trek statistics with safe defaults
    const stats = {
      total: allData?.length || 0,
      beginner: allData?.filter(trek => trek?.difficulty && trek.difficulty.toLowerCase().includes('easy')).length || 0,
      intermediate: allData?.filter(trek =>
        trek?.difficulty && (
          trek.difficulty.toLowerCase().includes('moderate') ||
          trek.difficulty.toLowerCase().includes('easy to moderate')
        )
      ).length || 0,
      advanced: allData?.filter(trek =>
        trek?.difficulty && (
          trek.difficulty.toLowerCase().includes('difficult') ||
          trek.difficulty.toLowerCase().includes('very difficult')
        )
      ).length || 0,
    };

    setTrekStats(stats);

    // Define difficulties array after stats calculation
    const difficultyOptions = [
      {
        id: 'beginner',
        title: 'Beginner',
        icon: '🌱',
        color: COLORS.success,
        description: 'Perfect for first-timers',
        subtitle: 'Easy trails & gentle slopes',
        gradient: ['#10B981', '#059669'],
        lightGradient: ['#D1FAE5', '#A7F3D0'],
        features: ['2-4 hours', 'Well marked trails', 'Basic fitness'],
        trekCount: stats.beginner
      },
      {
        id: 'intermediate',
        title: 'Intermediate',
        icon: '⛰️',
        color: COLORS.warning,
        description: 'For experienced hikers',
        subtitle: 'Moderate climbs & scenic views',
        gradient: ['#F59E0B', '#D97706'],
        lightGradient: ['#FEF3C7', '#FDE68A'],
        features: ['4-6 hours', 'Some steep sections', 'Good fitness'],
        trekCount: stats.intermediate
      },
      {
        id: 'advanced',
        title: 'Advanced',
        icon: '🏔️',
        color: COLORS.error,
        description: 'Expert-level challenges',
        subtitle: 'Steep climbs & rock patches',
        gradient: ['#EF4444', '#DC2626'],
        lightGradient: ['#FEE2E2', '#FECACA'],
        features: ['6+ hours', 'Rock climbing', 'Excellent fitness'],
        trekCount: stats.advanced
      },
    ];

    setDifficulties(difficultyOptions);
    setIsLoading(false);
  };

  const filterTreksByDifficulty = (difficulty) => {
    const difficultyMapping = {
      'beginner': ['Easy'],
      'intermediate': ['Moderate', 'Easy to Moderate'],
      'advanced': ['Difficult', 'Very difficult with rock climbing', 'Moderate to difficult']
    };

    if (difficultyMapping[difficulty]) {
      const allData = LocalDataService.getAllData();
      const filtered = allData.filter(trek =>
        difficultyMapping[difficulty].some(diff =>
          trek.difficulty.toLowerCase().includes(diff.toLowerCase())
        )
      );
      setFilteredTreks(filtered);
    }
  };

  const handleDifficultyPress = (difficulty) => {
    setSelectedDifficulty(difficulty.id);
    navigation.navigate('TrekList', { category: difficulty.id });
  };

  const handleTrekPress = (trek) => {
    navigation.navigate('TrekDetails', { trek });
  };

  const handleViewAllPress = () => {
    navigation.navigate('TrekList', { category: null });
  };

  // Get featured treks
  const featuredTreks = LocalDataService.getFeaturedData(3);

  // Show loading state until data is initialized
  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading trek data...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🏔️ Trek Explorer</Text>
        <Text style={styles.headerSubtitle}>Discover Maharashtra's best trekking destinations</Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Plan Trek - Prominent Section */}
        <View style={styles.planTrekSection}>
          <TouchableOpacity
            style={styles.planTrekButton}
            onPress={() => navigation.navigate('TrekPlanner')}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[COLORS.primary, COLORS.primaryDark]}
              style={styles.planTrekGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.planTrekContent}>
                <View style={styles.planTrekIconContainer}>
                  <Text style={styles.planTrekIcon}>📋</Text>
                </View>
                <View style={styles.planTrekTextContainer}>
                  <Text style={styles.planTrekTitle}>Plan Your Trek</Text>
                  <Text style={styles.planTrekSubtitle}>Create a detailed itinerary for your next adventure</Text>
                </View>
                <View style={styles.planTrekArrow}>
                  <Text style={styles.planTrekArrowText}>→</Text>
                </View>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Trek Statistics */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Trek Statistics</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{trekStats.total}</Text>
              <Text style={styles.statLabel}>Total Treks</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: COLORS.success }]}>{trekStats.beginner}</Text>
              <Text style={styles.statLabel}>Beginner</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: COLORS.warning }]}>{trekStats.intermediate}</Text>
              <Text style={styles.statLabel}>Intermediate</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: COLORS.error }]}>{trekStats.advanced}</Text>
              <Text style={styles.statLabel}>Advanced</Text>
            </View>
          </View>
        </View>

        {/* Browse by Difficulty - Ultra Modern Design */}
        <View style={styles.categoriesSection}>
          <View style={styles.sectionHeaderWithIcon}>
            <View>
              <Text style={styles.sectionTitle}>🎯 Browse by Difficulty</Text>
              <Text style={styles.sectionSubtitle}>Choose your perfect adventure level</Text>
            </View>
          </View>

          <View style={styles.modernCategoriesGrid}>
            {difficulties.map((difficulty, index) => (
              <TouchableOpacity
                key={difficulty.id}
                style={[styles.modernDifficultyCard, {
                  marginTop: index === 1 ? SPACING.lg : 0 // Stagger middle card
                }]}
                onPress={() => handleDifficultyPress(difficulty)}
                activeOpacity={0.8}
              >
                {/* Background Gradient */}
                <LinearGradient
                  colors={difficulty.lightGradient}
                  style={styles.cardBackground}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                />

                {/* Content Container */}
                <View style={styles.cardContent}>
                  {/* Header with Icon and Count */}
                  <View style={styles.cardHeader}>
                    <View style={[styles.iconCircle, { backgroundColor: difficulty.color + '20' }]}>
                      <Text style={styles.modernIcon}>{difficulty.icon}</Text>
                    </View>
                    <View style={[styles.countBadge, { backgroundColor: difficulty.color }]}>
                      <Text style={styles.countText}>{difficulty.trekCount}</Text>
                    </View>
                  </View>

                  {/* Title and Subtitle */}
                  <View style={styles.cardTitleSection}>
                    <Text style={[styles.modernTitle, { color: difficulty.color }]}>
                      {difficulty.title}
                    </Text>
                    <Text style={styles.modernSubtitle}>{difficulty.subtitle}</Text>
                  </View>

                  {/* Features List */}
                  <View style={styles.featuresList}>
                    {difficulty.features.map((feature, idx) => (
                      <View key={idx} style={styles.featureItem}>
                        <View style={[styles.featureDot, { backgroundColor: difficulty.color }]} />
                        <Text style={styles.featureText}>{feature}</Text>
                      </View>
                    ))}
                  </View>

                  {/* Action Button */}
                  <LinearGradient
                    colors={difficulty.gradient}
                    style={styles.actionButton}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    <Text style={styles.actionButtonText}>Explore Treks</Text>
                    <Text style={styles.actionButtonIcon}>→</Text>
                  </LinearGradient>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>



        {/* Enhanced Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.enhancedQuickActionsGrid}>
            <TouchableOpacity
              style={styles.enhancedQuickActionItem}
              onPress={handleViewAllPress}
              activeOpacity={0.7}
            >
              <LinearGradient
                colors={['#FF9933', '#FF7700']}
                style={styles.quickActionGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={styles.enhancedQuickActionIcon}>🗺️</Text>
                <Text style={styles.enhancedQuickActionTitle}>All Treks</Text>
                <Text style={styles.enhancedQuickActionSubtitle}>Browse complete list</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.enhancedQuickActionItem}
              onPress={() => navigation.navigate('Map')}
              activeOpacity={0.7}
            >
              <LinearGradient
                colors={['#10B981', '#059669']}
                style={styles.quickActionGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={styles.enhancedQuickActionIcon}>🗺️</Text>
                <Text style={styles.enhancedQuickActionTitle}>Trek Map</Text>
                <Text style={styles.enhancedQuickActionSubtitle}>Interactive map view</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.enhancedQuickActionItem}
              onPress={() => navigation.navigate('My Treks')}
              activeOpacity={0.7}
            >
              <LinearGradient
                colors={['#8B5CF6', '#7C3AED']}
                style={styles.quickActionGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={styles.enhancedQuickActionIcon}>📚</Text>
                <Text style={styles.enhancedQuickActionTitle}>My Treks</Text>
                <Text style={styles.enhancedQuickActionSubtitle}>View your collection</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.enhancedQuickActionItem}
              onPress={() => navigation.navigate('Emergency')}
              activeOpacity={0.7}
            >
              <LinearGradient
                colors={['#EF4444', '#DC2626']}
                style={styles.quickActionGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={styles.enhancedQuickActionIcon}>🚨</Text>
                <Text style={styles.enhancedQuickActionTitle}>Emergency</Text>
                <Text style={styles.enhancedQuickActionSubtitle}>Safety resources</Text>
              </LinearGradient>
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
  header: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.backgroundCard,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceBorder,
  },
  headerTitle: {
    ...createTextStyle(24, 'bold'),
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  headerSubtitle: {
    ...createTextStyle(14, 'regular'),
    color: COLORS.textSecondary,
  },
  scrollView: {
    flex: 1,
  },
  statsSection: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.md,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    ...createTextStyle(24, 'bold'),
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  statLabel: {
    ...createTextStyle(12, 'medium'),
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  categoriesSection: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xl,
    backgroundColor: COLORS.background,
  },
  sectionHeaderWithIcon: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    ...createTextStyle(24, 'bold'),
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  sectionSubtitle: {
    ...createTextStyle(16, 'regular'),
    color: COLORS.textSecondary,
    lineHeight: 22,
  },
  modernCategoriesGrid: {
    gap: SPACING.lg,
  },
  modernDifficultyCard: {
    borderRadius: BORDER_RADIUS.xl,
    overflow: 'hidden',
    ...SHADOWS.large,
    backgroundColor: COLORS.white,
    elevation: 8,
  },
  cardBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  cardContent: {
    padding: SPACING.xl,
    position: 'relative',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modernIcon: {
    fontSize: 28,
  },
  countBadge: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
    minWidth: 40,
    alignItems: 'center',
  },
  countText: {
    ...createTextStyle(14, 'bold'),
    color: COLORS.white,
  },
  cardTitleSection: {
    marginBottom: SPACING.lg,
  },
  modernTitle: {
    ...createTextStyle(22, 'bold'),
    marginBottom: SPACING.xs,
  },
  modernSubtitle: {
    ...createTextStyle(15, 'medium'),
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  featuresList: {
    marginBottom: SPACING.xl,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  featureDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: SPACING.md,
  },
  featureText: {
    ...createTextStyle(14, 'medium'),
    color: COLORS.textSecondary,
    flex: 1,
  },
  actionButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    ...SHADOWS.small,
  },
  actionButtonText: {
    ...createTextStyle(16, 'bold'),
    color: COLORS.white,
  },
  actionButtonIcon: {
    ...createTextStyle(18, 'bold'),
    color: COLORS.white,
  },
  section: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  viewAllText: {
    ...createTextStyle(14, 'medium'),
    color: COLORS.primary,
  },
  featuredList: {
    paddingRight: SPACING.lg,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginTop: SPACING.md,
  },
  quickActionItem: {
    flex: 1,
    backgroundColor: COLORS.backgroundCard,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    ...SHADOWS.small,
  },
  quickActionIcon: {
    fontSize: 24,
    marginBottom: SPACING.sm,
  },
  quickActionTitle: {
    ...createTextStyle(16, 'bold'),
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  quickActionSubtitle: {
    ...createTextStyle(12, 'regular'),
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  bottomSpacing: {
    height: SPACING.xl,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  loadingText: {
    ...createTextStyle(16, 'medium'),
    color: COLORS.textSecondary,
  },
  // Plan Trek Section Styles
  planTrekSection: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  planTrekButton: {
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    ...SHADOWS.large,
    elevation: 12,
  },
  planTrekGradient: {
    padding: SPACING.lg,
  },
  planTrekContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  planTrekIconContainer: {
    width: 60,
    height: 60,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.lg,
  },
  planTrekIcon: {
    fontSize: 28,
  },
  planTrekTextContainer: {
    flex: 1,
  },
  planTrekTitle: {
    ...createTextStyle(20, 'bold'),
    color: COLORS.white,
    marginBottom: SPACING.xs,
  },
  planTrekSubtitle: {
    ...createTextStyle(14, 'regular'),
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 20,
  },
  planTrekArrow: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  planTrekArrowText: {
    ...createTextStyle(20, 'bold'),
    color: COLORS.white,
  },
  // Enhanced Quick Actions Styles
  enhancedQuickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
    marginTop: SPACING.md,
  },
  enhancedQuickActionItem: {
    width: (width - SPACING.lg * 2 - SPACING.md) / 2,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    ...SHADOWS.medium,
    elevation: 6,
  },
  quickActionGradient: {
    padding: SPACING.lg,
    alignItems: 'center',
    minHeight: 120,
    justifyContent: 'center',
  },
  enhancedQuickActionIcon: {
    fontSize: 32,
    marginBottom: SPACING.sm,
  },
  enhancedQuickActionTitle: {
    ...createTextStyle(16, 'bold'),
    color: COLORS.white,
    marginBottom: SPACING.xs,
    textAlign: 'center',
  },
  enhancedQuickActionSubtitle: {
    ...createTextStyle(12, 'regular'),
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 16,
  },
});

export default TrekScreen;
