import React, { useState, useEffect } from 'react';
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
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SHADOWS, SPACING, BORDER_RADIUS, createTextStyle } from '../utils/constants';
import { 
  communityPosts, 
  featuredTrekkers, 
  communityStats, 
  trekRecommendations,
  weatherUpdates,
  getTimeAgo,
  getPostTypeIcon,
  getPostTypeColor
} from '../data/communityData';
import CommunityFeed from '../components/CommunityFeed';
import WeatherWidget from '../components/WeatherWidget';

const { width } = Dimensions.get('window');

const LoungeScreen = ({ navigation }) => {
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('feed');

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    // Simulate refresh delay
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  const tabs = [
    { id: 'feed', label: 'Community', icon: '👥' },
    { id: 'weather', label: 'Weather', icon: '🌤️' },
    { id: 'featured', label: 'Featured', icon: '⭐' },
  ];

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerTop}>
        <View>
          <Text style={styles.greeting}>Welcome to the</Text>
          <Text style={styles.title}>Trek Lounge 🏔️</Text>
        </View>
        <View style={styles.statsContainer}>
          <Text style={styles.statsNumber}>{communityStats.activeTrekkers}</Text>
          <Text style={styles.statsLabel}>Active Today</Text>
        </View>
      </View>
      
      {/* Community Stats Banner */}
      <LinearGradient
        colors={[COLORS.primary, COLORS.primaryDark]}
        style={styles.statsBanner}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{communityStats.totalMembers.toLocaleString()}</Text>
            <Text style={styles.statLabel}>Members</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{communityStats.treksCompletedThisMonth}</Text>
            <Text style={styles.statLabel}>Treks This Month</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{communityStats.weatherAlerts}</Text>
            <Text style={styles.statLabel}>Weather Alerts</Text>
          </View>
        </View>
      </LinearGradient>
    </View>
  );

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

  const renderFeaturedTrekkers = () => (
    <View style={styles.featuredSection}>
      <Text style={styles.sectionTitle}>🌟 Featured Trekkers</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {featuredTrekkers.map((trekker) => (
          <View key={trekker.id} style={styles.trekkerCard}>
            <View style={styles.trekkerAvatar}>
              <Text style={styles.trekkerAvatarText}>{trekker.avatar}</Text>
            </View>
            <Text style={styles.trekkerName}>{trekker.name}</Text>
            <Text style={styles.trekkerLevel}>{trekker.level}</Text>
            <View style={styles.trekkerStats}>
              <Text style={styles.trekkerStatsText}>{trekker.completedTreks} treks</Text>
            </View>
            <Text style={styles.trekkerAchievement}>{trekker.recentAchievement}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );

  const renderRecommendations = () => (
    <View style={styles.recommendationsSection}>
      <Text style={styles.sectionTitle}>🎯 Recommended for You</Text>
      {trekRecommendations.map((trek) => (
        <TouchableOpacity
          key={trek.id}
          style={styles.recommendationCard}
          onPress={() => {
            // Navigate to trek details if available
            // navigation.navigate('TrekDetails', { trek });
          }}
          activeOpacity={0.7}
        >
          <View style={styles.recommendationHeader}>
            <View style={styles.recommendationInfo}>
              <Text style={styles.recommendationName}>{trek.name}</Text>
              <Text style={styles.recommendationReason}>{trek.reason}</Text>
            </View>
            <View style={styles.recommendationRating}>
              <Text style={styles.ratingIcon}>⭐</Text>
              <Text style={styles.ratingText}>{trek.rating}</Text>
            </View>
          </View>
          <View style={styles.recommendationDetails}>
            <Text style={styles.recommendationDetail}>📍 {trek.distance}</Text>
            <Text style={styles.recommendationDetail}>👥 {trek.completedBy} completed</Text>
            <Text style={styles.recommendationDetail}>⚡ {trek.difficulty}</Text>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderQuickActions = () => (
    <View style={styles.quickActionsSection}>
      <Text style={styles.sectionTitle}>✨ Quick Actions</Text>
      <View style={styles.quickActionsGrid}>
        <TouchableOpacity
          style={styles.quickActionButton}
          onPress={() => {
            // Navigate to create post screen
            console.log('Create post pressed');
          }}
          activeOpacity={0.7}
        >
          <Text style={styles.quickActionIcon}>📝</Text>
          <Text style={styles.quickActionText}>Share Experience</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickActionButton}
          onPress={() => {
            // Navigate to ask question screen
            console.log('Ask question pressed');
          }}
          activeOpacity={0.7}
        >
          <Text style={styles.quickActionIcon}>❓</Text>
          <Text style={styles.quickActionText}>Ask Question</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickActionButton}
          onPress={() => {
            // Navigate to find trek buddies
            console.log('Find buddies pressed');
          }}
          activeOpacity={0.7}
        >
          <Text style={styles.quickActionIcon}>👥</Text>
          <Text style={styles.quickActionText}>Find Buddies</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickActionButton}
          onPress={() => {
            // Navigate to report weather
            console.log('Report weather pressed');
          }}
          activeOpacity={0.7}
        >
          <Text style={styles.quickActionIcon}>🌦️</Text>
          <Text style={styles.quickActionText}>Report Weather</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'feed':
        return (
          <>
            {renderQuickActions()}
            <CommunityFeed posts={communityPosts} navigation={navigation} />
            {renderRecommendations()}
          </>
        );
      case 'weather':
        return <WeatherWidget weatherData={weatherUpdates} />;
      case 'featured':
        return renderFeaturedTrekkers();
      default:
        return <CommunityFeed posts={communityPosts} navigation={navigation} />;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}
      {renderTabButtons()}

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >
        {renderContent()}
      </ScrollView>

      {/* Floating Action Button */}
      {activeTab === 'feed' && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => {
            console.log('FAB pressed - Create new post');
          }}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={[COLORS.primary, COLORS.primaryDark]}
            style={styles.fabGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.fabIcon}>✏️</Text>
          </LinearGradient>
        </TouchableOpacity>
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
    backgroundColor: COLORS.background,
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.md,
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
  title: {
    ...createTextStyle(28, 'bold'),
    color: COLORS.text,
    letterSpacing: -0.5,
  },
  statsContainer: {
    alignItems: 'center',
  },
  statsNumber: {
    ...createTextStyle(24, 'bold'),
    color: COLORS.primary,
  },
  statsLabel: {
    ...createTextStyle(12, 'medium'),
    color: COLORS.textSecondary,
  },
  statsBanner: {
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginTop: SPACING.sm,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    ...createTextStyle(18, 'bold'),
    color: COLORS.textInverse,
    marginBottom: SPACING.xs,
  },
  statLabel: {
    ...createTextStyle(12, 'medium'),
    color: COLORS.textInverse,
    opacity: 0.9,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: COLORS.textInverse,
    opacity: 0.3,
    marginHorizontal: SPACING.md,
  },
  tabContainer: {
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceBorder,
  },
  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    marginRight: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.backgroundSecondary,
  },
  activeTabButton: {
    backgroundColor: COLORS.primary,
  },
  tabIcon: {
    fontSize: 16,
    marginRight: SPACING.xs,
  },
  tabLabel: {
    ...createTextStyle(14, 'medium'),
    color: COLORS.textSecondary,
  },
  activeTabLabel: {
    color: COLORS.textInverse,
  },
  scrollView: {
    flex: 1,
  },
  featuredSection: {
    padding: SPACING.xl,
  },
  sectionTitle: {
    ...createTextStyle(18, 'bold'),
    color: COLORS.text,
    marginBottom: SPACING.lg,
  },
  trekkerCard: {
    width: 140,
    backgroundColor: COLORS.backgroundCard,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginRight: SPACING.md,
    alignItems: 'center',
    ...SHADOWS.medium,
  },
  trekkerAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  trekkerAvatarText: {
    fontSize: 24,
  },
  trekkerName: {
    ...createTextStyle(14, 'bold'),
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  trekkerLevel: {
    ...createTextStyle(12, 'medium'),
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  trekkerStats: {
    backgroundColor: COLORS.backgroundSecondary,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
    marginBottom: SPACING.sm,
  },
  trekkerStatsText: {
    ...createTextStyle(11, 'medium'),
    color: COLORS.primary,
  },
  trekkerAchievement: {
    ...createTextStyle(10, 'regular'),
    color: COLORS.textLight,
    textAlign: 'center',
  },
  recommendationsSection: {
    padding: SPACING.xl,
  },
  recommendationCard: {
    backgroundColor: COLORS.backgroundCard,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    ...SHADOWS.small,
  },
  recommendationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  recommendationInfo: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  recommendationName: {
    ...createTextStyle(16, 'bold'),
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  recommendationReason: {
    ...createTextStyle(12, 'regular'),
    color: COLORS.textSecondary,
  },
  recommendationRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingIcon: {
    fontSize: 14,
    marginRight: SPACING.xs,
  },
  ratingText: {
    ...createTextStyle(14, 'bold'),
    color: COLORS.text,
  },
  recommendationDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  recommendationDetail: {
    ...createTextStyle(12, 'medium'),
    color: COLORS.textSecondary,
  },
  quickActionsSection: {
    padding: SPACING.xl,
    paddingBottom: SPACING.md,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickActionButton: {
    width: (width - SPACING.xl * 2 - SPACING.md) / 2,
    backgroundColor: COLORS.backgroundCard,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    alignItems: 'center',
    marginBottom: SPACING.md,
    ...SHADOWS.small,
  },
  quickActionIcon: {
    fontSize: 24,
    marginBottom: SPACING.sm,
  },
  quickActionText: {
    ...createTextStyle(12, 'medium'),
    color: COLORS.text,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    bottom: 30, // Increased spacing to avoid tab bar overlap
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    ...SHADOWS.large,
    zIndex: 10, // Ensure FAB is above other elements
    elevation: 10,
  },
  fabGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fabIcon: {
    fontSize: 24,
    color: COLORS.textInverse,
  },
});

export default LoungeScreen;
