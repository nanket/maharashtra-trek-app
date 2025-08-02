import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Modal,
  Image,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  SafeAreaView,
  PanResponder,
  Animated,
} from 'react-native';
import { COLORS, SPACING, IMAGES, CLOUDINARY_IMAGES, TREK_IMAGE_COLLECTIONS, createTextStyle } from '../utils/constants';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

/**
 * PhotoGallery component for fullscreen image viewing
 *
 * Features:
 * - Fullscreen modal display
 * - Swipe navigation between images
 * - Pinch to zoom and pan functionality
 * - Image counter and navigation
 * - Smooth animations and gestures
 * - Loading states and error handling
 */
const PhotoGallery = ({
  visible,
  images = [],
  imageKey = null,
  initialIndex = 0,
  onClose,
  onIndexChange = null,
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [imageLoading, setImageLoading] = useState({});
  const [imageError, setImageError] = useState({});
  const scrollViewRef = useRef(null);

  // Animation values for zoom and pan
  const scale = useRef(new Animated.Value(1)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;

  // Get image array from props or image collections
  const getImageArray = () => {
    // Prioritize direct images array from JSON data
    if (images && images.length > 0) {
      return images;
    }
    // Fallback to image collections using imageKey
    else if (imageKey && TREK_IMAGE_COLLECTIONS[imageKey]) {
      return TREK_IMAGE_COLLECTIONS[imageKey];
    }
    // Final fallback to empty array
    return [];
  };

  const imageArray = getImageArray();

  // Reset zoom when image changes
  useEffect(() => {
    resetZoom();
  }, [currentIndex]);

  // Update current index when initialIndex changes
  useEffect(() => {
    if (initialIndex !== currentIndex) {
      setCurrentIndex(initialIndex);
      scrollToIndex(initialIndex);
    }
  }, [initialIndex]);

  const resetZoom = () => {
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, useNativeDriver: true }),
      Animated.spring(translateX, { toValue: 0, useNativeDriver: true }),
      Animated.spring(translateY, { toValue: 0, useNativeDriver: true }),
    ]).start();
  };

  const scrollToIndex = (index) => {
    if (scrollViewRef.current && index >= 0 && index < imageArray.length) {
      scrollViewRef.current.scrollTo({
        x: index * screenWidth,
        animated: true,
      });
    }
  };

  const handleScroll = (event) => {
    const contentOffset = event.nativeEvent.contentOffset;
    const viewSize = event.nativeEvent.layoutMeasurement;
    const pageNum = Math.floor(contentOffset.x / viewSize.width);

    if (pageNum >= 0 && pageNum < imageArray.length && pageNum !== currentIndex) {
      setCurrentIndex(pageNum);
      if (onIndexChange) {
        onIndexChange(pageNum);
      }
    }
  };

  const handleImageLoad = (index) => {
    setImageLoading(prev => ({ ...prev, [index]: false }));
  };

  const handleImageError = (index) => {
    setImageError(prev => ({ ...prev, [index]: true }));
    setImageLoading(prev => ({ ...prev, [index]: false }));
  };

  const handleImageLoadStart = (index) => {
    setImageLoading(prev => ({ ...prev, [index]: true }));
    setImageError(prev => ({ ...prev, [index]: false }));
  };

  // Get image source for a given image key/URL
  const getImageSource = (imageKey) => {
    if (CLOUDINARY_IMAGES[imageKey]) {
      return { uri: CLOUDINARY_IMAGES[imageKey] };
    } else if (IMAGES[imageKey]) {
      return IMAGES[imageKey];
    } else if (typeof imageKey === 'string' && imageKey.startsWith('http')) {
      return { uri: imageKey };
    }
    return IMAGES.defaultImage;
  };

  // Pan responder for zoom and pan gestures
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponderCapture: () => true,
      onPanResponderGrant: () => {
        scale.setOffset(scale._value);
        translateX.setOffset(translateX._value);
        translateY.setOffset(translateY._value);
      },
      onPanResponderMove: (evt, gestureState) => {
        // Simple pan for now - can be enhanced with pinch later
        if (scale._value > 1) {
          translateX.setValue(gestureState.dx);
          translateY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: () => {
        scale.flattenOffset();
        translateX.flattenOffset();
        translateY.flattenOffset();
      },
    })
  ).current;

  const animatedStyle = {
    transform: [
      { scale: scale },
      { translateX: translateX },
      { translateY: translateY },
    ],
  };

  const renderImage = (imageKey, index) => {
    const imageSource = getImageSource(imageKey);
    const isLoading = imageLoading[index];
    const hasError = imageError[index];

    return (
      <View key={index} style={styles.imageContainer}>
        <Animated.View
          style={[styles.imageWrapper, animatedStyle]}
          {...panResponder.panHandlers}
        >
          {hasError ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorIcon}>📷</Text>
              <Text style={styles.errorText}>Failed to load image</Text>
            </View>
          ) : (
            <Image
              source={imageSource}
              style={styles.image}
              resizeMode="contain"
              onLoadStart={() => handleImageLoadStart(index)}
              onLoad={() => handleImageLoad(index)}
              onError={() => handleImageError(index)}
            />
          )}
        </Animated.View>

        {isLoading && (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading...</Text>
          </View>
        )}
      </View>
    );
  };

  const renderCounter = () => {
    if (imageArray.length <= 1) return null;

    return (
      <View style={styles.counterContainer}>
        <Text style={styles.counterText}>
          {currentIndex + 1} / {imageArray.length}
        </Text>
      </View>
    );
  };

  const renderNavigationDots = () => {
    if (imageArray.length <= 1) return null;

    return (
      <View style={styles.dotsContainer}>
        {imageArray.map((_, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.dot,
              index === currentIndex && styles.activeDot
            ]}
            onPress={() => {
              setCurrentIndex(index);
              scrollToIndex(index);
              resetZoom();
            }}
          />
        ))}
      </View>
    );
  };

  if (!visible || imageArray.length === 0) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent={true}
    >
      <StatusBar hidden={true} />
      <View style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
            {renderCounter()}
          </View>

          {/* Image ScrollView */}
          <ScrollView
            ref={scrollViewRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={handleScroll}
            scrollEventThrottle={16}
            style={styles.scrollView}
          >
            {imageArray.map(renderImage)}
          </ScrollView>

          {/* Navigation Dots */}
          {renderNavigationDots()}
        </SafeAreaView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    zIndex: 10,
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    ...createTextStyle(18, 'bold', COLORS.white),
  },
  counterContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 20,
  },
  counterText: {
    ...createTextStyle(14, 'medium', COLORS.white),
  },
  scrollView: {
    flex: 1,
  },
  imageContainer: {
    width: screenWidth,
    height: screenHeight - 120, // Account for header and dots
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageWrapper: {
    width: screenWidth,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: screenWidth,
    height: '100%',
  },
  loadingContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -50 }, { translateY: -25 }],
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: SPACING.md,
  },
  loadingText: {
    ...createTextStyle(16, 'medium', COLORS.white),
  },
  errorContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: screenWidth,
    height: '100%',
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: SPACING.md,
  },
  errorText: {
    ...createTextStyle(16, 'medium', COLORS.white),
    textAlign: 'center',
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.lg,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: COLORS.white,
    width: 10,
    height: 10,
    borderRadius: 5,
  },
});

export default PhotoGallery;
