/**
 * Onramp utility functions and constants
 */

/**
 * Currency to FiatType mapping for Onramp SDK
 * FiatType values are based on Onramp.money API
 */
export const CURRENCY_TO_FIATTYPE: Record<string, number> = {
  NGN: 6,   // Nigerian Naira
  USD: 1,   // US Dollar
  EUR: 2,   // Euro
  GBP: 3,   // British Pound
};

/**
 * Get fiat type for a currency code
 * Defaults to NGN (6) if currency not found
 */
export const getFiatType = (currency: string): number => {
  return CURRENCY_TO_FIATTYPE[currency.toUpperCase()] || 6;
};

