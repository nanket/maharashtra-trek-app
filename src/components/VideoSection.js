import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { Video } from 'expo-av';
import YouTubeVideoPlayer from './YouTubeVideoPlayer';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS, createTextStyle } from '../utils/constants';
import { getVideoInfo } from '../utils/videoUtils';

const { width: screenWidth } = Dimensions.get('window');

/**
 * Dedicated Video Section Component
 * 
 * Features:
 * - Separate section for trek videos
 * - Horizontal scrollable video list
 * - Clear video indicators and thumbnails
 * - Fullscreen video support
 */
const VideoSection = ({
  videos = [],
  onVideoPress = null,
  title = "Trek Videos"
}) => {
  if (!videos || videos.length === 0) {
    return null;
  }

  const renderVideoItem = (videoUrl, index) => {
    const videoInfo = getVideoInfo(videoUrl);

    if (videoInfo.type === 'youtube') {
      return (
        <View key={index} style={styles.videoItem}>
          <YouTubeVideoPlayer
            url={videoUrl}
            style={styles.youtubeVideo}
          />
        </View>
      );
    } else if (videoInfo.playable) {
      return (
        <View key={index} style={styles.videoItem}>
          <Video
            source={{ uri: videoUrl }}
            style={styles.video}
            useNativeControls={false}
            resizeMode="cover"
            shouldPlay={false}
            isLooping={false}
          />
          
          {/* Video overlay with play button */}
          <View style={styles.videoOverlay}>
            <TouchableOpacity
              style={styles.playButton}
              onPress={() => onVideoPress && onVideoPress(videoUrl)}
              activeOpacity={0.8}
            >
              <Text style={styles.playIcon}>▶</Text>
            </TouchableOpacity>
            
            {/* Fullscreen button */}
            <TouchableOpacity
              style={styles.fullscreenButton}
              onPress={() => onVideoPress && onVideoPress(videoUrl)}
              activeOpacity={0.8}
            >
              <Text style={styles.fullscreenIcon}>⛶</Text>
            </TouchableOpacity>
          </View>
          
          {/* Video duration/info */}
          <View style={styles.videoInfo}>
            <Text style={styles.videoLabel}>Trek Video {index + 1}</Text>
          </View>
        </View>
      );
    } else {
      return (
        <View key={index} style={[styles.videoItem, styles.unsupportedVideo]}>
          <Text style={styles.unsupportedIcon}>⚠️</Text>
          <Text style={styles.unsupportedText}>Unsupported Format</Text>
        </View>
      );
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.videoCount}>
          <Text style={styles.videoCountText}>{videos.length} video{videos.length > 1 ? 's' : ''}</Text>
        </View>
      </View>
      
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.videoList}
        style={styles.scrollView}
      >
        {videos.map(renderVideoItem)}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.xl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
    paddingHorizontal: SPACING.lg,
  },
  title: {
    ...createTextStyle(20, 'bold', COLORS.text),
  },
  videoCount: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
  },
  videoCountText: {
    ...createTextStyle(12, 'semibold', COLORS.white),
  },
  scrollView: {
    paddingLeft: SPACING.lg,
  },
  videoList: {
    paddingRight: SPACING.lg,
  },
  videoItem: {
    width: 280,
    height: 160,
    marginRight: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    backgroundColor: COLORS.backgroundCard,
    position: 'relative',
    ...SHADOWS.medium,
  },
  video: {
    width: '100%',
    height: '100%',
  },
  youtubeVideo: {
    width: '100%',
    height: '100%',
  },
  videoOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  playButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.large,
  },
  playIcon: {
    fontSize: 24,
    color: COLORS.primary,
    marginLeft: 4, // Adjust for visual centering
  },
  fullscreenButton: {
    position: 'absolute',
    bottom: SPACING.md,
    right: SPACING.md,
    width: 36,
    height: 36,
    borderRadius: SPACING.sm,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullscreenIcon: {
    fontSize: 16,
    color: COLORS.white,
  },
  videoInfo: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  videoLabel: {
    ...createTextStyle(14, 'semibold', COLORS.white),
  },
  unsupportedVideo: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundSecondary,
  },
  unsupportedIcon: {
    fontSize: 32,
    marginBottom: SPACING.sm,
  },
  unsupportedText: {
    ...createTextStyle(14, 'medium', COLORS.textSecondary),
  },
});

export default VideoSection;
