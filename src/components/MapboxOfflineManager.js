import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../utils/constants';
import { MAHARASHTRA_BOUNDS, MAPBOX_CONFIG } from '../config/mapbox';

// Safely import Mapbox with error handling
let Mapbox = null;
let isMapboxAvailable = false;

try {
  Mapbox = require('@rnmapbox/maps').default;
  isMapboxAvailable = !!(Mapbox && Mapbox.offlineManager);
} catch (error) {
  console.warn('Mapbox not available in this environment:', error.message);
  isMapboxAvailable = false;
}

// Predefined regions for Maharashtra
const MAHARASHTRA_REGIONS = {
  pune: {
    name: 'Pune Region',
    bounds: [
      [73.4, 18.1], // Southwest
      [74.2, 18.9], // Northeast
    ],
    description: 'Includes Pune, Sinhagad, Rajgad, and surrounding areas',
    estimatedSize: '45 MB',
  },
  mumbai: {
    name: 'Mumbai Region',
    bounds: [
      [72.7, 18.8], // Southwest
      [73.2, 19.3], // Northeast
    ],
    description: 'Mumbai and nearby trekking spots',
    estimatedSize: '38 MB',
  },
  nashik: {
    name: 'Nashik Region',
    bounds: [
      [73.4, 19.7], // Southwest
      [74.2, 20.3], // Northeast
    ],
    description: 'Nashik and Western Ghats region',
    estimatedSize: '42 MB',
  },
  satara: {
    name: 'Satara Region',
    bounds: [
      [73.5, 17.4], // Southwest
      [74.8, 18.2], // Northeast
    ],
    description: 'Satara, Mahabaleshwar, and hill stations',
    estimatedSize: '52 MB',
  },
  kolhapur: {
    name: 'Kolhapur Region',
    bounds: [
      [73.8, 16.4], // Southwest
      [74.8, 17.2], // Northeast
    ],
    description: 'Kolhapur and southern Maharashtra',
    estimatedSize: '35 MB',
  },
  aurangabad: {
    name: 'Aurangabad Region',
    bounds: [
      [75.0, 19.6], // Southwest
      [76.0, 20.2], // Northeast
    ],
    description: 'Aurangabad, Ajanta, Ellora caves region',
    estimatedSize: '40 MB',
  },
};

const MapboxOfflineManager = ({ visible, onClose }) => {
  const [downloadedRegions, setDownloadedRegions] = useState([]);
  const [downloadProgress, setDownloadProgress] = useState({});
  const [isDownloading, setIsDownloading] = useState(false);
  const [totalStorage, setTotalStorage] = useState(0);

  useEffect(() => {
    if (visible) {
      loadDownloadedRegions();
    }
  }, [visible]);

  const loadDownloadedRegions = async () => {
    try {
      if (!isMapboxAvailable || !Mapbox?.offlineManager) {
        setDownloadedRegions([]);
        return;
      }

      const regions = await Mapbox.offlineManager.getPacks();
      setDownloadedRegions(regions || []);

      // Calculate total storage used
      const total = regions.reduce((sum, region) => sum + (region.size || 0), 0);
      setTotalStorage(total);
    } catch (error) {
      console.warn('Error loading downloaded regions:', error);
      setDownloadedRegions([]);
    }
  };

  const downloadRegion = async (regionKey) => {
    try {
      if (!isMapboxAvailable || !Mapbox?.offlineManager) {
        Alert.alert(
          'Development Build Required',
          'Mapbox offline maps require a development build. Run:\n\nexpo run:android\nexpo run:ios',
          [{ text: 'OK' }]
        );
        return;
      }

      const regionData = MAHARASHTRA_REGIONS[regionKey];
      if (!regionData) return;

      setIsDownloading(true);
      setDownloadProgress({ [regionKey]: 0 });

      // Create offline pack options
      const options = {
        name: regionKey,
        styleURL: MAPBOX_CONFIG.defaultStyle,
        bounds: regionData.bounds,
        minZoom: MAPBOX_CONFIG.offline.minZoom,
        maxZoom: MAPBOX_CONFIG.offline.maxZoom,
        metadata: {
          name: regionData.name,
          description: regionData.description,
          downloadDate: new Date().toISOString(),
        },
      };

      // Start download with progress tracking
      const progressListener = (offlineRegion, status) => {
        const progress = status.percentage / 100;
        setDownloadProgress({ [regionKey]: progress });
      };

      const errorListener = (offlineRegion, error) => {
        console.error('Download error:', error);
        setIsDownloading(false);
        setDownloadProgress({});
        Alert.alert('Download Failed', 'Failed to download offline map. Please try again.');
      };

      const completeListener = (offlineRegion) => {
        setIsDownloading(false);
        setDownloadProgress({});
        loadDownloadedRegions(); // Refresh the list
        
        Alert.alert(
          'Download Complete',
          `${regionData.name} is now available offline!`,
          [{ text: 'OK' }]
        );
      };

      // Create and start download
      await Mapbox.offlineManager.createPack(
        options,
        progressListener,
        errorListener,
        completeListener
      );

    } catch (error) {
      console.error('Download error:', error);
      setIsDownloading(false);
      setDownloadProgress({});
      Alert.alert('Download Failed', 'Failed to download offline map. Please try again.');
    }
  };

  const deleteRegion = async (regionName) => {
    try {
      Alert.alert(
        'Delete Offline Map',
        'Are you sure you want to delete this offline map?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: async () => {
              await Mapbox.offlineManager.deletePack(regionName);
              loadDownloadedRegions();
              Alert.alert('Deleted', 'Offline map has been removed.');
            }
          }
        ]
      );
    } catch (error) {
      console.error('Delete error:', error);
      Alert.alert('Delete Failed', 'Failed to delete offline map.');
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const renderAvailableRegions = () => {
    return Object.entries(MAHARASHTRA_REGIONS).map(([key, region]) => {
      const isDownloaded = downloadedRegions.some(r => r.name === key);
      const progress = downloadProgress[key];
      const isDownloadingThis = isDownloading && progress !== undefined;

      return (
        <View key={key} style={styles.regionItem}>
          <View style={styles.regionInfo}>
            <Text style={styles.regionName}>{region.name}</Text>
            <Text style={styles.regionDescription}>{region.description}</Text>
            <Text style={styles.regionSize}>Estimated size: {region.estimatedSize}</Text>
          </View>

          <View style={styles.regionActions}>
            {isDownloaded ? (
              <TouchableOpacity
                style={[styles.actionButton, styles.deleteButton]}
                onPress={() => deleteRegion(key)}
              >
                <Text style={styles.deleteButtonText}>Delete</Text>
              </TouchableOpacity>
            ) : isDownloadingThis ? (
              <View style={styles.progressContainer}>
                <ActivityIndicator size="small" color={COLORS.primary} />
                <Text style={styles.progressText}>
                  {Math.round(progress * 100)}%
                </Text>
              </View>
            ) : (
              <TouchableOpacity
                style={[styles.actionButton, styles.downloadButton]}
                onPress={() => downloadRegion(key)}
                disabled={isDownloading}
              >
                <Text style={styles.downloadButtonText}>Download</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      );
    });
  };

  const renderDownloadedRegions = () => {
    if (downloadedRegions.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>No offline maps downloaded</Text>
          <Text style={styles.emptyStateSubtext}>
            Download regions below to use maps offline
          </Text>
        </View>
      );
    }

    return downloadedRegions.map((region, index) => (
      <View key={index} style={styles.downloadedItem}>
        <View style={styles.downloadedInfo}>
          <Text style={styles.downloadedName}>
            {region.metadata?.name || region.name}
          </Text>
          <Text style={styles.downloadedSize}>
            {formatFileSize(region.size || 0)}
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => deleteRegion(region.name)}
        >
          <Text style={styles.deleteButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    ));
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

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Storage Info */}
          <View style={styles.storageSection}>
            <Text style={styles.sectionTitle}>Storage Usage</Text>
            <View style={styles.storageInfo}>
              <Text style={styles.storageText}>
                Total: {formatFileSize(totalStorage)}
              </Text>
              <Text style={styles.storageSubtext}>
                {downloadedRegions.length} region{downloadedRegions.length !== 1 ? 's' : ''} downloaded
              </Text>
            </View>
          </View>

          {/* Downloaded Regions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Downloaded Regions</Text>
            {renderDownloadedRegions()}
          </View>

          {/* Available Regions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Available Regions</Text>
            <Text style={styles.sectionSubtitle}>
              Download maps for offline use during treks
            </Text>
            {renderAvailableRegions()}
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
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.white,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.text,
  },
  closeButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  closeButtonText: {
    fontSize: 16,
    color: COLORS.primary,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  storageSection: {
    padding: SPACING.lg,
    backgroundColor: COLORS.white,
    marginBottom: SPACING.sm,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },
  storageInfo: {
    backgroundColor: COLORS.background,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
  },
  storageText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  storageSubtext: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  section: {
    padding: SPACING.lg,
    backgroundColor: COLORS.white,
    marginBottom: SPACING.sm,
  },
  regionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  regionInfo: {
    flex: 1,
    marginRight: SPACING.md,
  },
  regionName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  regionDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  regionSize: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  regionActions: {
    alignItems: 'center',
  },
  actionButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.sm,
    minWidth: 80,
    alignItems: 'center',
  },
  downloadButton: {
    backgroundColor: COLORS.primary,
  },
  downloadButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '600',
  },
  deleteButton: {
    backgroundColor: COLORS.error,
  },
  deleteButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '600',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressText: {
    marginLeft: SPACING.sm,
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
  },
  downloadedItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  downloadedInfo: {
    flex: 1,
  },
  downloadedName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  downloadedSize: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  emptyStateText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
});

export default MapboxOfflineManager;
