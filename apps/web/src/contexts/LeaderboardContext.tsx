import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from "react";
import { leaderboardService } from "@/services";
import { useAuth } from "./AuthContext";
import type {
  EarnerEntry,
  EarnerLeaderboardData,
} from "@/services/leaderboard";

type Period = "Daily" | "Weekly" | "Monthly";

interface LeaderboardContextType {
  entries: EarnerEntry[];
  pagination: EarnerLeaderboardData["pagination"] | null;
  selectedPeriod: Period;
  isLoading: boolean;
  error: string | null;
  setPeriod: (p: Period) => void;
  refetch: () => Promise<void>;
}

const LeaderboardContext = createContext<LeaderboardContextType | undefined>(
  undefined
);

interface LeaderboardProviderProps {
  children: ReactNode;
}

export const LeaderboardProvider: React.FC<LeaderboardProviderProps> = ({
  children,
}) => {
  const { state } = useAuth();
  const [entries, setEntries] = useState<EarnerEntry[]>([]);
  const [pagination, setPagination] = useState<
    EarnerLeaderboardData["pagination"] | null
  >(null);
  const [selectedPeriod, setSelectedPeriod] = useState<Period>("Weekly");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [limit] = useState<number>(50);
  const [offset] = useState<number>(0);

  const apiTimePeriod = useMemo(
    () => selectedPeriod.toLowerCase() as "daily" | "weekly" | "monthly",
    [selectedPeriod]
  );

  const fetchLeaderboard = async () => {
    if (
      !state.isAuthenticated ||
      state.isLoading ||
      !state.session?.access_token
    ) {
      setEntries([]);
      setPagination(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const response = await leaderboardService.getEarnerLeaderboard({
        limit,
        offset,
        orderBy: "lifetimeReward",
        orderDirection: "desc",
        timePeriod: apiTimePeriod,
      });
      if (response.success && response.data) {
        setEntries(response.data.earners || []);
        setPagination(response.data.pagination || null);
      } else {
        setEntries([]);
        setPagination(null);
        setError(response.message || "Failed to load leaderboard");
      }
    } catch (err: any) {
      setEntries([]);
      setPagination(null);
      setError("Failed to load leaderboard");
    } finally {
      setIsLoading(false);
    }
  };

  const refetch = async () => {
    await fetchLeaderboard();
  };

  useEffect(() => {
    if (
      !state.isLoading &&
      state.isAuthenticated &&
      state.session?.access_token
    ) {
      fetchLeaderboard();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    apiTimePeriod,
    state.isAuthenticated,
    state.isLoading,
    state.session?.access_token,
  ]);

  const setPeriod = (p: Period) => {
    setSelectedPeriod(p);
  };

  const value: LeaderboardContextType = {
    entries,
    pagination,
    selectedPeriod,
    isLoading,
    error,
    setPeriod,
    refetch,
  };

  return (
    <LeaderboardContext.Provider value={value}>
      {children}
    </LeaderboardContext.Provider>
  );
};

export const useLeaderboard = (): LeaderboardContextType => {
  const ctx = useContext(LeaderboardContext);
  if (!ctx)
    throw new Error("useLeaderboard must be used within a LeaderboardProvider");
  return ctx;
};
