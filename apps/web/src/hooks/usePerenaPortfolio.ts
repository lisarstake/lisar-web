import { useState, useEffect, useCallback } from "react";
import { perenaService } from "@/services";
import type { PortfolioData } from "@/services/perena/types";

export function usePerenaPortfolio(walletAddress: string | null) {
  const [data, setData] = useState<PortfolioData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPortfolio = useCallback(async () => {
    if (!walletAddress) {
      setData(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await perenaService.getPortfolio({ wallet: walletAddress });
      if (result.success) {
        setData(result.data);
      } else {
        setData(null);
        setError(result.error || "Failed to fetch portfolio");
      }
    } catch (err: unknown) {
      setData(null);
      setError(err instanceof Error ? err.message : "Failed to fetch portfolio");
    } finally {
      setIsLoading(false);
    }
  }, [walletAddress]);

  useEffect(() => {
    fetchPortfolio();
  }, [fetchPortfolio]);

  return { data, isLoading, error, refetch: fetchPortfolio };
}
