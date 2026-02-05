import { useEffect, useMemo } from "react";
import { useWallet } from "@/contexts/WalletContext";
import { useDelegation } from "@/contexts/DelegationContext";
import { useOrchestrators } from "@/contexts/OrchestratorContext";

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

  // Ensure APYs are loaded when hook is used
  useEffect(() => {
    loadApys();
  }, [loadApys]);

  const growthApy = useMemo(() => {
    if (!userDelegation?.delegate?.id || orchestrators.length === 0) {
      return null;
    }
    const delegateId = userDelegation.delegate.id;
    const orchestrator = orchestrators.find(
      (orch) => orch.address?.toLowerCase() === delegateId?.toLowerCase()
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
  }, [userDelegation, orchestrators]);

  return {
    maple: mapleApy,
    perena: perenaApy,
    growth: growthApy,
    isLoading: apyLoading,
  };
};
