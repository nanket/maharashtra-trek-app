import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage keys
const STORAGE_KEYS = {
  FAVORITES: '@maharashtra_trek_favorites',
  COMPLETED_TREKS: '@maharashtra_trek_completed',
  USER_STATS: '@maharashtra_trek_stats',
  TRIP_PLANS: '@maharashtra_trek_plans',
  USER_PROFILE: '@maharashtra_trek_profile',
};

// User Storage Service
export class UserStorageService {
  // Favorites Management
  static async getFavorites() {
    try {
      const favorites = await AsyncStorage.getItem(STORAGE_KEYS.FAVORITES);
      return favorites ? JSON.parse(favorites) : [];
    } catch (error) {
      console.error('Error getting favorites:', error);
      return [];
    }
  }

  static async addToFavorites(trekId) {
    try {
      const favorites = await this.getFavorites();
      if (!favorites.includes(trekId)) {
        favorites.push(trekId);
        await AsyncStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(favorites));
      }
      return favorites;
    } catch (error) {
      console.error('Error adding to favorites:', error);
      return [];
    }
  }

  static async removeFromFavorites(trekId) {
    try {
      const favorites = await this.getFavorites();
      const updatedFavorites = favorites.filter(id => id !== trekId);
      await AsyncStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(updatedFavorites));
      return updatedFavorites;
    } catch (error) {
      console.error('Error removing from favorites:', error);
      return [];
    }
  }

  static async isFavorite(trekId) {
    try {
      const favorites = await this.getFavorites();
      return favorites.includes(trekId);
    } catch (error) {
      console.error('Error checking favorite status:', error);
      return false;
    }
  }

  // Completed Treks Management
  static async getCompletedTreks() {
    try {
      const completed = await AsyncStorage.getItem(STORAGE_KEYS.COMPLETED_TREKS);
      return completed ? JSON.parse(completed) : [];
    } catch (error) {
      console.error('Error getting completed treks:', error);
      return [];
    }
  }

  static async markTrekCompleted(trekId, completionData = {}) {
    try {
      const completed = await this.getCompletedTreks();
      const existingIndex = completed.findIndex(item => item.trekId === trekId);
      
      const completionEntry = {
        trekId,
        completedDate: new Date().toISOString(),
        rating: completionData.rating || null,
        notes: completionData.notes || '',
        photos: completionData.photos || [],
        duration: completionData.duration || null,
        difficulty: completionData.difficulty || null,
        ...completionData
      };

      if (existingIndex >= 0) {
        completed[existingIndex] = completionEntry;
      } else {
        completed.push(completionEntry);
      }

      await AsyncStorage.setItem(STORAGE_KEYS.COMPLETED_TREKS, JSON.stringify(completed));
      
      // Update user stats
      await this.updateUserStats();
      
      return completed;
    } catch (error) {
      console.error('Error marking trek completed:', error);
      return [];
    }
  }

  static async removeTrekCompletion(trekId) {
    try {
      const completed = await this.getCompletedTreks();
      const updatedCompleted = completed.filter(item => item.trekId !== trekId);
      await AsyncStorage.setItem(STORAGE_KEYS.COMPLETED_TREKS, JSON.stringify(updatedCompleted));
      
      // Update user stats
      await this.updateUserStats();
      
      return updatedCompleted;
    } catch (error) {
      console.error('Error removing trek completion:', error);
      return [];
    }
  }

  static async isTrekCompleted(trekId) {
    try {
      const completed = await this.getCompletedTreks();
      return completed.some(item => item.trekId === trekId);
    } catch (error) {
      console.error('Error checking completion status:', error);
      return false;
    }
  }

  // User Stats Management
  static async getUserStats() {
    try {
      const stats = await AsyncStorage.getItem(STORAGE_KEYS.USER_STATS);
      return stats ? JSON.parse(stats) : {
        totalTreks: 0,
        totalDistance: 0,
        totalElevation: 0,
        favoriteCategory: null,
        achievements: [],
        joinDate: new Date().toISOString(),
        lastActivity: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error getting user stats:', error);
      return {};
    }
  }

  static async updateUserStats() {
    try {
      const completed = await this.getCompletedTreks();
      const currentStats = await this.getUserStats();
      
      // Calculate stats from completed treks
      const totalTreks = completed.length;
      const categories = completed.reduce((acc, trek) => {
        // This would need trek data to calculate properly
        return acc;
      }, {});

      const updatedStats = {
        ...currentStats,
        totalTreks,
        lastActivity: new Date().toISOString(),
        // Add more calculations as needed
      };

      await AsyncStorage.setItem(STORAGE_KEYS.USER_STATS, JSON.stringify(updatedStats));
      return updatedStats;
    } catch (error) {
      console.error('Error updating user stats:', error);
      return {};
    }
  }

  // Trip Plans Management
  static async getTripPlans() {
    try {
      const plans = await AsyncStorage.getItem(STORAGE_KEYS.TRIP_PLANS);
      return plans ? JSON.parse(plans) : [];
    } catch (error) {
      console.error('Error getting trip plans:', error);
      return [];
    }
  }

  static async addTripPlan(planData) {
    try {
      const plans = await this.getTripPlans();
      const newPlan = {
        id: Date.now().toString(),
        createdDate: new Date().toISOString(),
        ...planData
      };
      plans.push(newPlan);
      await AsyncStorage.setItem(STORAGE_KEYS.TRIP_PLANS, JSON.stringify(plans));
      return plans;
    } catch (error) {
      console.error('Error adding trip plan:', error);
      return [];
    }
  }

  static async updateTripPlan(planId, planData) {
    try {
      const plans = await this.getTripPlans();
      const planIndex = plans.findIndex(plan => plan.id === planId);

      if (planIndex >= 0) {
        plans[planIndex] = {
          ...plans[planIndex],
          ...planData,
          updatedDate: new Date().toISOString()
        };
        await AsyncStorage.setItem(STORAGE_KEYS.TRIP_PLANS, JSON.stringify(plans));
      }

      return plans;
    } catch (error) {
      console.error('Error updating trip plan:', error);
      return [];
    }
  }

  static async markTripPlanCompleted(planId, completionData = {}) {
    try {
      const plans = await this.getTripPlans();
      const planIndex = plans.findIndex(plan => plan.id === planId);

      if (planIndex >= 0) {
        plans[planIndex] = {
          ...plans[planIndex],
          status: 'completed',
          completedDate: new Date().toISOString(),
          completionNotes: completionData.notes || '',
          rating: completionData.rating || null,
          actualDuration: completionData.actualDuration || null,
          updatedDate: new Date().toISOString()
        };
        await AsyncStorage.setItem(STORAGE_KEYS.TRIP_PLANS, JSON.stringify(plans));
      }

      return plans;
    } catch (error) {
      console.error('Error marking trip plan completed:', error);
      return [];
    }
  }

  static async removeTripPlan(planId) {
    try {
      const plans = await this.getTripPlans();
      const updatedPlans = plans.filter(plan => plan.id !== planId);
      await AsyncStorage.setItem(STORAGE_KEYS.TRIP_PLANS, JSON.stringify(updatedPlans));
      return updatedPlans;
    } catch (error) {
      console.error('Error removing trip plan:', error);
      return [];
    }
  }

  // User Profile Management
  static async getUserProfile() {
    try {
      const profile = await AsyncStorage.getItem(STORAGE_KEYS.USER_PROFILE);
      return profile ? JSON.parse(profile) : {
        name: 'Trek Enthusiast',
        avatar: null,
        preferences: {
          difficulty: 'all',
          categories: ['fort', 'waterfall', 'trek'],
          notifications: true,
        },
        joinDate: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error getting user profile:', error);
      return {};
    }
  }

  static async updateUserProfile(profileData) {
    try {
      const currentProfile = await this.getUserProfile();
      const updatedProfile = { ...currentProfile, ...profileData };
      await AsyncStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(updatedProfile));
      return updatedProfile;
    } catch (error) {
      console.error('Error updating user profile:', error);
      return {};
    }
  }

  // Clear all data (for testing/reset)
  static async clearAllData() {
    try {
      await AsyncStorage.multiRemove(Object.values(STORAGE_KEYS));
      return true;
    } catch (error) {
      console.error('Error clearing data:', error);
      return false;
    }
  }
}

export default UserStorageService;
