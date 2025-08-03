import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Dimensions,
} from 'react-native';
import { COLORS, CATEGORIES, CATEGORY_COLORS, DIFFICULTY_COLORS, DIFFICULTY_LEVELS, SHADOWS, SPACING, BORDER_RADIUS, IMAGES, CLOUDINARY_IMAGES } from '../utils/constants';
import UserStorageService from '../utils/userStorage';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - (SPACING.lg * 2);

const TrekCard = ({ trek, onPress, showFavoriteButton = true }) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(false);

  const categoryData = CATEGORY_COLORS[trek.category] || CATEGORY_COLORS[CATEGORIES.TREK];
  const difficultyData = DIFFICULTY_COLORS[trek.difficulty] || DIFFICULTY_COLORS[DIFFICULTY_LEVELS.EASY];

  // Check if trek is in favorites
  useEffect(() => {
    checkFavoriteStatus();
  }, [trek.id]);

  const checkFavoriteStatus = async () => {
    try {
      const favoriteStatus = await UserStorageService.isFavorite(trek.id);
      setIsFavorite(favoriteStatus);
    } catch (error) {
      console.error('Error checking favorite status:', error);
    }
  };

  const handleFavoriteToggle = async () => {
    if (loading) return;

    setLoading(true);
    try {
      if (isFavorite) {
        await UserStorageService.removeFromFavorites(trek.id);
        setIsFavorite(false);
      } else {
        await UserStorageService.addToFavorites(trek.id);
        setIsFavorite(true);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get image from multiple sources - direct URLs, images array, imageKey, or local assets
  const getImageSource = () => {
    // First check if there's a direct images array with URLs
    if (trek.images && trek.images.length > 0) {
      const firstImage = trek.images[0];
      if (firstImage && firstImage.startsWith('http')) {
        return { uri: firstImage };
      }
    }

    // Check if imageKey points to a Cloudinary image
    if (trek.imageKey && CLOUDINARY_IMAGES[trek.imageKey]) {
      return { uri: CLOUDINARY_IMAGES[trek.imageKey] };
    }

    // Check if imageKey points to a local image
    if (trek.imageKey && IMAGES[trek.imageKey]) {
      return IMAGES[trek.imageKey];
    }

    // Fallback to default image
    return IMAGES.defaultImage;
  };

  return (
    <TouchableOpacity
      style={styles.cardContainer}
      onPress={() => onPress(trek)}
      activeOpacity={0.8}
    >
      <View style={styles.card}>
        {/* Image Section */}
        <View style={styles.imageContainer}>
          <Image
            source={getImageSource()}
            style={styles.image}
            resizeMode="cover"
          />

          {/* Category Badge */}
          <View style={[styles.categoryBadge, { backgroundColor: categoryData?.primary || COLORS.primary }]}>
            <Text style={styles.categoryIcon}>{categoryData?.emoji || '📍'}</Text>
            <Text style={styles.categoryText}>
              {trek.category.charAt(0).toUpperCase() + trek.category.slice(1)}
            </Text>
          </View>

          {/* Distance Badge (for nearby treks) */}
          {trek.distanceText && (
            <View style={styles.distanceBadge}>
              <Text style={styles.distanceIcon}>📍</Text>
              <Text style={styles.distanceText}>{trek.distanceText}</Text>
            </View>
          )}

          {/* Rating Badge */}
          {trek.rating && !trek.distanceText && (
            <View style={styles.ratingBadge}>
              <Text style={styles.ratingIcon}>⭐</Text>
              <Text style={styles.ratingText}>{trek.rating}</Text>
            </View>
          )}

          {/* Featured Badge (for featured treks when no location) */}
          {trek.showAsFeatured && (
            <View style={styles.featuredBadge}>
              <Text style={styles.featuredIcon}>⭐</Text>
              <Text style={styles.featuredText}>{trek.rating}</Text>
            </View>
          )}

          {/* Favorite Button */}
          {showFavoriteButton && (
            <TouchableOpacity
              style={styles.favoriteButton}
              onPress={handleFavoriteToggle}
              disabled={loading}
              activeOpacity={0.8}
            >
              <Text style={styles.favoriteIcon}>
                {isFavorite ? '❤️' : '🤍'}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Content Section */}
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>{trek.name}</Text>
            <View style={styles.locationContainer}>
              <Text style={styles.locationIcon}>📍</Text>
              <Text style={styles.location}>{trek.location}</Text>
            </View>
          </View>

          {/* Stats Row */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <View style={[styles.difficultyBadge, { backgroundColor: difficultyData?.background || COLORS.backgroundSecondary }]}>
                <Text style={[styles.difficultyText, { color: difficultyData?.color || COLORS.text }]}>
                  {trek.difficulty}
                </Text>
              </View>
            </View>

            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Duration</Text>
              <Text style={styles.statValue}>{trek.duration}</Text>
            </View>

            {trek.elevation && (
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Elevation</Text>
                <Text style={styles.statValue}>{trek.elevation}</Text>
              </View>
            )}
          </View>

          {/* Action Button */}
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: COLORS.primary }]}
            onPress={() => onPress(trek)}
            activeOpacity={0.8}
          >
            <Text style={styles.actionText}>View Details</Text>
            <Text style={styles.actionArrow}>→</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    marginHorizontal: SPACING.lg,
    marginVertical: SPACING.md,
  },
  card: {
    backgroundColor: COLORS.backgroundCard,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
    ...SHADOWS.medium,
  },

  // Image section
  imageContainer: {
    position: 'relative',
    height: 200,
  },
  image: {
    width: '100%',
    height: '100%',
    backgroundColor: COLORS.backgroundSecondary,
  },
  categoryBadge: {
    position: 'absolute',
    top: SPACING.md,
    left: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
    ...SHADOWS.small,
  },
  categoryIcon: {
    fontSize: 14,
    marginRight: SPACING.xs,
  },
  categoryText: {
    color: COLORS.textInverse,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  distanceBadge: {
    position: 'absolute',
    top: SPACING.md,
    right: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.info,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
    ...SHADOWS.small,
  },
  distanceIcon: {
    fontSize: 12,
    marginRight: SPACING.xs,
  },
  distanceText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textInverse,
  },
  ratingBadge: {
    position: 'absolute',
    top: SPACING.md,
    right: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundCard,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
    ...SHADOWS.small,
  },
  ratingIcon: {
    fontSize: 12,
    marginRight: SPACING.xs,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.text,
  },
  featuredBadge: {
    position: 'absolute',
    top: SPACING.md,
    right: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.accent,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
    ...SHADOWS.small,
  },
  featuredIcon: {
    fontSize: 12,
    marginRight: SPACING.xs,
  },
  featuredText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textInverse,
  },
  favoriteButton: {
    position: 'absolute',
    bottom: SPACING.md,
    right: SPACING.md,
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.medium,
  },
  favoriteIcon: {
    fontSize: 20,
  },

  // Content section
  content: {
    padding: SPACING.lg,
  },
  header: {
    marginBottom: SPACING.md,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: SPACING.xs,
    lineHeight: 24,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationIcon: {
    fontSize: 14,
    marginRight: SPACING.xs,
  },
  location: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },

  // Stats section - Compact design
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
    gap: SPACING.sm,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  difficultyBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
    alignItems: 'center',
    minWidth: 60,
  },
  difficultyText: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statLabel: {
    fontSize: 10,
    color: COLORS.textLight,
    fontWeight: '600',
    marginBottom: 2,
    textAlign: 'center',
  },
  statValue: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
  },

  // Action button
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
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

export default TrekCard;
