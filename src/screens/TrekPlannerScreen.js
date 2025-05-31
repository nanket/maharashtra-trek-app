import React, { useState, useEffect } from 'react';
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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SHADOWS, SPACING, BORDER_RADIUS, createTextStyle } from '../utils/constants';
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

const TrekPlannerScreen = ({ navigation, route }) => {
  const { trek } = route?.params || {};
  const [activeTab, setActiveTab] = useState('planner');
  const [plannerData, setPlannerData] = useState({
    selectedTrek: trek || null,
    groupSize: 1,
    fitnessLevel: 'intermediate',
    plannedDate: '',
    duration: 1,
    budget: 0
  });
  const [packingList, setPackingList] = useState([]);
  const [checkedItems, setCheckedItems] = useState({});

  useEffect(() => {
    if (trek) {
      generateTrekPlan();
    }
  }, [trek, plannerData]);

  const generateTrekPlan = () => {
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

    // Update planner data
    setPlannerData(prev => ({
      ...prev,
      estimatedTime: timeEstimate,
      season
    }));
  };

  const getCurrentSeason = () => {
    const month = new Date().getMonth() + 1;
    if (month >= 6 && month <= 9) return 'monsoon';
    if (month >= 12 || month <= 2) return 'winter';
    return 'summer';
  };

  const tabs = [
    { id: 'planner', label: 'Plan Trek', icon: '📋' },
    { id: 'checklist', label: 'Checklist', icon: '✅' },
    { id: 'safety', label: 'Safety', icon: '🛡️' },
    { id: 'budget', label: 'Budget', icon: '💰' },
  ];

  const renderTabButtons = () => (
    <View style={styles.tabContainer}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
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
        {trek ? (
          <View style={styles.trekCard}>
            <Text style={styles.trekName}>{trek.name}</Text>
            <Text style={styles.trekDetails}>
              {trek.difficulty} • {trek.duration} • {trek.location}
            </Text>
          </View>
        ) : (
          <TouchableOpacity 
            style={styles.selectTrekButton}
            onPress={() => navigation.navigate('TrekList')}
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
      </View>

      {/* Time Estimation */}
      {plannerData.estimatedTime && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⏱️ Time Estimation</Text>
          <LinearGradient
            colors={[COLORS.primary + '15', COLORS.secondary + '15']}
            style={styles.timeCard}
          >
            <View style={styles.timeRow}>
              <Text style={styles.timeLabel}>Estimated Trek Time:</Text>
              <Text style={styles.timeValue}>{plannerData.estimatedTime.estimatedTime} hours</Text>
            </View>
            <View style={styles.timeRow}>
              <Text style={styles.timeSubLabel}>Base time: {plannerData.estimatedTime.baseTime}h</Text>
              <Text style={styles.timeSubLabel}>Buffer: {plannerData.estimatedTime.bufferTime}h</Text>
            </View>
          </LinearGradient>
        </View>
      )}

      {/* Weather Guidance */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🌤️ Seasonal Guidance</Text>
        <View style={styles.weatherCard}>
          <Text style={styles.weatherSeason}>
            Current Season: {plannerData.season?.charAt(0).toUpperCase() + plannerData.season?.slice(1)}
          </Text>
          {weatherGuidance[plannerData.season]?.recommendations.map((rec, index) => (
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
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {renderContent()}
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
});

export default TrekPlannerScreen;
