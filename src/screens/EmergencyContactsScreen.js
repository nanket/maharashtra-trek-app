import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  Modal,
} from 'react-native';
import EmergencyService from '../services/EmergencyService';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../utils/constants';

const EmergencyContactsScreen = ({ navigation }) => {
  const [contacts, setContacts] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingContact, setEditingContact] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    relation: '',
  });

  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    try {
      const emergencyContacts = await EmergencyService.getEmergencyContacts();
      setContacts(emergencyContacts);
    } catch (error) {
      console.error('Error loading contacts:', error);
    }
  };

  const handleAddContact = () => {
    setEditingContact(null);
    setFormData({ name: '', phone: '', relation: '' });
    setModalVisible(true);
  };

  const handleEditContact = (contact, index) => {
    setEditingContact(index);
    setFormData(contact);
    setModalVisible(true);
  };

  const handleSaveContact = async () => {
    if (!formData.name.trim() || !formData.phone.trim()) {
      Alert.alert('Error', 'Please fill in name and phone number');
      return;
    }

    try {
      let updatedContacts = [...contacts];
      
      if (editingContact !== null) {
        // Edit existing contact
        updatedContacts[editingContact] = formData;
      } else {
        // Add new contact
        updatedContacts.push(formData);
      }

      await EmergencyService.saveEmergencyContacts(updatedContacts);
      setContacts(updatedContacts);
      setModalVisible(false);
      setFormData({ name: '', phone: '', relation: '' });
      setEditingContact(null);
    } catch (error) {
      Alert.alert('Error', 'Failed to save contact');
    }
  };

  const handleDeleteContact = (index) => {
    Alert.alert(
      'Delete Contact',
      'Are you sure you want to delete this emergency contact?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const updatedContacts = contacts.filter((_, i) => i !== index);
              await EmergencyService.saveEmergencyContacts(updatedContacts);
              setContacts(updatedContacts);
            } catch (error) {
              Alert.alert('Error', 'Failed to delete contact');
            }
          }
        }
      ]
    );
  };

  const renderContactItem = (contact, index) => (
    <View key={index} style={styles.contactItem}>
      <View style={styles.contactInfo}>
        <Text style={styles.contactName}>{contact.name}</Text>
        <Text style={styles.contactPhone}>{contact.phone}</Text>
        {contact.relation && (
          <Text style={styles.contactRelation}>{contact.relation}</Text>
        )}
      </View>
      <View style={styles.contactActions}>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => handleEditContact(contact, index)}
        >
          <Text style={styles.editButtonText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeleteContact(index)}
        >
          <Text style={styles.deleteButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderContactForm = () => (
    <Modal
      visible={modalVisible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => setModalVisible(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={() => setModalVisible(false)}>
            <Text style={styles.cancelButton}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.modalTitle}>
            {editingContact !== null ? 'Edit Contact' : 'Add Contact'}
          </Text>
          <TouchableOpacity onPress={handleSaveContact}>
            <Text style={styles.saveButton}>Save</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.formContainer}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Name *</Text>
            <TextInput
              style={styles.textInput}
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
              placeholder="Enter contact name"
              placeholderTextColor={COLORS.textSecondary}
              returnKeyType="next"
              blurOnSubmit={false}
              autoCorrect={false}
              autoCapitalize="words"
              keyboardType="default"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Phone Number *</Text>
            <TextInput
              style={styles.textInput}
              value={formData.phone}
              onChangeText={(text) => setFormData({ ...formData, phone: text })}
              placeholder="Enter phone number"
              placeholderTextColor={COLORS.textSecondary}
              keyboardType="phone-pad"
              returnKeyType="next"
              blurOnSubmit={false}
              autoCorrect={false}
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Relation</Text>
            <TextInput
              style={styles.textInput}
              value={formData.relation}
              onChangeText={(text) => setFormData({ ...formData, relation: text })}
              placeholder="e.g., Family, Friend, Doctor"
              placeholderTextColor={COLORS.textSecondary}
              returnKeyType="done"
              blurOnSubmit={true}
              autoCorrect={false}
              autoCapitalize="words"
              keyboardType="default"
            />
          </View>
        </ScrollView>
      </View>
    </Modal>
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
        <Text style={styles.headerTitle}>Emergency Contacts</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={handleAddContact}
        >
          <Text style={styles.addButtonText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >
        {/* Info Section */}
        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>👥 Emergency Contacts</Text>
          <Text style={styles.infoText}>
            Add trusted contacts who will be notified in case of emergency. 
            These contacts will receive your location and emergency information via SMS.
          </Text>
        </View>

        {/* Contacts List */}
        <View style={styles.contactsSection}>
          {contacts.length > 0 ? (
            contacts.map(renderContactItem)
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateIcon}>📱</Text>
              <Text style={styles.emptyStateTitle}>No Emergency Contacts</Text>
              <Text style={styles.emptyStateText}>
                Add emergency contacts to receive alerts with your location during emergencies.
              </Text>
              <TouchableOpacity
                style={styles.emptyStateButton}
                onPress={handleAddContact}
              >
                <Text style={styles.emptyStateButtonText}>Add First Contact</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Tips Section */}
        <View style={styles.tipsSection}>
          <Text style={styles.tipsTitle}>💡 Tips</Text>
          <Text style={styles.tipItem}>• Add at least 2-3 emergency contacts</Text>
          <Text style={styles.tipItem}>• Include family members and close friends</Text>
          <Text style={styles.tipItem}>• Verify phone numbers are correct</Text>
          <Text style={styles.tipItem}>• Inform contacts they're listed as emergency contacts</Text>
        </View>
      </ScrollView>

      {renderContactForm()}
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.backgroundCard,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    paddingVertical: SPACING.sm,
  },
  backButtonText: {
    fontSize: 16,
    color: COLORS.primary,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
  },
  addButton: {
    paddingVertical: SPACING.sm,
  },
  addButtonText: {
    fontSize: 16,
    color: COLORS.primary,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  infoSection: {
    padding: SPACING.lg,
    backgroundColor: COLORS.backgroundCard,
    marginBottom: SPACING.sm,
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
  },
  contactsSection: {
    backgroundColor: COLORS.backgroundCard,
    marginBottom: SPACING.sm,
  },
  contactItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  contactPhone: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  contactRelation: {
    fontSize: 12,
    color: COLORS.textLight,
  },
  contactActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  editButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.sm,
  },
  editButtonText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '600',
  },
  deleteButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.error,
    borderRadius: BORDER_RADIUS.sm,
  },
  deleteButtonText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    padding: SPACING.xl,
  },
  emptyStateIcon: {
    fontSize: 48,
    marginBottom: SPACING.md,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  emptyStateText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: SPACING.lg,
  },
  emptyStateButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    ...SHADOWS.small,
  },
  emptyStateButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '600',
  },
  tipsSection: {
    padding: SPACING.lg,
    backgroundColor: COLORS.backgroundCard,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  tipItem: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: SPACING.xs,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.backgroundCard,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  cancelButton: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
  },
  saveButton: {
    fontSize: 16,
    color: COLORS.primary,
    fontWeight: '600',
  },
  formContainer: {
    flex: 1,
    padding: SPACING.lg,
  },
  inputGroup: {
    marginBottom: SPACING.lg,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  textInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    fontSize: 16,
    color: COLORS.text,
    backgroundColor: COLORS.backgroundCard,
  },
});

export default EmergencyContactsScreen;
