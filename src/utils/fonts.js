// Font configuration for the Maharashtra Trek app
// Using Poppins font family for a modern, professional look

export const FONTS = {
  // Poppins font family
  regular: 'Poppins-Regular',
  medium: 'Poppins-Medium',
  bold: 'Poppins-Bold',
  light: 'Poppins-Light',
};

// Font weights mapping for consistent usage
export const FONT_WEIGHTS = {
  light: '300',
  regular: '400',
  medium: '500',
  semiBold: '600',
  bold: '700',
  extraBold: '800',
  black: '900',
};

// Typography scale with custom fonts
export const TYPOGRAPHY = {
  // Display text (large headings)
  display: {
    fontSize: 32,
    fontFamily: FONTS.bold,
    fontWeight: FONT_WEIGHTS.bold,
    lineHeight: 40,
    letterSpacing: -0.5,
  },
  
  // Large headings
  h1: {
    fontSize: 28,
    fontFamily: FONTS.bold,
    fontWeight: FONT_WEIGHTS.bold,
    lineHeight: 36,
    letterSpacing: -0.5,
  },
  
  // Medium headings
  h2: {
    fontSize: 24,
    fontFamily: FONTS.bold,
    fontWeight: FONT_WEIGHTS.bold,
    lineHeight: 32,
    letterSpacing: -0.25,
  },
  
  // Small headings
  h3: {
    fontSize: 20,
    fontFamily: FONTS.medium,
    fontWeight: FONT_WEIGHTS.medium,
    lineHeight: 28,
    letterSpacing: 0,
  },
  
  // Section titles
  h4: {
    fontSize: 18,
    fontFamily: FONTS.medium,
    fontWeight: FONT_WEIGHTS.medium,
    lineHeight: 24,
    letterSpacing: 0,
  },
  
  // Subsection titles
  h5: {
    fontSize: 16,
    fontFamily: FONTS.medium,
    fontWeight: FONT_WEIGHTS.medium,
    lineHeight: 22,
    letterSpacing: 0,
  },
  
  // Small titles
  h6: {
    fontSize: 14,
    fontFamily: FONTS.medium,
    fontWeight: FONT_WEIGHTS.medium,
    lineHeight: 20,
    letterSpacing: 0,
  },
  
  // Body text
  body: {
    fontSize: 16,
    fontFamily: FONTS.regular,
    fontWeight: FONT_WEIGHTS.regular,
    lineHeight: 24,
    letterSpacing: 0,
  },
  
  // Secondary body text
  bodySecondary: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    fontWeight: FONT_WEIGHTS.regular,
    lineHeight: 20,
    letterSpacing: 0,
  },
  
  // Caption text
  caption: {
    fontSize: 12,
    fontFamily: FONTS.regular,
    fontWeight: FONT_WEIGHTS.regular,
    lineHeight: 16,
    letterSpacing: 0.25,
  },
  
  // Small caption
  captionSmall: {
    fontSize: 10,
    fontFamily: FONTS.regular,
    fontWeight: FONT_WEIGHTS.regular,
    lineHeight: 14,
    letterSpacing: 0.25,
  },
  
  // Button text
  button: {
    fontSize: 16,
    fontFamily: FONTS.medium,
    fontWeight: FONT_WEIGHTS.medium,
    lineHeight: 20,
    letterSpacing: 0.25,
  },
  
  // Small button text
  buttonSmall: {
    fontSize: 14,
    fontFamily: FONTS.medium,
    fontWeight: FONT_WEIGHTS.medium,
    lineHeight: 18,
    letterSpacing: 0.25,
  },
  
  // Label text
  label: {
    fontSize: 12,
    fontFamily: FONTS.medium,
    fontWeight: FONT_WEIGHTS.medium,
    lineHeight: 16,
    letterSpacing: 0.5,
  },
  
  // Overline text
  overline: {
    fontSize: 10,
    fontFamily: FONTS.medium,
    fontWeight: FONT_WEIGHTS.medium,
    lineHeight: 14,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
};

// Helper function to get font style
export const getFontStyle = (variant = 'body', customProps = {}) => {
  const baseStyle = TYPOGRAPHY[variant] || TYPOGRAPHY.body;
  return {
    ...baseStyle,
    ...customProps,
  };
};

// Helper function to create text style with custom font
export const createTextStyle = (fontSize, fontWeight = 'regular', customProps = {}) => {
  let fontFamily = FONTS.regular;
  
  // Map font weights to font families
  switch (fontWeight) {
    case 'light':
    case '300':
      fontFamily = FONTS.light;
      break;
    case 'regular':
    case '400':
      fontFamily = FONTS.regular;
      break;
    case 'medium':
    case '500':
    case 'semiBold':
    case '600':
      fontFamily = FONTS.medium;
      break;
    case 'bold':
    case '700':
    case 'extraBold':
    case '800':
    case 'black':
    case '900':
      fontFamily = FONTS.bold;
      break;
    default:
      fontFamily = FONTS.regular;
  }
  
  return {
    fontSize,
    fontFamily,
    ...customProps,
  };
};
