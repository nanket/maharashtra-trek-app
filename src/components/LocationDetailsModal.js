import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Image,
  Dimensions,
} from 'react-native';
import { COLORS, CATEGORIES, CATEGORY_COLORS, DIFFICULTY_COLORS, DIFFICULTY_LEVELS, SPACING, BORDER_RADIUS, SHADOWS, IMAGES } from '../utils/constants';

const { width: screenWidth } = Dimensions.get('window');

const LocationDetailsModal = ({
  visible,
  location,
  onClose,
  onNavigate,
  onViewDetails,
}) => {
  if (!location) return null;

  const categoryInfo = CATEGORY_COLORS[location.category] || CATEGORY_COLORS[CATEGORIES.TREK];
  const difficultyInfo = DIFFICULTY_COLORS[location.difficulty] || DIFFICULTY_COLORS[DIFFICULTY_LEVELS.EASY];
  const difficultyColor = difficultyInfo?.color || COLORS.text;

  const handleNavigate = () => {
    onNavigate(location);
    onClose();
  };

  const handleViewDetails = () => {
    onViewDetails(location);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity 
          style={styles.overlayTouch} 
          activeOpacity={1} 
          onPress={onClose}
        />
        
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.dragHandle} />
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Image */}
            <View style={styles.imageContainer}>
              <Image
                source={IMAGES[location.imageKey] || IMAGES.defaultImage}
                style={styles.image}
                resizeMode="cover"
              />
              <View style={[styles.categoryBadge, { backgroundColor: categoryInfo?.primary || COLORS.primary }]}>
                <Text style={styles.categoryIcon}>{categoryInfo?.icon || '📍'}</Text>
                <Text style={styles.categoryText}>{location.category.toUpperCase()}</Text>
              </View>
            </View>

            {/* Title and Location */}
            <View style={styles.titleSection}>
              <Text style={styles.title}>{location.name}</Text>
              <View style={styles.locationRow}>
                <Text style={styles.locationIcon}>📍</Text>
                <Text style={styles.locationText}>{location.location}</Text>
              </View>
            </View>

            {/* Quick Info */}
            <View style={styles.quickInfoContainer}>
              <View style={styles.quickInfoItem}>
                <Text style={styles.quickInfoIcon}>⏱️</Text>
                <Text style={styles.quickInfoLabel}>Duration</Text>
                <Text style={styles.quickInfoValue}>{location.duration}</Text>
              </View>
              
              <View style={styles.quickInfoItem}>
                <Text style={styles.quickInfoIcon}>📊</Text>
                <Text style={styles.quickInfoLabel}>Difficulty</Text>
                <Text style={[styles.quickInfoValue, { color: difficultyColor }]}>
                  {location.difficulty}
                </Text>
              </View>
              
              {location.elevation && (
                <View style={styles.quickInfoItem}>
                  <Text style={styles.quickInfoIcon}>⛰️</Text>
                  <Text style={styles.quickInfoLabel}>Elevation</Text>
                  <Text style={styles.quickInfoValue}>{location.elevation}</Text>
                </View>
              )}
            </View>

            {/* Description */}
            <View style={styles.descriptionContainer}>
              <Text style={styles.description}>{location.description}</Text>
            </View>

            {/* Rating */}
            {location.rating && (
              <View style={styles.ratingContainer}>
                <View style={styles.ratingRow}>
                  <Text style={styles.ratingIcon}>⭐</Text>
                  <Text style={styles.ratingValue}>{location.rating}</Text>
                  <Text style={styles.ratingCount}>({location.reviewCount} reviews)</Text>
                </View>
              </View>
            )}

            {/* Best Time to Visit */}
            <View style={styles.bestTimeContainer}>
              <Text style={styles.bestTimeIcon}>🗓️</Text>
              <View style={styles.bestTimeText}>
                <Text style={styles.bestTimeLabel}>Best Time to Visit</Text>
                <Text style={styles.bestTimeValue}>{location.bestTimeToVisit}</Text>
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              <TouchableOpacity 
                style={[styles.actionButton, styles.navigateButton]} 
                onPress={handleNavigate}
              >
                <Text style={styles.navigateButtonText}>🧭 Navigate</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.actionButton, styles.detailsButton]} 
                onPress={handleViewDetails}
              >
                <Text style={styles.detailsButtonText}>View Details</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  overlayTouch: {
    flex: 1,
  },
  modalContainer: {
    backgroundColor: COLORS.background,
    borderTopLeftRadius: BORDER_RADIUS.xl,
    borderTopRightRadius: BORDER_RADIUS.xl,
    maxHeight: '80%',
    ...SHADOWS.xl,
  },
  header: {
    alignItems: 'center',
    paddingTop: SPACING.md,
    paddingHorizontal: SPACING.lg,
    position: 'relative',
  },
  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: COLORS.textSecondary,
    borderRadius: 2,
    opacity: 0.3,
  },
  closeButton: {
    position: 'absolute',
    right: SPACING.lg,
    top: SPACING.md,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  content: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xl,
  },
  imageContainer: {
    position: 'relative',
    marginTop: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: BORDER_RADIUS.lg,
  },
  categoryBadge: {
    position: 'absolute',
    top: SPACING.md,
    left: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    ...SHADOWS.medium,
  },
  categoryIcon: {
    fontSize: 16,
    marginRight: SPACING.xs,
  },
  categoryText: {
    color: COLORS.textInverse,
    fontSize: 12,
    fontWeight: '700',
  },
  titleSection: {
    marginBottom: SPACING.lg,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationIcon: {
    fontSize: 16,
    marginRight: SPACING.sm,
  },
  locationText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  quickInfoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
    backgroundColor: COLORS.backgroundCard,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
  },
  quickInfoItem: {
    alignItems: 'center',
    flex: 1,
  },
  quickInfoIcon: {
    fontSize: 20,
    marginBottom: SPACING.xs,
  },
  quickInfoLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '500',
    marginBottom: SPACING.xs,
  },
  quickInfoValue: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '700',
    textAlign: 'center',
  },
  descriptionContainer: {
    marginBottom: SPACING.lg,
  },
  description: {
    fontSize: 16,
    color: COLORS.text,
    lineHeight: 24,
    fontWeight: '400',
  },
  ratingContainer: {
    marginBottom: SPACING.lg,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingIcon: {
    fontSize: 18,
    marginRight: SPACING.sm,
  },
  ratingValue: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginRight: SPACING.sm,
  },
  ratingCount: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  bestTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundCard,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  bestTimeIcon: {
    fontSize: 24,
    marginRight: SPACING.lg,
  },
  bestTimeText: {
    flex: 1,
  },
  bestTimeLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '500',
    marginBottom: SPACING.xs,
  },
  bestTimeValue: {
    fontSize: 16,
    color: COLORS.text,
    fontWeight: '700',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  actionButton: {
    flex: 1,
    paddingVertical: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    ...SHADOWS.medium,
  },
  navigateButton: {
    backgroundColor: COLORS.primary,
  },
  navigateButtonText: {
    color: COLORS.textInverse,
    fontSize: 16,
    fontWeight: '700',
  },
  detailsButton: {
    backgroundColor: COLORS.backgroundCard,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  detailsButtonText: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: '700',
  },
});

export default LocationDetailsModal;
