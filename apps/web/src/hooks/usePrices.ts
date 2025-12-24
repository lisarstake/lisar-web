import { useState, useEffect, useCallback } from 'react';
import { priceService, type PriceData } from '@/lib/priceService';

interface UsePricesReturn {
  prices: PriceData;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Custom hook for managing cryptocurrency prices
 * Handles loading states, error handling, and automatic refresh
 */
export const usePrices = (refreshInterval: number = 30000): UsePricesReturn => {
  const [prices, setPrices] = useState<PriceData>({
    sol: 0,
    lpt: 0,
    usdc: 1,
    ngn: 1500,
    eur: 0.85,
    gbp: 0.75,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPrices = useCallback(async () => {
    try {
      setError(null);
      const priceData = await priceService.getPrices();
      setPrices(priceData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch prices');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Initial fetch
    fetchPrices();

    // Set up interval for automatic refresh
    const interval = setInterval(fetchPrices, refreshInterval);

    return () => clearInterval(interval);
  }, [fetchPrices, refreshInterval]);

  return {
    prices,
    loading,
    error,
    refetch: fetchPrices,
  };
};
