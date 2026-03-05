import { usePricesContext } from "@/contexts/PricesContext";

/**
 * Single source of truth for prices. Reads from PricesProvider so the app
 * makes only one request to CoinGecko per refresh (2 min), avoiding 429.
 */
export const usePrices = () => {
  return usePricesContext();
};
