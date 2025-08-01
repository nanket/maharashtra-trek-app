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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SHADOWS, SPACING, BORDER_RADIUS, createTextStyle } from '../utils/constants';
import UserStorageService from '../utils/userStorage';

const { width } = Dimensions.get('window');

const TripPlannerTab = ({ navigation, tripPlans, onTripPlansChange }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [planTitle, setPlanTitle] = useState('');
  const [planDescription, setPlanDescription] = useState('');
  const [planDate, setPlanDate] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreatePlan = () => {
    setPlanTitle('');
    setPlanDescription('');
    setPlanDate('');
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
        plannedDate: planDate.trim(),
        status: 'planned',
        treks: [],
      };

      const updatedPlans = await UserStorageService.addTripPlan(planData);
      onTripPlansChange(updatedPlans);
      setModalVisible(false);
    } catch (error) {
      console.error('Error creating trip plan:', error);
      Alert.alert('Error', 'Failed to create trip plan');
    } finally {
      setLoading(false);
    }
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
            } catch (error) {
              console.error('Error deleting trip plan:', error);
              Alert.alert('Error', 'Failed to delete trip plan');
            }
          },
        },
      ]
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Date not set';
    return dateString;
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

  const renderPlanCard = ({ item }) => (
    <View style={styles.planCard}>
      <View style={styles.planHeader}>
        <View style={styles.planInfo}>
          <Text style={styles.planTitle}>{item.title}</Text>
          <Text style={styles.planDate}>{formatDate(item.plannedDate)}</Text>
          {item.description && (
            <Text style={styles.planDescription} numberOfLines={2}>
              {item.description}
            </Text>
          )}
        </View>
        <View style={styles.planStatus}>
          <Text style={styles.statusBadge}>Planned</Text>
        </View>
      </View>

      <View style={styles.planActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => {
            // Navigate to plan details or edit
            Alert.alert('Coming Soon', 'Plan editing feature will be available soon!');
          }}
        >
          <Text style={styles.actionButtonText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => handleDeletePlan(item.id)}
        >
          <Text style={[styles.actionButtonText, styles.deleteButtonText]}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

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
          <Text style={styles.modalTitle}>Create Trip Plan</Text>

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
              />
            </View>

            <View style={styles.modalSection}>
              <Text style={styles.modalLabel}>Planned Date</Text>
              <TextInput
                style={styles.textInput}
                value={planDate}
                onChangeText={setPlanDate}
                placeholder="e.g., December 2024"
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
              />
            </View>
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
                {loading ? 'Creating...' : 'Create Plan'}
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
});

export default TripPlannerTab;
