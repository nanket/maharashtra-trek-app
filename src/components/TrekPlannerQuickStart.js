import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SHADOWS, SPACING, BORDER_RADIUS, createTextStyle } from '../utils/constants';

const { width } = Dimensions.get('window');

const TrekPlannerQuickStart = ({ navigation }) => {
  const quickActions = [
    {
      id: 'plan-new',
      title: 'Plan New Trek',
      subtitle: 'Start planning your adventure',
      icon: '🧭',
      color: COLORS.primary,
      action: () => navigation.navigate('TrekPlanner')
    },
    {
      id: 'emergency-kit',
      title: 'Emergency SOS',
      subtitle: 'Safety & emergency contacts',
      icon: '🚨',
      color: COLORS.error,
      action: () => navigation.navigate('Emergency')
    },
    {
      id: 'weather-check',
      title: 'Weather Check',
      subtitle: 'Current conditions',
      icon: '🌤️',
      color: COLORS.secondary,
      action: () => navigation.navigate('Lounge', { activeTab: 'weather' })
    },
    {
      id: 'find-buddies',
      title: 'Find Buddies',
      subtitle: 'Connect with trekkers',
      icon: '👥',
      color: COLORS.accent,
      action: () => navigation.navigate('Lounge', { activeTab: 'featured' })
    }
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🎯 Quick Actions</Text>
        <Text style={styles.subtitle}>Essential tools for every trekker</Text>
      </View>

      <View style={styles.actionsGrid}>
        {quickActions.map((action) => (
          <TouchableOpacity
            key={action.id}
            style={styles.actionCard}
            onPress={action.action}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[action.color + '15', action.color + '25']}
              style={styles.actionGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={[styles.iconContainer, { backgroundColor: action.color }]}>
                <Text style={styles.actionIcon}>{action.icon}</Text>
              </View>
              <View style={styles.actionContent}>
                <Text style={styles.actionTitle}>{action.title}</Text>
                <Text style={styles.actionSubtitle}>{action.subtitle}</Text>
              </View>
              <View style={styles.arrowContainer}>
                <Text style={styles.arrow}>→</Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        ))}
      </View>

      {/* Pro Tips Section */}
      <View style={styles.tipsSection}>
        <Text style={styles.tipsTitle}>💡 Pro Tips</Text>
        <View style={styles.tipsList}>
          <View style={styles.tipItem}>
            <Text style={styles.tipIcon}>📱</Text>
            <Text style={styles.tipText}>
              Download offline maps before heading out - network coverage can be spotty in mountains
            </Text>
          </View>
          <View style={styles.tipItem}>
            <Text style={styles.tipIcon}>⏰</Text>
            <Text style={styles.tipText}>
              Start early (5-6 AM) to avoid afternoon heat and crowds
            </Text>
          </View>
          <View style={styles.tipItem}>
            <Text style={styles.tipIcon}>💧</Text>
            <Text style={styles.tipText}>
              Carry 1 liter water per 2 hours of trekking + extra for emergencies
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: SPACING.xl,
  },
  header: {
    paddingHorizontal: SPACING.xl,
    marginBottom: SPACING.lg,
  },
  title: {
    ...createTextStyle(20, 'bold'),
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    ...createTextStyle(14, 'regular'),
    color: COLORS.textSecondary,
  },
  actionsGrid: {
    paddingHorizontal: SPACING.xl,
    marginBottom: SPACING.xl,
  },
  actionCard: {
    marginBottom: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    ...SHADOWS.medium,
  },
  actionGradient: {
    padding: SPACING.lg,
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  actionIcon: {
    fontSize: 24,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    ...createTextStyle(16, 'bold'),
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  actionSubtitle: {
    ...createTextStyle(12, 'regular'),
    color: COLORS.textSecondary,
  },
  arrowContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.backgroundCard,
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrow: {
    ...createTextStyle(16, 'bold'),
    color: COLORS.primary,
  },
  tipsSection: {
    paddingHorizontal: SPACING.xl,
  },
  tipsTitle: {
    ...createTextStyle(18, 'bold'),
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  tipsList: {
    backgroundColor: COLORS.backgroundCard,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    ...SHADOWS.small,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  tipIcon: {
    fontSize: 16,
    marginRight: SPACING.sm,
    marginTop: 2,
  },
  tipText: {
    ...createTextStyle(14, 'regular'),
    color: COLORS.textSecondary,
    flex: 1,
    lineHeight: 20,
  },
});

export default TrekPlannerQuickStart;
