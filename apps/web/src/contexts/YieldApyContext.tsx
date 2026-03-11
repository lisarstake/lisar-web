import React, { createContext, useContext, useMemo } from "react";
import { useStablesApy } from "@/hooks/useStablesApy";
import { useOrchestrators } from "@/contexts/OrchestratorContext";

type YieldApyContextValue = {
  stablesApyPercent: number | null;
  stakingApyPercent: number | null;
  isLoading: boolean;
};

const YieldApyContext = createContext<YieldApyContextValue | null>(null);

export const YieldApyProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { perena: perenaApy, isLoading: apyLoading } = useStablesApy();
  const { orchestrators } = useOrchestrators();

  const stablesApyPercent = useMemo(() => {
    if (!perenaApy) return null;
    return Math.max(0, perenaApy * 100);
  }, [perenaApy]);

  const stakingApyPercent = useMemo(() => {
    if (!orchestrators?.length) return null;
    const maxApy = orchestrators.reduce((acc, orch) => {
      const value =
        typeof orch.apy === "string"
          ? parseFloat(orch.apy.replace("%", "")) || 0
          : typeof orch.apy === "number"
            ? orch.apy
            : 0;
      return Math.max(acc, value);
    }, 0);
    return maxApy > 0 ? maxApy : null;
  }, [orchestrators]);

  const value = useMemo(
    () => ({
      stablesApyPercent,
      stakingApyPercent,
      isLoading: apyLoading,
    }),
    [stablesApyPercent, stakingApyPercent, apyLoading],
  );

  return (
    <YieldApyContext.Provider value={value}>
      {children}
    </YieldApyContext.Provider>
  );
};

export const useYieldApy = () => {
  const context = useContext(YieldApyContext);
  if (!context) {
    throw new Error("useYieldApy must be used within YieldApyProvider");
  }
  return context;
};
