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
  } else if (value >= 100) {
    return value.toFixed(2);
  } else if (value >= 10) {
    return value.toFixed(3);
  } else if (value >= 1) {
    return value.toFixed(3);
  }
  const fourDecimals = value.toFixed(4);
  const decimalPart = fourDecimals.split('.')[1];
  const thirdDecimal = decimalPart && decimalPart.length >= 3 ? decimalPart[2] : '0';
  const fourthDecimal = decimalPart && decimalPart.length >= 4 ? decimalPart[3] : '0';
  
  if (thirdDecimal === '0' && fourthDecimal === '0') {
    return value.toFixed(2);
  }
  
  const result = parseFloat(fourDecimals).toString();
  if (!result.includes('.')) {
    return result;
  }
  
  const [intPart, decPart] = result.split('.');
  if (decPart && decPart.length === 1 && parseFloat(decPart) === 0) {
    return value.toFixed(2);
  }
  
  return result;
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
  } else if (value >= 100) {
    return value.toFixed(2);
  } else if (value >= 10) {
    return value.toFixed(3);
  } else if (value >= 1) {
    return value.toFixed(3);
  }
  const fourDecimals = value.toFixed(4);
  const decimalPart = fourDecimals.split('.')[1];
  const thirdDecimal = decimalPart && decimalPart.length >= 3 ? decimalPart[2] : '0';
  const fourthDecimal = decimalPart && decimalPart.length >= 4 ? decimalPart[3] : '0';
  
  if (thirdDecimal === '0' && fourthDecimal === '0') {
    return value.toFixed(2);
  }
  
  const result = parseFloat(fourDecimals).toString();
  if (!result.includes('.')) {
    return result;
  }
  
  const [intPart, decPart] = result.split('.');
  if (decPart && decPart.length === 1 && parseFloat(decPart) === 0) {
    return value.toFixed(2);
  }
  
  return result;
};

/**
 * Format number with thousand separators (commas)
 * Example: 1000 -> "1,000", 1000000 -> "1,000,000"
 */
export const formatNumber = (value: number | string, decimals: number = 0): string => {
  if (typeof value === 'string') {
    if (value === '' || value === '.') return value;
    
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return '0';
    
    if (value.includes('.')) {
      const [intPart, decPart] = value.split('.');
      if (decPart !== undefined && (decPart === '' || /^0*$/.test(decPart) || value.length <= 15)) {
        return value;
      }
    }
    
    return numValue.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: decimals > 0 ? decimals : 10,
    });
  }
  
  if (isNaN(value)) return '0';
  
  return value.toLocaleString('en-US', {
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

/**
 * Format fiat currency values for display
 * Always shows 2 decimal places with thousand separators
 * Example: 1234.5 -> "1,234.50", 1000000.99 -> "1,000,000.99"
 */
export const formatFiat = (value: number): string => {
  if (isNaN(value)) return '0.00';
  
  return value.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};


