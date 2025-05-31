import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Dimensions,
} from 'react-native';
import { COLORS, CATEGORIES, CATEGORY_COLORS, DIFFICULTY_COLORS, DIFFICULTY_LEVELS, SHADOWS, SPACING, BORDER_RADIUS, IMAGES } from '../utils/constants';
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

  // Get image from local assets
  const getImageSource = () => {
    return IMAGES[trek.imageKey] || IMAGES.defaultImage;
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

          {/* Rating Badge */}
          {trek.rating && (
            <View style={styles.ratingBadge}>
              <Text style={styles.ratingIcon}>⭐</Text>
              <Text style={styles.ratingText}>{trek.rating}</Text>
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

  // Stats section
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
    gap: SPACING.md,
  },
  statItem: {
    flex: 1,
  },
  difficultyBadge: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
  },
  difficultyText: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textLight,
    fontWeight: '600',
    marginBottom: SPACING.xs,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
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
