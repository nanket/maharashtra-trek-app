import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  Dimensions,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SHADOWS, SPACING, BORDER_RADIUS, createTextStyle } from '../utils/constants';
import TrekTrackingService from '../services/TrekTrackingService';
import EmergencyService from '../services/EmergencyService';
import MapView from '../components/MapView';

const { width } = Dimensions.get('window');

const LiveTrackingScreen = ({ navigation, route }) => {
  const { trek } = route?.params || {};
  const [isTracking, setIsTracking] = useState(false);
  const [trackingData, setTrackingData] = useState(null);
  const [currentStats, setCurrentStats] = useState({
    distance: 0,
    elevation: 0,
    duration: 0,
    speed: 0,
  });
  const [showMap, setShowMap] = useState(true);
  const intervalRef = useRef(null);

  useEffect(() => {
    loadTrackingStatus();
    
    // Update stats every 5 seconds when tracking
    if (isTracking) {
      intervalRef.current = setInterval(updateStats, 5000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isTracking]);

  const loadTrackingStatus = async () => {
    try {
      const status = TrekTrackingService.getTrackingStatus();
      setIsTracking(status.isTracking);
      setTrackingData(status.trackingData);
      
      if (status.isTracking) {
        updateStats();
      }
    } catch (error) {
      console.error('Error loading tracking status:', error);
    }
  };

  const updateStats = () => {
    const status = TrekTrackingService.getTrackingStatus();
    if (status.trackingData && status.trackingData.waypoints.length > 0) {
      const data = status.trackingData;
      const waypoints = data.waypoints;
      const latest = waypoints[waypoints.length - 1];
      
      // Calculate current stats
      TrekTrackingService.calculateTrekStatistics();
      
      setCurrentStats({
        distance: (data.totalDistance / 1000).toFixed(2), // Convert to km
        elevation: Math.round(data.elevationGain),
        duration: calculateDuration(data.startTime),
        speed: latest.speed ? (latest.speed * 3.6).toFixed(1) : '0.0', // Convert m/s to km/h
      });
      
      setTrackingData(data);
    }
  };

  const calculateDuration = (startTime) => {
    if (!startTime) return '00:00:00';
    
    const start = new Date(startTime);
    const now = new Date();
    const diffMs = now - start;
    
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleStartTracking = async () => {
    try {
      if (!trek) {
        Alert.alert('Error', 'No trek selected for tracking');
        return;
      }

      Alert.alert(
        'Start Trek Tracking',
        `Begin tracking your ${trek.name} trek? This will monitor your location and progress.`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Start Tracking',
            onPress: async () => {
              try {
                await TrekTrackingService.startTracking(trek);
                setIsTracking(true);
                Alert.alert('Tracking Started', 'Your trek is now being tracked. Stay safe!');
              } catch (error) {
                Alert.alert('Error', 'Failed to start tracking: ' + error.message);
              }
            }
          }
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to start tracking');
    }
  };

  const handleStopTracking = async () => {
    try {
      Alert.alert(
        'Stop Trek Tracking',
        'Are you sure you want to stop tracking? Your trek data will be saved.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Stop Tracking',
            style: 'destructive',
            onPress: async () => {
              try {
                const result = await TrekTrackingService.stopTracking();
                setIsTracking(false);
                setTrackingData(null);
                
                Alert.alert(
                  'Trek Completed!',
                  `Your trek has been saved with ${result.trekData.waypoints.length} waypoints.`,
                  [
                    { text: 'View Summary', onPress: () => navigation.navigate('TrekSummary', { trekData: result.trekData }) },
                    { text: 'OK' }
                  ]
                );
              } catch (error) {
                Alert.alert('Error', 'Failed to stop tracking: ' + error.message);
              }
            }
          }
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to stop tracking');
    }
  };

  const handleAddCheckpoint = async () => {
    Alert.prompt(
      'Add Checkpoint',
      'Enter a name for this checkpoint:',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Add',
          onPress: async (name) => {
            if (name && name.trim()) {
              try {
                await TrekTrackingService.addCheckpoint(name.trim(), 'waypoint');
                Alert.alert('Checkpoint Added', `"${name}" has been added to your trek.`);
              } catch (error) {
                Alert.alert('Error', 'Failed to add checkpoint');
              }
            }
          }
        }
      ],
      'plain-text'
    );
  };

  const handleRestStop = async () => {
    Alert.prompt(
      'Rest Stop',
      'Add notes for this rest stop (optional):',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Add Rest Stop',
          onPress: async (notes) => {
            try {
              await TrekTrackingService.addRestStop(notes || '');
              Alert.alert('Rest Stop Added', 'Rest stop has been recorded.');
            } catch (error) {
              Alert.alert('Error', 'Failed to add rest stop');
            }
          }
        }
      ],
      'plain-text'
    );
  };

  const handleEmergency = async () => {
    try {
      const action = await EmergencyService.showEmergencyOptions();
      
      if (action === 'sos') {
        await EmergencyService.sendEmergencySOS('trek_emergency');
        Alert.alert('SOS Sent', 'Emergency alert sent with your location.');
      } else if (action) {
        await EmergencyService.callEmergencyNumber(action.toUpperCase());
      }
    } catch (error) {
      Alert.alert('Error', 'Emergency action failed');
    }
  };

  const renderTrackingControls = () => (
    <View style={styles.controlsSection}>
      {!isTracking ? (
        <TouchableOpacity
          style={styles.startButton}
          onPress={handleStartTracking}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={[COLORS.secondary, COLORS.primary]}
            style={styles.startGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.startIcon}>▶️</Text>
            <Text style={styles.startText}>Start Trek Tracking</Text>
          </LinearGradient>
        </TouchableOpacity>
      ) : (
        <View style={styles.trackingControls}>
          <TouchableOpacity
            style={styles.stopButton}
            onPress={handleStopTracking}
            activeOpacity={0.8}
          >
            <Text style={styles.stopIcon}>⏹️</Text>
            <Text style={styles.stopText}>Stop Tracking</Text>
          </TouchableOpacity>
          
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleAddCheckpoint}
              activeOpacity={0.7}
            >
              <Text style={styles.actionIcon}>📍</Text>
              <Text style={styles.actionText}>Checkpoint</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleRestStop}
              activeOpacity={0.7}
            >
              <Text style={styles.actionIcon}>☕</Text>
              <Text style={styles.actionText}>Rest Stop</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.actionButton, styles.emergencyButton]}
              onPress={handleEmergency}
              activeOpacity={0.7}
            >
              <Text style={styles.actionIcon}>🚨</Text>
              <Text style={styles.actionText}>Emergency</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );

  const renderStats = () => (
    <View style={styles.statsSection}>
      <Text style={styles.sectionTitle}>📊 Trek Statistics</Text>
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{currentStats.distance}</Text>
          <Text style={styles.statLabel}>Distance (km)</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{currentStats.elevation}</Text>
          <Text style={styles.statLabel}>Elevation (m)</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{currentStats.duration}</Text>
          <Text style={styles.statLabel}>Duration</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{currentStats.speed}</Text>
          <Text style={styles.statLabel}>Speed (km/h)</Text>
        </View>
      </View>
    </View>
  );

  const renderMap = () => (
    <View style={styles.mapSection}>
      <View style={styles.mapHeader}>
        <Text style={styles.sectionTitle}>🗺️ Live Map</Text>
        <TouchableOpacity
          style={styles.mapToggle}
          onPress={() => setShowMap(!showMap)}
        >
          <Text style={styles.mapToggleText}>{showMap ? 'Hide' : 'Show'}</Text>
        </TouchableOpacity>
      </View>
      
      {showMap && (
        <View style={styles.mapContainer}>
          <MapView
            locations={trek ? [trek] : []}
            showUserLocation={true}
            style={styles.map}
          />
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Live Tracking</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Trek Info */}
        {trek && (
          <View style={styles.trekInfo}>
            <Text style={styles.trekName}>{trek.name}</Text>
            <Text style={styles.trekDetails}>{trek.location} • {trek.difficulty}</Text>
            {isTracking && (
              <View style={styles.trackingIndicator}>
                <View style={styles.trackingDot} />
                <Text style={styles.trackingText}>Live Tracking Active</Text>
              </View>
            )}
          </View>
        )}

        {renderTrackingControls()}
        
        {isTracking && (
          <>
            {renderStats()}
            {renderMap()}
          </>
        )}

        {/* Safety Reminders */}
        <View style={styles.safetySection}>
          <Text style={styles.sectionTitle}>🛡️ Safety Reminders</Text>
          <View style={styles.safetyList}>
            <Text style={styles.safetyItem}>• Keep your phone charged</Text>
            <Text style={styles.safetyItem}>• Stay on marked trails</Text>
            <Text style={styles.safetyItem}>• Inform others of your progress</Text>
            <Text style={styles.safetyItem}>• Turn back if weather deteriorates</Text>
            <Text style={styles.safetyItem}>• Use emergency button if needed</Text>
          </View>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceBorder,
  },
  backButton: {
    padding: SPACING.sm,
  },
  backButtonText: {
    ...createTextStyle(16, 'medium'),
    color: COLORS.primary,
  },
  headerTitle: {
    ...createTextStyle(20, 'bold'),
    color: COLORS.text,
  },
  headerSpacer: {
    width: 60,
  },
  scrollView: {
    flex: 1,
  },
  trekInfo: {
    padding: SPACING.xl,
    backgroundColor: COLORS.backgroundCard,
    marginHorizontal: SPACING.xl,
    marginTop: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    ...SHADOWS.small,
  },
  trekName: {
    ...createTextStyle(18, 'bold'),
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  trekDetails: {
    ...createTextStyle(14, 'regular'),
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  trackingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trackingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.secondary,
    marginRight: SPACING.xs,
  },
  trackingText: {
    ...createTextStyle(12, 'medium'),
    color: COLORS.secondary,
  },
  controlsSection: {
    padding: SPACING.xl,
  },
  startButton: {
    height: 80,
    borderRadius: BORDER_RADIUS.xl,
    overflow: 'hidden',
    ...SHADOWS.medium,
  },
  startGradient: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  startIcon: {
    fontSize: 24,
    marginRight: SPACING.sm,
  },
  startText: {
    ...createTextStyle(18, 'bold'),
    color: COLORS.textInverse,
  },
  trackingControls: {
    alignItems: 'center',
  },
  stopButton: {
    backgroundColor: COLORS.error,
    borderRadius: BORDER_RADIUS.lg,
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.xl,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
    ...SHADOWS.medium,
  },
  stopIcon: {
    fontSize: 20,
    marginRight: SPACING.sm,
  },
  stopText: {
    ...createTextStyle(16, 'bold'),
    color: COLORS.textInverse,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  actionButton: {
    backgroundColor: COLORS.backgroundCard,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: SPACING.xs,
    ...SHADOWS.small,
  },
  emergencyButton: {
    backgroundColor: COLORS.error + '15',
    borderWidth: 1,
    borderColor: COLORS.error,
  },
  actionIcon: {
    fontSize: 20,
    marginBottom: SPACING.xs,
  },
  actionText: {
    ...createTextStyle(12, 'medium'),
    color: COLORS.text,
  },
  statsSection: {
    padding: SPACING.xl,
    paddingTop: 0,
  },
  sectionTitle: {
    ...createTextStyle(18, 'bold'),
    color: COLORS.text,
    marginBottom: SPACING.lg,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: (width - SPACING.xl * 2 - SPACING.md) / 2,
    backgroundColor: COLORS.backgroundCard,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    alignItems: 'center',
    marginBottom: SPACING.md,
    ...SHADOWS.small,
  },
  statValue: {
    ...createTextStyle(24, 'bold'),
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  statLabel: {
    ...createTextStyle(12, 'medium'),
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  mapSection: {
    padding: SPACING.xl,
    paddingTop: 0,
  },
  mapHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  mapToggle: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  mapToggleText: {
    ...createTextStyle(12, 'bold'),
    color: COLORS.textInverse,
  },
  mapContainer: {
    height: 200,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    ...SHADOWS.medium,
  },
  map: {
    flex: 1,
  },
  safetySection: {
    padding: SPACING.xl,
    paddingTop: 0,
  },
  safetyList: {
    backgroundColor: COLORS.backgroundCard,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    ...SHADOWS.small,
  },
  safetyItem: {
    ...createTextStyle(14, 'regular'),
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
    lineHeight: 20,
  },
});

export default LiveTrackingScreen;
