import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  Dimensions,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SHADOWS, SPACING, BORDER_RADIUS, createTextStyle } from '../utils/constants';
import UserStorageService from '../utils/userStorage';
import {
  trekPreparationGuide,
  fitnessPreparation,
  safetyGuidelines,
  weatherGuidance,
  calculateTrekTime,
  generatePackingList,
  budgetPlanning
} from '../data/trekPlanningData';


const { width } = Dimensions.get('window');

// Helper function to get current season
const getCurrentSeason = () => {
  const month = new Date().getMonth() + 1;
  if (month >= 6 && month <= 9) return 'monsoon';
  if (month >= 12 || month <= 2) return 'winter';
  return 'summer';
};

const TrekPlannerScreen = ({ navigation, route }) => {
  const { trek } = route?.params || {};
  const [activeTab, setActiveTab] = useState('planner');
  const [selectedTrek, setSelectedTrek] = useState(trek || null);
  const [plannerData, setPlannerData] = useState({
    selectedTrek: trek || null,
    groupSize: 1,
    fitnessLevel: 'intermediate',
    plannedDate: '',
    duration: 1,
    budget: 0,
    season: getCurrentSeason() // Initialize with current season
  });
  const [packingList, setPackingList] = useState([]);
  const [checkedItems, setCheckedItems] = useState({});
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Separate state for calculated values to avoid infinite loops
  const [estimatedTime, setEstimatedTime] = useState(null);
  const [currentSeason, setCurrentSeason] = useState(getCurrentSeason());

  // Listen for trek selection from TrekListScreen
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      const params = route?.params;
      if (params?.selectedTrek && params.selectedTrek !== selectedTrek) {
        setSelectedTrek(params.selectedTrek);
        setPlannerData(prev => ({
          ...prev,
          selectedTrek: params.selectedTrek
        }));

        // Clear the parameter to avoid re-triggering
        navigation.setParams({ selectedTrek: null });
      }
    });

    return unsubscribe;
  }, [navigation, route?.params, selectedTrek]);

// Clear form data when navigating away from the screen
useEffect(() => {
  const unsubscribe = navigation.addListener('blur', () => {
    // Clear form data when leaving the screen
    setSelectedTrek(null);
    setPlannerData({
      selectedTrek: null,
      groupSize: 1,
      fitnessLevel: 'intermediate',
      plannedDate: '',
      duration: 1,
      budget: 0,
      season: getCurrentSeason()
    });
    setShowDatePicker(false);
  });

  return unsubscribe;
}, [navigation]);

// Date picker handlers
const handleDateChange = (_, selectedDate) => {
  if (Platform.OS === 'android') {
    setShowDatePicker(false);
  }

  if (selectedDate) {
    setPlannerData(prev => ({
      ...prev,
      plannedDate: selectedDate.toISOString()
    }));
  }
};

const handleDatePickerDone = () => {
  setShowDatePicker(false);
};

// Save plan functionality
const handleSavePlan = async () => {
  if (!selectedTrek) {
    Alert.alert('Error', 'Please select a trek first');
    return;
  }

  if (!plannerData.plannedDate) {
    Alert.alert('Error', 'Please select a planned date');
    return;
  }

  try {
    const planData = {
      title: `${selectedTrek.name} Trek`,
      description: `Trek to ${selectedTrek.name} - ${selectedTrek.difficulty} level`,
      plannedDate: plannerData.plannedDate,
      difficulty: selectedTrek.difficulty?.toLowerCase() || 'moderate',
      duration: selectedTrek.duration || '1',
      status: 'planned',
      trekDetails: {
        trekId: selectedTrek.id,
        trekName: selectedTrek.name,
        location: selectedTrek.location,
        groupSize: plannerData.groupSize,
        fitnessLevel: plannerData.fitnessLevel,
        season: plannerData.season,
        estimatedBudget: plannerData.budget,
      },
      createdDate: new Date().toISOString(),
      updatedDate: new Date().toISOString(),
    };

    const savedPlan = await UserStorageService.addTripPlan(planData);
    console.log('Trek plan saved successfully:', savedPlan);

    Alert.alert(
      'Success!',
      'Your trek plan has been saved successfully!',
      [
        {
          text: 'View Plans',
          onPress: () => {
            // Navigate to MyTreks and set the planned tab as active
            navigation.navigate('My Treks');
            // Use a timeout to ensure the screen has loaded before setting the tab
            setTimeout(() => {
              navigation.setParams({ initialTab: 'planned' });
            }, 100);
          }
        },
        {
          text: 'Plan Another',
          onPress: () => {
            // Reset form
            setSelectedTrek(null);
            setPlannerData({
              selectedTrek: null,
              groupSize: 1,
              fitnessLevel: 'intermediate',
              plannedDate: '',
              duration: 1,
              budget: 0,
              season: getCurrentSeason()
            });
          }
        }
      ]
    );
  } catch (error) {
    console.error('Error saving trek plan:', error);
    Alert.alert('Error', 'Failed to save trek plan. Please try again.');
  }
};

  // Effect to calculate trek plan when relevant data changes
  useEffect(() => {
    if (!trek) return;

    const season = getCurrentSeason();
    const difficulty = trek?.difficulty?.toLowerCase() || 'moderate';
    const distance = parseFloat(trek?.distance) || 10;
    const elevation = parseFloat(trek?.elevation) || 500;

    // Calculate estimated time
    const timeEstimate = calculateTrekTime(
      distance,
      elevation,
      plannerData.groupSize,
      plannerData.fitnessLevel
    );

    // Generate packing list
    const list = generatePackingList(
      trek?.category || 'trek',
      season,
      plannerData.duration,
      difficulty
    );

    setPackingList(list);
    setEstimatedTime(timeEstimate);
    setCurrentSeason(season);
  }, [trek, plannerData.groupSize, plannerData.fitnessLevel, plannerData.duration]);



  const tabs = [
    { id: 'planner', label: 'Plan Trek', icon: '📋' },
    { id: 'checklist', label: 'Checklist', icon: '✅' },
    { id: 'safety', label: 'Safety', icon: '🛡️' },
    { id: 'budget', label: 'Budget', icon: '💰' },
  ];

  const renderTabButtons = () => (
    <View style={styles.tabContainer}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[
              styles.tabButton,
              activeTab === tab.id && styles.activeTabButton,
            ]}
            onPress={() => setActiveTab(tab.id)}
          >
            <Text style={styles.tabIcon}>{tab.icon}</Text>
            <Text
              style={[
                styles.tabLabel,
                activeTab === tab.id && styles.activeTabLabel,
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderTrekPlanner = () => (
    <View style={styles.content}>
      {/* Trek Selection */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🏔️ Selected Trek</Text>
        {selectedTrek ? (
          <View style={styles.trekCard}>
            <Text style={styles.trekName}>{selectedTrek.name}</Text>
            <Text style={styles.trekDetails}>
              {selectedTrek.difficulty} • {selectedTrek.duration} • {selectedTrek.location}
            </Text>
            <TouchableOpacity
              style={styles.changeTrekButton}
              onPress={() => navigation.navigate('TrekList', {
                selectionMode: true
              })}
            >
              <Text style={styles.changeTrekText}>Change Trek</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.selectTrekButton}
            onPress={() => navigation.navigate('TrekList', {
              selectionMode: true
            })}
          >
            <Text style={styles.selectTrekText}>Select a Trek</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Group Configuration */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>👥 Group Details</Text>
        <View style={styles.inputRow}>
          <Text style={styles.inputLabel}>Group Size:</Text>
          <View style={styles.counterContainer}>
            <TouchableOpacity 
              style={styles.counterButton}
              onPress={() => setPlannerData(prev => ({ 
                ...prev, 
                groupSize: Math.max(1, prev.groupSize - 1) 
              }))}
            >
              <Text style={styles.counterText}>-</Text>
            </TouchableOpacity>
            <Text style={styles.counterValue}>{plannerData.groupSize}</Text>
            <TouchableOpacity 
              style={styles.counterButton}
              onPress={() => setPlannerData(prev => ({ 
                ...prev, 
                groupSize: prev.groupSize + 1 
              }))}
            >
              <Text style={styles.counterText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.inputRow}>
          <Text style={styles.inputLabel}>Fitness Level:</Text>
          <View style={styles.fitnessButtons}>
            {['beginner', 'intermediate', 'advanced'].map((level) => (
              <TouchableOpacity
                key={level}
                style={[
                  styles.fitnessButton,
                  plannerData.fitnessLevel === level && styles.activeFitnessButton
                ]}
                onPress={() => setPlannerData(prev => ({ ...prev, fitnessLevel: level }))}
              >
                <Text style={[
                  styles.fitnessButtonText,
                  plannerData.fitnessLevel === level && styles.activeFitnessButtonText
                ]}>
                  {level.charAt(0).toUpperCase() + level.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.inputRow}>
          <Text style={styles.inputLabel}>Planned Date:</Text>
          <TouchableOpacity
            style={styles.dateInput}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={[styles.dateInputText, !plannerData.plannedDate && styles.placeholderText]}>
              {plannerData.plannedDate ?
                new Date(plannerData.plannedDate).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                }) :
                'Select Date'
              }
            </Text>
            <Text style={styles.dateInputIcon}>📅</Text>
          </TouchableOpacity>
        </View>

        {/* Date Picker */}
        {showDatePicker && (
          <View style={styles.datePickerContainer}>
            <DateTimePicker
              value={plannerData.plannedDate ? new Date(plannerData.plannedDate) : new Date()}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={handleDateChange}
              minimumDate={new Date()}
            />
            {Platform.OS === 'ios' && (
              <TouchableOpacity
                style={styles.datePickerDoneButton}
                onPress={handleDatePickerDone}
              >
                <Text style={styles.datePickerDoneText}>Done</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>

      {/* Time Estimation */}
      {estimatedTime && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⏱️ Time Estimation</Text>
          <LinearGradient
            colors={[COLORS.primary + '15', COLORS.secondary + '15']}
            style={styles.timeCard}
          >
            <View style={styles.timeRow}>
              <Text style={styles.timeLabel}>Estimated Trek Time:</Text>
              <Text style={styles.timeValue}>{estimatedTime.estimatedTime} hours</Text>
            </View>
            <View style={styles.timeRow}>
              <Text style={styles.timeSubLabel}>Base time: {estimatedTime.baseTime}h</Text>
              <Text style={styles.timeSubLabel}>Buffer: {estimatedTime.bufferTime}h</Text>
            </View>
          </LinearGradient>
        </View>
      )}

      {/* Weather Guidance */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🌤️ Seasonal Guidance</Text>
        <View style={styles.weatherCard}>
          <Text style={styles.weatherSeason}>
            Current Season: {currentSeason ? currentSeason.charAt(0).toUpperCase() + currentSeason.slice(1) : 'Loading...'}
          </Text>
          {weatherGuidance[currentSeason]?.recommendations.map((rec, index) => (
            <Text key={index} style={styles.weatherRec}>• {rec}</Text>
          ))}
        </View>
      </View>
    </View>
  );

  const renderChecklist = () => (
    <View style={styles.content}>
      <Text style={styles.sectionTitle}>✅ Packing Checklist</Text>
      
      {/* Essential Items */}
      <View style={styles.checklistSection}>
        <Text style={styles.checklistCategory}>Essential Items</Text>
        {trekPreparationGuide.essential.items.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.checklistItem}
            onPress={() => setCheckedItems(prev => ({
              ...prev,
              [item.id]: !prev[item.id]
            }))}
          >
            <View style={[
              styles.checkbox,
              checkedItems[item.id] && styles.checkedBox
            ]}>
              {checkedItems[item.id] && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={[
              styles.checklistText,
              checkedItems[item.id] && styles.checkedText
            ]}>
              {item.item}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Recommended Items */}
      <View style={styles.checklistSection}>
        <Text style={styles.checklistCategory}>Recommended Items</Text>
        {trekPreparationGuide.recommended.items.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.checklistItem}
            onPress={() => setCheckedItems(prev => ({
              ...prev,
              [item.id]: !prev[item.id]
            }))}
          >
            <View style={[
              styles.checkbox,
              checkedItems[item.id] && styles.checkedBox
            ]}>
              {checkedItems[item.id] && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={[
              styles.checklistText,
              checkedItems[item.id] && styles.checkedText
            ]}>
              {item.item}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderSafety = () => (
    <View style={styles.content}>
      <Text style={styles.sectionTitle}>🛡️ Safety Guidelines</Text>
      
      {/* Before Trek */}
      <View style={styles.safetySection}>
        <Text style={styles.safetyCategory}>Before Trek</Text>
        {safetyGuidelines.beforeTrek.map((guideline, index) => (
          <Text key={index} style={styles.safetyItem}>• {guideline}</Text>
        ))}
      </View>

      {/* During Trek */}
      <View style={styles.safetySection}>
        <Text style={styles.safetyCategory}>During Trek</Text>
        {safetyGuidelines.duringTrek.map((guideline, index) => (
          <Text key={index} style={styles.safetyItem}>• {guideline}</Text>
        ))}
      </View>

      {/* Emergency Contacts */}
      <View style={styles.emergencySection}>
        <Text style={styles.safetyCategory}>🚨 Emergency Contacts</Text>
        {safetyGuidelines.emergency.map((contact, index) => (
          <Text key={index} style={styles.emergencyContact}>{contact}</Text>
        ))}
      </View>
    </View>
  );

  const renderBudget = () => (
    <View style={styles.content}>
      <Text style={styles.sectionTitle}>💰 Budget Planning</Text>
      
      {budgetPlanning.categories.map((category, categoryIndex) => (
        <View key={categoryIndex} style={styles.budgetSection}>
          <Text style={styles.budgetCategory}>{category.category}</Text>
          {category.items.map((item, itemIndex) => (
            <View key={itemIndex} style={styles.budgetItem}>
              <View style={styles.budgetItemHeader}>
                <Text style={styles.budgetItemName}>{item.item}</Text>
                <Text style={styles.budgetItemCost}>{item.typical_cost}</Text>
              </View>
              <Text style={styles.budgetItemTip}>💡 {item.tips}</Text>
            </View>
          ))}
        </View>
      ))}
    </View>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'planner':
        return renderTrekPlanner();
      case 'checklist':
        return renderChecklist();
      case 'safety':
        return renderSafety();
      case 'budget':
        return renderBudget();
      default:
        return renderTrekPlanner();
    }
  };

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
        <Text style={styles.headerTitle}>Trek Planner</Text>
        <View style={styles.headerSpacer} />
      </View>


      {renderTabButtons()}

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >
        {renderContent()}
      </ScrollView>

      {/* Save Plan Button - Show when trek is selected and basic details are filled */}
      {selectedTrek && plannerData.plannedDate && (
        <View style={styles.savePlanContainer}>
          <TouchableOpacity
            style={styles.savePlanButton}
            onPress={handleSavePlan}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[COLORS.primary, COLORS.primaryDark]}
              style={styles.savePlanGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.savePlanIcon}>💾</Text>
              <Text style={styles.savePlanText}>Save Trek Plan</Text>
              <Text style={styles.savePlanArrow}>→</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}
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
  tabContainer: {
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceBorder,
  },
  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    marginRight: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.backgroundSecondary,
  },
  activeTabButton: {
    backgroundColor: COLORS.primary,
  },
  tabIcon: {
    fontSize: 16,
    marginRight: SPACING.xs,
  },
  tabLabel: {
    ...createTextStyle(14, 'medium'),
    color: COLORS.textSecondary,
  },
  activeTabLabel: {
    color: COLORS.textInverse,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: SPACING.xl,
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    ...createTextStyle(18, 'bold'),
    color: COLORS.text,
    marginBottom: SPACING.lg,
  },
  trekCard: {
    backgroundColor: COLORS.backgroundCard,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    ...SHADOWS.medium,
  },
  trekName: {
    ...createTextStyle(16, 'bold'),
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  trekDetails: {
    ...createTextStyle(14, 'regular'),
    color: COLORS.textSecondary,
  },
  selectTrekButton: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    alignItems: 'center',
  },
  selectTrekText: {
    ...createTextStyle(16, 'bold'),
    color: COLORS.textInverse,
  },
  changeTrekButton: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    marginTop: SPACING.md,
    alignItems: 'center',
  },
  changeTrekText: {
    ...createTextStyle(14, 'medium'),
    color: COLORS.primary,
  },
  inputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  inputLabel: {
    ...createTextStyle(14, 'medium'),
    color: COLORS.text,
  },
  counterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  counterButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  counterText: {
    ...createTextStyle(18, 'bold'),
    color: COLORS.textInverse,
  },
  counterValue: {
    ...createTextStyle(16, 'bold'),
    color: COLORS.text,
    marginHorizontal: SPACING.lg,
  },
  fitnessButtons: {
    flexDirection: 'row',
  },
  fitnessButton: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
    backgroundColor: COLORS.backgroundSecondary,
    marginLeft: SPACING.xs,
  },
  activeFitnessButton: {
    backgroundColor: COLORS.primary,
  },
  fitnessButtonText: {
    ...createTextStyle(12, 'medium'),
    color: COLORS.textSecondary,
  },
  activeFitnessButtonText: {
    color: COLORS.textInverse,
  },
  timeCard: {
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  timeLabel: {
    ...createTextStyle(14, 'medium'),
    color: COLORS.text,
  },
  timeValue: {
    ...createTextStyle(16, 'bold'),
    color: COLORS.primary,
  },
  timeSubLabel: {
    ...createTextStyle(12, 'regular'),
    color: COLORS.textSecondary,
  },
  weatherCard: {
    backgroundColor: COLORS.backgroundCard,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    ...SHADOWS.small,
  },
  weatherSeason: {
    ...createTextStyle(14, 'bold'),
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  weatherRec: {
    ...createTextStyle(12, 'regular'),
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
    lineHeight: 18,
  },
  checklistSection: {
    marginBottom: SPACING.xl,
  },
  checklistCategory: {
    ...createTextStyle(16, 'bold'),
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  checklistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: COLORS.surfaceBorder,
    marginRight: SPACING.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkedBox: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  checkmark: {
    color: COLORS.textInverse,
    fontSize: 14,
    fontWeight: 'bold',
  },
  checklistText: {
    ...createTextStyle(14, 'regular'),
    color: COLORS.text,
    flex: 1,
  },
  checkedText: {
    textDecorationLine: 'line-through',
    color: COLORS.textSecondary,
  },
  safetySection: {
    marginBottom: SPACING.xl,
  },
  safetyCategory: {
    ...createTextStyle(16, 'bold'),
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  safetyItem: {
    ...createTextStyle(14, 'regular'),
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
    lineHeight: 20,
  },
  emergencySection: {
    backgroundColor: COLORS.error + '10',
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginTop: SPACING.lg,
  },
  emergencyContact: {
    ...createTextStyle(14, 'bold'),
    color: COLORS.error,
    marginBottom: SPACING.xs,
  },
  budgetSection: {
    marginBottom: SPACING.xl,
  },
  budgetCategory: {
    ...createTextStyle(16, 'bold'),
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  budgetItem: {
    backgroundColor: COLORS.backgroundCard,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    ...SHADOWS.small,
  },
  budgetItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  budgetItemName: {
    ...createTextStyle(14, 'medium'),
    color: COLORS.text,
    flex: 1,
  },
  budgetItemCost: {
    ...createTextStyle(14, 'bold'),
    color: COLORS.primary,
  },
  budgetItemTip: {
    ...createTextStyle(12, 'regular'),
    color: COLORS.textSecondary,
    fontStyle: 'italic',
  },
  // Save Plan Button Styles
  savePlanContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.background,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.surfaceBorder,
    ...SHADOWS.large,
  },
  savePlanButton: {
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    ...SHADOWS.medium,
    elevation: 8,
  },
  savePlanGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.xl,
  },
  savePlanIcon: {
    fontSize: 24,
    marginRight: SPACING.md,
  },
  savePlanText: {
    ...createTextStyle(18, 'bold'),
    color: COLORS.white,
    flex: 1,
    textAlign: 'center',
  },
  savePlanArrow: {
    fontSize: 20,
    color: COLORS.white,
    marginLeft: SPACING.md,
  },
  // Date Input Styles
  dateInput: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.backgroundCard,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    marginLeft: SPACING.md,
  },
  dateInputText: {
    ...createTextStyle(16, 'regular'),
    color: COLORS.text,
    flex: 1,
  },
  dateInputIcon: {
    fontSize: 20,
  },
  placeholderText: {
    color: COLORS.textSecondary,
  },
  datePickerContainer: {
    backgroundColor: COLORS.backgroundCard,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginTop: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
    ...SHADOWS.small,
  },
  datePickerDoneButton: {
    backgroundColor: COLORS.primary,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    marginTop: SPACING.md,
  },
  datePickerDoneText: {
    ...createTextStyle(16, 'medium'),
    color: COLORS.white,
  },
});

export default TrekPlannerScreen;
