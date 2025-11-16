import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
  ReactNode,
} from "react";
import {
  DashboardSummary,
  DashboardTransaction,
} from "@/services/dashboard/types";
import { dashboardService } from "@/services";

interface DashboardContextType {
  summary: DashboardSummary | null;
  transactions: DashboardTransaction[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

const DashboardContext = createContext<DashboardContextType | undefined>(
  undefined
);

interface DashboardProviderProps {
  children: ReactNode;
}

export const DashboardProvider: React.FC<DashboardProviderProps> = ({
  children,
}) => {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [transactions, setTransactions] = useState<DashboardTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch summary and transactions in parallel
      const [summaryResponse, transactionsResponse] = await Promise.all([
        dashboardService.getDashboardSummary(),
        dashboardService.getDashboardTransactions(15), // Default limit to 15
      ]);

      if (summaryResponse.success && summaryResponse.data) {
        setSummary(summaryResponse.data);
      } else {
        throw new Error(summaryResponse.message || "Failed to fetch dashboard summary");
      }

      if (transactionsResponse.success && transactionsResponse.data) {
        setTransactions(transactionsResponse.data);
      } else {
        // Don't throw error for transactions, just log it
        console.warn("Failed to fetch transactions:", transactionsResponse.message);
        setTransactions([]);
      }
    } catch (err: any) {
      setError(err?.message || "Failed to load dashboard data");
      console.warn("Dashboard fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Fetch dashboard data on mount
    fetchDashboardData();
  }, [fetchDashboardData]);

  const value = useMemo<DashboardContextType>(
    () => ({
      summary,
      transactions,
      isLoading,
      error,
      refetch: fetchDashboardData,
    }),
    [summary, transactions, isLoading, error, fetchDashboardData]
  );

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboard = (): DashboardContextType => {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error("useDashboard must be used within a DashboardProvider");
  }
  return context;
};

