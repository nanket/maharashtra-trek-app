import * as Location from 'expo-location';
import * as SMS from 'expo-sms';
import * as Linking from 'expo-linking';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

class EmergencyService {
  static STORAGE_KEYS = {
    EMERGENCY_CONTACTS: '@emergency_contacts',
    USER_MEDICAL_INFO: '@user_medical_info',
    EMERGENCY_SETTINGS: '@emergency_settings',
    LIVE_SHARING_SESSIONS: '@live_sharing_sessions',
    AUTO_CHECKIN_SETTINGS: '@auto_checkin_settings',
    PANIC_BUTTON_SETTINGS: '@panic_button_settings',
  };

  static EMERGENCY_NUMBERS = {
    POLICE: '100',
    AMBULANCE: '108',
    FIRE: '101',
    TOURIST_HELPLINE: '1363',
    DISASTER_MANAGEMENT: '108',
    FOREST_DEPARTMENT: '1926',
  };

  // Get current location for emergency
  static async getCurrentLocation() {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Location permission denied');
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
        timeout: 10000,
      });

      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error getting location:', error);
      throw error;
    }
  }

  // Send emergency SOS
  static async sendEmergencySOS(emergencyType = 'general') {
    try {
      // Get current location
      const location = await this.getCurrentLocation();
      
      // Get emergency contacts
      const contacts = await this.getEmergencyContacts();
      
      // Get user medical info
      const medicalInfo = await this.getUserMedicalInfo();

      // Create emergency message
      const message = this.createEmergencyMessage(location, emergencyType, medicalInfo);

      // Send to emergency contacts
      await this.notifyEmergencyContacts(contacts, message, location);

      // Log emergency event
      await this.logEmergencyEvent(emergencyType, location);

      return {
        success: true,
        location,
        message,
        contactsNotified: contacts.length,
      };
    } catch (error) {
      console.error('Emergency SOS failed:', error);
      throw error;
    }
  }

  // Create emergency message
  static createEmergencyMessage(location, emergencyType, medicalInfo) {
    const googleMapsUrl = `https://maps.google.com/maps?q=${location.latitude},${location.longitude}`;
    const timestamp = new Date().toLocaleString();

    let message = `🚨 EMERGENCY ALERT 🚨\n\n`;
    message += `Type: ${emergencyType.toUpperCase()}\n`;
    message += `Time: ${timestamp}\n`;
    message += `Location: ${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}\n`;
    message += `Accuracy: ±${Math.round(location.accuracy)}m\n\n`;
    message += `Google Maps: ${googleMapsUrl}\n\n`;
    
    if (medicalInfo.conditions && medicalInfo.conditions.length > 0) {
      message += `Medical Info: ${medicalInfo.conditions.join(', ')}\n`;
    }
    
    if (medicalInfo.medications && medicalInfo.medications.length > 0) {
      message += `Medications: ${medicalInfo.medications.join(', ')}\n`;
    }
    
    if (medicalInfo.allergies && medicalInfo.allergies.length > 0) {
      message += `Allergies: ${medicalInfo.allergies.join(', ')}\n`;
    }

    message += `\nSent from Maharashtra Trek App`;

    return message;
  }

  // Notify emergency contacts
  static async notifyEmergencyContacts(contacts, message, location) {
    const promises = contacts.map(async (contact) => {
      try {
        // Check if SMS is available
        const isAvailable = await SMS.isAvailableAsync();
        
        if (isAvailable) {
          await SMS.sendSMSAsync([contact.phone], message);
        } else {
          // Fallback to opening SMS app
          const smsUrl = `sms:${contact.phone}?body=${encodeURIComponent(message)}`;
          await Linking.openURL(smsUrl);
        }
        
        return { contact: contact.name, status: 'sent' };
      } catch (error) {
        console.error(`Failed to notify ${contact.name}:`, error);
        return { contact: contact.name, status: 'failed', error: error.message };
      }
    });

    return Promise.allSettled(promises);
  }

  // Quick call emergency number
  static async callEmergencyNumber(type = 'AMBULANCE') {
    try {
      const number = this.EMERGENCY_NUMBERS[type];
      if (!number) {
        throw new Error('Invalid emergency number type');
      }

      const phoneUrl = `tel:${number}`;
      const canOpen = await Linking.canOpenURL(phoneUrl);
      
      if (canOpen) {
        await Linking.openURL(phoneUrl);
        
        // Log the emergency call
        await this.logEmergencyEvent(`call_${type.toLowerCase()}`, null);
        
        return true;
      } else {
        throw new Error('Cannot make phone calls on this device');
      }
    } catch (error) {
      console.error('Emergency call failed:', error);
      throw error;
    }
  }

  // Get emergency contacts
  static async getEmergencyContacts() {
    try {
      const contacts = await AsyncStorage.getItem(this.STORAGE_KEYS.EMERGENCY_CONTACTS);
      return contacts ? JSON.parse(contacts) : [];
    } catch (error) {
      console.error('Error getting emergency contacts:', error);
      return [];
    }
  }

  // Save emergency contacts
  static async saveEmergencyContacts(contacts) {
    try {
      await AsyncStorage.setItem(this.STORAGE_KEYS.EMERGENCY_CONTACTS, JSON.stringify(contacts));
      return true;
    } catch (error) {
      console.error('Error saving emergency contacts:', error);
      return false;
    }
  }

  // Get user medical information
  static async getUserMedicalInfo() {
    try {
      const medicalInfo = await AsyncStorage.getItem(this.STORAGE_KEYS.USER_MEDICAL_INFO);
      return medicalInfo ? JSON.parse(medicalInfo) : {
        bloodType: '',
        conditions: [],
        medications: [],
        allergies: [],
        emergencyContact: '',
        doctorContact: '',
      };
    } catch (error) {
      console.error('Error getting medical info:', error);
      return {};
    }
  }

  // Save user medical information
  static async saveUserMedicalInfo(medicalInfo) {
    try {
      await AsyncStorage.setItem(this.STORAGE_KEYS.USER_MEDICAL_INFO, JSON.stringify(medicalInfo));
      return true;
    } catch (error) {
      console.error('Error saving medical info:', error);
      return false;
    }
  }

  // Log emergency events
  static async logEmergencyEvent(type, location) {
    try {
      const event = {
        id: Date.now(),
        type,
        location,
        timestamp: new Date().toISOString(),
      };

      const existingLogs = await AsyncStorage.getItem('@emergency_logs');
      const logs = existingLogs ? JSON.parse(existingLogs) : [];
      
      logs.unshift(event); // Add to beginning
      
      // Keep only last 50 events
      if (logs.length > 50) {
        logs.splice(50);
      }

      await AsyncStorage.setItem('@emergency_logs', JSON.stringify(logs));
    } catch (error) {
      console.error('Error logging emergency event:', error);
    }
  }

  // Get emergency logs
  static async getEmergencyLogs() {
    try {
      const logs = await AsyncStorage.getItem('@emergency_logs');
      return logs ? JSON.parse(logs) : [];
    } catch (error) {
      console.error('Error getting emergency logs:', error);
      return [];
    }
  }

  // Check if emergency contacts are set up
  static async isEmergencySetupComplete() {
    try {
      const contacts = await this.getEmergencyContacts();
      return contacts.length > 0;
    } catch (error) {
      return false;
    }
  }

  // Get nearest hospital/police station (mock data for now)
  static getNearestEmergencyServices(userLocation) {
    // In a real app, this would query a database or API
    return {
      hospitals: [
        {
          name: "Pune Municipal Hospital",
          phone: "+91-20-26127394",
          distance: "2.3 km",
          coordinates: { latitude: 18.5204, longitude: 73.8567 }
        },
        {
          name: "Sahyadri Hospital",
          phone: "+91-20-67206720",
          distance: "3.1 km",
          coordinates: { latitude: 18.5314, longitude: 73.8446 }
        },
        {
          name: "Rural Hospital Rajgurunagar",
          phone: "+91-2553-222777",
          distance: "35 km",
          coordinates: { latitude: 19.0717, longitude: 73.5333 }
        }
      ],
      policeStations: [
        {
          name: "Pune City Police Station",
          phone: "+91-20-26122880",
          distance: "1.8 km",
          coordinates: { latitude: 18.5196, longitude: 73.8553 }
        }
      ],
      fireStations: [
        {
          name: "Pune Fire Brigade",
          phone: "+91-20-26126592",
          distance: "2.1 km",
          coordinates: { latitude: 18.5089, longitude: 73.8553 }
        }
      ]
    };
  }

  // Show emergency action sheet
  static showEmergencyOptions() {
    return new Promise((resolve) => {
      Alert.alert(
        '🚨 Emergency',
        'Choose emergency action:',
        [
          {
            text: 'Send SOS',
            onPress: () => resolve('sos'),
            style: 'destructive'
          },
          {
            text: 'Call Ambulance (108)',
            onPress: () => resolve('ambulance')
          },
          {
            text: 'Call Police (100)',
            onPress: () => resolve('police')
          },
          {
            text: 'Tourist Helpline (1363)',
            onPress: () => resolve('tourist')
          },
          {
            text: 'Forest Department (1926)',
            onPress: () => resolve('forest')
          },
          {
            text: 'Cancel',
            onPress: () => resolve(null),
            style: 'cancel'
          }
        ],
        { cancelable: true }
      );
    });
  }

  // Save emergency contacts
  static async saveEmergencyContacts(contacts) {
    try {
      await AsyncStorage.setItem(
        this.STORAGE_KEYS.EMERGENCY_CONTACTS,
        JSON.stringify(contacts)
      );
      return true;
    } catch (error) {
      console.error('Error saving emergency contacts:', error);
      throw error;
    }
  }
}

export default EmergencyService;
