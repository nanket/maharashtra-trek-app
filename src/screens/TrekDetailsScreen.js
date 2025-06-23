import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  SafeAreaView,
  TouchableOpacity,
  Linking,
  Alert,
  Modal,
  TextInput,
  Animated,
} from 'react-native';
import MapView from '../components/MapView';
import MapboxMapView from '../components/MapboxMapView';
import ComprehensiveTrekInfo from '../components/ComprehensiveTrekInfo';
import LocationDetailsModal from '../components/LocationDetailsModal';
import ImageCarousel from '../components/ImageCarousel';
import PhotoGallery from '../components/PhotoGallery';
import UserStorageService from '../utils/userStorage';
import { COLORS, CATEGORIES, CATEGORY_COLORS, DIFFICULTY_COLORS, DIFFICULTY_LEVELS, SPACING, BORDER_RADIUS, SHADOWS, IMAGES, createTextStyle } from '../utils/constants';

const TrekDetailsScreen = ({ route, navigation }) => {
  const { trek } = route.params;

  // Early return if trek data is not available
  if (!trek) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Trek information not available</Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }
  const [modalVisible, setModalVisible] = useState(false);
  const [completionModalVisible, setCompletionModalVisible] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [rating, setRating] = useState(0);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [useMapbox, setUseMapbox] = useState(false);
  const [galleryVisible, setGalleryVisible] = useState(false);
  const [galleryInitialIndex, setGalleryInitialIndex] = useState(0);

  // Expandable FAB state
  const [fabExpanded, setFabExpanded] = useState(false);
  const fabAnimation = useRef(new Animated.Value(0)).current;
  const fabRotation = useRef(new Animated.Value(0)).current;

  const categoryData = CATEGORY_COLORS[trek.category] || CATEGORY_COLORS[CATEGORIES.TREK];
  const difficultyData = DIFFICULTY_COLORS[trek.difficulty] || DIFFICULTY_COLORS[DIFFICULTY_LEVELS.EASY];

  // Check favorite and completion status
  useEffect(() => {
    checkStatus();
  }, [trek.id]);

  const checkStatus = async () => {
    try {
      const [favoriteStatus, completedStatus] = await Promise.all([
        UserStorageService.isFavorite(trek.id),
        UserStorageService.isTrekCompleted(trek.id),
      ]);
      setIsFavorite(favoriteStatus);
      setIsCompleted(completedStatus);
    } catch (error) {
      console.error('Error checking status:', error);
    }
  };

  const handlePhonePress = (phoneNumber) => {
    const cleanNumber = phoneNumber.replace(/\s+/g, '');
    Linking.openURL(`tel:${cleanNumber}`);
  };

  const handleLocationPress = (location) => {
    setModalVisible(true);
  };

  const handleNavigate = (location) => {
    const { latitude, longitude } = location.coordinates;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;

    Linking.canOpenURL(url)
      .then(supported => {
        if (supported) {
          Linking.openURL(url);
        } else {
          Alert.alert('Error', 'Unable to open navigation app');
        }
      })
      .catch(err => {
        console.error('Navigation error:', err);
        Alert.alert('Error', 'Unable to open navigation app');
      });
  };

  const handleViewDetails = (location) => {
    // Already on details screen, just close modal
    setModalVisible(false);
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
      Alert.alert('Error', 'Failed to update favorites');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkCompleted = () => {
    setRating(0);
    setNotes('');
    setCompletionModalVisible(true);
  };

  const handleSaveCompletion = async () => {
    setLoading(true);
    try {
      const completionData = {
        rating,
        notes,
        completedDate: new Date().toISOString(),
      };

      await UserStorageService.markTrekCompleted(trek.id, completionData);
      setIsCompleted(true);
      setCompletionModalVisible(false);
      Alert.alert('Success', 'Trek marked as completed!');
    } catch (error) {
      console.error('Error marking trek completed:', error);
      Alert.alert('Error', 'Failed to mark trek as completed');
    } finally {
      setLoading(false);
    }
  };

  const handleImagePress = (index) => {
    setGalleryInitialIndex(index);
    setGalleryVisible(true);
  };

  // FAB Animation Functions
  const toggleFab = () => {
    const toValue = fabExpanded ? 0 : 1;

    Animated.parallel([
      Animated.spring(fabAnimation, {
        toValue,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }),
      Animated.timing(fabRotation, {
        toValue,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    setFabExpanded(!fabExpanded);
  };

  const closeFab = () => {
    if (fabExpanded) {
      toggleFab();
    }
  };

  const renderStars = (rating, onPress = null) => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            onPress={() => onPress && onPress(star)}
            disabled={!onPress}
          >
            <Text style={[
              styles.star,
              star <= rating && styles.starFilled
            ]}>
              ⭐
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderContactInfo = () => {
    // Check if localContacts exists and is an array
    if (!trek.localContacts || !Array.isArray(trek.localContacts) || trek.localContacts.length === 0) {
      return (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Local Contacts</Text>
          <View style={styles.noDataContainer}>
            <Text style={styles.noDataText}>No local contacts available</Text>
          </View>
        </View>
      );
    }

    return (
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
  };

  const [selectedCity, setSelectedCity] = useState('fromPune');

  const renderHowToReach = () => {
    // Check if howToReach exists
    if (!trek.howToReach) {
      return (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How to Reach</Text>
          <View style={styles.noDataContainer}>
            <Text style={styles.noDataText}>Transportation information not available</Text>
          </View>
        </View>
      );
    }

    // Check if the new structure exists, otherwise fall back to old structure
    const hasNewStructure = trek.howToReach.fromMumbai || trek.howToReach.fromPune;

    if (!hasNewStructure) {
      // Fallback to old structure for backward compatibility
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
                </View>
              </View>
              <Text style={styles.transportDescription}>
                {typeof mode.data === 'object' ? mode.data.description : mode.data}
              </Text>
            </View>
          ))}
        </View>
      );
    }

    // New structure with Mumbai/Pune tabs
    const cityTabs = [
      { id: 'fromPune', label: 'From Pune', icon: '🏙️' },
      { id: 'fromMumbai', label: 'From Mumbai', icon: '🌆' }
    ];

    const selectedCityData = trek.howToReach[selectedCity];

    if (!selectedCityData) {
      return null;
    }

    const transportModes = [
      {
        key: 'byTrain',
        icon: '🚂',
        title: 'By Train',
        data: selectedCityData.byTrain
      },
      {
        key: 'byBus',
        icon: '🚌',
        title: 'By Bus',
        data: selectedCityData.byBus
      },
      {
        key: 'byPrivateVehicle',
        icon: '🚗',
        title: 'By Private Vehicle',
        data: selectedCityData.byPrivateVehicle
      }
    ];

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>How to Reach</Text>

        {/* City Selection Tabs */}
        <View style={styles.cityTabsContainer}>
          {cityTabs.map((tab) => (
            <TouchableOpacity
              key={tab.id}
              style={[
                styles.cityTab,
                selectedCity === tab.id && styles.activeCityTab
              ]}
              onPress={() => setSelectedCity(tab.id)}
            >
              <Text style={styles.cityTabIcon}>{tab.icon}</Text>
              <Text style={[
                styles.cityTabText,
                selectedCity === tab.id && styles.activeCityTabText
              ]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Transport Options */}
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

            {typeof mode.data === 'object' && mode.data.steps && Array.isArray(mode.data.steps) && mode.data.steps.length > 0 && (
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
        <ImageCarousel
          imageKey={trek.imageKey}
          videos={trek.videos || []}
          height={280}
          style={styles.imageContainer}
          onImagePress={handleImagePress}
        >
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
              <Text style={styles.reviewCount}>({trek.reviewCount} reviews)</Text>
            </View>
          )}
        </ImageCarousel>

        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>{trek.name}</Text>
            <Text style={styles.location}>📍 {trek.location}</Text>
          </View>

          <View style={styles.quickInfo}>
            <View style={[styles.infoItem, { backgroundColor: difficultyData?.background || COLORS.backgroundSecondary }]}>
              <Text style={styles.infoLabel}>Difficulty</Text>
              <Text style={[styles.infoValue, { color: difficultyData?.color || COLORS.text }]}>
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

          {/* Interactive Map Section */}
          {trek.coordinates && trek.coordinates.latitude && trek.coordinates.longitude ? (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Location Map</Text>
                <TouchableOpacity
                  style={styles.mapToggleButton}
                  onPress={() => setUseMapbox(!useMapbox)}
                >
                  <Text style={styles.mapToggleText}>
                    {useMapbox ? 'Mapbox' : 'Google'}
                  </Text>
                </TouchableOpacity>
              </View>
              <View style={styles.mapContainer}>
                {useMapbox ? (
                  <MapboxMapView
                    locations={[trek]}
                    selectedLocation={trek}
                    onLocationPress={handleLocationPress}
                    showUserLocation={true}
                    initialCenter={{
                      latitude: trek.coordinates.latitude,
                      longitude: trek.coordinates.longitude,
                    }}
                    style={styles.mapView}
                  />
                ) : (
                  <MapView
                    locations={[trek]}
                    selectedLocation={trek}
                    onLocationPress={handleLocationPress}
                    showUserLocation={true}
                    initialCenter={{
                      latitude: trek.coordinates.latitude,
                      longitude: trek.coordinates.longitude,
                    }}
                    mapType="standard"
                    style={styles.mapView}
                  />
                )}
              </View>
            </View>
          ) : (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Location Map</Text>
              <View style={styles.noDataContainer}>
                <Text style={styles.noDataText}>Location coordinates not available</Text>
              </View>
            </View>
          )}

          {/* Comprehensive Trek Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📋 Complete Trek Guide</Text>
            <Text style={styles.sectionSubtitle}>
              Everything you need to know for a safe and successful trek
            </Text>
            <View style={styles.comprehensiveInfoContainer}>
              <ComprehensiveTrekInfo trek={trek} />
            </View>
          </View>

          {renderContactInfo()}
        </View>
      </ScrollView>

      {/* Expandable Floating Action Button */}
      <View style={styles.fabContainer}>
        {/* Secondary Action Buttons */}
        {fabExpanded && (
          <>
            <Animated.View
              style={[
                styles.secondaryFab,
                {
                  transform: [
                    {
                      translateY: fabAnimation.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, -70],
                      }),
                    },
                    {
                      scale: fabAnimation.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, 1],
                      }),
                    },
                  ],
                  opacity: fabAnimation,
                },
              ]}
            >
              <TouchableOpacity
                style={[styles.fabButton, styles.favoriteButton]}
                onPress={() => {
                  handleFavoriteToggle();
                  closeFab();
                }}
                disabled={loading}
              >
                <Text style={styles.fabIcon}>
                  {isFavorite ? '❤️' : '🤍'}
                </Text>
              </TouchableOpacity>
              <Text style={styles.fabLabel}>Favorite</Text>
            </Animated.View>

            <Animated.View
              style={[
                styles.secondaryFab,
                {
                  transform: [
                    {
                      translateY: fabAnimation.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, -140],
                      }),
                    },
                    {
                      scale: fabAnimation.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, 1],
                      }),
                    },
                  ],
                  opacity: fabAnimation,
                },
              ]}
            >
              <TouchableOpacity
                style={[styles.fabButton, styles.planButton]}
                onPress={() => {
                  navigation.navigate('TrekPlanner', { trek });
                  closeFab();
                }}
              >
                <Text style={styles.fabIcon}>🧭</Text>
              </TouchableOpacity>
              <Text style={styles.fabLabel}>Plan Trek</Text>
            </Animated.View>

            <Animated.View
              style={[
                styles.secondaryFab,
                {
                  transform: [
                    {
                      translateY: fabAnimation.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, -210],
                      }),
                    },
                    {
                      scale: fabAnimation.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, 1],
                      }),
                    },
                  ],
                  opacity: fabAnimation,
                },
              ]}
            >
              <TouchableOpacity
                style={[styles.fabButton, styles.trackingButton]}
                onPress={() => {
                  navigation.navigate('LiveTracking', { trek });
                  closeFab();
                }}
              >
                <Text style={styles.fabIcon}>📍</Text>
              </TouchableOpacity>
              <Text style={styles.fabLabel}>Live Track</Text>
            </Animated.View>

            <Animated.View
              style={[
                styles.secondaryFab,
                {
                  transform: [
                    {
                      translateY: fabAnimation.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, -280],
                      }),
                    },
                    {
                      scale: fabAnimation.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, 1],
                      }),
                    },
                  ],
                  opacity: fabAnimation,
                },
              ]}
            >
              <TouchableOpacity
                style={[styles.fabButton, styles.galleryButton]}
                onPress={() => {
                  handleImagePress(0);
                  closeFab();
                }}
              >
                <Text style={styles.fabIcon}>📷</Text>
              </TouchableOpacity>
              <Text style={styles.fabLabel}>Gallery</Text>
            </Animated.View>

            {!isCompleted && (
              <Animated.View
                style={[
                  styles.secondaryFab,
                  {
                    transform: [
                      {
                        translateY: fabAnimation.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0, -350],
                        }),
                      },
                      {
                        scale: fabAnimation.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0, 1],
                        }),
                      },
                    ],
                    opacity: fabAnimation,
                  },
                ]}
              >
                <TouchableOpacity
                  style={[styles.fabButton, styles.completeButton]}
                  onPress={() => {
                    handleMarkCompleted();
                    closeFab();
                  }}
                  disabled={loading}
                >
                  <Text style={styles.fabIcon}>✅</Text>
                </TouchableOpacity>
                <Text style={styles.fabLabel}>Complete</Text>
              </Animated.View>
            )}
          </>
        )}

        {/* Main FAB */}
        <TouchableOpacity
          style={[styles.mainFab, isCompleted && styles.completedMainFab]}
          onPress={toggleFab}
          activeOpacity={0.8}
        >
          <Animated.View
            style={{
              transform: [
                {
                  rotate: fabRotation.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '45deg'],
                  }),
                },
              ],
            }}
          >
            <Text style={styles.mainFabIcon}>
              {isCompleted ? '✅' : '+'}
            </Text>
          </Animated.View>
        </TouchableOpacity>
      </View>

      {/* Overlay to close FAB when expanded */}
      {fabExpanded && (
        <TouchableOpacity
          style={styles.fabOverlay}
          onPress={closeFab}
          activeOpacity={1}
        />
      )}

      {/* Location Details Modal */}
      <LocationDetailsModal
        visible={modalVisible}
        location={trek}
        onClose={() => setModalVisible(false)}
        onNavigate={handleNavigate}
        onViewDetails={handleViewDetails}
      />

      {/* Completion Modal */}
      <Modal
        visible={completionModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setCompletionModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              Mark {trek.name} as Completed
            </Text>

            <View style={styles.modalSection}>
              <Text style={styles.modalLabel}>Your Rating</Text>
              {renderStars(rating, setRating)}
            </View>

            <View style={styles.modalSection}>
              <Text style={styles.modalLabel}>Notes (Optional)</Text>
              <TextInput
                style={styles.notesInput}
                value={notes}
                onChangeText={setNotes}
                placeholder="Share your experience..."
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setCompletionModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleSaveCompletion}
                disabled={loading}
              >
                <Text style={styles.saveButtonText}>
                  {loading ? 'Saving...' : 'Mark Completed'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Photo Gallery */}
      <PhotoGallery
        visible={galleryVisible}
        imageKey={trek.imageKey}
        initialIndex={galleryInitialIndex}
        onClose={() => setGalleryVisible(false)}
        onIndexChange={(index) => setGalleryInitialIndex(index)}
      />
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.text,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
    lineHeight: 20,
  },
  mapToggleButton: {
    backgroundColor: COLORS.backgroundCard,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.success,
    ...SHADOWS.small,
  },
  mapToggleText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.success,
  },
  comprehensiveInfoContainer: {
    backgroundColor: COLORS.backgroundCard,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    ...SHADOWS.medium,
    minHeight: 400,
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

  // City tabs styles
  cityTabsContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.xs,
    marginBottom: SPACING.lg,
  },
  cityTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
  },
  activeCityTab: {
    backgroundColor: COLORS.backgroundCard,
    ...SHADOWS.small,
  },
  cityTabIcon: {
    fontSize: 16,
    marginRight: SPACING.sm,
  },
  cityTabText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  activeCityTabText: {
    color: COLORS.text,
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

  // Map styles
  mapContainer: {
    height: 250,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    backgroundColor: COLORS.backgroundSecondary,
    ...SHADOWS.medium,
  },
  mapView: {
    flex: 1,
  },

  // Expandable FAB styles
  fabContainer: {
    position: 'absolute',
    bottom: SPACING.xl,
    right: SPACING.lg,
    alignItems: 'center',
  },
  fabOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    zIndex: 1,
  },
  mainFab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.large,
    zIndex: 3,
  },
  completedMainFab: {
    backgroundColor: COLORS.success,
  },
  mainFabIcon: {
    fontSize: 24,
    fontWeight: '600',
    color: COLORS.textInverse,
  },
  secondaryFab: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 2,
  },
  fabButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.medium,
    marginBottom: SPACING.xs,
  },
  favoriteButton: {
    backgroundColor: COLORS.backgroundCard,
  },
  planButton: {
    backgroundColor: COLORS.primary,
  },
  trackingButton: {
    backgroundColor: COLORS.secondary,
  },
  galleryButton: {
    backgroundColor: COLORS.accent,
  },
  completeButton: {
    backgroundColor: COLORS.success,
  },
  fabIcon: {
    fontSize: 20,
  },
  fabLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.text,
    backgroundColor: COLORS.backgroundCard,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
    ...SHADOWS.small,
    marginBottom: SPACING.sm,
    textAlign: 'center',
    minWidth: 60,
  },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  modalContent: {
    backgroundColor: COLORS.backgroundCard,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.xl,
    width: '100%',
    maxWidth: 400,
    ...SHADOWS.xl,
  },
  modalTitle: {
    ...createTextStyle(20, 'bold'),
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.xl,
  },
  modalSection: {
    marginBottom: SPACING.xl,
  },
  modalLabel: {
    ...createTextStyle(16, 'medium'),
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  star: {
    fontSize: 24,
    color: COLORS.textLight,
    marginHorizontal: SPACING.xs,
  },
  starFilled: {
    color: COLORS.accent,
  },
  notesInput: {
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    ...createTextStyle(14, 'regular'),
    color: COLORS.text,
    backgroundColor: COLORS.backgroundSecondary,
    minHeight: 80,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    marginHorizontal: SPACING.xs,
  },
  cancelButton: {
    backgroundColor: COLORS.backgroundSecondary,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
  },
  cancelButtonText: {
    ...createTextStyle(16, 'medium'),
    color: COLORS.textSecondary,
  },
  saveButtonText: {
    ...createTextStyle(16, 'medium'),
    color: COLORS.textInverse,
  },

  // City tabs styles
  cityTabsContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.xs,
    marginBottom: SPACING.lg,
    ...SHADOWS.small,
  },
  cityTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
  },
  activeCityTab: {
    backgroundColor: COLORS.primary,
    ...SHADOWS.small,
  },
  cityTabIcon: {
    fontSize: 16,
    marginRight: SPACING.xs,
  },
  cityTabText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  activeCityTabText: {
    color: COLORS.textInverse,
  },

  // Error and no-data styles
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  backButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
  },
  backButtonText: {
    color: COLORS.textInverse,
    fontSize: 16,
    fontWeight: '600',
  },
  noDataContainer: {
    backgroundColor: COLORS.backgroundSecondary,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
  },
  noDataText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '500',
    textAlign: 'center',
  },
});

export default TrekDetailsScreen;
