import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { pointsService } from "@/services/points";
import type { PointsBalanceData, PointsPartner, PointsHistoryEntry, PointsRedemptionRecord } from "@/services/points/types";
import { useAuth } from "@/contexts/AuthContext";

const sortByCreatedDesc = <T extends { created_at: string }>(items: T[]) =>
  [...items].sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );

interface PointsContextValue {
  balance: PointsBalanceData | null;
  partners: PointsPartner[];
  loading: boolean;
  refetch: () => Promise<void>;
  pointsHistory: PointsHistoryEntry[];
  pointsRedemptions: PointsRedemptionRecord[];
  historyLoading: boolean;
  historyLoadError: string | null;
  redemptionsLoadError: string | null;
  loadHistoryData: () => Promise<void>;
}

const PointsContext = createContext<PointsContextValue | undefined>(undefined);

export const PointsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const {
    state: { isAuthenticated, isLoading: authLoading },
  } = useAuth();
  const [balance, setBalance] = useState<PointsBalanceData | null>(null);
  const [partners, setPartners] = useState<PointsPartner[]>([]);
  const [loading, setLoading] = useState(true);

  const [pointsHistory, setPointsHistory] = useState<PointsHistoryEntry[]>([]);
  const [pointsRedemptions, setPointsRedemptions] = useState<PointsRedemptionRecord[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyLoadError, setHistoryLoadError] = useState<string | null>(null);
  const [redemptionsLoadError, setRedemptionsLoadError] = useState<string | null>(null);

  const loadPointsData = useCallback(async () => {
    setLoading(true);
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

  const loadHistoryData = useCallback(async () => {
    setHistoryLoading(true);
    setHistoryLoadError(null);
    setRedemptionsLoadError(null);

    const [histRes, redRes] = await Promise.all([
      pointsService.getHistory(),
      pointsService.getRedemptions(),
    ]);

    if (histRes.success) {
      const arr = Array.isArray(histRes.data) ? histRes.data : [];
      setPointsHistory(sortByCreatedDesc(arr));
    } else {
      setPointsHistory([]);
      setHistoryLoadError(
        histRes.error || histRes.message || "Could not load points history",
      );
    }

    if (redRes.success) {
      const arr = Array.isArray(redRes.data) ? redRes.data : [];
      setPointsRedemptions(sortByCreatedDesc(arr));
    } else {
      setPointsRedemptions([]);
      setRedemptionsLoadError(
        redRes.error || redRes.message || "Could not load redemptions",
      );
    }

    setHistoryLoading(false);
  }, []);

  useEffect(() => {
    if (authLoading) return;

    if (!isAuthenticated) {
      setBalance(null);
      setPartners([]);
      setPointsHistory([]);
      setPointsRedemptions([]);
      setLoading(false);
      setHistoryLoading(false);
      return;
    }

    void loadPointsData();
    void loadHistoryData();
  }, [authLoading, isAuthenticated, loadPointsData, loadHistoryData]);

  // Refresh points data when referral code is applied
  useEffect(() => {
    const handleRefresh = () => {
      void Promise.all([loadPointsData(), loadHistoryData()]);
    };
    window.addEventListener("points:refresh", handleRefresh);
    return () => window.removeEventListener("points:refresh", handleRefresh);
  }, [loadPointsData, loadHistoryData]);

  return (
    <PointsContext.Provider
      value={{
        balance,
        partners,
        loading,
        refetch: loadPointsData,
        pointsHistory,
        pointsRedemptions,
        historyLoading,
        historyLoadError,
        redemptionsLoadError,
        loadHistoryData,
      }}
    >
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
