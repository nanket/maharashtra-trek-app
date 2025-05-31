import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Modal,
  ScrollView,
  ProgressBarAndroid,
  Platform,
} from 'react-native';
import { ProgressView } from '@react-native-community/progress-view';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../utils/constants';
import { TREK_REGIONS } from '../config/mapbox';

const ProgressBar = Platform.OS === 'ios' ? ProgressView : ProgressBarAndroid;

const OfflineMapManager = ({ visible, onClose }) => {
  const [downloadedRegions, setDownloadedRegions] = useState([]);
  const [downloadProgress, setDownloadProgress] = useState({});
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    if (visible) {
      loadDownloadedRegions();
    }
  }, [visible]);

  const loadDownloadedRegions = async () => {
    try {
      // For react-native-maps, we'll simulate offline functionality
      // In a real implementation, you would use a different offline solution
      const regions = []; // Placeholder for downloaded regions
      setDownloadedRegions(regions || []);
    } catch (error) {
      console.warn('Error loading downloaded regions:', error);
    }
  };

  const downloadRegion = async (regionKey, regionData) => {
    try {
      setIsDownloading(true);
      setDownloadProgress({ [regionKey]: 0 });

      // Simulate download progress for react-native-maps
      // In a real implementation, you would use a different offline solution
      const simulateProgress = () => {
        let progress = 0;
        const interval = setInterval(() => {
          progress += 0.1;
          setDownloadProgress({ [regionKey]: progress });

          if (progress >= 1) {
            clearInterval(interval);
            setIsDownloading(false);
            setDownloadProgress({});

            // Add to downloaded regions
            setDownloadedRegions(prev => [...prev, { name: regionKey, size: 52428800 }]); // 50MB

            Alert.alert(
              'Download Complete',
              `${regionData.name} is now available offline!\n\nNote: This is a demo. For full offline functionality, consider using Mapbox with a development build.`,
              [{ text: 'OK' }]
            );
          }
        }, 200);
      };

      simulateProgress();
    } catch (error) {
      console.error('Download error:', error);
      setIsDownloading(false);
      setDownloadProgress({});
      Alert.alert('Download Failed', 'Failed to download offline map. Please try again.');
    }
  };

  const deleteRegion = async (regionName) => {
    try {
      // Remove from downloaded regions
      setDownloadedRegions(prev => prev.filter(region => region.name !== regionName));
      Alert.alert('Deleted', 'Offline map has been removed.');
    } catch (error) {
      console.error('Delete error:', error);
      Alert.alert('Delete Failed', 'Failed to delete offline map.');
    }
  };

  const confirmDownload = (regionKey, regionData) => {
    Alert.alert(
      'Download Offline Map',
      `Download ${regionData.name} for offline use? This may use significant data and storage.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Download', onPress: () => downloadRegion(regionKey, regionData) },
      ]
    );
  };

  const confirmDelete = (regionName) => {
    Alert.alert(
      'Delete Offline Map',
      'Are you sure you want to delete this offline map?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteRegion(regionName) },
      ]
    );
  };

  const isRegionDownloaded = (regionKey) => {
    return downloadedRegions.some(region => region.name === regionKey);
  };

  const getDownloadedSize = (regionKey) => {
    const region = downloadedRegions.find(r => r.name === regionKey);
    if (region && region.size) {
      const sizeInMB = (region.size / (1024 * 1024)).toFixed(1);
      return `${sizeInMB} MB`;
    }
    return '';
  };

  const renderRegionItem = (regionKey, regionData) => {
    const isDownloaded = isRegionDownloaded(regionKey);
    const progress = downloadProgress[regionKey];
    const isCurrentlyDownloading = progress !== undefined;

    return (
      <View key={regionKey} style={styles.regionItem}>
        <View style={styles.regionInfo}>
          <Text style={styles.regionName}>{regionData.name}</Text>
          <Text style={styles.regionDescription}>
            Popular trekking destinations in this region
          </Text>
          {isDownloaded && (
            <Text style={styles.regionSize}>
              Downloaded • {getDownloadedSize(regionKey)}
            </Text>
          )}
        </View>

        <View style={styles.regionActions}>
          {isCurrentlyDownloading ? (
            <View style={styles.progressContainer}>
              <ProgressBar
                style={styles.progressBar}
                progress={progress}
                color={COLORS.primary}
              />
              <Text style={styles.progressText}>
                {Math.round(progress * 100)}%
              </Text>
            </View>
          ) : isDownloaded ? (
            <TouchableOpacity
              style={[styles.actionButton, styles.deleteButton]}
              onPress={() => confirmDelete(regionKey)}
            >
              <Text style={styles.deleteButtonText}>Delete</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.actionButton, styles.downloadButton]}
              onPress={() => confirmDownload(regionKey, regionData)}
              disabled={isDownloading}
            >
              <Text style={styles.downloadButtonText}>Download</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Offline Maps</Text>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Done</Text>
          </TouchableOpacity>
        </View>

        {/* Info Section */}
        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>📱 Offline Maps Demo</Text>
          <Text style={styles.infoText}>
            This demonstrates offline map functionality. For full offline support with
            react-native-maps, consider using additional libraries or switching to
            Mapbox with a development build.
          </Text>
        </View>

        {/* Regions List */}
        <ScrollView style={styles.regionsList} showsVerticalScrollIndicator={false}>
          <Text style={styles.sectionTitle}>Available Regions</Text>
          
          {Object.entries(TREK_REGIONS).map(([key, data]) => 
            renderRegionItem(key, data)
          )}

          {/* Storage Info */}
          <View style={styles.storageInfo}>
            <Text style={styles.storageTitle}>💾 Storage Information</Text>
            <Text style={styles.storageText}>
              • Each region: ~50-100 MB{'\n'}
              • Maps include detailed topography{'\n'}
              • Updates available when online
            </Text>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.backgroundSecondary,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.text,
  },
  closeButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
  },
  closeButtonText: {
    color: COLORS.textInverse,
    fontSize: 16,
    fontWeight: '600',
  },
  infoSection: {
    backgroundColor: COLORS.backgroundCard,
    margin: SPACING.lg,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    ...SHADOWS.small,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  infoText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
    fontWeight: '500',
  },
  regionsList: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.lg,
  },
  regionItem: {
    flexDirection: 'row',
    backgroundColor: COLORS.backgroundCard,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    ...SHADOWS.small,
  },
  regionInfo: {
    flex: 1,
    marginRight: SPACING.md,
  },
  regionName: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  regionDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '500',
    marginBottom: SPACING.xs,
  },
  regionSize: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '600',
  },
  regionActions: {
    justifyContent: 'center',
  },
  actionButton: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    minWidth: 80,
    alignItems: 'center',
  },
  downloadButton: {
    backgroundColor: COLORS.primary,
  },
  downloadButtonText: {
    color: COLORS.textInverse,
    fontSize: 14,
    fontWeight: '600',
  },
  deleteButton: {
    backgroundColor: COLORS.backgroundSecondary,
    borderWidth: 1,
    borderColor: COLORS.textSecondary,
  },
  deleteButtonText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  progressContainer: {
    alignItems: 'center',
    minWidth: 80,
  },
  progressBar: {
    width: 60,
    height: 4,
    marginBottom: SPACING.xs,
  },
  progressText: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '600',
  },
  storageInfo: {
    backgroundColor: COLORS.backgroundCard,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    marginTop: SPACING.lg,
    marginBottom: SPACING.xl,
    ...SHADOWS.small,
  },
  storageTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  storageText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
    fontWeight: '500',
  },
});

export default OfflineMapManager;
