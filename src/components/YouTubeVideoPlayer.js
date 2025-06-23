import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Linking,
  Alert,
  Dimensions,
} from 'react-native';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS, createTextStyle } from '../utils/constants';
import { getVideoInfo } from '../utils/videoUtils';

const { width: screenWidth } = Dimensions.get('window');

const YouTubeVideoPlayer = ({ url, style = {} }) => {
  const [imageError, setImageError] = useState(false);
  
  const videoInfo = getVideoInfo(url);
  
  if (videoInfo.type !== 'youtube') {
    return null;
  }

  const handlePlayPress = async () => {
    try {
      // Try to open in YouTube app first
      const youtubeAppUrl = `youtube://watch?v=${videoInfo.videoId}`;
      const canOpenYouTube = await Linking.canOpenURL(youtubeAppUrl);
      
      if (canOpenYouTube) {
        await Linking.openURL(youtubeAppUrl);
      } else {
        // Fallback to web browser
        await Linking.openURL(videoInfo.url);
      }
    } catch (error) {
      console.error('Error opening video:', error);
      Alert.alert(
        'Error',
        'Unable to open video. Please check your internet connection and try again.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleThumbnailError = () => {
    setImageError(true);
  };

  return (
    <View style={[styles.container, style]}>
      <TouchableOpacity
        style={styles.videoContainer}
        onPress={handlePlayPress}
        activeOpacity={0.8}
      >
        {/* Video Thumbnail */}
        <View style={styles.thumbnailContainer}>
          {!imageError && videoInfo.thumbnailUrl ? (
            <Image
              source={{ uri: videoInfo.thumbnailUrl }}
              style={styles.thumbnail}
              resizeMode="cover"
              onError={handleThumbnailError}
            />
          ) : (
            <View style={styles.placeholderThumbnail}>
              <Text style={styles.placeholderIcon}>📹</Text>
              <Text style={styles.placeholderText}>YouTube Video</Text>
            </View>
          )}
          
          {/* Play Button Overlay */}
          <View style={styles.playButtonOverlay}>
            <View style={styles.playButton}>
              <Text style={styles.playIcon}>▶</Text>
            </View>
          </View>
          
          {/* YouTube Badge */}
          <View style={styles.youtubeBadge}>
            <Text style={styles.youtubeText}>YouTube</Text>
          </View>
        </View>
        
        {/* Video Info */}
        <View style={styles.videoInfo}>
          <Text style={styles.videoTitle}>Trek Video</Text>
          <Text style={styles.videoDescription}>
            Tap to watch on YouTube
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: screenWidth,
    backgroundColor: COLORS.backgroundCard,
  },
  videoContainer: {
    flex: 1,
  },
  thumbnailContainer: {
    position: 'relative',
    width: '100%',
    height: '100%',
    backgroundColor: COLORS.backgroundSecondary,
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  placeholderThumbnail: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundSecondary,
  },
  placeholderIcon: {
    fontSize: 48,
    marginBottom: SPACING.sm,
  },
  placeholderText: {
    ...createTextStyle(16, 'medium'),
    color: COLORS.textSecondary,
  },
  playButtonOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.large,
  },
  playIcon: {
    color: COLORS.white,
    fontSize: 32,
    fontWeight: 'bold',
    marginLeft: 4, // Slight offset to center the triangle
  },
  youtubeBadge: {
    position: 'absolute',
    top: SPACING.md,
    right: SPACING.md,
    backgroundColor: 'rgba(255, 0, 0, 0.9)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
  },
  youtubeText: {
    ...createTextStyle(12, 'bold'),
    color: COLORS.white,
  },
  videoInfo: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: SPACING.md,
  },
  videoTitle: {
    ...createTextStyle(16, 'bold'),
    color: COLORS.white,
    marginBottom: SPACING.xs,
  },
  videoDescription: {
    ...createTextStyle(14, 'regular'),
    color: 'rgba(255, 255, 255, 0.8)',
  },
});

export default YouTubeVideoPlayer;
