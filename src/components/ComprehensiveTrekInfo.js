import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Animated,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../utils/constants';

const { width } = Dimensions.get('window');

const ComprehensiveTrekInfo = ({ trek }) => {
  const [activeTab, setActiveTab] = useState('network');

  // Safety check for trek object
  if (!trek) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Trek information not available</Text>
      </View>
    );
  }

  // Additional safety check for foodAndWater structure
  if (!trek.foodAndWater) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Food and water information not available</Text>
      </View>
    );
  }

  const tabs = [
    { id: 'network', label: '📶 Network', icon: '📶', color: '#4CAF50', gradient: ['#4CAF50', '#45a049'] },
    { id: 'food', label: '🍽️ Food & Water', icon: '🍽️', color: '#FF9800', gradient: ['#FF9800', '#f57c00'] },
    { id: 'accommodation', label: '🏠 Stay', icon: '🏠', color: '#2196F3', gradient: ['#2196F3', '#1976d2'] },
    { id: 'safety', label: '🛡️ Safety', icon: '🛡️', color: '#f44336', gradient: ['#f44336', '#d32f2f'] },
    { id: 'route', label: '🗺️ Route', icon: '🗺️', color: '#9C27B0', gradient: ['#9C27B0', '#7b1fa2'] },
    { id: 'permits', label: '📋 Permits', icon: '📋', color: '#607D8B', gradient: ['#607D8B', '#455a64'] },
  ];

  const renderNetworkInfo = () => (
    <View style={styles.tabContent}>
      <LinearGradient
        colors={['#4CAF50', '#45a049']}
        style={styles.sectionHeader}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <Text style={styles.sectionHeaderText}>📶 Network Availability</Text>
        <Text style={styles.sectionSubtext}>Stay connected during your trek</Text>
      </LinearGradient>

      {trek.networkAvailability && (
        <>
          <View style={styles.modernNetworkSection}>
            <View style={styles.locationHeader}>
              <Text style={styles.locationIcon}>📍</Text>
              <Text style={styles.networkTitle}>At Base ({trek.startingPoint?.name})</Text>
            </View>
            <View style={styles.networkGrid}>
              {Object.entries(trek.networkAvailability.baseVillage || trek.networkAvailability.baseStation || trek.networkAvailability.baseTemple || {}).map(([provider, signal]) => (
                <View key={provider} style={[styles.modernNetworkItem, { borderLeftColor: getSignalColor(signal) }]}>
                  <Text style={styles.networkProvider}>{provider.toUpperCase()}</Text>
                  <View style={styles.signalContainer}>
                    <Text style={styles.signalIcon}>{getSignalIcon(signal)}</Text>
                    <Text style={[styles.networkSignal, { color: getSignalColor(signal) }]}>
                      {signal}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.modernNetworkSection}>
            <View style={styles.locationHeader}>
              <Text style={styles.locationIcon}>🥾</Text>
              <Text style={styles.networkTitle}>During Trek</Text>
            </View>
            <View style={styles.networkGrid}>
              {Object.entries(trek.networkAvailability.duringTrek || trek.networkAvailability.duringJeepSafari || {}).map(([provider, signal]) => (
                <View key={provider} style={[styles.modernNetworkItem, { borderLeftColor: getSignalColor(signal) }]}>
                  <Text style={styles.networkProvider}>{provider.toUpperCase()}</Text>
                  <View style={styles.signalContainer}>
                    <Text style={styles.signalIcon}>{getSignalIcon(signal)}</Text>
                    <Text style={[styles.networkSignal, { color: getSignalColor(signal) }]}>
                      {signal}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.modernNetworkSection}>
            <View style={styles.locationHeader}>
              <Text style={styles.locationIcon}>🏔️</Text>
              <Text style={styles.networkTitle}>At Summit/Destination</Text>
            </View>
            <View style={styles.networkGrid}>
              {Object.entries(trek.networkAvailability.atSummit || trek.networkAvailability.atWaterfall || {}).map(([provider, signal]) => (
                <View key={provider} style={[styles.modernNetworkItem, { borderLeftColor: getSignalColor(signal) }]}>
                  <Text style={styles.networkProvider}>{provider.toUpperCase()}</Text>
                  <View style={styles.signalContainer}>
                    <Text style={styles.signalIcon}>{getSignalIcon(signal)}</Text>
                    <Text style={[styles.networkSignal, { color: getSignalColor(signal) }]}>
                      {signal}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>

          <LinearGradient
            colors={['#f44336', '#d32f2f']}
            style={styles.modernEmergencyInfo}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.emergencyTitle}>🚨 Emergency Contact</Text>
            <Text style={styles.emergencyText}>{trek.networkAvailability.emergencyContact}</Text>
          </LinearGradient>
        </>
      )}
    </View>
  );

  const renderFoodInfo = () => (
    <View style={styles.tabContent}>
      <LinearGradient
        colors={['#FF9800', '#f57c00']}
        style={styles.sectionHeader}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <Text style={styles.sectionHeaderText}>🍽️ Food & Water Information</Text>
        <Text style={styles.sectionSubtext}>Essential dining and hydration guide</Text>
      </LinearGradient>

      {trek.foodAndWater && (
        <>
          <View style={styles.modernFoodSection}>
            <View style={styles.locationHeader}>
              <Text style={styles.locationIcon}>📍</Text>
              <Text style={styles.foodTitle}>At Base</Text>
            </View>

            <View style={styles.modernFoodCategory}>
              <View style={styles.foodCategoryHeader}>
                <Text style={styles.foodCategoryIcon}>🍽️</Text>
                <Text style={styles.foodCategoryTitle}>Restaurants</Text>
              </View>
              <View style={styles.foodItemsContainer}>
                {(trek.foodAndWater.atBase?.restaurants || []).map((restaurant, index) => (
                  <View key={index} style={styles.modernFoodItem}>
                    <Text style={styles.foodItemText}>{restaurant}</Text>
                  </View>
                ))}
              </View>
            </View>

            <View style={styles.modernFoodCategory}>
              <View style={styles.foodCategoryHeader}>
                <Text style={styles.foodCategoryIcon}>🛒</Text>
                <Text style={styles.foodCategoryTitle}>Shops</Text>
              </View>
              <View style={styles.foodItemsContainer}>
                {(trek.foodAndWater.atBase?.shops || []).map((shop, index) => (
                  <View key={index} style={styles.modernFoodItem}>
                    <Text style={styles.foodItemText}>{shop}</Text>
                  </View>
                ))}
              </View>
            </View>

            <View style={styles.modernFoodCategory}>
              <View style={styles.foodCategoryHeader}>
                <Text style={styles.foodCategoryIcon}>💧</Text>
                <Text style={styles.foodCategoryTitle}>Water Sources</Text>
              </View>
              <View style={styles.foodItemsContainer}>
                {trek.foodAndWater.atBase?.waterSources?.map((source, index) => (
                  <View key={index} style={styles.modernFoodItem}>
                    <Text style={styles.foodItemText}>{source}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>

          <View style={styles.modernFoodSection}>
            <View style={styles.locationHeader}>
              <Text style={styles.locationIcon}>🥾</Text>
              <Text style={styles.foodTitle}>During Trek</Text>
            </View>

            <View style={styles.modernFoodCategory}>
              <View style={styles.foodCategoryHeader}>
                <Text style={styles.foodCategoryIcon}>💧</Text>
                <Text style={styles.foodCategoryTitle}>Water Sources</Text>
              </View>
              <View style={styles.foodItemsContainer}>
                {(trek.foodAndWater.duringTrek?.waterSources || trek.foodAndWater.duringJeepSafari?.waterSources || [])?.map((source, index) => (
                  <View key={index} style={styles.modernFoodItem}>
                    <Text style={styles.foodItemText}>{source}</Text>
                  </View>
                ))}
              </View>
            </View>

            <View style={styles.modernFoodCategory}>
              <View style={styles.foodCategoryHeader}>
                <Text style={styles.foodCategoryIcon}>🥪</Text>
                <Text style={styles.foodCategoryTitle}>Food Options</Text>
              </View>
              <View style={styles.foodItemsContainer}>
                {(trek.foodAndWater.duringTrek?.foodOptions || trek.foodAndWater.duringJeepSafari?.foodOptions || [])?.map((option, index) => (
                  <View key={index} style={styles.modernFoodItem}>
                    <Text style={styles.foodItemText}>{option}</Text>
                  </View>
                ))}
              </View>
            </View>

            <View style={styles.modernFoodCategory}>
              <View style={styles.foodCategoryHeader}>
                <Text style={styles.foodCategoryIcon}>💡</Text>
                <Text style={styles.foodCategoryTitle}>Recommendations</Text>
              </View>
              <View style={styles.foodItemsContainer}>
                {(trek.foodAndWater.duringTrek?.recommendations || trek.foodAndWater.duringJeepSafari?.recommendations || [])?.map((rec, index) => (
                  <View key={index} style={[styles.modernFoodItem, styles.recommendationItem]}>
                    <Text style={styles.foodItemText}>{rec}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>

          <View style={styles.modernFoodSection}>
            <View style={styles.locationHeader}>
              <Text style={styles.locationIcon}>🏔️</Text>
              <Text style={styles.foodTitle}>At Summit/Destination</Text>
            </View>

            <View style={styles.modernFoodCategory}>
              <View style={styles.foodCategoryHeader}>
                <Text style={styles.foodCategoryIcon}>🏪</Text>
                <Text style={styles.foodCategoryTitle}>Facilities</Text>
              </View>
              <View style={styles.foodItemsContainer}>
                {(trek.foodAndWater.atSummit?.facilities || trek.foodAndWater.atWaterfall?.facilities || [])?.map((facility, index) => (
                  <View key={index} style={styles.modernFoodItem}>
                    <Text style={styles.foodItemText}>{facility}</Text>
                  </View>
                ))}
              </View>
            </View>

            <View style={styles.modernFoodCategory}>
              <View style={styles.foodCategoryHeader}>
                <Text style={styles.foodCategoryIcon}>💡</Text>
                <Text style={styles.foodCategoryTitle}>Recommendations</Text>
              </View>
              <View style={styles.foodItemsContainer}>
                {(trek.foodAndWater.atSummit?.recommendations || trek.foodAndWater.atWaterfall?.recommendations || [])?.map((rec, index) => (
                  <View key={index} style={[styles.modernFoodItem, styles.recommendationItem]}>
                    <Text style={styles.foodItemText}>{rec}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        </>
      )}
    </View>
  );

  const renderAccommodationInfo = () => (
    <View style={styles.tabContent}>
      <LinearGradient
        colors={['#2196F3', '#1976d2']}
        style={styles.sectionHeader}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <Text style={styles.sectionHeaderText}>🏠 Accommodation Options</Text>
        <Text style={styles.sectionSubtext}>Find your perfect stay for the trek</Text>
      </LinearGradient>

      {trek.accommodation && (
        <>
          {trek.accommodation.camping && (
            <View style={styles.modernAccommodationSection}>
              <View style={styles.locationHeader}>
                <Text style={styles.locationIcon}>⛺</Text>
                <Text style={styles.accommodationTitle}>Camping</Text>
              </View>
              {trek.accommodation.camping.allowed ? (
                <>
                  <View style={styles.modernAccommodationCategory}>
                    <View style={styles.accommodationCategoryHeader}>
                      <Text style={styles.accommodationCategoryIcon}>📍</Text>
                      <Text style={styles.accommodationCategoryTitle}>Locations</Text>
                    </View>
                    <View style={styles.accommodationItemsContainer}>
                      {(trek.accommodation.camping.locations || []).map((location, index) => (
                        <View key={index} style={styles.modernAccommodationItem}>
                          <Text style={styles.accommodationItemText}>{location}</Text>
                        </View>
                      ))}
                    </View>
                  </View>

                  <View style={styles.modernAccommodationCategory}>
                    <View style={styles.accommodationCategoryHeader}>
                      <Text style={styles.accommodationCategoryIcon}>🏪</Text>
                      <Text style={styles.accommodationCategoryTitle}>Facilities</Text>
                    </View>
                    <View style={styles.accommodationItemsContainer}>
                      {(trek.accommodation.camping.facilities || []).map((facility, index) => (
                        <View key={index} style={styles.modernAccommodationItem}>
                          <Text style={styles.accommodationItemText}>{facility}</Text>
                        </View>
                      ))}
                    </View>
                  </View>

                  <View style={styles.modernCostContainer}>
                    <Text style={styles.modernCostLabel}>💰 Cost:</Text>
                    <Text style={styles.modernCostValue}>{trek.accommodation.camping.cost}</Text>
                  </View>
                </>
              ) : (
                <View style={styles.modernNotAllowedContainer}>
                  <Text style={styles.modernNotAllowedText}>
                    ❌ Camping not allowed
                    {trek.accommodation.camping.reason && ` - ${trek.accommodation.camping.reason}`}
                  </Text>
                </View>
              )}
            </View>
          )}

          <View style={styles.modernAccommodationSection}>
            <View style={styles.locationHeader}>
              <Text style={styles.locationIcon}>🏨</Text>
              <Text style={styles.accommodationTitle}>Nearby Stays</Text>
            </View>
            {(trek.accommodation.nearbyStays || []).map((stay, index) => (
              <View key={index} style={styles.modernStayCard}>
                <View style={styles.stayCardHeader}>
                  <Text style={styles.modernStayName}>{stay.name}</Text>
                  <Text style={styles.modernStayCost}>{stay.cost}</Text>
                </View>
                <Text style={styles.modernStayDistance}>📍 {stay.distance}</Text>
                <TouchableOpacity
                  style={styles.modernContactButton}
                  onPress={() => Linking.openURL(`tel:${stay.contact}`)}
                >
                  <Text style={styles.modernContactButtonText}>📞 Call {stay.contact}</Text>
                </TouchableOpacity>
                <View style={styles.modernFacilitiesContainer}>
                  {(stay.facilities || []).map((facility, fIndex) => (
                    <View key={fIndex} style={styles.modernFacilityTag}>
                      <Text style={styles.modernFacilityText}>{facility}</Text>
                    </View>
                  ))}
                </View>
              </View>
            ))}
          </View>
        </>
      )}
    </View>
  );

  const renderSafetyInfo = () => {
    const getRiskLevelColor = (riskLevel) => {
      switch (riskLevel?.toLowerCase()) {
        case 'low': return { color: '#4CAF50', bg: '#E8F5E8', icon: '🟢' };
        case 'moderate': return { color: '#FF9800', bg: '#FFF3E0', icon: '🟡' };
        case 'moderate to high': return { color: '#FF5722', bg: '#FFEBEE', icon: '🟠' };
        case 'high': return { color: '#f44336', bg: '#FFEBEE', icon: '🔴' };
        default: return { color: '#757575', bg: '#F5F5F5', icon: '⚪' };
      }
    };

    const riskData = getRiskLevelColor(trek.safety?.riskLevel);

    return (
      <View style={styles.tabContent}>
        <LinearGradient
          colors={['#f44336', '#d32f2f']}
          style={styles.sectionHeader}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <Text style={styles.sectionHeaderText}>🛡️ Safety Information</Text>
          <Text style={styles.sectionSubtext}>Complete safety guide for your trek</Text>
        </LinearGradient>

        {trek.safety && (
          <>
            {/* Risk Level Card */}
            <View style={[styles.modernSafetyCard, { backgroundColor: riskData.bg }]}>
              <View style={styles.riskLevelHeader}>
                <Text style={styles.riskLevelIcon}>{riskData.icon}</Text>
                <View style={styles.riskLevelInfo}>
                  <Text style={styles.riskLevelLabel}>Risk Level</Text>
                  <Text style={[styles.riskLevelValue, { color: riskData.color }]}>
                    {trek.safety.riskLevel}
                  </Text>
                </View>
              </View>
            </View>

            {/* Safety Categories Grid */}
            <View style={styles.safetyGrid}>
              {/* Common Risks */}
              <View style={styles.modernSafetySection}>
                <View style={styles.safetySectionHeader}>
                  <Text style={styles.safetySectionIcon}>🚨</Text>
                  <Text style={styles.safetySectionTitle}>Common Risks</Text>
                </View>
                <View style={styles.safetyItemsContainer}>
                  {(trek.safety.commonRisks || []).map((risk, index) => (
                    <View key={index} style={styles.modernSafetyItem}>
                      <Text style={styles.safetyItemIcon}>⚠️</Text>
                      <Text style={styles.safetyItemText}>{risk}</Text>
                    </View>
                  ))}
                </View>
              </View>

              {/* Precautions */}
              <View style={styles.modernSafetySection}>
                <View style={styles.safetySectionHeader}>
                  <Text style={styles.safetySectionIcon}>🛡️</Text>
                  <Text style={styles.safetySectionTitle}>Safety Precautions</Text>
                </View>
                <View style={styles.safetyItemsContainer}>
                  {(trek.safety.precautions || []).map((precaution, index) => (
                    <View key={index} style={styles.modernSafetyItem}>
                      <Text style={styles.safetyItemIcon}>✅</Text>
                      <Text style={styles.safetyItemText}>{precaution}</Text>
                    </View>
                  ))}
                </View>
              </View>

              {/* Rescue Points */}
              <View style={styles.modernSafetySection}>
                <View style={styles.safetySectionHeader}>
                  <Text style={styles.safetySectionIcon}>🆘</Text>
                  <Text style={styles.safetySectionTitle}>Rescue Points</Text>
                </View>
                <View style={styles.safetyItemsContainer}>
                  {(trek.safety.rescuePoints || []).map((point, index) => (
                    <View key={index} style={styles.modernSafetyItem}>
                      <Text style={styles.safetyItemIcon}>📍</Text>
                      <Text style={styles.safetyItemText}>{point}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>

            {/* Emergency Services Quick Access */}
            <View style={styles.emergencyServicesSection}>
              <Text style={styles.emergencyServicesTitle}>🚑 Emergency Services</Text>
              <View style={styles.emergencyButtonsGrid}>
                <TouchableOpacity
                  style={[styles.emergencyButton, { backgroundColor: '#f44336' }]}
                  onPress={() => Linking.openURL('tel:108')}
                >
                  <Text style={styles.emergencyButtonIcon}>🚑</Text>
                  <Text style={styles.emergencyButtonText}>Ambulance</Text>
                  <Text style={styles.emergencyButtonNumber}>108</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.emergencyButton, { backgroundColor: '#2196F3' }]}
                  onPress={() => Linking.openURL('tel:100')}
                >
                  <Text style={styles.emergencyButtonIcon}>👮</Text>
                  <Text style={styles.emergencyButtonText}>Police</Text>
                  <Text style={styles.emergencyButtonNumber}>100</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.emergencyButton, { backgroundColor: '#FF9800' }]}
                  onPress={() => Linking.openURL('tel:1363')}
                >
                  <Text style={styles.emergencyButtonIcon}>🏔️</Text>
                  <Text style={styles.emergencyButtonText}>Tourist Help</Text>
                  <Text style={styles.emergencyButtonNumber}>1363</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.emergencyButton, { backgroundColor: '#4CAF50' }]}
                  onPress={() => Linking.openURL('tel:1926')}
                >
                  <Text style={styles.emergencyButtonIcon}>🌲</Text>
                  <Text style={styles.emergencyButtonText}>Forest Dept</Text>
                  <Text style={styles.emergencyButtonNumber}>1926</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Nearest Hospital */}
            {trek.safety.nearestHospital && (
              <View style={styles.modernHospitalInfo}>
                <LinearGradient
                  colors={['#f44336', '#d32f2f']}
                  style={styles.hospitalHeader}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Text style={styles.hospitalHeaderIcon}>🏥</Text>
                  <Text style={styles.hospitalHeaderText}>Nearest Hospital</Text>
                </LinearGradient>

                <View style={styles.hospitalDetails}>
                  <Text style={styles.modernHospitalName}>{trek.safety.nearestHospital.name}</Text>
                  <View style={styles.hospitalInfoRow}>
                    <Text style={styles.hospitalInfoIcon}>📍</Text>
                    <Text style={styles.modernHospitalDistance}>{trek.safety.nearestHospital.distance}</Text>
                  </View>

                  <TouchableOpacity
                    style={styles.modernHospitalContact}
                    onPress={() => Linking.openURL(`tel:${trek.safety.nearestHospital.contact}`)}
                  >
                    <Text style={styles.hospitalContactIcon}>📞</Text>
                    <Text style={styles.modernHospitalContactText}>Call Hospital</Text>
                    <Text style={styles.hospitalContactNumber}>{trek.safety.nearestHospital.contact}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Safety Tips */}
            <View style={styles.safetyTipsSection}>
              <View style={styles.safetyTipsHeader}>
                <Text style={styles.safetyTipsIcon}>💡</Text>
                <Text style={styles.safetyTipsTitle}>Essential Safety Tips</Text>
              </View>

              <View style={styles.safetyTipsList}>
                <View style={styles.safetyTip}>
                  <Text style={styles.safetyTipIcon}>📱</Text>
                  <Text style={styles.safetyTipText}>Keep your phone charged and carry a power bank</Text>
                </View>
                <View style={styles.safetyTip}>
                  <Text style={styles.safetyTipIcon}>👥</Text>
                  <Text style={styles.safetyTipText}>Never trek alone - always go with a group</Text>
                </View>
                <View style={styles.safetyTip}>
                  <Text style={styles.safetyTipIcon}>🌦️</Text>
                  <Text style={styles.safetyTipText}>Check weather forecast before starting</Text>
                </View>
                <View style={styles.safetyTip}>
                  <Text style={styles.safetyTipIcon}>💧</Text>
                  <Text style={styles.safetyTipText}>Carry sufficient water and stay hydrated</Text>
                </View>
                <View style={styles.safetyTip}>
                  <Text style={styles.safetyTipIcon}>🧭</Text>
                  <Text style={styles.safetyTipText}>Download offline maps and carry a compass</Text>
                </View>
              </View>
            </View>
          </>
        )}
      </View>
    );
  };

  const renderRouteInfo = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>🗺️ Trek Route Details</Text>

      {trek.trekRoute && (
        <>
          <View style={styles.routeOverview}>
            <Text style={styles.routeTitle}>📊 Overview</Text>
            <Text style={styles.routeDetail}>📏 Total Distance: {trek.trekRoute.totalDistance}</Text>
            <Text style={styles.routeDetail}>⬆️ Ascent: {trek.trekRoute.ascent}</Text>
            <Text style={styles.routeDetail}>🎯 Difficulty: {trek.trekRoute.difficulty}</Text>
          </View>

          <View style={styles.waypointsSection}>
            <Text style={styles.waypointsTitle}>📍 Waypoints</Text>
            {(trek.trekRoute.waypoints || []).map((waypoint, index) => (
              <View key={index} style={styles.waypointCard}>
                <Text style={styles.waypointName}>{waypoint.name}</Text>
                <Text style={styles.waypointElevation}>🏔️ {waypoint.elevation}</Text>
                <Text style={styles.waypointDescription}>{waypoint.description}</Text>
              </View>
            ))}
          </View>
        </>
      )}
    </View>
  );

  const renderPermitsInfo = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>📋 Permits & Entry Information</Text>

      {trek.permits && (
        <View style={styles.permitsSection}>
          <View style={styles.permitItem}>
            <Text style={styles.permitLabel}>Required:</Text>
            <Text style={[styles.permitValue, { color: trek.permits.required ? COLORS.error : COLORS.success }]}>
              {trek.permits.required ? 'Yes' : 'No'}
            </Text>
          </View>

          {trek.permits.entry && (
            <View style={styles.permitItem}>
              <Text style={styles.permitLabel}>Entry Fee:</Text>
              <Text style={styles.permitValue}>{trek.permits.entry}</Text>
            </View>
          )}

          {trek.permits.timings && (
            <View style={styles.permitItem}>
              <Text style={styles.permitLabel}>Timings:</Text>
              <Text style={styles.permitValue}>{trek.permits.timings}</Text>
            </View>
          )}

          {trek.permits.forestDepartment && (
            <View style={styles.permitItem}>
              <Text style={styles.permitLabel}>Forest Department:</Text>
              <Text style={styles.permitValue}>{trek.permits.forestDepartment}</Text>
            </View>
          )}

          {trek.permits.jeepSafari && (
            <View style={styles.permitItem}>
              <Text style={styles.permitLabel}>Jeep Safari:</Text>
              <Text style={styles.permitValue}>{trek.permits.jeepSafari}</Text>
            </View>
          )}

          {trek.permits.bookingRequired && (
            <View style={styles.permitItem}>
              <Text style={styles.permitLabel}>Booking:</Text>
              <Text style={styles.permitValue}>{trek.permits.bookingRequired}</Text>
            </View>
          )}
        </View>
      )}
    </View>
  );

  const getSignalColor = (signal) => {
    switch (signal.toLowerCase()) {
      case 'excellent': return '#4CAF50';
      case 'good': return '#8BC34A';
      case 'fair': return '#FF9800';
      case 'poor': return '#FF5722';
      case 'no signal': return '#f44336';
      case 'intermittent': return '#FFC107';
      default: return COLORS.textSecondary;
    }
  };

  const getSignalIcon = (signal) => {
    switch (signal.toLowerCase()) {
      case 'excellent': return '📶';
      case 'good': return '📶';
      case 'fair': return '📶';
      case 'poor': return '📵';
      case 'no signal': return '📵';
      case 'intermittent': return '📶';
      default: return '📶';
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'network': return renderNetworkInfo();
      case 'food': return renderFoodInfo();
      case 'accommodation': return renderAccommodationInfo();
      case 'safety': return renderSafetyInfo();
      case 'route': return renderRouteInfo();
      case 'permits': return renderPermitsInfo();
      default: return renderNetworkInfo();
    }
  };

  return (
    <View style={styles.container}>
      {/* Modern Tab Navigation */}
      <View style={styles.modernTabsContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsScrollContent}
        >
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.id}
              style={[
                styles.modernTab,
                activeTab === tab.id && styles.modernActiveTab
              ]}
              onPress={() => setActiveTab(tab.id)}
            >
              {activeTab === tab.id ? (
                <LinearGradient
                  colors={tab.gradient}
                  style={styles.modernTabGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Text style={styles.modernTabIcon}>{tab.icon}</Text>
                  <Text style={styles.modernActiveTabText}>
                    {tab.label.split(' ')[1] || tab.label}
                  </Text>
                </LinearGradient>
              ) : (
                <View style={styles.modernTabContent}>
                  <Text style={styles.modernTabIcon}>{tab.icon}</Text>
                  <Text style={styles.modernTabText}>
                    {tab.label.split(' ')[1] || tab.label}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Tab Content */}
      <ScrollView style={styles.contentContainer} showsVerticalScrollIndicator={false}>
        {renderTabContent()}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  // Modern Tab Styles
  modernTabsContainer: {
    backgroundColor: COLORS.backgroundCard,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    ...SHADOWS.small,
  },
  tabsScrollContent: {
    paddingHorizontal: SPACING.md,
  },
  modernTab: {
    marginHorizontal: SPACING.xs,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    minWidth: 90,
    ...SHADOWS.small,
  },
  modernActiveTab: {
    ...SHADOWS.medium,
  },
  modernTabGradient: {
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
  },
  modernTabContent: {
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: BORDER_RADIUS.lg,
  },
  modernTabIcon: {
    fontSize: 18,
    marginBottom: 4,
  },
  modernTabText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '600',
    textAlign: 'center',
  },
  modernActiveTabText: {
    fontSize: 11,
    color: COLORS.white,
    fontWeight: '700',
    textAlign: 'center',
  },

  contentContainer: {
    flex: 1,
  },
  tabContent: {
    padding: SPACING.lg,
  },

  // Modern Section Headers
  sectionHeader: {
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.lg,
    ...SHADOWS.medium,
  },
  sectionHeaderText: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.white,
    marginBottom: 4,
  },
  sectionSubtext: {
    fontSize: 14,
    color: COLORS.white,
    opacity: 0.9,
    fontWeight: '500',
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.lg,
  },
  // Modern Network styles
  modernNetworkSection: {
    backgroundColor: COLORS.backgroundCard,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    ...SHADOWS.medium,
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  locationIcon: {
    fontSize: 20,
    marginRight: SPACING.sm,
  },
  networkTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
  networkGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  modernNetworkItem: {
    backgroundColor: COLORS.backgroundSecondary,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    minWidth: 80,
    borderLeftWidth: 4,
    ...SHADOWS.small,
  },
  networkProvider: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },
  signalContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  signalIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  networkSignal: {
    fontSize: 11,
    fontWeight: '600',
  },
  modernEmergencyInfo: {
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    marginTop: SPACING.md,
    ...SHADOWS.medium,
  },
  emergencyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.white,
    marginBottom: 4,
  },
  emergencyText: {
    fontSize: 14,
    color: COLORS.white,
    fontWeight: '500',
  },
  // Food styles
  foodSection: {
    marginBottom: SPACING.lg,
  },
  foodTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  foodCategory: {
    marginBottom: SPACING.md,
  },
  foodSubtitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  foodItem: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 2,
    marginLeft: SPACING.sm,
  },

  // Modern Food styles
  modernFoodSection: {
    backgroundColor: COLORS.backgroundCard,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    ...SHADOWS.medium,
  },
  foodTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
  modernFoodCategory: {
    marginBottom: SPACING.lg,
  },
  foodCategoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  foodCategoryIcon: {
    fontSize: 18,
    marginRight: SPACING.sm,
  },
  foodCategoryTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
  },
  foodItemsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  modernFoodItem: {
    backgroundColor: COLORS.backgroundSecondary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
    ...SHADOWS.small,
    minWidth: '45%',
    flexGrow: 1,
  },
  recommendationItem: {
    borderLeftColor: '#FF9800',
    backgroundColor: '#FFF3E0',
  },
  foodItemText: {
    fontSize: 13,
    color: COLORS.text,
    fontWeight: '500',
    lineHeight: 18,
  },

  // Accommodation styles
  accommodationSection: {
    marginBottom: SPACING.lg,
  },
  accommodationTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },

  // Modern Accommodation styles
  modernAccommodationSection: {
    backgroundColor: COLORS.backgroundCard,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    ...SHADOWS.medium,
  },
  modernAccommodationCategory: {
    marginBottom: SPACING.lg,
  },
  accommodationCategoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  accommodationCategoryIcon: {
    fontSize: 18,
    marginRight: SPACING.sm,
  },
  accommodationCategoryTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
  },
  accommodationItemsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  modernAccommodationItem: {
    backgroundColor: COLORS.backgroundSecondary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    borderLeftWidth: 3,
    borderLeftColor: '#2196F3',
    ...SHADOWS.small,
    minWidth: '45%',
    flexGrow: 1,
  },
  accommodationItemText: {
    fontSize: 13,
    color: COLORS.text,
    fontWeight: '500',
    lineHeight: 18,
  },
  modernCostContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E8',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginTop: SPACING.md,
  },
  modernCostLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginRight: SPACING.sm,
  },
  modernCostValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#4CAF50',
  },
  modernNotAllowedContainer: {
    backgroundColor: '#FFEBEE',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    borderLeftWidth: 4,
    borderLeftColor: '#f44336',
  },
  modernNotAllowedText: {
    fontSize: 14,
    color: '#f44336',
    fontWeight: '500',
  },
  modernStayCard: {
    backgroundColor: COLORS.backgroundSecondary,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.md,
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
    ...SHADOWS.medium,
  },
  stayCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  modernStayName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    flex: 1,
  },
  modernStayCost: {
    fontSize: 14,
    fontWeight: '700',
    color: '#4CAF50',
    backgroundColor: '#E8F5E8',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.sm,
  },
  modernStayDistance: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
    fontWeight: '500',
  },
  modernContactButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    alignSelf: 'flex-start',
    marginBottom: SPACING.md,
    ...SHADOWS.small,
  },
  modernContactButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '700',
  },
  modernFacilitiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
  },
  modernFacilityTag: {
    backgroundColor: COLORS.background,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  modernFacilityText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  accommodationSubtitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
    marginBottom: SPACING.xs,
    marginTop: SPACING.sm,
  },
  accommodationItem: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 2,
    marginLeft: SPACING.sm,
  },
  accommodationCost: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.success,
    marginTop: SPACING.sm,
  },
  accommodationNotAllowed: {
    fontSize: 14,
    color: COLORS.error,
    fontStyle: 'italic',
  },
  stayCard: {
    backgroundColor: COLORS.backgroundCard,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.sm,
    ...SHADOWS.small,
  },
  stayName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  stayDistance: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  stayCost: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.success,
    marginBottom: SPACING.sm,
  },
  contactButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.sm,
    alignSelf: 'flex-start',
    marginBottom: SPACING.sm,
  },
  contactButtonText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '600',
  },
  facilitiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
  },
  facilityTag: {
    backgroundColor: COLORS.background,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  // Modern Safety styles
  modernSafetyCard: {
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    ...SHADOWS.medium,
  },
  riskLevelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  riskLevelIcon: {
    fontSize: 24,
    marginRight: SPACING.md,
  },
  riskLevelInfo: {
    flex: 1,
  },
  riskLevelLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  riskLevelValue: {
    fontSize: 18,
    fontWeight: '800',
  },
  safetyGrid: {
    marginBottom: SPACING.lg,
  },
  modernSafetySection: {
    backgroundColor: COLORS.backgroundCard,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    ...SHADOWS.medium,
  },
  safetySectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  safetySectionIcon: {
    fontSize: 20,
    marginRight: SPACING.sm,
  },
  safetySectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
  safetyItemsContainer: {
    gap: SPACING.sm,
  },
  modernSafetyItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.backgroundSecondary,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
  },
  safetyItemIcon: {
    fontSize: 16,
    marginRight: SPACING.sm,
    marginTop: 2,
  },
  safetyItemText: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '500',
    flex: 1,
    lineHeight: 20,
  },
  emergencyServicesSection: {
    backgroundColor: COLORS.backgroundCard,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    ...SHADOWS.medium,
  },
  emergencyServicesTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  emergencyButtonsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    justifyContent: 'space-between',
  },
  emergencyButton: {
    width: '48%',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    ...SHADOWS.medium,
  },
  emergencyButtonIcon: {
    fontSize: 24,
    marginBottom: SPACING.xs,
  },
  emergencyButtonText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 2,
  },
  emergencyButtonNumber: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '800',
  },
  modernHospitalInfo: {
    backgroundColor: COLORS.backgroundCard,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.lg,
    overflow: 'hidden',
    ...SHADOWS.medium,
  },
  hospitalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  hospitalHeaderIcon: {
    fontSize: 24,
    marginRight: SPACING.sm,
  },
  hospitalHeaderText: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.white,
  },
  hospitalDetails: {
    padding: SPACING.lg,
  },
  modernHospitalName: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  hospitalInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  hospitalInfoIcon: {
    fontSize: 16,
    marginRight: SPACING.sm,
  },
  modernHospitalDistance: {
    fontSize: 16,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  modernHospitalContact: {
    backgroundColor: '#f44336',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    ...SHADOWS.medium,
  },
  hospitalContactIcon: {
    fontSize: 20,
    marginRight: SPACING.sm,
  },
  modernHospitalContactText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
    marginRight: SPACING.sm,
  },
  hospitalContactNumber: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '500',
  },
  safetyTipsSection: {
    backgroundColor: COLORS.backgroundCard,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    ...SHADOWS.medium,
  },
  safetyTipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  safetyTipsIcon: {
    fontSize: 24,
    marginRight: SPACING.sm,
  },
  safetyTipsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
  },
  safetyTipsList: {
    gap: SPACING.md,
  },
  safetyTip: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.backgroundSecondary,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    borderLeftWidth: 3,
    borderLeftColor: '#4CAF50',
  },
  safetyTipIcon: {
    fontSize: 16,
    marginRight: SPACING.sm,
    marginTop: 2,
  },
  safetyTipText: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '500',
    flex: 1,
    lineHeight: 20,
  },

  // Legacy Safety styles (keeping for backward compatibility)
  safetySection: {
    marginBottom: SPACING.lg,
  },
  safetyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  safetySubtitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
    marginBottom: SPACING.xs,
    marginTop: SPACING.sm,
  },
  safetyItem: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 2,
    marginLeft: SPACING.sm,
  },
  hospitalInfo: {
    backgroundColor: COLORS.error + '20',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.error,
  },
  hospitalTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.error,
    marginBottom: 4,
  },
  hospitalName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 2,
  },
  hospitalDistance: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  hospitalContact: {
    backgroundColor: COLORS.error,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.sm,
    alignSelf: 'flex-start',
  },
  hospitalContactText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '600',
  },
  // Route styles
  routeOverview: {
    backgroundColor: COLORS.backgroundCard,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.lg,
    ...SHADOWS.small,
  },
  routeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  routeDetail: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  waypointsSection: {
    marginBottom: SPACING.lg,
  },
  waypointsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  waypointCard: {
    backgroundColor: COLORS.backgroundCard,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.sm,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
    ...SHADOWS.small,
  },
  waypointName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  waypointElevation: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.primary,
    marginBottom: 4,
  },
  waypointDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  // Permits styles
  permitsSection: {
    backgroundColor: COLORS.backgroundCard,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    ...SHADOWS.small,
  },
  permitItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  permitLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    flex: 1,
  },
  permitValue: {
    fontSize: 14,
    color: COLORS.textSecondary,
    flex: 2,
    textAlign: 'right',
  },
  errorText: {
    fontSize: 16,
    color: COLORS.error,
    textAlign: 'center',
    padding: SPACING.lg,
  },
});

export default ComprehensiveTrekInfo;
