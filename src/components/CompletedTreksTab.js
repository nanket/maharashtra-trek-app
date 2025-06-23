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
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SHADOWS, SPACING, BORDER_RADIUS, createTextStyle, CATEGORY_COLORS } from '../utils/constants';
import UserStorageService from '../utils/userStorage';
import LocalDataService from '../services/LocalDataService';

const { width } = Dimensions.get('window');

const CompletedTreksTab = ({ navigation, completedTreks, onCompletedChange }) => {
  const [completedTreksData, setCompletedTreksData] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedTrek, setSelectedTrek] = useState(null);
  const [rating, setRating] = useState(0);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadCompletedTreksData();
  }, [completedTreks]);

  const loadCompletedTreksData = () => {
    const allData = LocalDataService.getAllData();
    const completed = completedTreks.map(completed => {
      const trekData = allData.find(trek => trek.id === completed.trekId);
      return { ...trekData, completionData: completed };
    }).filter(Boolean);

    // Sort by completion date (most recent first)
    completed.sort((a, b) => new Date(b.completionData.completedDate) - new Date(a.completionData.completedDate));

    setCompletedTreksData(completed);
  };

  const handleMarkCompleted = async (trek) => {
    setSelectedTrek(trek);
    setRating(0);
    setNotes('');
    setModalVisible(true);
  };

  const handleSaveCompletion = async () => {
    if (!selectedTrek) return;

    setLoading(true);
    try {
      const completionData = {
        rating,
        notes,
        completedDate: new Date().toISOString(),
      };

      const updatedCompleted = await UserStorageService.markTrekCompleted(
        selectedTrek.id,
        completionData
      );

      onCompletedChange(updatedCompleted);
      setModalVisible(false);
      setSelectedTrek(null);
    } catch (error) {
      console.error('Error marking trek completed:', error);
      Alert.alert('Error', 'Failed to mark trek as completed');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveCompletion = async (trekId) => {
    Alert.alert(
      'Remove Completion',
      'Are you sure you want to remove this trek from your completed list?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              const updatedCompleted = await UserStorageService.removeTrekCompletion(trekId);
              onCompletedChange(updatedCompleted);
            } catch (error) {
              console.error('Error removing completion:', error);
              Alert.alert('Error', 'Failed to remove completion');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleTrekPress = (trek) => {
    navigation.navigate('TrekDetails', { trek });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

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

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <LinearGradient
        colors={[COLORS.secondary, COLORS.secondaryDark]}
        style={styles.emptyGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Text style={styles.emptyIcon}>✅</Text>
        <Text style={styles.emptyTitle}>No Completed Treks Yet</Text>
        <Text style={styles.emptySubtitle}>
          Start your trekking journey and mark your achievements!
        </Text>
        <TouchableOpacity
          style={styles.exploreButton}
          onPress={() => navigation.navigate('Home')}
        >
          <Text style={styles.exploreButtonText}>Start Exploring</Text>
        </TouchableOpacity>
      </LinearGradient>
    </View>
  );

  const renderCompletedCard = ({ item }) => {
    const categoryData = CATEGORY_COLORS[item.category];

    return (
      <TouchableOpacity
        style={styles.completedCard}
        onPress={() => handleTrekPress(item)}
        activeOpacity={0.8}
      >
        <View style={styles.cardHeader}>
          <View style={styles.cardInfo}>
            <Text style={styles.cardTitle}>{item.name}</Text>
            <Text style={styles.cardLocation}>{item.location}</Text>
            <Text style={styles.completedDate}>
              Completed on {formatDate(item.completionData.completedDate)}
            </Text>
          </View>
          <View style={[styles.categoryBadge, { backgroundColor: categoryData?.primary }]}>
            <Text style={styles.categoryIcon}>{categoryData?.emoji}</Text>
          </View>
        </View>

        {item.completionData.rating > 0 && (
          <View style={styles.ratingContainer}>
            {renderStars(item.completionData.rating)}
          </View>
        )}

        {item.completionData.notes && (
          <Text style={styles.notesText} numberOfLines={2}>
            "{item.completionData.notes}"
          </Text>
        )}

        <View style={styles.cardActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleMarkCompleted(item)}
          >
            <Text style={styles.actionButtonText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.removeActionButton]}
            onPress={() => handleRemoveCompletion(item.id)}
          >
            <Text style={[styles.actionButtonText, styles.removeActionText]}>Remove</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <Text style={styles.headerTitle}>
        Completed Treks ({completedTreksData.length})
      </Text>
      <Text style={styles.headerSubtitle}>
        Your trekking achievements
      </Text>
    </View>
  );

  const renderCompletionModal = () => (
    <Modal
      visible={modalVisible}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>
            {selectedTrek ? `Rate ${selectedTrek.name}` : 'Rate Trek'}
          </Text>

          <View style={styles.modalSection}>
            <Text style={styles.modalLabel}>Your Rating</Text>
            {renderStars(rating, setRating)}
          </View>

          <View style={styles.modalSection}>
            <Text style={styles.modalLabel}>Notes (Optional)</Text>
            <TextInput
              style={styles.notesInput}
              value={notes}
              onChangeText={setNotes}
              placeholder="Share your experience..."
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.modalActions}>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.saveButton]}
              onPress={handleSaveCompletion}
              disabled={loading}
            >
              <Text style={styles.saveButtonText}>
                {loading ? 'Saving...' : 'Save'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  if (completedTreksData.length === 0) {
    return (
      <View style={styles.container}>
        {renderHeader()}
        {renderEmptyState()}
        {renderCompletionModal()}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={completedTreksData}
        renderItem={renderCompletedCard}
        keyExtractor={(item) => item.id.toString()}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
      {renderCompletionModal()}
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
  headerTitle: {
    ...createTextStyle(24, 'bold'),
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  headerSubtitle: {
    ...createTextStyle(14, 'regular'),
    color: COLORS.textSecondary,
  },
  completedCard: {
    backgroundColor: COLORS.backgroundCard,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
    ...SHADOWS.medium,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  cardInfo: {
    flex: 1,
  },
  cardTitle: {
    ...createTextStyle(18, 'bold'),
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  cardLocation: {
    ...createTextStyle(14, 'regular'),
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  completedDate: {
    ...createTextStyle(12, 'medium'),
    color: COLORS.secondary,
  },
  categoryBadge: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: SPACING.md,
  },
  categoryIcon: {
    fontSize: 20,
  },
  ratingContainer: {
    marginBottom: SPACING.md,
  },
  starsContainer: {
    flexDirection: 'row',
  },
  star: {
    fontSize: 16,
    color: COLORS.textLight,
    marginRight: SPACING.xs,
  },
  starFilled: {
    color: COLORS.accent,
  },
  notesText: {
    ...createTextStyle(14, 'regular'),
    color: COLORS.textSecondary,
    fontStyle: 'italic',
    marginBottom: SPACING.md,
    lineHeight: 20,
  },
  cardActions: {
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
  removeActionButton: {
    backgroundColor: COLORS.error,
  },
  actionButtonText: {
    ...createTextStyle(12, 'medium'),
    color: COLORS.textInverse,
  },
  removeActionText: {
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
  exploreButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  exploreButtonText: {
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
    ...SHADOWS.xl,
  },
  modalTitle: {
    ...createTextStyle(20, 'bold'),
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.xl,
  },
  modalSection: {
    marginBottom: SPACING.xl,
  },
  modalLabel: {
    ...createTextStyle(16, 'medium'),
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  notesInput: {
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    ...createTextStyle(14, 'regular'),
    color: COLORS.text,
    backgroundColor: COLORS.backgroundSecondary,
    minHeight: 80,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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

export default CompletedTreksTab;
