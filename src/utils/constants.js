import { Platform } from 'react-native';

export const CATEGORIES = {
  FORT: 'fort',
  WATERFALL: 'waterfall',
  TREK: 'trek',
  CAVE: 'cave',
};

export const DIFFICULTY_LEVELS = {
  EASY: 'Easy',
  MODERATE: 'Moderate',
  DIFFICULT: 'Difficult',
};

export const COLORS = {
  // Modern, beautiful color palette
  primary: '#6366F1',        // Beautiful indigo
  primaryLight: '#818CF8',   // Lighter indigo
  primaryDark: '#4F46E5',    // Darker indigo

  // Secondary colors - Nature inspired
  secondary: '#10B981',      // Emerald green
  secondaryLight: '#34D399', // Light emerald
  secondaryDark: '#059669',  // Dark emerald

  // Accent colors - Warm and inviting
  accent: '#F59E0B',         // Amber
  accentLight: '#FBBF24',    // Light amber
  accentDark: '#D97706',     // Dark amber

  // Background colors - Ultra clean
  background: '#FAFBFC',     // Almost white with hint of blue
  backgroundSecondary: '#F1F5F9', // Light slate
  backgroundCard: '#FFFFFF', // Pure white

  // Surface colors
  surface: '#FFFFFF',
  surfaceElevated: '#FFFFFF',
  surfaceBorder: '#E2E8F0',

  // Text colors - Perfect contrast
  text: '#1E293B',           // Slate 800
  textPrimary: '#1E293B',    // Slate 800 (alias for consistency)
  textSecondary: '#64748B',  // Slate 500
  textLight: '#94A3B8',      // Slate 400
  textInverse: '#FFFFFF',
  white: '#FFFFFF',          // Pure white

  // Status colors - Modern and clear
  success: '#10B981',        // Emerald
  warning: '#F59E0B',        // Amber
  error: '#EF4444',          // Red
  info: '#3B82F6',           // Blue

  // Category colors - Beautiful and distinct
  fort: '#DC2626',           // Red for historic forts
  waterfall: '#0EA5E9',      // Sky blue for waterfalls
  trek: '#10B981',           // Emerald for treks
  cave: '#8B5CF6',           // Purple for caves

  // Difficulty colors
  easy: '#10B981',           // Green
  moderate: '#F59E0B',       // Amber
  difficult: '#EF4444',      // Red

  // Shadow colors - Subtle and modern
  shadow: {
    light: 'rgba(0, 0, 0, 0.03)',
    medium: 'rgba(0, 0, 0, 0.06)',
    dark: 'rgba(0, 0, 0, 0.10)',
  },
};

export const CATEGORY_COLORS = {
  [CATEGORIES.FORT]: {
    primary: COLORS.fort,
    background: 'rgba(139, 69, 19, 0.1)',
    icon: '🏰',
    emoji: '🏛️',
    theme: 'heritage',
  },
  [CATEGORIES.WATERFALL]: {
    primary: COLORS.waterfall,
    background: 'rgba(30, 64, 175, 0.1)',
    icon: '💧',
    emoji: '🌊',
    theme: 'water',
  },
  [CATEGORIES.TREK]: {
    primary: COLORS.trek,
    background: 'rgba(5, 150, 105, 0.1)',
    icon: '⛰️',
    emoji: '🥾',
    theme: 'adventure',
  },
  [CATEGORIES.CAVE]: {
    primary: COLORS.cave,
    background: 'rgba(139, 92, 246, 0.1)',
    icon: '🕳️',
    emoji: '🏛️',
    theme: 'heritage',
  },
};

export const DIFFICULTY_COLORS = {
  [DIFFICULTY_LEVELS.EASY]: {
    color: COLORS.easy,
    background: '#ECFDF5',
    icon: '🟢',
    emoji: '😊',
    label: 'Beginner Friendly',
  },
  [DIFFICULTY_LEVELS.MODERATE]: {
    color: COLORS.moderate,
    background: '#FFFBEB',
    icon: '🟡',
    emoji: '💪',
    label: 'Moderate Challenge',
  },
  [DIFFICULTY_LEVELS.DIFFICULT]: {
    color: COLORS.difficult,
    background: '#FEF2F2',
    icon: '🔴',
    emoji: '🔥',
    label: 'Expert Level',
  },
};

// Platform-optimized shadows - Very subtle for Android
export const SHADOWS = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  small: Platform.select({
    ios: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 0.5 },
      shadowOpacity: 0.02,
      shadowRadius: 1,
    },
    android: {
      elevation: 0.5,
    },
  }),
  medium: Platform.select({
    ios: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.04,
      shadowRadius: 2,
    },
    android: {
      elevation: 1,
    },
  }),
  large: Platform.select({
    ios: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 3,
    },
    android: {
      elevation: 1.5,
    },
  }),
  xl: Platform.select({
    ios: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.08,
      shadowRadius: 4,
    },
    android: {
      elevation: 2,
    },
  }),
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
};

export const BORDER_RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  full: 9999,
};

// Import font configuration
export { FONTS, FONT_WEIGHTS, TYPOGRAPHY, getFontStyle, createTextStyle } from './fonts';

export const IMAGES = {
  // Trek images from assets/img folder
  rajgad: require('../../assets/img/rajgad.jpg'),
  dudhsagar: require('../../assets/img/waterfall.jpg'), // Using waterfall image for Dudhsagar
  harishchandragad: require('../../assets/img/harishchandra.png'),
  sinhagad: require('../../assets/img/raigad.jpg'), // Using raigad for sinhagad
  bhimashankar: require('../../assets/img/harihar.jpg'), // Using harihar for bhimashankar
  kalsubai: require('../../assets/img/rajgad.jpg'), // Using rajgad for kalsubai (similar mountain fort)
  lohagad: require('../../assets/img/raigad.jpg'), // Using raigad for lohagad (similar fort)
  tikona: require('../../assets/img/rajgad.jpg'), // Using rajgad for tikona (similar fort)
  visapur: require('../../assets/img/raigad.jpg'), // Using raigad for visapur (similar fort)
  torna: require('../../assets/img/rajgad.jpg'), // Using rajgad for torna (similar fort)
  andharban: require('../../assets/img/harihar.jpg'), // Using harihar for andharban (forest trek)

  // Additional images for carousel (using existing images for variety)
  rajgad2: require('../../assets/img/harishchandra.png'),
  rajgad3: require('../../assets/img/raigad.jpg'),
  dudhsagar2: require('../../assets/img/rajgad.jpg'),
  dudhsagar3: require('../../assets/img/harihar.jpg'),
  harishchandragad2: require('../../assets/img/waterfall.jpg'),
  harishchandragad3: require('../../assets/img/rajgad.jpg'),
  sinhagad2: require('../../assets/img/harishchandra.png'),
  sinhagad3: require('../../assets/img/harihar.jpg'),
  bhimashankar2: require('../../assets/img/waterfall.jpg'),
  bhimashankar3: require('../../assets/img/raigad.jpg'),

  // Category background images
  fortBackground: require('../../assets/img/rajgad.jpg'),
  waterfallBackground: require('../../assets/img/waterfall.jpg'),
  trekBackground: require('../../assets/img/harishchandra.png'),

  // Default fallback
  defaultImage: require('../../assets/icon.png'),
};

// Cloudinary image URLs for high-quality images
export const CLOUDINARY_IMAGES = {
  // Rajgad Fort images from Cloudinary
  rajgad_main: 'https://res.cloudinary.com/dworlkdn8/image/upload/v1573202739/trekapp/trek%20images/raigad_dae0q5.jpg',
  rajgad_detail1: 'https://res.cloudinary.com/dworlkdn8/image/upload/v1610637684/trekapp/detailpageimages/raigad/main_e1fgqe.jpg',
  rajgad_detail2: 'https://res.cloudinary.com/dworlkdn8/image/upload/v1610637799/trekapp/detailpageimages/raigad/raigad1_hgyhxy.jpg',
  rajgad_detail3: 'https://res.cloudinary.com/dworlkdn8/image/upload/v1610637800/trekapp/detailpageimages/raigad/raigad2_kqkjuw.jpg',
  rajgad_detail4: 'https://res.cloudinary.com/dworlkdn8/image/upload/v1610637800/trekapp/detailpageimages/raigad/raigad3_qvxfqq.jpg',

  // Harishchandragad Fort images - using high-quality public images
  harishchandragad_main: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
  harishchandragad_detail1: 'https://images.unsplash.com/photo-1464822759844-d150baec4e84?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
  harishchandragad_detail2: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
  harishchandragad_detail3: 'https://images.unsplash.com/photo-1551632811-561732d1e306?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
  harishchandragad_detail4: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',

  // Sinhagad Fort images - using high-quality mountain/fort images
  sinhagad_main: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
  sinhagad_detail1: 'https://images.unsplash.com/photo-1464822759844-d150baec4e84?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
  sinhagad_detail2: 'https://images.unsplash.com/photo-1551632811-561732d1e306?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
  sinhagad_detail3: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',

  // Lohagad Fort images - using high-quality landscape images
  lohagad_main: 'https://images.unsplash.com/photo-1464822759844-d150baec4e84?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
  lohagad_detail1: 'https://images.unsplash.com/photo-1551632811-561732d1e306?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
  lohagad_detail2: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
  lohagad_detail3: 'https://images.unsplash.com/photo-1464822759844-d150baec4e84?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',

  // Kalsubai Peak images - using high-quality mountain peak images
  kalsubai_main: 'https://images.unsplash.com/photo-1551632811-561732d1e306?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
  kalsubai_detail1: 'https://images.unsplash.com/photo-1464822759844-d150baec4e84?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
  kalsubai_detail2: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
  kalsubai_detail3: 'https://images.unsplash.com/photo-1551632811-561732d1e306?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',

  // Dudhsagar Waterfall images - using high-quality waterfall images
  dudhsagar_main: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
  dudhsagar_detail1: 'https://images.unsplash.com/photo-1464822759844-d150baec4e84?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
  dudhsagar_detail2: 'https://images.unsplash.com/photo-1551632811-561732d1e306?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
  dudhsagar_detail3: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
};

// Image collections for carousel
export const TREK_IMAGE_COLLECTIONS = {
  rajgad: ['rajgad_main', 'rajgad_detail1', 'rajgad_detail2', 'rajgad_detail3', 'rajgad_detail4'],
  harishchandragad: ['harishchandragad_main', 'harishchandragad_detail1', 'harishchandragad_detail2', 'harishchandragad_detail3', 'harishchandragad_detail4'],
  sinhagad: ['sinhagad_main', 'sinhagad_detail1', 'sinhagad_detail2', 'sinhagad_detail3'],
  lohagad: ['lohagad_main', 'lohagad_detail1', 'lohagad_detail2', 'lohagad_detail3'],
  kalsubai: ['kalsubai_main', 'kalsubai_detail1', 'kalsubai_detail2', 'kalsubai_detail3'],
  dudhsagar: ['dudhsagar_main', 'dudhsagar_detail1', 'dudhsagar_detail2', 'dudhsagar_detail3'],
  // Treks with single images for now - can be expanded with real images
  bhimashankar: ['bhimashankar'],
  tikona: ['tikona'],
  visapur: ['visapur'],
  torna: ['torna'],
  andharban: ['andharban'],
};
