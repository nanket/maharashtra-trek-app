import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  ScrollView,
  Dimensions,
  Switch,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SHADOWS, SPACING, BORDER_RADIUS, createTextStyle } from '../utils/constants';
import UserStorageService from '../utils/userStorage';

const { width } = Dimensions.get('window');

const TripPlannerTab = ({ navigation, tripPlans, onTripPlansChange }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [planTitle, setPlanTitle] = useState('');
  const [planDescription, setPlanDescription] = useState('');
  const [planDate, setPlanDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [difficulty, setDifficulty] = useState('moderate');
  const [duration, setDuration] = useState('1');
  const [isCompleted, setIsCompleted] = useState(false);
  const [completionNotes, setCompletionNotes] = useState('');
  const [rating, setRating] = useState(0);
  const [loading, setLoading] = useState(false);

  const handleCreatePlan = () => {
    setEditingPlan(null);
    setPlanTitle('');
    setPlanDescription('');

    // Set date to tomorrow as default for new plans
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setPlanDate(tomorrow);

    setDifficulty('moderate');
    setDuration('1');
    setIsCompleted(false);
    setCompletionNotes('');
    setRating(0);
    setShowDatePicker(false);
    setModalVisible(true);
  };

  const handleEditPlan = (plan) => {
    setEditingPlan(plan);
    setPlanTitle(plan.title || '');
    setPlanDescription(plan.description || '');
    setPlanDate(plan.plannedDate ? new Date(plan.plannedDate) : new Date());
    setDifficulty(plan.difficulty || 'moderate');
    setDuration(plan.duration || '1');
    setIsCompleted(plan.status === 'completed');
    setCompletionNotes(plan.completionNotes || '');
    setRating(plan.rating || 0);
    setModalVisible(true);
  };

  const handleSavePlan = async () => {
    if (!planTitle.trim()) {
      Alert.alert('Error', 'Please enter a plan title');
      return;
    }

    setLoading(true);
    try {
      const planData = {
        title: planTitle.trim(),
        description: planDescription.trim(),
        plannedDate: planDate.toISOString(),
        difficulty: difficulty,
        duration: duration,
        status: isCompleted ? 'completed' : 'planned',
        treks: editingPlan?.treks || [],
      };

      // Add completion data if marked as completed
      if (isCompleted) {
        planData.completionNotes = completionNotes.trim();
        planData.rating = rating;
        planData.completedDate = new Date().toISOString();
      }

      let updatedPlans;
      if (editingPlan) {
        // Update existing plan
        updatedPlans = await UserStorageService.updateTripPlan(editingPlan.id, planData);
        Alert.alert('Success', 'Trip plan updated successfully!');
      } else {
        // Create new plan
        updatedPlans = await UserStorageService.addTripPlan(planData);
        Alert.alert('Success', 'Trip plan created successfully!');
      }

      onTripPlansChange(updatedPlans);
      setModalVisible(false);
    } catch (error) {
      console.error('Error saving trip plan:', error);
      Alert.alert('Error', `Failed to ${editingPlan ? 'update' : 'create'} trip plan`);
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (event, selectedDate) => {
    // Handle different event types
    if (event?.type === 'dismissed' || event?.type === 'neutralButtonPressed') {
      // User cancelled - hide picker but don't update date
      setShowDatePicker(false);
      return;
    }

    // On Android, hide picker after any interaction
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }

    // Update date if user selected a date
    if (selectedDate && selectedDate instanceof Date) {
      setPlanDate(selectedDate);
    }
  };

  const handleDatePickerPress = () => {
    setShowDatePicker(true);
  };

  const handleDatePickerDone = () => {
    setShowDatePicker(false);
  };

  const formatDate = (date) => {
    try {
      if (!date) {
        return 'Select Date';
      }

      // Ensure we have a valid Date object
      const dateObj = date instanceof Date ? date : new Date(date);

      // Check if date is valid
      if (isNaN(dateObj.getTime())) {
        return 'Select Date';
      }

      return dateObj.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Select Date';
    }
  };

  const handleMarkCompleted = async (planId) => {
    Alert.alert(
      'Mark as Completed',
      'Mark this trek plan as completed?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Mark Completed',
          onPress: async () => {
            try {
              const updatedPlans = await UserStorageService.markTripPlanCompleted(planId);
              onTripPlansChange(updatedPlans);
              Alert.alert('Success', 'Trek plan marked as completed!');
            } catch (error) {
              console.error('Error marking plan completed:', error);
              Alert.alert('Error', 'Failed to mark plan as completed');
            }
          },
        },
      ]
    );
  };

  const handleDeletePlan = async (planId) => {
    Alert.alert(
      'Delete Plan',
      'Are you sure you want to delete this trip plan?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const updatedPlans = await UserStorageService.removeTripPlan(planId);
              onTripPlansChange(updatedPlans);
              Alert.alert('Success', 'Trip plan deleted successfully!');
            } catch (error) {
              console.error('Error deleting trip plan:', error);
              Alert.alert('Error', 'Failed to delete trip plan');
            }
          },
        },
      ]
    );
  };

  const formatDateString = (dateString) => {
    if (!dateString) return 'Date not set';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch (error) {
      return dateString;
    }
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <LinearGradient
        colors={[COLORS.accent, COLORS.accentDark]}
        style={styles.emptyGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Text style={styles.emptyIcon}>📅</Text>
        <Text style={styles.emptyTitle}>No Trip Plans Yet</Text>
        <Text style={styles.emptySubtitle}>
          Create your first trip plan and organize your trekking adventures!
        </Text>
        <TouchableOpacity
          style={styles.createButton}
          onPress={handleCreatePlan}
        >
          <Text style={styles.createButtonText}>Create First Plan</Text>
        </TouchableOpacity>
      </LinearGradient>
    </View>
  );

  const renderStars = (rating, onPress = null) => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            onPress={() => onPress && onPress(star)}
            disabled={!onPress}
          >
            <Text style={[
              styles.star,
              star <= rating && styles.starFilled
            ]}>
              ⭐
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderPlanCard = ({ item }) => {
    const isCompleted = item.status === 'completed';

    return (
      <View style={[styles.planCard, isCompleted && styles.completedCard]}>
        <View style={styles.planHeader}>
          <View style={styles.planInfo}>
            <View style={styles.titleRow}>
              <Text style={[styles.planTitle, isCompleted && styles.completedTitle]}>
                {item.title}
              </Text>
              {isCompleted && <Text style={styles.completedIcon}>✅</Text>}
            </View>

            <Text style={styles.planDate}>
              📅 {formatDateString(item.plannedDate)}
            </Text>

            {item.difficulty && (
              <Text style={styles.planDifficulty}>
                🏔️ {item.difficulty.charAt(0).toUpperCase() + item.difficulty.slice(1)}
              </Text>
            )}

            {item.duration && (
              <Text style={styles.planDuration}>
                ⏱️ {item.duration} day{item.duration !== '1' ? 's' : ''}
              </Text>
            )}

            {item.description && (
              <Text style={styles.planDescription} numberOfLines={2}>
                {item.description}
              </Text>
            )}

            {isCompleted && item.completedDate && (
              <Text style={styles.completedDate}>
                ✅ Completed on {formatDateString(item.completedDate)}
              </Text>
            )}

            {isCompleted && item.rating > 0 && (
              <View style={styles.ratingContainer}>
                {renderStars(item.rating)}
              </View>
            )}
          </View>

          <View style={styles.planStatus}>
            <Text style={[
              styles.statusBadge,
              isCompleted ? styles.completedBadge : styles.plannedBadge
            ]}>
              {isCompleted ? 'Completed' : 'Planned'}
            </Text>
          </View>
        </View>

        <View style={styles.planActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleEditPlan(item)}
          >
            <Text style={styles.actionButtonText}>✏️ Edit</Text>
          </TouchableOpacity>

          {!isCompleted && (
            <TouchableOpacity
              style={[styles.actionButton, styles.completeButton]}
              onPress={() => handleMarkCompleted(item.id)}
            >
              <Text style={[styles.actionButtonText, styles.completeButtonText]}>
                ✅ Complete
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={() => handleDeletePlan(item.id)}
          >
            <Text style={[styles.actionButtonText, styles.deleteButtonText]}>🗑️ Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <View style={styles.headerTop}>
        <View>
          <Text style={styles.headerTitle}>
            Trip Plans ({tripPlans.length})
          </Text>
          <Text style={styles.headerSubtitle}>
            Organize your future adventures
          </Text>
        </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={handleCreatePlan}
        >
          <Text style={styles.addButtonText}>+ Add Plan</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderCreateModal = () => (
    <Modal
      visible={modalVisible}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>
            {editingPlan ? 'Edit Trip Plan' : 'Create Trip Plan'}
          </Text>

          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
          >
            <View style={styles.modalSection}>
              <Text style={styles.modalLabel}>Plan Title *</Text>
              <TextInput
                style={styles.textInput}
                value={planTitle}
                onChangeText={setPlanTitle}
                placeholder="e.g., Weekend Trek to Rajgad"
                maxLength={50}
                returnKeyType="next"
                blurOnSubmit={false}
                autoCorrect={false}
                autoCapitalize="words"
                keyboardType="default"
              />
            </View>

            <View style={styles.modalSection}>
              <Text style={styles.modalLabel}>Planned Date *</Text>
              <TouchableOpacity
                style={styles.datePickerButton}
                onPress={handleDatePickerPress}
              >
                <Text style={styles.datePickerText}>
                  📅 {formatDate(planDate)}
                </Text>
              </TouchableOpacity>

              {showDatePicker && Platform.OS === 'ios' && (
                <View style={styles.iosDatePickerContainer}>
                  <DateTimePicker
                    value={planDate instanceof Date && !isNaN(planDate.getTime()) ? planDate : new Date()}
                    mode="date"
                    display="spinner"
                    onChange={handleDateChange}
                    minimumDate={new Date()}
                    style={styles.iosDatePicker}
                  />
                  <TouchableOpacity
                    style={styles.datePickerDoneButton}
                    onPress={handleDatePickerDone}
                  >
                    <Text style={styles.datePickerDoneText}>Done</Text>
                  </TouchableOpacity>
                </View>
              )}

              {showDatePicker && Platform.OS === 'android' && (
                <DateTimePicker
                  value={planDate instanceof Date && !isNaN(planDate.getTime()) ? planDate : new Date()}
                  mode="date"
                  display="default"
                  onChange={handleDateChange}
                  minimumDate={new Date()}
                />
              )}

              {/* Web fallback - HTML5 date input */}
              {showDatePicker && Platform.OS === 'web' && (
                <View style={styles.webDatePicker}>
                  <Text style={styles.webDateLabel}>Select Date:</Text>
                  <input
                    type="date"
                    value={planDate instanceof Date && !isNaN(planDate.getTime())
                      ? planDate.toISOString().split('T')[0]
                      : new Date().toISOString().split('T')[0]
                    }
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => {
                      try {
                        const newDate = new Date(e.target.value + 'T00:00:00');
                        if (!isNaN(newDate.getTime())) {
                          setPlanDate(newDate);
                        }
                      } catch (error) {
                        console.error('Invalid date:', error);
                      }
                    }}
                    style={{
                      padding: '12px',
                      borderRadius: '8px',
                      border: '1px solid #E5E7EB',
                      fontSize: '16px',
                      width: '100%',
                      marginTop: '8px',
                      marginBottom: '12px'
                    }}
                  />
                  <TouchableOpacity
                    style={styles.datePickerCloseButton}
                    onPress={() => setShowDatePicker(false)}
                  >
                    <Text style={styles.datePickerCloseText}>Done</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            <View style={styles.modalSection}>
              <Text style={styles.modalLabel}>Difficulty Level</Text>
              <View style={styles.difficultyContainer}>
                {['easy', 'moderate', 'difficult'].map((level) => (
                  <TouchableOpacity
                    key={level}
                    style={[
                      styles.difficultyButton,
                      difficulty === level && styles.selectedDifficulty
                    ]}
                    onPress={() => setDifficulty(level)}
                  >
                    <Text style={[
                      styles.difficultyText,
                      difficulty === level && styles.selectedDifficultyText
                    ]}>
                      {level.charAt(0).toUpperCase() + level.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.modalSection}>
              <Text style={styles.modalLabel}>Duration (Days)</Text>
              <TextInput
                style={styles.textInput}
                value={duration}
                onChangeText={setDuration}
                placeholder="1"
                keyboardType="numeric"
                returnKeyType="next"
                blurOnSubmit={false}
              />
            </View>

            <View style={styles.modalSection}>
              <Text style={styles.modalLabel}>Description (Optional)</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                value={planDescription}
                onChangeText={setPlanDescription}
                placeholder="Add notes about your trip plan..."
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                maxLength={200}
                returnKeyType="done"
                blurOnSubmit={true}
                autoCorrect={true}
                autoCapitalize="sentences"
                keyboardType="default"
              />
            </View>

            <View style={styles.modalSection}>
              <View style={styles.completionToggle}>
                <Text style={styles.modalLabel}>Mark as Completed</Text>
                <Switch
                  value={isCompleted}
                  onValueChange={setIsCompleted}
                  trackColor={{ false: COLORS.border, true: COLORS.success }}
                  thumbColor={isCompleted ? COLORS.white : COLORS.textSecondary}
                />
              </View>
            </View>

            {isCompleted && (
              <>
                <View style={styles.modalSection}>
                  <Text style={styles.modalLabel}>Rating</Text>
                  <View style={styles.ratingSelector}>
                    {renderStars(rating, setRating)}
                  </View>
                </View>

                <View style={styles.modalSection}>
                  <Text style={styles.modalLabel}>Completion Notes</Text>
                  <TextInput
                    style={[styles.textInput, styles.textArea]}
                    value={completionNotes}
                    onChangeText={setCompletionNotes}
                    placeholder="How was your trek experience?"
                    multiline
                    numberOfLines={3}
                    textAlignVertical="top"
                    maxLength={300}
                    returnKeyType="done"
                    blurOnSubmit={true}
                    autoCorrect={true}
                    autoCapitalize="sentences"
                    keyboardType="default"
                  />
                </View>
              </>
            )}
          </ScrollView>

          <View style={styles.modalActions}>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.saveButton]}
              onPress={handleSavePlan}
              disabled={loading}
            >
              <Text style={styles.saveButtonText}>
                {loading
                  ? (editingPlan ? 'Updating...' : 'Creating...')
                  : (editingPlan ? 'Update Plan' : 'Create Plan')
                }
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  if (tripPlans.length === 0) {
    return (
      <View style={styles.container}>
        {renderHeader()}
        {renderEmptyState()}
        {renderCreateModal()}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={tripPlans}
        renderItem={renderPlanCard}
        keyExtractor={(item) => item.id.toString()}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      />
      {renderCreateModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  listContainer: {
    padding: SPACING.lg,
  },
  headerContainer: {
    marginBottom: SPACING.xl,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerTitle: {
    ...createTextStyle(24, 'bold'),
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  headerSubtitle: {
    ...createTextStyle(14, 'regular'),
    color: COLORS.textSecondary,
  },
  addButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    ...SHADOWS.small,
  },
  addButtonText: {
    ...createTextStyle(14, 'medium'),
    color: COLORS.textInverse,
  },
  planCard: {
    backgroundColor: COLORS.backgroundCard,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
    ...SHADOWS.medium,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  planInfo: {
    flex: 1,
  },
  planTitle: {
    ...createTextStyle(18, 'bold'),
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  planDate: {
    ...createTextStyle(14, 'medium'),
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  planDescription: {
    ...createTextStyle(14, 'regular'),
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  planStatus: {
    marginLeft: SPACING.md,
  },
  statusBadge: {
    ...createTextStyle(12, 'medium'),
    color: COLORS.accent,
    backgroundColor: `${COLORS.accent}20`,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
    textTransform: 'uppercase',
  },
  planActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  actionButton: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.primary,
    marginLeft: SPACING.sm,
  },
  deleteButton: {
    backgroundColor: COLORS.error,
  },
  actionButtonText: {
    ...createTextStyle(12, 'medium'),
    color: COLORS.textInverse,
  },
  deleteButtonText: {
    color: COLORS.textInverse,
  },
  emptyContainer: {
    flex: 1,
    marginTop: SPACING.xxl,
  },
  emptyGradient: {
    padding: SPACING.xxl,
    borderRadius: BORDER_RADIUS.xl,
    alignItems: 'center',
    ...SHADOWS.large,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: SPACING.lg,
  },
  emptyTitle: {
    ...createTextStyle(20, 'bold'),
    color: COLORS.textInverse,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  emptySubtitle: {
    ...createTextStyle(14, 'regular'),
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginBottom: SPACING.xl,
    lineHeight: 20,
  },
  createButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  createButtonText: {
    ...createTextStyle(14, 'bold'),
    color: COLORS.textInverse,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  modalContent: {
    backgroundColor: COLORS.backgroundCard,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.xl,
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
    ...SHADOWS.xl,
  },
  modalTitle: {
    ...createTextStyle(20, 'bold'),
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.xl,
  },
  modalSection: {
    marginBottom: SPACING.lg,
  },
  modalLabel: {
    ...createTextStyle(16, 'medium'),
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  textInput: {
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    ...createTextStyle(14, 'regular'),
    color: COLORS.text,
    backgroundColor: COLORS.backgroundSecondary,
  },
  textArea: {
    minHeight: 80,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.lg,
  },
  modalButton: {
    flex: 1,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    marginHorizontal: SPACING.xs,
  },
  cancelButton: {
    backgroundColor: COLORS.backgroundSecondary,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
  },
  cancelButtonText: {
    ...createTextStyle(16, 'medium'),
    color: COLORS.textSecondary,
  },
  saveButtonText: {
    ...createTextStyle(16, 'medium'),
    color: COLORS.textInverse,
  },
  // Enhanced styles for new features
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs,
  },
  completedTitle: {
    textDecorationLine: 'line-through',
    color: COLORS.textSecondary,
  },
  completedIcon: {
    fontSize: 16,
    marginLeft: SPACING.xs,
  },
  planDifficulty: {
    ...createTextStyle(12, 'medium'),
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  planDuration: {
    ...createTextStyle(12, 'medium'),
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  completedDate: {
    ...createTextStyle(12, 'medium'),
    color: COLORS.success,
    marginTop: SPACING.xs,
  },
  completedCard: {
    backgroundColor: COLORS.successLight,
    borderColor: COLORS.success,
    borderWidth: 1,
  },
  completedBadge: {
    backgroundColor: COLORS.success,
  },
  plannedBadge: {
    backgroundColor: COLORS.primary,
  },
  completeButton: {
    backgroundColor: COLORS.success,
  },
  completeButtonText: {
    color: COLORS.white,
  },
  datePickerButton: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginTop: SPACING.xs,
    minHeight: 48,
    justifyContent: 'center',
    ...SHADOWS.small,
  },
  datePickerText: {
    ...createTextStyle(16, 'regular'),
    color: COLORS.text,
    textAlign: 'left',
  },
  difficultyContainer: {
    flexDirection: 'row',
    marginTop: SPACING.xs,
  },
  difficultyButton: {
    flex: 1,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginRight: SPACING.xs,
    alignItems: 'center',
  },
  selectedDifficulty: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  difficultyText: {
    ...createTextStyle(14, 'medium'),
    color: COLORS.text,
  },
  selectedDifficultyText: {
    color: COLORS.white,
  },
  completionToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ratingSelector: {
    marginTop: SPACING.xs,
  },
  starsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  star: {
    fontSize: 24,
    marginRight: SPACING.xs,
    opacity: 0.3,
  },
  starFilled: {
    opacity: 1,
  },
  ratingContainer: {
    marginTop: SPACING.xs,
  },
  iosDatePickerContainer: {
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginTop: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.small,
  },
  iosDatePicker: {
    height: 200,
    width: '100%',
  },
  webDatePicker: {
    marginTop: SPACING.xs,
    padding: SPACING.md,
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.small,
  },
  webDateLabel: {
    ...createTextStyle(14, 'medium'),
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  datePickerCloseButton: {
    backgroundColor: COLORS.primary,
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.sm,
    alignItems: 'center',
    marginTop: SPACING.xs,
  },
  datePickerCloseText: {
    color: COLORS.white,
    ...createTextStyle(14, 'medium'),
  },
  datePickerDoneButton: {
    backgroundColor: COLORS.primary,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    marginTop: SPACING.md,
    ...SHADOWS.small,
  },
  datePickerDoneText: {
    color: COLORS.white,
    ...createTextStyle(16, 'medium'),
  },
});

export default TripPlannerTab;
