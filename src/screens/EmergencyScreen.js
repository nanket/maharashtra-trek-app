import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  Linking,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SHADOWS, SPACING, BORDER_RADIUS, createTextStyle } from '../utils/constants';
import EmergencyService from '../services/EmergencyService';

const { width } = Dimensions.get('window');

const EmergencyScreen = ({ navigation }) => {
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [emergencyContacts, setEmergencyContacts] = useState([]);
  const [nearestServices, setNearestServices] = useState(null);

  useEffect(() => {
    loadEmergencyData();
  }, []);

  const loadEmergencyData = async () => {
    try {
      setLoading(true);
      
      // Load emergency contacts
      const contacts = await EmergencyService.getEmergencyContacts();
      setEmergencyContacts(contacts);

      // Get current location
      const currentLocation = await EmergencyService.getCurrentLocation();
      setLocation(currentLocation);

      // Get nearest emergency services
      const services = EmergencyService.getNearestEmergencyServices(currentLocation);
      setNearestServices(services);
    } catch (error) {
      console.error('Error loading emergency data:', error);
      Alert.alert('Error', 'Failed to load emergency information');
    } finally {
      setLoading(false);
    }
  };

  const handleEmergencySOS = async () => {
    Alert.alert(
      '🚨 Emergency SOS',
      'This will send your location and emergency information to your emergency contacts. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send SOS',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              const result = await EmergencyService.sendEmergencySOS('trek_emergency');
              
              Alert.alert(
                'SOS Sent',
                `Emergency alert sent to ${result.contactsNotified} contacts with your current location.`,
                [{ text: 'OK' }]
              );
            } catch (error) {
              Alert.alert('Error', 'Failed to send SOS. Please try calling emergency services directly.');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const handleEmergencyCall = async (type, number) => {
    try {
      await EmergencyService.callEmergencyNumber(type);
    } catch (error) {
      Alert.alert('Error', 'Failed to make emergency call');
    }
  };

  const renderSOSButton = () => (
    <View style={styles.sosSection}>
      <TouchableOpacity
        style={styles.sosButton}
        onPress={handleEmergencySOS}
        disabled={loading}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={[COLORS.error, '#FF6B6B']}
          style={styles.sosGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {loading ? (
            <ActivityIndicator color={COLORS.textInverse} size="large" />
          ) : (
            <>
              <Text style={styles.sosIcon}>🚨</Text>
              <Text style={styles.sosText}>EMERGENCY SOS</Text>
              <Text style={styles.sosSubtext}>Send location to emergency contacts</Text>
            </>
          )}
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

  const renderQuickCallButtons = () => (
    <View style={styles.quickCallSection}>
      <Text style={styles.sectionTitle}>🚑 Quick Emergency Calls</Text>
      <View style={styles.quickCallGrid}>
        {[
          { type: 'AMBULANCE', number: '108', label: 'Ambulance', icon: '🚑', color: COLORS.error },
          { type: 'POLICE', number: '100', label: 'Police', icon: '👮', color: COLORS.primary },
          { type: 'FIRE', number: '101', label: 'Fire', icon: '🚒', color: COLORS.warning },
          { type: 'TOURIST_HELPLINE', number: '1363', label: 'Tourist Help', icon: '🏔️', color: COLORS.secondary },
        ].map((service) => (
          <TouchableOpacity
            key={service.type}
            style={[styles.quickCallButton, { borderColor: service.color }]}
            onPress={() => handleEmergencyCall(service.type, service.number)}
            activeOpacity={0.7}
          >
            <Text style={styles.quickCallIcon}>{service.icon}</Text>
            <Text style={styles.quickCallLabel}>{service.label}</Text>
            <Text style={styles.quickCallNumber}>{service.number}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderLocationInfo = () => (
    <View style={styles.locationSection}>
      <Text style={styles.sectionTitle}>📍 Current Location</Text>
      {location ? (
        <View style={styles.locationCard}>
          <View style={styles.locationRow}>
            <Text style={styles.locationLabel}>Coordinates:</Text>
            <Text style={styles.locationValue}>
              {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
            </Text>
          </View>
          <View style={styles.locationRow}>
            <Text style={styles.locationLabel}>Accuracy:</Text>
            <Text style={styles.locationValue}>±{Math.round(location.accuracy)}m</Text>
          </View>
          <View style={styles.locationRow}>
            <Text style={styles.locationLabel}>Updated:</Text>
            <Text style={styles.locationValue}>
              {new Date(location.timestamp).toLocaleTimeString()}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.shareLocationButton}
            onPress={() => {
              const googleMapsUrl = `https://maps.google.com/maps?q=${location.latitude},${location.longitude}`;
              Linking.openURL(googleMapsUrl);
            }}
          >
            <Text style={styles.shareLocationText}>📍 Open in Maps</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.locationCard}>
          <Text style={styles.locationError}>Location not available</Text>
          <TouchableOpacity
            style={styles.refreshLocationButton}
            onPress={loadEmergencyData}
          >
            <Text style={styles.refreshLocationText}>🔄 Refresh Location</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  const renderNearestServices = () => (
    <View style={styles.servicesSection}>
      <Text style={styles.sectionTitle}>🏥 Nearest Emergency Services</Text>
      
      {nearestServices?.hospitals && (
        <View style={styles.serviceCategory}>
          <Text style={styles.serviceCategoryTitle}>🏥 Hospitals</Text>
          {nearestServices.hospitals.map((hospital, index) => (
            <TouchableOpacity
              key={index}
              style={styles.serviceItem}
              onPress={() => Linking.openURL(`tel:${hospital.phone}`)}
            >
              <View style={styles.serviceInfo}>
                <Text style={styles.serviceName}>{hospital.name}</Text>
                <Text style={styles.serviceDistance}>{hospital.distance}</Text>
              </View>
              <Text style={styles.servicePhone}>{hospital.phone}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {nearestServices?.policeStations && (
        <View style={styles.serviceCategory}>
          <Text style={styles.serviceCategoryTitle}>👮 Police Stations</Text>
          {nearestServices.policeStations.map((station, index) => (
            <TouchableOpacity
              key={index}
              style={styles.serviceItem}
              onPress={() => Linking.openURL(`tel:${station.phone}`)}
            >
              <View style={styles.serviceInfo}>
                <Text style={styles.serviceName}>{station.name}</Text>
                <Text style={styles.serviceDistance}>{station.distance}</Text>
              </View>
              <Text style={styles.servicePhone}>{station.phone}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );

  const renderEmergencyContacts = () => (
    <View style={styles.contactsSection}>
      <View style={styles.contactsHeader}>
        <Text style={styles.sectionTitle}>👥 Emergency Contacts</Text>
        <TouchableOpacity
          style={styles.manageContactsButton}
          onPress={() => navigation.navigate('EmergencyContacts')}
        >
          <Text style={styles.manageContactsText}>Manage</Text>
        </TouchableOpacity>
      </View>
      
      {emergencyContacts.length > 0 ? (
        emergencyContacts.map((contact, index) => (
          <TouchableOpacity
            key={index}
            style={styles.contactItem}
            onPress={() => Linking.openURL(`tel:${contact.phone}`)}
          >
            <View style={styles.contactInfo}>
              <Text style={styles.contactName}>{contact.name}</Text>
              <Text style={styles.contactRelation}>{contact.relation}</Text>
            </View>
            <Text style={styles.contactPhone}>{contact.phone}</Text>
          </TouchableOpacity>
        ))
      ) : (
        <View style={styles.noContactsCard}>
          <Text style={styles.noContactsText}>No emergency contacts set up</Text>
          <TouchableOpacity
            style={styles.addContactsButton}
            onPress={() => navigation.navigate('EmergencyContacts')}
          >
            <Text style={styles.addContactsText}>Add Contacts</Text>
          </TouchableOpacity>
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
        <Text style={styles.headerTitle}>Emergency</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {renderSOSButton()}
        {renderQuickCallButtons()}
        {renderLocationInfo()}
        {renderNearestServices()}
        {renderEmergencyContacts()}
        
        {/* Safety Tips */}
        <View style={styles.tipsSection}>
          <Text style={styles.sectionTitle}>💡 Emergency Tips</Text>
          <View style={styles.tipsList}>
            <Text style={styles.tipItem}>• Stay calm and assess the situation</Text>
            <Text style={styles.tipItem}>• Call for help immediately if injured</Text>
            <Text style={styles.tipItem}>• Share your location with others</Text>
            <Text style={styles.tipItem}>• Stay in one place if lost</Text>
            <Text style={styles.tipItem}>• Conserve phone battery</Text>
            <Text style={styles.tipItem}>• Use whistle or bright clothing to signal</Text>
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
  sosSection: {
    padding: SPACING.xl,
    alignItems: 'center',
  },
  sosButton: {
    width: width - SPACING.xl * 2,
    height: 120,
    borderRadius: BORDER_RADIUS.xl,
    overflow: 'hidden',
    ...SHADOWS.large,
  },
  sosGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sosIcon: {
    fontSize: 32,
    marginBottom: SPACING.sm,
  },
  sosText: {
    ...createTextStyle(20, 'bold'),
    color: COLORS.textInverse,
    marginBottom: SPACING.xs,
  },
  sosSubtext: {
    ...createTextStyle(12, 'regular'),
    color: COLORS.textInverse,
    opacity: 0.9,
  },
  quickCallSection: {
    padding: SPACING.xl,
    paddingTop: 0,
  },
  sectionTitle: {
    ...createTextStyle(18, 'bold'),
    color: COLORS.text,
    marginBottom: SPACING.lg,
  },
  quickCallGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickCallButton: {
    width: (width - SPACING.xl * 2 - SPACING.md) / 2,
    backgroundColor: COLORS.backgroundCard,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    alignItems: 'center',
    marginBottom: SPACING.md,
    borderWidth: 2,
    ...SHADOWS.small,
  },
  quickCallIcon: {
    fontSize: 24,
    marginBottom: SPACING.sm,
  },
  quickCallLabel: {
    ...createTextStyle(14, 'bold'),
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  quickCallNumber: {
    ...createTextStyle(16, 'bold'),
    color: COLORS.primary,
  },
  locationSection: {
    padding: SPACING.xl,
    paddingTop: 0,
  },
  locationCard: {
    backgroundColor: COLORS.backgroundCard,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    ...SHADOWS.small,
  },
  locationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  locationLabel: {
    ...createTextStyle(14, 'medium'),
    color: COLORS.textSecondary,
  },
  locationValue: {
    ...createTextStyle(14, 'bold'),
    color: COLORS.text,
  },
  shareLocationButton: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  shareLocationText: {
    ...createTextStyle(14, 'bold'),
    color: COLORS.textInverse,
  },
  locationError: {
    ...createTextStyle(14, 'regular'),
    color: COLORS.error,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  refreshLocationButton: {
    backgroundColor: COLORS.secondary,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    alignItems: 'center',
  },
  refreshLocationText: {
    ...createTextStyle(14, 'bold'),
    color: COLORS.textInverse,
  },
  servicesSection: {
    padding: SPACING.xl,
    paddingTop: 0,
  },
  serviceCategory: {
    marginBottom: SPACING.lg,
  },
  serviceCategoryTitle: {
    ...createTextStyle(16, 'bold'),
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  serviceItem: {
    backgroundColor: COLORS.backgroundCard,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
    ...SHADOWS.small,
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    ...createTextStyle(14, 'bold'),
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  serviceDistance: {
    ...createTextStyle(12, 'regular'),
    color: COLORS.textSecondary,
  },
  servicePhone: {
    ...createTextStyle(14, 'bold'),
    color: COLORS.primary,
  },
  contactsSection: {
    padding: SPACING.xl,
    paddingTop: 0,
  },
  contactsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  manageContactsButton: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  manageContactsText: {
    ...createTextStyle(12, 'bold'),
    color: COLORS.textInverse,
  },
  contactItem: {
    backgroundColor: COLORS.backgroundCard,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
    ...SHADOWS.small,
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    ...createTextStyle(14, 'bold'),
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  contactRelation: {
    ...createTextStyle(12, 'regular'),
    color: COLORS.textSecondary,
  },
  contactPhone: {
    ...createTextStyle(14, 'bold'),
    color: COLORS.primary,
  },
  noContactsCard: {
    backgroundColor: COLORS.backgroundCard,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.xl,
    alignItems: 'center',
    ...SHADOWS.small,
  },
  noContactsText: {
    ...createTextStyle(14, 'regular'),
    color: COLORS.textSecondary,
    marginBottom: SPACING.lg,
  },
  addContactsButton: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  addContactsText: {
    ...createTextStyle(14, 'bold'),
    color: COLORS.textInverse,
  },
  tipsSection: {
    padding: SPACING.xl,
    paddingTop: 0,
  },
  tipsList: {
    backgroundColor: COLORS.backgroundCard,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    ...SHADOWS.small,
  },
  tipItem: {
    ...createTextStyle(14, 'regular'),
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
    lineHeight: 20,
  },
});

export default EmergencyScreen;
