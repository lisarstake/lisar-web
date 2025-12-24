/**
 * useEnsIdentity Hook
 * Custom hook to fetch ENS identity for an orchestrator
 */

import { useState, useEffect } from "react";
import { EnsIdentity, ensService } from "@/services";

export const useEnsIdentity = (addressOrEns: string | undefined) => {
  const [identity, setIdentity] = useState<EnsIdentity | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!addressOrEns) {
      setIdentity(null);
      return;
    }

    const fetchIdentity = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await ensService.getEnsIdentity(addressOrEns);
        if (response.success && response.data) {
          setIdentity(response.data);
        } else {
          setIdentity(null); // Don't create default identity
          setError(response.message || "Failed to fetch ENS identity");
        }
      } catch (err: any) {
        setIdentity(null); // Don't create default identity
        setError(err?.message || "Failed to fetch ENS identity");
      } finally {
        setIsLoading(false);
      }
    };

    fetchIdentity();
  }, [addressOrEns]);

  return { identity, isLoading, error };
};

