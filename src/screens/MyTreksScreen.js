import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SHADOWS, SPACING, BORDER_RADIUS, createTextStyle } from '../utils/constants';
import UserStorageService from '../utils/userStorage';
import LocalDataService from '../services/LocalDataService';
import FavoritesTab from '../components/FavoritesTab';
import CompletedTreksTab from '../components/CompletedTreksTab';
import TripPlannerTab from '../components/TripPlannerTab';

const { width } = Dimensions.get('window');

const MyTreksScreen = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [favorites, setFavorites] = useState([]);
  const [completedTreks, setCompletedTreks] = useState([]);
  const [tripPlans, setTripPlans] = useState([]);
  const [userStats, setUserStats] = useState({});
  const [userProfile, setUserProfile] = useState({});
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load user data
  const loadUserData = async () => {
    try {
      const [favs, completed, plans, stats, profile] = await Promise.all([
        UserStorageService.getFavorites(),
        UserStorageService.getCompletedTreks(),
        UserStorageService.getTripPlans(),
        UserStorageService.getUserStats(),
        UserStorageService.getUserProfile(),
      ]);

      setFavorites(favs);
      setCompletedTreks(completed);
      setTripPlans(plans);
      setUserStats(stats);
      setUserProfile(profile);
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Refresh data
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadUserData();
    setRefreshing(false);
  }, []);

  // Load data when screen focuses
  useFocusEffect(
    useCallback(() => {
      loadUserData();
    }, [])
  );

  // Get favorite treks data
  const getFavoriteTraks = () => {
    const allData = LocalDataService.getAllData();
    return allData.filter(trek => favorites.includes(trek.id));
  };

  // Get completed treks data
  const getCompletedTreksData = () => {
    const allData = LocalDataService.getAllData();
    return completedTreks.map(completed => {
      const trekData = allData.find(trek => trek.id === completed.trekId);
      return { ...trekData, completionData: completed };
    }).filter(Boolean);
  };

  // Calculate user statistics
  const calculateStats = () => {
    const favoriteTreks = getFavoriteTraks();
    const completedTreksData = getCompletedTreksData();

    const categories = completedTreksData.reduce((acc, trek) => {
      acc[trek.category] = (acc[trek.category] || 0) + 1;
      return acc;
    }, {});

    const favoriteCategory = Object.keys(categories).reduce((a, b) =>
      categories[a] > categories[b] ? a : b, 'trek'
    );

    return {
      totalCompleted: completedTreksData.length,
      totalFavorites: favoriteTreks.length,
      favoriteCategory: favoriteCategory || 'trek',
      categories,
    };
  };

  const stats = calculateStats();

  // Tab configuration
  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'favorites', label: 'Wishlist', icon: '❤️' },
    { id: 'completed', label: 'Completed', icon: '✅' },
    { id: 'planned', label: 'Planned', icon: '📅' },
  ];

  // Render tab buttons
  const renderTabButtons = () => (
    <View style={styles.tabContainer}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[
              styles.tabButton,
              activeTab === tab.id && styles.activeTabButton,
            ]}
            onPress={() => setActiveTab(tab.id)}
          >
            <Text style={styles.tabIcon}>{tab.icon}</Text>
            <Text
              style={[
                styles.tabLabel,
                activeTab === tab.id && styles.activeTabLabel,
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  // Render overview tab
  const renderOverview = () => (
    <View style={styles.overviewContainer}>
      {/* User Profile Card */}
      <View style={styles.profileCard}>
        <LinearGradient
          colors={[COLORS.primary, COLORS.primaryDark]}
          style={styles.profileGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.profileContent}>
            <View style={styles.avatarContainer}>
              <Text style={styles.avatarText}>
                {userProfile.name ? userProfile.name.charAt(0).toUpperCase() : 'T'}
              </Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{userProfile.name || 'Trek Enthusiast'}</Text>
              <Text style={styles.profileSubtitle}>Maharashtra Explorer</Text>
            </View>
          </View>
        </LinearGradient>
      </View>

      {/* Simplified Stats Cards */}
      <View style={styles.statsContainer}>
        <View style={styles.statsRow}>
          <TouchableOpacity
            style={styles.cleanStatCard}
            onPress={() => setActiveTab('completed')}
            activeOpacity={0.7}
          >
            <View style={styles.cleanStatContent}>
              <View style={[styles.cleanStatIconContainer, { backgroundColor: '#F0FDF4' }]}>
                <Text style={[styles.cleanStatIcon, { color: '#16A34A' }]}>✅</Text>
              </View>
              <Text style={styles.cleanStatNumber}>{stats.totalCompleted}</Text>
              <Text style={styles.cleanStatLabel}>Completed</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cleanStatCard}
            onPress={() => setActiveTab('favorites')}
            activeOpacity={0.7}
          >
            <View style={styles.cleanStatContent}>
              <View style={[styles.cleanStatIconContainer, { backgroundColor: '#FEF2F2' }]}>
                <Text style={[styles.cleanStatIcon, { color: '#DC2626' }]}>❤️</Text>
              </View>
              <Text style={styles.cleanStatNumber}>{stats.totalFavorites}</Text>
              <Text style={styles.cleanStatLabel}>Favorites</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.statsRow}>
          <TouchableOpacity
            style={styles.cleanStatCard}
            onPress={() => navigation.navigate('TrekList', { category: 'fort' })}
            activeOpacity={0.7}
          >
            <View style={styles.cleanStatContent}>
              <View style={[styles.cleanStatIconContainer, { backgroundColor: '#FEF3C7' }]}>
                <Text style={[styles.cleanStatIcon, { color: '#D97706' }]}>🏰</Text>
              </View>
              <Text style={styles.cleanStatNumber}>{stats.categories.fort || 0}</Text>
              <Text style={styles.cleanStatLabel}>Forts</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cleanStatCard}
            onPress={() => navigation.navigate('TrekList', { category: 'waterfall' })}
            activeOpacity={0.7}
          >
            <View style={styles.cleanStatContent}>
              <View style={[styles.cleanStatIconContainer, { backgroundColor: '#EFF6FF' }]}>
                <Text style={[styles.cleanStatIcon, { color: '#2563EB' }]}>💧</Text>
              </View>
              <Text style={styles.cleanStatNumber}>{stats.categories.waterfall || 0}</Text>
              <Text style={styles.cleanStatLabel}>Waterfalls</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* Planned Treks Section */}
      {renderPlannedTreksSection()}

      {/* Simplified Quick Actions */}
      <View style={styles.quickActionsContainer}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.cleanQuickActionsGrid}>
          <TouchableOpacity
            style={styles.cleanQuickActionCard}
            onPress={() => setActiveTab('planned')}
            activeOpacity={0.7}
          >
            <View style={styles.cleanQuickActionContent}>
              <View style={[styles.cleanQuickActionIconContainer, { backgroundColor: '#EEF2FF' }]}>
                <Text style={[styles.cleanQuickActionIcon, { color: COLORS.primary }]}>📅</Text>
              </View>
              <Text style={styles.cleanQuickActionLabel}>Plan Trek</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cleanQuickActionCard}
            onPress={() => navigation.navigate('Home')}
            activeOpacity={0.7}
          >
            <View style={styles.cleanQuickActionContent}>
              <View style={[styles.cleanQuickActionIconContainer, { backgroundColor: '#F3E8FF' }]}>
                <Text style={[styles.cleanQuickActionIcon, { color: '#8B5CF6' }]}>🔍</Text>
              </View>
              <Text style={styles.cleanQuickActionLabel}>Discover</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cleanQuickActionCard}
            onPress={() => navigation.navigate('Map')}
            activeOpacity={0.7}
          >
            <View style={styles.cleanQuickActionContent}>
              <View style={[styles.cleanQuickActionIconContainer, { backgroundColor: '#ECFEFF' }]}>
                <Text style={[styles.cleanQuickActionIcon, { color: '#06B6D4' }]}>🗺️</Text>
              </View>
              <Text style={styles.cleanQuickActionLabel}>Map</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cleanQuickActionCard}
            onPress={() => navigation.navigate('Emergency')}
            activeOpacity={0.7}
          >
            <View style={styles.cleanQuickActionContent}>
              <View style={[styles.cleanQuickActionIconContainer, { backgroundColor: '#FFF7ED' }]}>
                <Text style={[styles.cleanQuickActionIcon, { color: '#F97316' }]}>🚨</Text>
              </View>
              <Text style={styles.cleanQuickActionLabel}>Emergency</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  // Render planned treks section for overview
  const renderPlannedTreksSection = () => {
    const plannedTrips = tripPlans.filter(plan => plan.status === 'planned');
    const nextTrek = plannedTrips
      .sort((a, b) => new Date(a.plannedDate) - new Date(b.plannedDate))[0];

    const formatDate = (dateString) => {
      try {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        });
      } catch (error) {
        return 'Date not set';
      }
    };

    return (
      <View style={styles.plannedTreksContainer}>
        <Text style={styles.sectionTitle}>Upcoming Treks</Text>
        <View style={styles.plannedTreksCard}>
          <View style={styles.plannedTreksHeader}>
            <View style={styles.plannedTreksInfo}>
              <View style={[styles.cleanStatIconContainer, { backgroundColor: '#EEF2FF' }]}>
                <Text style={[styles.cleanStatIcon, { color: COLORS.primary }]}>📅</Text>
              </View>
              <View style={styles.plannedTreksTextContainer}>
                <Text style={styles.plannedTreksCount}>{plannedTrips.length}</Text>
                <Text style={styles.plannedTreksLabel}>Planned Treks</Text>
                {nextTrek && (
                  <Text style={styles.nextTrekInfo}>
                    Next: {nextTrek.title} • {formatDate(nextTrek.plannedDate)}
                  </Text>
                )}
                {plannedTrips.length === 0 && (
                  <Text style={styles.noPlannedTreks}>No treks planned yet</Text>
                )}
              </View>
            </View>
            <TouchableOpacity
              style={styles.viewAllPlannedButton}
              onPress={() => setActiveTab('planned')}
              activeOpacity={0.7}
            >
              <Text style={styles.viewAllPlannedText}>View All</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  // Render content based on active tab
  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'favorites':
        return (
          <FavoritesTab
            navigation={navigation}
            favorites={favorites}
            onFavoritesChange={setFavorites}
          />
        );
      case 'completed':
        return (
          <CompletedTreksTab
            navigation={navigation}
            completedTreks={completedTreks}
            onCompletedChange={setCompletedTreks}
            tripPlans={tripPlans}
          />
        );
      case 'planned':
        return (
          <TripPlannerTab
            navigation={navigation}
            tripPlans={tripPlans}
            onTripPlansChange={setTripPlans}
          />
        );
      default:
        return renderOverview();
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading your trek data...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Treks</Text>
        <TouchableOpacity style={styles.settingsButton}>
          <Text style={styles.settingsIcon}>⚙️</Text>
        </TouchableOpacity>
      </View>

      {/* Tab Navigation */}
      {renderTabButtons()}

      {/* Content */}
      {activeTab === 'overview' ? (
        <ScrollView
          style={styles.content}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >
          {renderContent()}
        </ScrollView>
      ) : (
        <View style={styles.content}>
          {renderContent()}
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...createTextStyle(16, 'medium'),
    color: COLORS.textSecondary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.backgroundCard,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceBorder,
  },
  headerTitle: {
    ...createTextStyle(24, 'bold'),
    color: COLORS.text,
  },
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingsIcon: {
    fontSize: 20,
  },
  tabContainer: {
    backgroundColor: COLORS.backgroundCard,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceBorder,
  },
  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    marginHorizontal: SPACING.xs,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: COLORS.backgroundSecondary,
  },
  activeTabButton: {
    backgroundColor: COLORS.primary,
  },
  tabIcon: {
    fontSize: 16,
    marginRight: SPACING.sm,
  },
  tabLabel: {
    ...createTextStyle(14, 'medium'),
    color: COLORS.textSecondary,
  },
  activeTabLabel: {
    color: COLORS.textInverse,
  },
  content: {
    flex: 1,
  },
  overviewContainer: {
    padding: SPACING.lg,
  },
  profileCard: {
    marginBottom: SPACING.xl,
    borderRadius: BORDER_RADIUS.xl,
    overflow: 'hidden',
    ...SHADOWS.large,
  },
  profileGradient: {
    padding: SPACING.xl,
  },
  profileContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.lg,
  },
  avatarText: {
    ...createTextStyle(24, 'bold'),
    color: COLORS.textInverse,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    ...createTextStyle(20, 'bold'),
    color: COLORS.textInverse,
    marginBottom: SPACING.xs,
  },
  profileSubtitle: {
    ...createTextStyle(14, 'regular'),
    color: 'rgba(255, 255, 255, 0.8)',
  },
  statsContainer: {
    marginBottom: SPACING.xl,
  },
  statsRow: {
    flexDirection: 'row',
    marginBottom: SPACING.md,
  },
  statCard: {
    flex: 1,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    marginHorizontal: SPACING.xs,
    alignItems: 'center',
    ...SHADOWS.medium,
  },
  statNumber: {
    ...createTextStyle(24, 'bold'),
    color: COLORS.textInverse,
    marginBottom: SPACING.xs,
  },
  statLabel: {
    ...createTextStyle(12, 'medium'),
    color: 'rgba(255, 255, 255, 0.9)',
    textTransform: 'uppercase',
  },
  quickActionsContainer: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    ...createTextStyle(18, 'bold'),
    color: COLORS.text,
    marginBottom: SPACING.lg,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickActionCard: {
    width: (width - SPACING.lg * 2 - SPACING.md) / 2,
    backgroundColor: COLORS.backgroundCard,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
    ...SHADOWS.small,
  },
  quickActionIcon: {
    fontSize: 24,
    marginBottom: SPACING.sm,
  },
  quickActionLabel: {
    ...createTextStyle(12, 'medium'),
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  placeholderText: {
    ...createTextStyle(16, 'regular'),
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.xxl,
  },
  // Enhanced UI Styles
  enhancedStatCard: {
    flex: 1,
    marginHorizontal: SPACING.xs,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    ...SHADOWS.medium,
    elevation: 8,
  },
  statGradient: {
    padding: SPACING.lg,
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 80,
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  statIcon: {
    fontSize: 20,
  },
  statContent: {
    flex: 1,
  },
  enhancedQuickActionCard: {
    width: (width - SPACING.xl * 2 - SPACING.md) / 2,
    marginBottom: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    ...SHADOWS.medium,
    elevation: 8,
  },
  quickActionGradient: {
    padding: SPACING.lg,
    alignItems: 'center',
    minHeight: 120,
    justifyContent: 'center',
  },
  quickActionIconContainer: {
    width: 50,
    height: 50,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  quickActionSubtitle: {
    ...createTextStyle(10, 'regular'),
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginTop: SPACING.xs,
  },
  // Clean/Simplified Design Styles
  cleanStatCard: {
    flex: 1,
    backgroundColor: COLORS.backgroundCard,
    borderRadius: BORDER_RADIUS.lg,
    marginHorizontal: SPACING.xs,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
    ...SHADOWS.small,
  },
  cleanStatContent: {
    padding: SPACING.lg,
    alignItems: 'center',
  },
  cleanStatIconContainer: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  cleanStatIcon: {
    fontSize: 24,
  },
  cleanStatNumber: {
    ...createTextStyle(28, 'bold'),
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  cleanStatLabel: {
    ...createTextStyle(14, 'medium'),
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  cleanQuickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  cleanQuickActionCard: {
    width: (width - SPACING.xl * 2 - SPACING.md) / 2,
    backgroundColor: COLORS.backgroundCard,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
    ...SHADOWS.small,
  },
  cleanQuickActionContent: {
    padding: SPACING.lg,
    alignItems: 'center',
  },
  cleanQuickActionIconContainer: {
    width: 56,
    height: 56,
    borderRadius: BORDER_RADIUS.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  cleanQuickActionIcon: {
    fontSize: 28,
  },
  cleanQuickActionLabel: {
    ...createTextStyle(16, 'semibold'),
    color: COLORS.text,
    textAlign: 'center',
  },
  // Planned Treks Section Styles
  plannedTreksContainer: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  plannedTreksCard: {
    backgroundColor: COLORS.backgroundCard,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
    ...SHADOWS.small,
  },
  plannedTreksHeader: {
    padding: SPACING.lg,
  },
  plannedTreksInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  plannedTreksTextContainer: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  plannedTreksCount: {
    ...createTextStyle(24, 'bold'),
    color: COLORS.text,
  },
  plannedTreksLabel: {
    ...createTextStyle(14, 'medium'),
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  nextTrekInfo: {
    ...createTextStyle(12, 'regular'),
    color: COLORS.primary,
    fontStyle: 'italic',
  },
  noPlannedTreks: {
    ...createTextStyle(12, 'regular'),
    color: COLORS.textSecondary,
    fontStyle: 'italic',
  },
  viewAllPlannedButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    ...SHADOWS.small,
  },
  viewAllPlannedText: {
    ...createTextStyle(14, 'medium'),
    color: COLORS.white,
  },
});

export default MyTreksScreen;
