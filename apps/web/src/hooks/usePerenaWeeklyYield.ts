import { useState, useEffect, useCallback } from "react";
import { perenaService } from "@/services";
import type { WeeklyYieldData } from "@/services/perena/types";

export function usePerenaWeeklyYield(walletAddress: string | null) {
  const [data, setData] = useState<WeeklyYieldData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWeeklyYield = useCallback(async () => {
    if (!walletAddress) {
      setData(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await perenaService.getWeeklyYield(walletAddress);
      if (result.success) {
        setData(result.data);
      } else {
        setData(null);
        setError(result.error || "Failed to fetch weekly yield");
      }
    } catch (err: unknown) {
      setData(null);
      setError(
        err instanceof Error ? err.message : "Failed to fetch weekly yield",
      );
    } finally {
      setIsLoading(false);
    }
  }, [walletAddress]);

  useEffect(() => {
    fetchWeeklyYield();
  }, [fetchWeeklyYield]);

  return { data, isLoading, error, refetch: fetchWeeklyYield };
}
