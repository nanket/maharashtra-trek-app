import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Modal,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
  Alert,
} from 'react-native';
import { Video } from 'expo-av';
import { COLORS, SPACING, createTextStyle } from '../utils/constants';
import { getVideoInfo } from '../utils/videoUtils';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

/**
 * FullscreenVideoPlayer component for immersive video viewing
 *
 * Features:
 * - Fullscreen modal display
 * - Native video controls
 * - Auto-rotation support
 * - Loading states and error handling
 * - Professional UI with minimal distractions
 */
const FullscreenVideoPlayer = ({
  visible,
  videoUrl,
  onClose,
  title = "Trek Video"
}) => {
  const [videoStatus, setVideoStatus] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const videoRef = useRef(null);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (visible) {
      setLoading(true);
      setError(false);
      setVideoStatus({});
    } else {
      // Pause video when modal closes
      if (videoRef.current) {
        videoRef.current.pauseAsync();
      }
    }
  }, [visible]);

  const handleVideoStatusUpdate = (status) => {
    setVideoStatus(status);
    
    // Handle loading state
    if (status.isLoaded && loading) {
      setLoading(false);
    }
    
    // Handle errors
    if (status.error) {
      setError(true);
      setLoading(false);
      console.error('Video playback error:', status.error);
    }
  };

  const handleVideoError = (error) => {
    console.error('Video error:', error);
    setError(true);
    setLoading(false);
    Alert.alert(
      'Video Error',
      'Unable to play video. Please check your internet connection and try again.',
      [{ text: 'OK', onPress: onClose }]
    );
  };

  const handleClose = () => {
    // Pause video before closing
    if (videoRef.current && videoStatus.isLoaded) {
      videoRef.current.pauseAsync();
    }
    onClose();
  };

  const renderVideoControls = () => {
    if (!videoStatus.isLoaded || error) return null;

    const isPlaying = videoStatus.isPlaying;
    const duration = videoStatus.durationMillis || 0;
    const position = videoStatus.positionMillis || 0;
    
    const formatTime = (millis) => {
      const totalSeconds = Math.floor(millis / 1000);
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = totalSeconds % 60;
      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    return (
      <View style={styles.controlsContainer}>
        <View style={styles.timeContainer}>
          <Text style={styles.timeText}>
            {formatTime(position)} / {formatTime(duration)}
          </Text>
        </View>
      </View>
    );
  };

  const renderContent = () => {
    if (!videoUrl) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={styles.errorText}>No video URL provided</Text>
        </View>
      );
    }

    const videoInfo = getVideoInfo(videoUrl);

    if (!videoInfo.playable) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorIcon}>📹</Text>
          <Text style={styles.errorText}>Video format not supported for fullscreen playback</Text>
          <Text style={styles.errorSubtext}>This video can only be played in the carousel view</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorIcon}>❌</Text>
          <Text style={styles.errorText}>Failed to load video</Text>
          <Text style={styles.errorSubtext}>Please check your internet connection</Text>
        </View>
      );
    }

    return (
      <View style={styles.videoContainer}>
        <Video
          ref={videoRef}
          source={{ uri: videoUrl }}
          style={styles.video}
          useNativeControls={true}
          resizeMode="contain"
          shouldPlay={false}
          isLooping={false}
          onPlaybackStatusUpdate={handleVideoStatusUpdate}
          onError={handleVideoError}
        />
        
        {loading && (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading video...</Text>
          </View>
        )}
        
        {renderVideoControls()}
      </View>
    );
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={handleClose}
      statusBarTranslucent={true}
    >
      <StatusBar hidden={true} />
      <View style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
            <View style={styles.titleContainer}>
              <Text style={styles.title}>{title}</Text>
            </View>
          </View>

          {/* Video Content */}
          <View style={styles.content}>
            {renderContent()}
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.black,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    ...createTextStyle(18, 'bold', COLORS.white),
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
    marginRight: 40, // Balance the close button
  },
  title: {
    ...createTextStyle(18, 'semibold', COLORS.white),
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoContainer: {
    width: screenWidth,
    height: screenHeight - 120, // Account for header
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  loadingContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -75 }, { translateY: -25 }],
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.lg,
    borderRadius: SPACING.md,
    alignItems: 'center',
  },
  loadingText: {
    ...createTextStyle(16, 'medium', COLORS.white),
  },
  errorContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: SPACING.lg,
  },
  errorText: {
    ...createTextStyle(18, 'semibold', COLORS.white),
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  errorSubtext: {
    ...createTextStyle(14, 'regular', COLORS.textSecondary),
    textAlign: 'center',
    opacity: 0.8,
  },
  controlsContainer: {
    position: 'absolute',
    bottom: SPACING.xl,
    left: SPACING.lg,
    right: SPACING.lg,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: SPACING.md,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  timeContainer: {
    alignItems: 'center',
  },
  timeText: {
    ...createTextStyle(14, 'medium', COLORS.white),
  },
});

export default FullscreenVideoPlayer;
