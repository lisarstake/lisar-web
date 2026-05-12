import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { pointsService } from "@/services/points";
import type { PointsBalanceData, PointsPartner } from "@/services/points/types";

interface PointsContextValue {
  balance: PointsBalanceData | null;
  partners: PointsPartner[];
  loading: boolean;
  refetch: () => Promise<void>;
}

const PointsContext = createContext<PointsContextValue | undefined>(undefined);

export const PointsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [balance, setBalance] = useState<PointsBalanceData | null>(null);
  const [partners, setPartners] = useState<PointsPartner[]>([]);
  const [loading, setLoading] = useState(true);

  const loadPointsData = useCallback(async () => {
    const [balRes, partRes] = await Promise.all([
      pointsService.getBalance(),
      pointsService.getPartners(),
    ]);

    if (balRes.success && balRes.data) {
      setBalance(balRes.data);
    }

    if (partRes.success && partRes.data) {
      setPartners(partRes.data.filter((p) => p.is_active));
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    loadPointsData();
  }, [loadPointsData]);

  return (
    <PointsContext.Provider value={{ balance, partners, loading, refetch: loadPointsData }}>
      {children}
    </PointsContext.Provider>
  );
};

export const usePointsContext = (): PointsContextValue => {
  const ctx = useContext(PointsContext);
  if (ctx === undefined) {
    throw new Error("usePointsContext must be used within PointsProvider");
  }
  return ctx;
};
