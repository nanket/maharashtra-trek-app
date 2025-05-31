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
import treksData from '../data/treksData.json';
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
    return treksData.filter(trek => favorites.includes(trek.id));
  };

  // Get completed treks data
  const getCompletedTreksData = () => {
    return completedTreks.map(completed => {
      const trekData = treksData.find(trek => trek.id === completed.trekId);
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
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
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

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: COLORS.secondary }]}>
            <Text style={styles.statNumber}>{stats.totalCompleted}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: COLORS.accent }]}>
            <Text style={styles.statNumber}>{stats.totalFavorites}</Text>
            <Text style={styles.statLabel}>Wishlist</Text>
          </View>
        </View>
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: COLORS.fort }]}>
            <Text style={styles.statNumber}>{stats.categories.fort || 0}</Text>
            <Text style={styles.statLabel}>Forts</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: COLORS.waterfall }]}>
            <Text style={styles.statNumber}>{stats.categories.waterfall || 0}</Text>
            <Text style={styles.statLabel}>Waterfalls</Text>
          </View>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActionsContainer}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActionsGrid}>
          <TouchableOpacity
            style={styles.quickActionCard}
            onPress={() => setActiveTab('favorites')}
          >
            <Text style={styles.quickActionIcon}>❤️</Text>
            <Text style={styles.quickActionLabel}>View Wishlist</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickActionCard}
            onPress={() => setActiveTab('completed')}
          >
            <Text style={styles.quickActionIcon}>✅</Text>
            <Text style={styles.quickActionLabel}>Completed Treks</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickActionCard}
            onPress={() => navigation.navigate('Home')}
          >
            <Text style={styles.quickActionIcon}>🔍</Text>
            <Text style={styles.quickActionLabel}>Discover New</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickActionCard}
            onPress={() => navigation.navigate('Map')}
          >
            <Text style={styles.quickActionIcon}>🗺️</Text>
            <Text style={styles.quickActionLabel}>Explore Map</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

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
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {renderContent()}
      </ScrollView>
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
});

export default MyTreksScreen;
