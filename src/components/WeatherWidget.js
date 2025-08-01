import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import WeatherService from '../services/WeatherService';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS, createTextStyle } from '../utils/constants';

/**
 * Weather Widget Component
 *
 * Features:
 * - Current weather display
 * - 5-day forecast
 * - Trek safety assessment
 * - Weather-based recommendations
 * - Auto-refresh functionality
 */
const WeatherWidget = ({
  coordinates,
  trekName = 'Trek Location',
  showForecast = true,
  showSafetyAssessment = true,
  compact = false
}) => {
  const [currentWeather, setCurrentWeather] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [safetyAssessment, setSafetyAssessment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    if (coordinates?.latitude && coordinates?.longitude) {
      fetchWeatherData();
    }
  }, [coordinates]);

  const fetchWeatherData = async () => {
    if (!coordinates?.latitude || !coordinates?.longitude) {
      setError(true);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(false);

      const [weatherData, forecastData] = await Promise.all([
        WeatherService.getCurrentWeather(coordinates.latitude, coordinates.longitude),
        showForecast ? WeatherService.getWeatherForecast(coordinates.latitude, coordinates.longitude) : null,
      ]);

      setCurrentWeather(weatherData);
      if (forecastData) {
        setForecast(forecastData);
      }

      // Generate safety assessment
      if (showSafetyAssessment && weatherData && !weatherData.error) {
        const assessment = WeatherService.getTrekSafetyAssessment(
          weatherData,
          forecastData || { forecast: [] }
        );
        setSafetyAssessment(assessment);
      }

      setLastUpdated(new Date());
    } catch (err) {
      console.error('Weather fetch error:', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchWeatherData();
  };
  const formatTime = (date) => {
    if (!date) return '';
    return date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDate = (date) => {
    if (!date) return '';
    return date.toLocaleDateString('en-IN', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const getSafetyColor = (level) => {
    switch (level) {
      case 'safe': return COLORS.success;
      case 'caution': return COLORS.warning;
      case 'dangerous': return COLORS.error;
      default: return COLORS.textSecondary;
    }
  };

  const getSafetyIcon = (level) => {
    switch (level) {
      case 'safe': return '✅';
      case 'caution': return '⚠️';
      case 'dangerous': return '🚨';
      default: return 'ℹ️';
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, compact && styles.compactContainer]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading weather data...</Text>
        </View>
      </View>
    );
  }

  if (error || !currentWeather) {
    return (
      <View style={[styles.container, compact && styles.compactContainer]}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorIcon}>🌤️</Text>
          <Text style={styles.errorText}>Weather data unavailable</Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (compact) {
    return (
      <View style={styles.compactContainer}>
        <View style={styles.compactWeather}>
          <Text style={styles.compactEmoji}>
            {WeatherService.getWeatherEmoji(currentWeather.main)}
          </Text>
          <View style={styles.compactInfo}>
            <Text style={styles.compactTemp}>{currentWeather.temperature}°C</Text>
            <Text style={styles.compactDesc}>{currentWeather.description}</Text>
          </View>
          {safetyAssessment && (
            <Text style={[styles.compactSafety, { color: getSafetyColor(safetyAssessment.safetyLevel) }]}>
              {getSafetyIcon(safetyAssessment.safetyLevel)}
            </Text>
          )}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>🌦️ Weather Conditions</Text>
        <TouchableOpacity style={styles.refreshButton} onPress={handleRefresh}>
          <Text style={styles.refreshIcon}>🔄</Text>
        </TouchableOpacity>
      </View>

      {/* Current Weather */}
      <View style={styles.currentWeather}>
        <View style={styles.currentMain}>
          <Text style={styles.weatherEmoji}>
            {WeatherService.getWeatherEmoji(currentWeather.main)}
          </Text>
          <View style={styles.currentInfo}>
            <Text style={styles.temperature}>{currentWeather.temperature}°C</Text>
            <Text style={styles.description}>{currentWeather.description}</Text>
            <Text style={styles.feelsLike}>Feels like {currentWeather.feelsLike}°C</Text>
          </View>
        </View>

        {/* Weather Details */}
        <View style={styles.weatherDetails}>
          <View style={styles.detailItem}>
            <Text style={styles.detailIcon}>💧</Text>
            <Text style={styles.detailLabel}>Humidity</Text>
            <Text style={styles.detailValue}>{currentWeather.humidity}%</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailIcon}>💨</Text>
            <Text style={styles.detailLabel}>Wind</Text>
            <Text style={styles.detailValue}>{currentWeather.windSpeed} km/h</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailIcon}>👁️</Text>
            <Text style={styles.detailLabel}>Visibility</Text>
            <Text style={styles.detailValue}>
              {currentWeather.visibility ? `${currentWeather.visibility} km` : 'N/A'}
            </Text>
          </View>
        </View>

        {/* Sun Times */}
        {currentWeather.sunrise && currentWeather.sunset && (
          <View style={styles.sunTimes}>
            <View style={styles.sunTime}>
              <Text style={styles.sunIcon}>🌅</Text>
              <Text style={styles.sunLabel}>Sunrise</Text>
              <Text style={styles.sunValue}>{formatTime(currentWeather.sunrise)}</Text>
            </View>
            <View style={styles.sunTime}>
              <Text style={styles.sunIcon}>🌇</Text>
              <Text style={styles.sunLabel}>Sunset</Text>
              <Text style={styles.sunValue}>{formatTime(currentWeather.sunset)}</Text>
            </View>
          </View>
        )}
      </View>

      {/* Safety Assessment */}
      {showSafetyAssessment && safetyAssessment && (
        <View style={[styles.safetyAssessment, { borderLeftColor: getSafetyColor(safetyAssessment.safetyLevel) }]}>
          <View style={styles.safetyHeader}>
            <Text style={styles.safetyIcon}>{getSafetyIcon(safetyAssessment.safetyLevel)}</Text>
            <Text style={[styles.safetyLevel, { color: getSafetyColor(safetyAssessment.safetyLevel) }]}>
              Trek Safety: {safetyAssessment.safetyLevel.toUpperCase()}
            </Text>
          </View>
          <Text style={styles.safetyRecommendation}>{safetyAssessment.recommendation}</Text>
          {safetyAssessment.warnings.length > 0 && (
            <View style={styles.warningsContainer}>
              {safetyAssessment.warnings.map((warning, index) => (
                <Text key={index} style={styles.warningText}>• {warning}</Text>
              ))}
            </View>
          )}
        </View>
      )}

      {/* 5-Day Forecast */}
      {showForecast && forecast && forecast.forecast.length > 0 && (
        <View style={styles.forecastContainer}>
          <Text style={styles.forecastTitle}>5-Day Forecast</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.forecastScroll}>
            {forecast.forecast.map((day, index) => (
              <View key={index} style={styles.forecastDay}>
                <Text style={styles.forecastDate}>{formatDate(day.date)}</Text>
                <Text style={styles.forecastEmoji}>
                  {WeatherService.getWeatherEmoji(day.condition.main)}
                </Text>
                <Text style={styles.forecastTemp}>{day.maxTemp}°</Text>
                <Text style={styles.forecastTempMin}>{day.minTemp}°</Text>
                {day.precipitation > 0 && (
                  <Text style={styles.forecastRain}>💧 {day.precipitation}mm</Text>
                )}
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Last Updated */}
      {lastUpdated && (
        <Text style={styles.lastUpdated}>
          Last updated: {formatTime(lastUpdated)}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.backgroundCard,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    ...SHADOWS.medium,
  },
  compactContainer: {
    backgroundColor: COLORS.backgroundCard,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    ...SHADOWS.small,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  title: {
    ...createTextStyle(18, 'bold', COLORS.text),
  },
  refreshButton: {
    padding: SPACING.sm,
  },
  refreshIcon: {
    fontSize: 16,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  loadingText: {
    ...createTextStyle(14, 'medium', COLORS.textSecondary),
    marginTop: SPACING.md,
  },
  errorContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: SPACING.md,
  },
  errorText: {
    ...createTextStyle(16, 'medium', COLORS.textSecondary),
    marginBottom: SPACING.lg,
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
  },
  retryButtonText: {
    ...createTextStyle(14, 'semibold', COLORS.white),
  },
  currentWeather: {
    marginBottom: SPACING.lg,
  },
  currentMain: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  weatherEmoji: {
    fontSize: 64,
    marginRight: SPACING.lg,
  },
  currentInfo: {
    flex: 1,
  },
  temperature: {
    ...createTextStyle(36, 'bold', COLORS.text),
    lineHeight: 40,
  },
  description: {
    ...createTextStyle(16, 'medium', COLORS.textSecondary),
    textTransform: 'capitalize',
    marginBottom: SPACING.xs,
  },
  feelsLike: {
    ...createTextStyle(14, 'regular', COLORS.textLight),
  },
  weatherDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
  },
  detailItem: {
    alignItems: 'center',
    flex: 1,
  },
  detailIcon: {
    fontSize: 20,
    marginBottom: SPACING.xs,
  },
  detailLabel: {
    ...createTextStyle(12, 'medium', COLORS.textSecondary),
    marginBottom: SPACING.xs,
  },
  detailValue: {
    ...createTextStyle(14, 'semibold', COLORS.text),
  },
  sunTimes: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: SPACING.md,
  },
  sunTime: {
    alignItems: 'center',
  },
  sunIcon: {
    fontSize: 20,
    marginBottom: SPACING.xs,
  },
  sunLabel: {
    ...createTextStyle(12, 'medium', COLORS.textSecondary),
    marginBottom: SPACING.xs,
  },
  sunValue: {
    ...createTextStyle(14, 'semibold', COLORS.text),
  },
  safetyAssessment: {
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    borderLeftWidth: 4,
  },
  safetyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  safetyIcon: {
    fontSize: 20,
    marginRight: SPACING.md,
  },
  safetyLevel: {
    ...createTextStyle(16, 'bold'),
  },
  safetyRecommendation: {
    ...createTextStyle(14, 'medium', COLORS.text),
    marginBottom: SPACING.md,
  },
  warningsContainer: {
    marginTop: SPACING.sm,
  },
  warningText: {
    ...createTextStyle(13, 'regular', COLORS.textSecondary),
    marginBottom: SPACING.xs,
  },
  forecastContainer: {
    marginBottom: SPACING.lg,
  },
  forecastTitle: {
    ...createTextStyle(16, 'bold', COLORS.text),
    marginBottom: SPACING.md,
  },
  forecastScroll: {
    marginHorizontal: -SPACING.sm,
  },
  forecastDay: {
    alignItems: 'center',
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginHorizontal: SPACING.sm,
    minWidth: 80,
  },
  forecastDate: {
    ...createTextStyle(12, 'semibold', COLORS.textSecondary),
    marginBottom: SPACING.sm,
  },
  forecastEmoji: {
    fontSize: 24,
    marginBottom: SPACING.sm,
  },
  forecastTemp: {
    ...createTextStyle(16, 'bold', COLORS.text),
  },
  forecastTempMin: {
    ...createTextStyle(14, 'regular', COLORS.textSecondary),
  },
  forecastRain: {
    ...createTextStyle(10, 'medium', COLORS.primary),
    marginTop: SPACING.xs,
  },
  lastUpdated: {
    ...createTextStyle(12, 'regular', COLORS.textLight),
    textAlign: 'center',
    marginTop: SPACING.md,
  },
  // Compact styles
  compactWeather: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  compactEmoji: {
    fontSize: 32,
    marginRight: SPACING.md,
  },
  compactInfo: {
    flex: 1,
  },
  compactTemp: {
    ...createTextStyle(18, 'bold', COLORS.text),
  },
  compactDesc: {
    ...createTextStyle(12, 'medium', COLORS.textSecondary),
    textTransform: 'capitalize',
  },
  compactSafety: {
    fontSize: 20,
    marginLeft: SPACING.md,
  },
});

export default WeatherWidget;
