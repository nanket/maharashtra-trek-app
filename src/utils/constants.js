export const CATEGORIES = {
  FORT: 'fort',
  WATERFALL: 'waterfall',
  TREK: 'trek',
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
  textSecondary: '#64748B',  // Slate 500
  textLight: '#94A3B8',      // Slate 400
  textInverse: '#FFFFFF',

  // Status colors - Modern and clear
  success: '#10B981',        // Emerald
  warning: '#F59E0B',        // Amber
  error: '#EF4444',          // Red
  info: '#3B82F6',           // Blue

  // Category colors - Beautiful and distinct
  fort: '#DC2626',           // Red for historic forts
  waterfall: '#0EA5E9',      // Sky blue for waterfalls
  trek: '#10B981',           // Emerald for treks

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

export const SHADOWS = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  small: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  medium: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  large: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  xl: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
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

  // Category background images
  fortBackground: require('../../assets/img/rajgad.jpg'),
  waterfallBackground: require('../../assets/img/waterfall.jpg'),
  trekBackground: require('../../assets/img/harishchandra.png'),

  // Default fallback
  defaultImage: require('../../assets/icon.png'),
};
