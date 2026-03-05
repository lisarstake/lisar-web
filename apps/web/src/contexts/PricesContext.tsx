import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  ReactNode,
} from "react";
import { priceService, type PriceData } from "@/lib/priceService";
import { useAuth } from "@/contexts/AuthContext";

const FALLBACK: PriceData = {
  sol: 140,
  lpt: 5,
  usdc: 1,
  ngn: 1450,
  eur: 0.85,
  gbp: 0.75,
};

type PricesContextValue = {
  prices: PriceData;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
};

const PricesContext = createContext<PricesContextValue | undefined>(undefined);

const PRICE_REFRESH_MS = 30 * 60 * 1000; 

export const PricesProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [prices, setPrices] = useState<PriceData>(FALLBACK);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const prevAuthenticated = useRef<boolean | null>(null);

  const fetchPrices = useCallback(async () => {
    try {
      setError(null);
      const priceData = await priceService.getPrices();
      setPrices(priceData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch prices");
    } finally {
      setLoading(false);
    }
  }, []);

  const { state } = useAuth();

  useEffect(() => {
    const nowAuth = state.isAuthenticated === true;
    if (prevAuthenticated.current === false && nowAuth) {
      fetchPrices();
    }
    prevAuthenticated.current = nowAuth;
  }, [state.isAuthenticated, fetchPrices]);

  useEffect(() => {
    fetchPrices();
    const interval = setInterval(fetchPrices, PRICE_REFRESH_MS);
    return () => clearInterval(interval);
  }, [fetchPrices]);

  const value: PricesContextValue = {
    prices,
    loading,
    error,
    refetch: fetchPrices,
  };

  return (
    <PricesContext.Provider value={value}>{children}</PricesContext.Provider>
  );
};

export const usePricesContext = (): PricesContextValue => {
  const ctx = useContext(PricesContext);
  if (ctx === undefined) {
    throw new Error("usePricesContext must be used within PricesProvider");
  }
  return ctx;
};
