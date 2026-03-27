import { useEffect, useMemo, useState } from "react";
import { useWallet } from "@/contexts/WalletContext";
import { useDelegation } from "@/contexts/DelegationContext";
import { useOrchestrators } from "@/contexts/OrchestratorContext";
import { delegationService } from "@/services";

interface StablesApy {
  maple: number | null;
  perena: number | null;
  /** APY of the user's active vest (orchestrator they are delegated to). Null if not vested. */
  growth: number | null;
  isLoading: boolean;
}

/**
 * Hook to get cached APY values from WalletContext
 * Values are cached and persist across navigation
 * Growth APY comes from the orchestrator the user is vested to
 */
export const useStablesApy = (): StablesApy => {
  const { mapleApy, perenaApy, apyLoading, loadApys } = useWallet();
  const { userDelegation } = useDelegation();
  const { orchestrators } = useOrchestrators();
  const [delegatedGrowthApy, setDelegatedGrowthApy] = useState<number | null>(
    null,
  );
  const [delegatedGrowthApyLoading, setDelegatedGrowthApyLoading] =
    useState(false);
  useEffect(() => {
    loadApys();
  }, [loadApys]);

  const delegateId = userDelegation?.delegate?.id?.toLowerCase() || "";

  const contextGrowthApy = useMemo(() => {
    if (!delegateId) {
      return null;
    }

    const orchestrator = orchestrators.find(
      (orch) => orch.address?.toLowerCase() === delegateId,
    );
    if (!orchestrator?.apy) return null;

    const apyValue = orchestrator.apy;
    const parsed =
      typeof apyValue === "string"
        ? parseFloat(apyValue.replace("%", "")) || 0
        : typeof apyValue === "number"
          ? apyValue
          : 0;
    return parsed / 100;
  }, [delegateId, orchestrators]);

  useEffect(() => {
    let cancelled = false;

    const fetchDelegatedOrchestratorApy = async () => {
      if (!delegateId) {
        setDelegatedGrowthApy(null);
        setDelegatedGrowthApyLoading(false);
        return;
      }

      if (contextGrowthApy !== null) {
        setDelegatedGrowthApy(contextGrowthApy);
        setDelegatedGrowthApyLoading(false);
        return;
      }

      setDelegatedGrowthApyLoading(true);

      try {
        const candidateQueries = [
          { page: 1, limit: 200 },
          { page: 1, limit: 200, active: true },
        ] as const;

        let matchedApy: number | null = null;

        for (const query of candidateQueries) {
          const response = await delegationService.getOrchestrators(query);
          if (!response.success || !Array.isArray(response.data)) {
            continue;
          }

          const matchedOrchestrator = response.data.find(
            (orchestrator) =>
              orchestrator.address?.toLowerCase() === delegateId,
          );

          if (!matchedOrchestrator?.apy) continue;

          const parsed =
            typeof matchedOrchestrator.apy === "string"
              ? parseFloat(matchedOrchestrator.apy.replace("%", "")) || 0
              : typeof matchedOrchestrator.apy === "number"
                ? matchedOrchestrator.apy
                : 0;

          matchedApy = parsed / 100;
          break;
        }

        if (!cancelled) {
          setDelegatedGrowthApy(matchedApy);
        }
      } catch {
        if (!cancelled) {
          setDelegatedGrowthApy(null);
        }
      } finally {
        if (!cancelled) {
          setDelegatedGrowthApyLoading(false);
        }
      }
    };

    void fetchDelegatedOrchestratorApy();

    return () => {
      cancelled = true;
    };
  }, [contextGrowthApy, delegateId]);

  const growthApy = contextGrowthApy ?? delegatedGrowthApy;

  return {
    maple: mapleApy,
    perena: perenaApy,
    growth: growthApy,
    isLoading: apyLoading || delegatedGrowthApyLoading,
  };
};
