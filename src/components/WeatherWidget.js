import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SHADOWS, SPACING, BORDER_RADIUS, createTextStyle } from '../utils/constants';

const { width } = Dimensions.get('window');

const WeatherWidget = ({ weatherData }) => {
  const getTrekConditionColor = (condition) => {
    switch (condition.toLowerCase()) {
      case 'excellent': return COLORS.success;
      case 'good': return COLORS.secondary;
      case 'caution': return COLORS.warning;
      case 'poor': return COLORS.error;
      default: return COLORS.textSecondary;
    }
  };

  const getTrekConditionIcon = (condition) => {
    switch (condition.toLowerCase()) {
      case 'excellent': return '✅';
      case 'good': return '👍';
      case 'caution': return '⚠️';
      case 'poor': return '❌';
      default: return '❓';
    }
  };

  const renderWeatherCard = (weather, index) => {
    const conditionColor = getTrekConditionColor(weather.trekCondition);
    const conditionIcon = getTrekConditionIcon(weather.trekCondition);

    return (
      <View key={index} style={styles.weatherCard}>
        <LinearGradient
          colors={[COLORS.backgroundCard, COLORS.backgroundSecondary]}
          style={styles.weatherGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {/* Location Header */}
          <View style={styles.weatherHeader}>
            <Text style={styles.weatherIcon}>{weather.icon}</Text>
            <View style={styles.locationInfo}>
              <Text style={styles.locationName}>{weather.location}</Text>
              <Text style={styles.weatherCondition}>{weather.condition}</Text>
            </View>
            <Text style={styles.temperature}>{weather.temperature}</Text>
          </View>

          {/* Weather Details */}
          <View style={styles.weatherDetails}>
            <View style={styles.detailItem}>
              <Text style={styles.detailIcon}>💧</Text>
              <Text style={styles.detailLabel}>Humidity</Text>
              <Text style={styles.detailValue}>{weather.humidity}</Text>
            </View>
            
            <View style={styles.detailItem}>
              <Text style={styles.detailIcon}>💨</Text>
              <Text style={styles.detailLabel}>Wind</Text>
              <Text style={styles.detailValue}>{weather.windSpeed}</Text>
            </View>
          </View>

          {/* Trek Condition */}
          <View style={[styles.trekCondition, { backgroundColor: conditionColor + '15' }]}>
            <Text style={styles.conditionIcon}>{conditionIcon}</Text>
            <Text style={styles.conditionLabel}>Trek Condition:</Text>
            <Text style={[styles.conditionValue, { color: conditionColor }]}>
              {weather.trekCondition}
            </Text>
          </View>
        </LinearGradient>
      </View>
    );
  };

  const renderWeatherTips = () => (
    <View style={styles.tipsSection}>
      <Text style={styles.tipsTitle}>🌦️ Weather Tips</Text>
      <View style={styles.tipsList}>
        <View style={styles.tipItem}>
          <Text style={styles.tipIcon}>☀️</Text>
          <Text style={styles.tipText}>
            Clear skies are perfect for photography and panoramic views
          </Text>
        </View>
        
        <View style={styles.tipItem}>
          <Text style={styles.tipIcon}>⛅</Text>
          <Text style={styles.tipText}>
            Partly cloudy conditions offer comfortable trekking temperatures
          </Text>
        </View>
        
        <View style={styles.tipItem}>
          <Text style={styles.tipIcon}>🌧️</Text>
          <Text style={styles.tipText}>
            Avoid trekking during heavy rain - trails become slippery and dangerous
          </Text>
        </View>
        
        <View style={styles.tipItem}>
          <Text style={styles.tipIcon}>🌪️</Text>
          <Text style={styles.tipText}>
            High winds can make ridge walks challenging - exercise extra caution
          </Text>
        </View>
      </View>
    </View>
  );

  const renderWeatherAlert = () => (
    <View style={styles.alertSection}>
      <LinearGradient
        colors={[COLORS.warning + '20', COLORS.error + '20']}
        style={styles.alertGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <View style={styles.alertContent}>
          <Text style={styles.alertIcon}>⚠️</Text>
          <View style={styles.alertText}>
            <Text style={styles.alertTitle}>Weather Advisory</Text>
            <Text style={styles.alertMessage}>
              Monsoon season is approaching. Check local weather conditions before planning any treks.
              Always carry rain gear and inform someone about your trekking plans.
            </Text>
          </View>
        </View>
      </LinearGradient>
    </View>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>🌤️ Weather Updates</Text>
          <Text style={styles.headerSubtitle}>
            Current conditions for popular trekking regions
          </Text>
        </View>

        {/* Weather Alert */}
        {renderWeatherAlert()}

        {/* Weather Cards */}
        <View style={styles.weatherSection}>
          {weatherData.map((weather, index) => renderWeatherCard(weather, index))}
        </View>

        {/* Weather Tips */}
        {renderWeatherTips()}

        {/* Last Updated */}
        <View style={styles.lastUpdated}>
          <Text style={styles.lastUpdatedText}>
            Last updated: {new Date().toLocaleTimeString()} • Tap to refresh
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: SPACING.xl,
  },
  header: {
    marginBottom: SPACING.lg,
  },
  headerTitle: {
    ...createTextStyle(18, 'bold'),
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  headerSubtitle: {
    ...createTextStyle(14, 'regular'),
    color: COLORS.textSecondary,
  },
  alertSection: {
    marginBottom: SPACING.lg,
  },
  alertGradient: {
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
  },
  alertContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  alertIcon: {
    fontSize: 24,
    marginRight: SPACING.sm,
  },
  alertText: {
    flex: 1,
  },
  alertTitle: {
    ...createTextStyle(14, 'bold'),
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  alertMessage: {
    ...createTextStyle(12, 'regular'),
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  weatherSection: {
    marginBottom: SPACING.lg,
  },
  weatherCard: {
    marginBottom: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    ...SHADOWS.medium,
  },
  weatherGradient: {
    padding: SPACING.lg,
  },
  weatherHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  weatherIcon: {
    fontSize: 32,
    marginRight: SPACING.sm,
  },
  locationInfo: {
    flex: 1,
  },
  locationName: {
    ...createTextStyle(16, 'bold'),
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  weatherCondition: {
    ...createTextStyle(12, 'medium'),
    color: COLORS.textSecondary,
  },
  temperature: {
    ...createTextStyle(24, 'bold'),
    color: COLORS.primary,
  },
  weatherDetails: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.background + '50',
    borderRadius: BORDER_RADIUS.sm,
  },
  detailItem: {
    alignItems: 'center',
  },
  detailIcon: {
    fontSize: 16,
    marginBottom: SPACING.xs,
  },
  detailLabel: {
    ...createTextStyle(10, 'medium'),
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  detailValue: {
    ...createTextStyle(12, 'bold'),
    color: COLORS.text,
  },
  trekCondition: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.sm,
  },
  conditionIcon: {
    fontSize: 16,
    marginRight: SPACING.xs,
  },
  conditionLabel: {
    ...createTextStyle(12, 'medium'),
    color: COLORS.textSecondary,
    marginRight: SPACING.xs,
  },
  conditionValue: {
    ...createTextStyle(12, 'bold'),
  },
  tipsSection: {
    marginBottom: SPACING.lg,
  },
  tipsTitle: {
    ...createTextStyle(16, 'bold'),
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
    ...createTextStyle(12, 'regular'),
    color: COLORS.textSecondary,
    flex: 1,
    lineHeight: 18,
  },
  lastUpdated: {
    alignItems: 'center',
    paddingTop: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.surfaceBorder,
  },
  lastUpdatedText: {
    ...createTextStyle(11, 'regular'),
    color: COLORS.textLight,
  },
});

export default WeatherWidget;
