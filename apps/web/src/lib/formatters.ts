/**
 * Format earnings values for display
 * - Values < 1000: Show 2 decimal places (no K approximation)
 * - Values >= 1000: Use K notation
 */
export const formatEarnings = (value: number): string => {
  if (value >= 100000) {
    return `${Math.round(value / 1000)}k`;
  } else if (value >= 10000) {
    return `${(value / 1000).toFixed(1)}k`;
  } else if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}k`;
  }
  // For values less than 1000, show 2 decimal places
  return value.toFixed(2);
};

/**
 * Format lifetime values for display
 * - Values < 1000: Show 2 decimal places (no K approximation)
 * - Values >= 1000: Use K notation
 */
export const formatLifetime = (value: number): string => {
  if (value >= 100000) {
    return `${(value / 1000).toFixed(2)}k`;
  } else if (value >= 10000) {
    return `${(value / 1000).toFixed(2)}k`;
  } else if (value >= 1000) {
    return `${(value / 1000).toFixed(2)}k`;
  }
  // For values less than 1000, show 2 decimal places
  return value.toFixed(2);
};

/**
 * Format number with thousand separators (commas)
 * Example: 1000 -> "1,000", 1000000 -> "1,000,000"
 */
export const formatNumber = (value: number | string, decimals: number = 0): string => {
  const numValue = typeof value === 'string' ? parseFloat(value) || 0 : value;
  
  if (isNaN(numValue)) return '0';
  
  return numValue.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
};

/**
 * Parse formatted number string back to numeric value
 * Removes commas and other formatting
 */
export const parseFormattedNumber = (value: string): string => {
  return value.replace(/,/g, '');
};

