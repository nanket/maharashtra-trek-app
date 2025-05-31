import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, CATEGORIES, CATEGORY_COLORS, DIFFICULTY_COLORS, DIFFICULTY_LEVELS, SHADOWS, SPACING, BORDER_RADIUS, IMAGES } from '../utils/constants';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.75;

const FeaturedTrekCard = ({ trek, onPress }) => {
  const categoryData = CATEGORY_COLORS[trek.category] || CATEGORY_COLORS[CATEGORIES.TREK];
  const difficultyData = DIFFICULTY_COLORS[trek.difficulty] || DIFFICULTY_COLORS[DIFFICULTY_LEVELS.EASY];
  
  // Get image from local assets
  const getImageSource = () => {
    return IMAGES[trek.imageKey] || IMAGES.defaultImage;
  };

  return (
    <TouchableOpacity
      style={styles.cardContainer}
      onPress={() => onPress(trek)}
      activeOpacity={0.9}
    >
      <View style={styles.card}>
        {/* Enhanced Image Section */}
        <View style={styles.imageContainer}>
          <Image
            source={getImageSource()}
            style={styles.image}
            resizeMode="cover"
          />

          {/* Image Overlay Gradient */}
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.3)']}
            style={styles.imageOverlay}
          />

          {/* Enhanced Featured Badge */}
          <LinearGradient
            colors={[COLORS.accent, COLORS.accentDark]}
            style={styles.featuredBadge}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.featuredIcon}>⭐</Text>
            <Text style={styles.featuredText}>Featured</Text>
          </LinearGradient>

          {/* Enhanced Category Badge */}
          <View style={[styles.categoryBadge, { backgroundColor: categoryData?.primary || COLORS.primary }]}>
            <Text style={styles.categoryIcon}>{categoryData?.emoji || '📍'}</Text>
          </View>

          {/* Quick Action Buttons */}
          <View style={styles.quickActions}>
            <TouchableOpacity style={styles.quickActionButton}>
              <Text style={styles.quickActionIcon}>🔖</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickActionButton}>
              <Text style={styles.quickActionIcon}>📤</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Enhanced Content Section */}
        <LinearGradient
          colors={['rgba(255,255,255,0.95)', 'rgba(255,255,255,1)']}
          style={styles.contentGradient}
        >
          <View style={styles.content}>
            <Text style={styles.title}>{trek.name}</Text>
            <View style={styles.locationContainer}>
              <Text style={styles.locationIcon}>📍</Text>
              <Text style={styles.location}>{trek.location}</Text>
            </View>

            <View style={styles.statsRow}>
              <View style={[styles.difficultyBadge, { backgroundColor: difficultyData?.background || COLORS.backgroundSecondary }]}>
                <Text style={[styles.difficultyText, { color: difficultyData?.color || COLORS.text }]}>
                  {trek.difficulty}
                </Text>
              </View>

              <View style={styles.ratingContainer}>
                <Text style={styles.ratingIcon}>⭐</Text>
                <Text style={styles.ratingText}>{trek.rating}</Text>
                <Text style={styles.reviewCount}>({trek.reviewCount})</Text>
              </View>
            </View>

            {/* Additional Info */}
            <View style={styles.additionalInfo}>
              <View style={styles.infoItem}>
                <Text style={styles.infoIcon}>⏱️</Text>
                <Text style={styles.infoText}>{trek.duration}</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoIcon}>📏</Text>
                <Text style={styles.infoText}>{trek.elevation}</Text>
              </View>
            </View>
          </View>
        </LinearGradient>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    width: CARD_WIDTH,
    marginRight: SPACING.lg,
  },
  card: {
    backgroundColor: COLORS.backgroundCard,
    borderRadius: BORDER_RADIUS.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
    ...SHADOWS.large,
  },

  // Enhanced Image section
  imageContainer: {
    position: 'relative',
    height: 180,
  },
  image: {
    width: '100%',
    height: '100%',
    backgroundColor: COLORS.backgroundSecondary,
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
  },
  featuredBadge: {
    position: 'absolute',
    top: SPACING.md,
    left: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
    ...SHADOWS.medium,
  },
  featuredIcon: {
    fontSize: 12,
    marginRight: SPACING.xs,
    color: COLORS.textInverse,
  },
  featuredText: {
    color: COLORS.textInverse,
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  categoryBadge: {
    position: 'absolute',
    top: SPACING.md,
    right: SPACING.md,
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.full,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.medium,
  },
  categoryIcon: {
    fontSize: 20,
  },
  quickActions: {
    position: 'absolute',
    bottom: SPACING.md,
    right: SPACING.md,
    flexDirection: 'row',
  },
  quickActionButton: {
    width: 32,
    height: 32,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: SPACING.sm,
    ...SHADOWS.small,
  },
  quickActionIcon: {
    fontSize: 14,
  },

  // Enhanced Content section
  contentGradient: {
    borderBottomLeftRadius: BORDER_RADIUS.xl,
    borderBottomRightRadius: BORDER_RADIUS.xl,
  },
  content: {
    padding: SPACING.lg,
  },
  title: {
    fontSize: 17,
    fontWeight: '900',
    color: COLORS.text,
    marginBottom: SPACING.xs,
    lineHeight: 22,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  locationIcon: {
    fontSize: 12,
    marginRight: SPACING.xs,
  },
  location: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },

  // Enhanced Stats section
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  difficultyBadge: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  difficultyText: {
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingIcon: {
    fontSize: 12,
    marginRight: SPACING.xs,
  },
  ratingText: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.text,
    marginRight: SPACING.xs,
  },
  reviewCount: {
    fontSize: 12,
    color: COLORS.textLight,
    fontWeight: '600',
  },

  // Additional Info section
  additionalInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.surfaceBorder,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  infoIcon: {
    fontSize: 12,
    marginRight: SPACING.xs,
  },
  infoText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
});

export default FeaturedTrekCard;
