import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  SafeAreaView,
  TouchableOpacity,
  Linking,
} from 'react-native';
import MapPlaceholder from '../components/MapPlaceholder';
import { COLORS, CATEGORY_COLORS, DIFFICULTY_COLORS, SPACING, BORDER_RADIUS, SHADOWS, IMAGES } from '../utils/constants';

const TrekDetailsScreen = ({ route }) => {
  const { trek } = route.params;

  const categoryData = CATEGORY_COLORS[trek.category] || CATEGORY_COLORS.trek;
  const difficultyData = DIFFICULTY_COLORS[trek.difficulty] || DIFFICULTY_COLORS.Easy;

  const handlePhonePress = (phoneNumber) => {
    const cleanNumber = phoneNumber.replace(/\s+/g, '');
    Linking.openURL(`tel:${cleanNumber}`);
  };

  // Get image from local assets
  const getImageSource = () => {
    return IMAGES[trek.imageKey] || IMAGES.defaultImage;
  };

  const renderContactInfo = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Local Contacts</Text>
      {trek.localContacts.map((contact, index) => (
        <View key={index} style={styles.contactCard}>
          <View style={styles.contactInfo}>
            <Text style={styles.contactName}>{contact.name}</Text>
            <Text style={styles.contactService}>{contact.service}</Text>
          </View>
          <TouchableOpacity
            style={styles.phoneButton}
            onPress={() => handlePhonePress(contact.phone)}
          >
            <Text style={styles.phoneText}>📞 Call</Text>
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );

  const renderHowToReach = () => {
    const transportModes = [
      {
        key: 'byTrain',
        icon: '🚂',
        title: 'By Train',
        data: trek.howToReach.byTrain
      },
      {
        key: 'byBus',
        icon: '🚌',
        title: 'By Bus',
        data: trek.howToReach.byBus
      },
      {
        key: 'byPrivateVehicle',
        icon: '🚗',
        title: 'By Private Vehicle',
        data: trek.howToReach.byPrivateVehicle
      }
    ];

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>How to Reach</Text>

        {transportModes.map((mode, index) => (
          <View key={mode.key} style={styles.transportCard}>
            <View style={styles.transportHeader}>
              <View style={styles.transportIconContainer}>
                <Text style={styles.transportIcon}>{mode.icon}</Text>
              </View>
              <View style={styles.transportTitleContainer}>
                <Text style={styles.transportTitle}>{mode.title}</Text>
                {typeof mode.data === 'object' && (
                  <View style={styles.transportMeta}>
                    <Text style={styles.transportDistance}>{mode.data.distance}</Text>
                    <Text style={styles.transportTime}>• {mode.data.time}</Text>
                  </View>
                )}
              </View>
            </View>

            <Text style={styles.transportDescription}>
              {typeof mode.data === 'object' ? mode.data.description : mode.data}
            </Text>

            {typeof mode.data === 'object' && mode.data.steps && (
              <View style={styles.stepsContainer}>
                <Text style={styles.stepsTitle}>Step-by-step directions:</Text>
                {mode.data.steps.map((step, stepIndex) => (
                  <View key={stepIndex} style={styles.stepItem}>
                    <View style={styles.stepNumber}>
                      <Text style={styles.stepNumberText}>{stepIndex + 1}</Text>
                    </View>
                    <Text style={styles.stepText}>{step}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.imageContainer}>
          <Image
            source={getImageSource()}
            style={styles.image}
            resizeMode="cover"
          />
          <View style={[styles.categoryBadge, { backgroundColor: categoryData.primary }]}>
            <Text style={styles.categoryIcon}>{categoryData.emoji}</Text>
            <Text style={styles.categoryText}>
              {trek.category.charAt(0).toUpperCase() + trek.category.slice(1)}
            </Text>
          </View>

          {trek.rating && (
            <View style={styles.ratingBadge}>
              <Text style={styles.ratingIcon}>⭐</Text>
              <Text style={styles.ratingText}>{trek.rating}</Text>
              <Text style={styles.reviewCount}>({trek.reviewCount} reviews)</Text>
            </View>
          )}
        </View>

        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>{trek.name}</Text>
            <Text style={styles.location}>📍 {trek.location}</Text>
          </View>

          <View style={styles.quickInfo}>
            <View style={[styles.infoItem, { backgroundColor: difficultyData.background }]}>
              <Text style={styles.infoLabel}>Difficulty</Text>
              <Text style={[styles.infoValue, { color: difficultyData.color }]}>
                {trek.difficulty}
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Duration</Text>
              <Text style={styles.infoValue}>{trek.duration}</Text>
            </View>
            {trek.elevation && (
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Elevation</Text>
                <Text style={styles.infoValue}>{trek.elevation}</Text>
              </View>
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{trek.description}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Best Time to Visit</Text>
            <View style={styles.bestTimeContainer}>
              <Text style={styles.bestTimeIcon}>🗓️</Text>
              <Text style={styles.bestTime}>{trek.bestTimeToVisit}</Text>
            </View>
          </View>

          {renderHowToReach()}

          <MapPlaceholder
            coordinates={trek.coordinates}
            location={trek.location}
          />

          {renderContactInfo()}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  imageContainer: {
    position: 'relative',
    height: 280,
  },
  image: {
    width: '100%',
    height: '100%',
    backgroundColor: COLORS.backgroundSecondary,
  },
  categoryBadge: {
    position: 'absolute',
    top: SPACING.lg,
    left: SPACING.lg,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
    ...SHADOWS.medium,
  },
  categoryIcon: {
    fontSize: 16,
    marginRight: SPACING.xs,
  },
  categoryText: {
    color: COLORS.textInverse,
    fontSize: 14,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  ratingBadge: {
    position: 'absolute',
    top: SPACING.lg,
    right: SPACING.lg,
    backgroundColor: COLORS.backgroundCard,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
    flexDirection: 'row',
    alignItems: 'center',
    ...SHADOWS.medium,
  },
  ratingIcon: {
    fontSize: 14,
    marginRight: SPACING.xs,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
    marginRight: SPACING.xs,
  },
  reviewCount: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  content: {
    padding: SPACING.xl,
  },
  header: {
    marginBottom: SPACING.xl,
  },
  title: {
    fontSize: 26,
    fontWeight: '900',
    color: COLORS.text,
    marginBottom: SPACING.sm,
    lineHeight: 32,
  },
  location: {
    fontSize: 16,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  quickInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.xl,
    gap: SPACING.md,
  },
  infoItem: {
    alignItems: 'center',
    flex: 1,
    backgroundColor: COLORS.backgroundSecondary,
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
  },
  infoLabel: {
    fontSize: 12,
    color: COLORS.textLight,
    marginBottom: SPACING.xs,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.text,
    textAlign: 'center',
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: SPACING.lg,
  },
  description: {
    fontSize: 16,
    color: COLORS.text,
    lineHeight: 26,
    fontWeight: '500',
  },
  bestTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundCard,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
  },
  bestTimeIcon: {
    fontSize: 20,
    marginRight: SPACING.md,
  },
  bestTime: {
    fontSize: 16,
    color: COLORS.text,
    fontWeight: '600',
  },

  // Transportation styles
  transportCard: {
    backgroundColor: COLORS.backgroundCard,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
    ...SHADOWS.small,
  },
  transportHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  transportIconContainer: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: COLORS.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  transportIcon: {
    fontSize: 24,
  },
  transportTitleContainer: {
    flex: 1,
  },
  transportTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  transportMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  transportDistance: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  transportTime: {
    fontSize: 14,
    color: COLORS.textLight,
    fontWeight: '500',
    marginLeft: SPACING.xs,
  },
  transportDescription: {
    fontSize: 15,
    color: COLORS.text,
    lineHeight: 22,
    marginBottom: SPACING.md,
    fontWeight: '500',
  },
  stepsContainer: {
    marginTop: SPACING.md,
  },
  stepsTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.md,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
    marginTop: 2,
  },
  stepNumberText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textInverse,
  },
  stepText: {
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 20,
    flex: 1,
    fontWeight: '500',
  },

  // Contact styles
  contactCard: {
    backgroundColor: COLORS.backgroundCard,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
    ...SHADOWS.small,
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  contactService: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  phoneButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    ...SHADOWS.small,
  },
  phoneText: {
    color: COLORS.textInverse,
    fontSize: 14,
    fontWeight: '700',
  },
});

export default TrekDetailsScreen;
