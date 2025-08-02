import React, { useState, useRef } from 'react';
import {
  View,
  ScrollView,
  Image,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { Video } from 'expo-av';
import YouTubeVideoPlayer from './YouTubeVideoPlayer';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS, IMAGES, TREK_IMAGE_COLLECTIONS, CLOUDINARY_IMAGES, createTextStyle } from '../utils/constants';
import { getVideoInfo } from '../utils/videoUtils';

const { width: screenWidth } = Dimensions.get('window');

/**
 * Enhanced ImageCarousel component that supports both images and videos
 *
 * Features:
 * - Displays images from local assets, Cloudinary URLs, or direct image URLs
 * - Supports video playback for direct video URLs (MP4, etc.)
 * - Handles YouTube videos with thumbnail preview and external app opening
 * - Visual indicators for different media types
 * - Swipeable carousel with dots navigation
 * - Counter showing current position and media type
 *
 * @param {string} imageKey - Key for image collections from constants
 * @param {Array} images - Array of image keys/URLs to display
 * @param {Array} videos - Array of video URLs (supports YouTube and direct video URLs)
 * @param {Object} style - Custom styles for the container
 * @param {boolean} showCounter - Whether to show the media counter
 * @param {boolean} showDots - Whether to show navigation dots
 * @param {number} height - Height of the carousel
 * @param {ReactNode} children - Overlay components (badges, etc.)
 */
const ImageCarousel = ({
  imageKey,
  images = null,
  videos = null, // New prop for video URLs
  style = {},
  showCounter = true,
  showDots = true,
  height = 300,
  children = null, // For overlays like badges
  onImagePress = null, // Callback for when an image is pressed
  onVideoPress = null // Callback for when a video is pressed
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [videoStatus, setVideoStatus] = useState({});
  const scrollViewRef = useRef(null);

  // Get media array - either from props or from image collections
  const getMediaItems = () => {
    let imageItems = [];
    let videoItems = [];

    // Collect images
    if (images && images.length > 0) {
      imageItems = [...imageItems, ...images.map(img => ({ type: 'image', source: img }))];
    } else if (imageKey && TREK_IMAGE_COLLECTIONS[imageKey]) {
      imageItems = [...imageItems, ...TREK_IMAGE_COLLECTIONS[imageKey].map(img => ({ type: 'image', source: img }))];
    } else if (imageKey && (CLOUDINARY_IMAGES[imageKey] || IMAGES[imageKey])) {
      imageItems = [...imageItems, { type: 'image', source: imageKey }];
    }

    // Collect videos
    if (videos && videos.length > 0) {
      videoItems = [...videoItems, ...videos.map(video => ({ type: 'video', source: video }))];
    }

    // Place videos FIRST, then images for better visibility
    let mediaItems = [...videoItems, ...imageItems];

    // Final fallback
    if (mediaItems.length === 0) {
      mediaItems = [{ type: 'image', source: 'defaultImage' }];
    }

    return mediaItems;
  };

  const mediaItems = getMediaItems();

  const handleScroll = (event) => {
    const contentOffset = event.nativeEvent.contentOffset;
    const viewSize = event.nativeEvent.layoutMeasurement;
    const pageNum = Math.floor(contentOffset.x / viewSize.width);

    if (pageNum >= 0 && pageNum < mediaItems.length) {
      setCurrentIndex(pageNum);
    }
  };

  const scrollToIndex = (index) => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({
        x: index * screenWidth,
        animated: true,
      });
    }
  };

  const handleVideoStatusUpdate = (index, status) => {
    setVideoStatus(prev => ({
      ...prev,
      [index]: status
    }));
  };

  const renderDots = () => {
    if (!showDots || mediaItems.length <= 1) return null;

    return (
      <View style={styles.dotsContainer}>
        {mediaItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.dot,
              index === currentIndex && styles.activeDot,
              item.type === 'video' && styles.videoDot
            ]}
            onPress={() => scrollToIndex(index)}
          >
            {item.type === 'video' && (
              <Text style={styles.videoDotIcon}>▶</Text>
            )}
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderCounter = () => {
    if (!showCounter || mediaItems.length <= 1) return null;

    const currentItem = mediaItems[currentIndex];
    const mediaType = currentItem?.type === 'video' ? '📹' : '📷';

    return (
      <View style={styles.counterContainer}>
        <Text style={styles.counterText}>
          {mediaType} {currentIndex + 1}/{mediaItems.length}
        </Text>
      </View>
    );
  };

  const renderMediaItem = (item, index) => {
    if (item.type === 'video') {
      const videoInfo = getVideoInfo(item.source);

      if (videoInfo.type === 'youtube') {
        // Handle YouTube videos
        return (
          <View key={index} style={styles.mediaContainer}>
            <YouTubeVideoPlayer
              url={item.source}
              style={styles.youtubePlayer}
            />
          </View>
        );
      } else if (videoInfo.playable) {
        // Handle direct video URLs
        return (
          <View key={index} style={styles.mediaContainer}>
            <Video
              source={{ uri: item.source }}
              style={styles.video}
              useNativeControls
              resizeMode="contain"
              shouldPlay={false}
              isLooping={false}
              onPlaybackStatusUpdate={(status) => handleVideoStatusUpdate(index, status)}
            />
            {/* Video overlay indicator */}
            <View style={styles.videoOverlay}>
              <View style={styles.videoIndicator}>
                <Text style={styles.videoIndicatorText}>📹 Video</Text>
              </View>
            </View>
            {/* Fullscreen button overlay */}
            {onVideoPress && (
              <TouchableOpacity
                style={styles.fullscreenButton}
                onPress={() => onVideoPress(item.source)}
                activeOpacity={0.8}
              >
                <View style={styles.fullscreenIcon}>
                  <Text style={styles.fullscreenIconText}>⛶</Text>
                </View>
              </TouchableOpacity>
            )}
          </View>
        );
      } else {
        // Unsupported video format
        return (
          <View key={index} style={styles.mediaContainer}>
            <View style={styles.unsupportedVideo}>
              <Text style={styles.unsupportedIcon}>⚠️</Text>
              <Text style={styles.unsupportedText}>Unsupported Video Format</Text>
              <Text style={styles.unsupportedUrl}>{item.source}</Text>
            </View>
          </View>
        );
      }
    } else {
      // Handle image - support direct URLs, Cloudinary keys, and local images
      let imageSource;

      // Check if it's a direct URL (starts with http)
      if (item.source && item.source.startsWith('http')) {
        imageSource = { uri: item.source };
      }
      // Check if it's a Cloudinary key
      else if (CLOUDINARY_IMAGES[item.source]) {
        imageSource = { uri: CLOUDINARY_IMAGES[item.source] };
      }
      // Check if it's a local image key
      else if (IMAGES[item.source]) {
        imageSource = IMAGES[item.source];
      }
      // Fallback to default image
      else {
        imageSource = IMAGES.defaultImage;
      }

      return (
        <TouchableOpacity
          key={index}
          style={styles.mediaContainer}
          onPress={() => onImagePress && onImagePress(index)}
          activeOpacity={0.9}
        >
          <Image
            source={imageSource}
            style={styles.image}
            resizeMode="cover"
          />
        </TouchableOpacity>
      );
    }
  };

  return (
    <View style={[styles.container, { height }, style]}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        scrollEventThrottle={16}
        style={styles.scrollView}
      >
        {mediaItems.map(renderMediaItem)}
      </ScrollView>

      {/* Overlays */}
      {children}

      {/* Counter */}
      {renderCounter()}

      {/* Dots Indicator */}
      {renderDots()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    backgroundColor: COLORS.backgroundCard,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
  },
  scrollView: {
    flex: 1,
  },
  mediaContainer: {
    width: screenWidth,
    flex: 1,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  videoOverlay: {
    position: 'absolute',
    top: SPACING.md,
    right: SPACING.md,
  },
  videoIndicator: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
  },
  videoIndicatorText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '600',
  },
  dotsContainer: {
    position: 'absolute',
    bottom: SPACING.md,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    marginHorizontal: 3,
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  activeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.backgroundCard,
    borderColor: 'rgba(255, 255, 255, 0.9)',
    borderWidth: 1,
  },
  videoDot: {
    backgroundColor: 'rgba(255, 0, 0, 0.8)',
    borderColor: 'rgba(255, 255, 255, 0.9)',
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoDotIcon: {
    color: COLORS.white,
    fontSize: 4,
    fontWeight: 'bold',
  },
  youtubePlayer: {
    width: '100%',
    height: '100%',
  },
  unsupportedVideo: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundSecondary,
    padding: SPACING.lg,
  },
  unsupportedIcon: {
    fontSize: 48,
    marginBottom: SPACING.md,
  },
  unsupportedText: {
    ...createTextStyle(16, 'bold'),
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  unsupportedUrl: {
    ...createTextStyle(12, 'regular'),
    color: COLORS.textLight,
    textAlign: 'center',
    fontFamily: 'monospace',
  },
  counterContainer: {
    position: 'absolute',
    top: SPACING.md,
    right: SPACING.md,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    borderRadius: BORDER_RADIUS.full,
    minWidth: 40,
    alignItems: 'center',
  },
  counterText: {
    color: COLORS.backgroundCard,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  fullscreenButton: {
    position: 'absolute',
    bottom: SPACING.md,
    right: SPACING.md,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: SPACING.sm,
    padding: SPACING.sm,
  },
  fullscreenIcon: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullscreenIconText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ImageCarousel;
