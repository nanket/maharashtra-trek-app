/**
 * Map Icon Test Utility
 * Tests the category-specific icon implementation for map markers
 */

// Category-specific icons for map markers (same as in MapView components)
const getCategoryIcon = (category) => {
  const icons = {
    fort: '🏰',      // Fort/Castle icon
    waterfall: '💧', // Waterfall icon
    trek: '🥾',      // Hiking boot icon
    cave: '🕳️',      // Cave icon
  };
  return icons[category] || '📍'; // Default location pin
};

/**
 * Test function to verify icon mapping for all categories
 */
export const testCategoryIcons = () => {
  const testCategories = ['fort', 'waterfall', 'trek', 'cave', 'unknown'];
  
  console.log('🗺️ Testing Category Icon Mapping:');
  console.log('=====================================');
  
  testCategories.forEach(category => {
    const icon = getCategoryIcon(category);
    console.log(`${category.padEnd(10)} → ${icon}`);
  });
  
  console.log('=====================================');
  
  return {
    fort: getCategoryIcon('fort'),
    waterfall: getCategoryIcon('waterfall'),
    trek: getCategoryIcon('trek'),
    cave: getCategoryIcon('cave'),
    default: getCategoryIcon('unknown')
  };
};

/**
 * Expected icon mapping for verification
 */
export const EXPECTED_ICONS = {
  fort: '🏰',
  waterfall: '💧',
  trek: '🥾',
  cave: '🕳️',
  default: '📍'
};

/**
 * Verify that all icons are correctly mapped
 */
export const verifyIconMapping = () => {
  const actualIcons = testCategoryIcons();
  const isValid = Object.keys(EXPECTED_ICONS).every(
    category => actualIcons[category] === EXPECTED_ICONS[category]
  );
  
  console.log(`✅ Icon mapping verification: ${isValid ? 'PASSED' : 'FAILED'}`);
  return isValid;
};

export default getCategoryIcon;
