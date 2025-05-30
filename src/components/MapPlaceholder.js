import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { COLORS, SHADOWS, SPACING, BORDER_RADIUS } from '../utils/constants';

const MapPlaceholder = ({ coordinates, location }) => {
  const handleMapPress = () => {
    // TODO: Implement offline map functionality
    // This could integrate with react-native-maps or similar
    console.log('Map pressed for coordinates:', coordinates);
    alert('Offline map feature coming soon!\n\nCoordinates:\nLat: ' + 
          coordinates?.latitude + '\nLng: ' + coordinates?.longitude);
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={handleMapPress}
      activeOpacity={0.8}
    >
      <View style={styles.mapPlaceholder}>
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Text style={styles.mapIcon}>🗺️</Text>
          </View>
          <View style={styles.headerText}>
            <Text style={styles.title}>Offline Map</Text>
            <Text style={styles.subtitle}>Tap to view location details</Text>
          </View>
        </View>

        {location && (
          <View style={styles.locationContainer}>
            <Text style={styles.locationIcon}>📍</Text>
            <Text style={styles.location}>{location}</Text>
          </View>
        )}

        {coordinates && (
          <View style={styles.coordinatesContainer}>
            <Text style={styles.coordinatesLabel}>GPS Coordinates</Text>
            <Text style={styles.coordinates}>
              {coordinates.latitude.toFixed(4)}, {coordinates.longitude.toFixed(4)}
            </Text>
          </View>
        )}

        <View style={styles.actionContainer}>
          <View style={[styles.actionButton, { backgroundColor: COLORS.primary }]}>
            <Text style={styles.actionText}>View on Map</Text>
            <Text style={styles.actionArrow}>→</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: SPACING.lg,
  },
  mapPlaceholder: {
    backgroundColor: COLORS.backgroundCard,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.xl,
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderStyle: 'dashed',
    ...SHADOWS.medium,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: COLORS.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.lg,
  },
  mapIcon: {
    fontSize: 28,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundSecondary,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.md,
  },
  locationIcon: {
    fontSize: 16,
    marginRight: SPACING.sm,
  },
  location: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '600',
    flex: 1,
  },
  coordinatesContainer: {
    backgroundColor: COLORS.backgroundSecondary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.lg,
  },
  coordinatesLabel: {
    fontSize: 12,
    color: COLORS.textLight,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: SPACING.xs,
  },
  coordinates: {
    fontSize: 14,
    color: COLORS.text,
    fontFamily: 'monospace',
    fontWeight: '700',
  },
  actionContainer: {
    alignItems: 'center',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    ...SHADOWS.small,
  },
  actionText: {
    color: COLORS.textInverse,
    fontSize: 16,
    fontWeight: '700',
    marginRight: SPACING.sm,
  },
  actionArrow: {
    color: COLORS.textInverse,
    fontSize: 16,
    fontWeight: '700',
  },
});

export default MapPlaceholder;
