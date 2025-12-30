import { useEffect } from "react";
import { useWallet } from "@/contexts/WalletContext";

interface StablesApy {
  maple: number | null;
  perena: number | null;
  isLoading: boolean;
}

/**
 * Hook to get cached APY values from WalletContext
 * Values are cached and persist across navigation
 */
export const useStablesApy = (): StablesApy => {
  const { mapleApy, perenaApy, apyLoading, loadApys } = useWallet();

  // Ensure APYs are loaded when hook is used
  useEffect(() => {
    loadApys();
  }, [loadApys]);

  return {
    maple: mapleApy,
    perena: perenaApy,
    isLoading: apyLoading,
  };
};
