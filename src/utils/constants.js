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
  // Primary brand colors - Clean and minimal
  primary: '#1B4332',
  primaryLight: '#2D5A47',
  primaryDark: '#081C15',

  // Secondary colors - Subtle accent
  secondary: '#D2691E',
  secondaryLight: '#DEB887',
  secondaryDark: '#A0522D',

  // Accent colors - Minimal usage
  accent: '#F4A261',
  accentLight: '#F4A261',
  accentDark: '#E76F51',

  // Background colors
  background: '#FAFAFA',
  backgroundSecondary: '#F5F5F5',
  backgroundCard: '#FFFFFF',

  // Surface colors
  surface: '#FFFFFF',
  surfaceElevated: '#FFFFFF',
  surfaceBorder: '#E5E7EB',

  // Text colors
  text: '#111827',
  textSecondary: '#6B7280',
  textLight: '#9CA3AF',
  textInverse: '#FFFFFF',

  // Status colors
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',

  // Category colors - solid colors only
  fort: '#8B4513',
  waterfall: '#1E40AF',
  trek: '#059669',

  // Difficulty colors
  easy: '#10B981',
  moderate: '#F59E0B',
  difficult: '#EF4444',

  // Shadow colors
  shadow: {
    light: 'rgba(0, 0, 0, 0.05)',
    medium: 'rgba(0, 0, 0, 0.1)',
    dark: 'rgba(0, 0, 0, 0.15)',
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
    shadowColor: COLORS.shadow.light,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 3,
    elevation: 2,
  },
  medium: {
    shadowColor: COLORS.shadow.medium,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 4,
  },
  large: {
    shadowColor: COLORS.shadow.dark,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 8,
  },
  colored: {
    shadowColor: COLORS.shadow.colored,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 6,
  },
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const BORDER_RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  full: 9999,
};

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
