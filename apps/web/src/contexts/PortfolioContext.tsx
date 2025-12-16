import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  ReactNode,
} from "react";
import { useDelegation } from "./DelegationContext";
import { useOrchestrators } from "./OrchestratorContext";
import { useWallet } from "./WalletContext";
import { walletService, mapleService } from "@/services";
import { getEarliestUnbondingTime } from "@/lib/unbondingTime";
import { DelegatorTransaction } from "@/services/delegation/types";

export type PortfolioMode = "staking" | "savings";

export interface StakeEntry {
  id: string;
  name: string;
  yourStake: number;
  apy: number;
  fee: number;
  orchestrator?: any;
  isSavings?: boolean;
}

export interface PortfolioSummary {
  totalStake: number;
  currentStake: number;
  lifetimeRewards: number;
  lifetimeUnbonded: number;
  dailyEarnings: number;
  weeklyEarnings: number;
  monthlyEarnings: number;
  averageApy: number;
}

export interface UnbondingInfo {
  pending: {
    count: number;
    totalAmount: number;
    timeRemaining: string | null;
  };
  completed: {
    count: number;
    totalAmount: number;
    validatorId: string | null;
  };
}

interface PortfolioContextValue {
  mode: PortfolioMode;
  setMode: (mode: PortfolioMode) => void;
  summary: PortfolioSummary | null;
  stakeEntries: StakeEntry[];
  unbonding: UnbondingInfo;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

const PortfolioContext = createContext<PortfolioContextValue | undefined>(
  undefined
);

interface PortfolioProviderProps {
  children: ReactNode;
}

export const PortfolioProvider: React.FC<PortfolioProviderProps> = ({
  children,
}) => {
  const [mode, setMode] = useState<PortfolioMode>("staking");
  const [savingsEntries, setSavingsEntries] = useState<StakeEntry[]>([]);
  const [savingsLoading, setSavingsLoading] = useState(false);
  const [hasFetchedSavings, setHasFetchedSavings] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { orchestrators } = useOrchestrators();
  const {
    userDelegation,
    delegatorTransactions,
    delegatorStakeProfile,
    isLoading: delegationLoading,
  } = useDelegation();
  const { solanaBalance, loadSolanaBalance, solanaLoading } = useWallet();

  const lptStakeEntries: StakeEntry[] = useMemo(() => {
    const entries: StakeEntry[] = [];

    if (userDelegation) {
      const bondedAmount = parseFloat(userDelegation.bondedAmount) || 0;
      const delegateId = userDelegation.delegate?.id || "";

      const orchestrator =
        orchestrators.length > 0
          ? orchestrators.find((orch) => orch.address === delegateId)
          : null;

      const orchestratorName =
        orchestrator?.ensIdentity?.name ||
        orchestrator?.ensName ||
        userDelegation.delegate?.id ||
        "Unknown Orchestrator";

      let apyPercentage = 0;
      if (orchestrator?.apy) {
        const apyValue = orchestrator.apy;
        if (typeof apyValue === "string") {
          apyPercentage = parseFloat(apyValue.replace("%", "")) || 0;
        } else {
          apyPercentage = typeof apyValue === "number" ? apyValue : 0;
        }
      }

      const rewardCutPercentage = orchestrator?.reward
        ? parseFloat(orchestrator.reward) / 10000
        : 0;

      if (delegateId) {
        entries.push({
          id: delegateId,
          name: orchestratorName,
          yourStake: bondedAmount,
          apy: apyPercentage / 100,
          fee: rewardCutPercentage,
          orchestrator: orchestrator || null,
          isSavings: false,
        });
      }
    }

    return entries;
  }, [userDelegation, orchestrators]);

  useEffect(() => {
    if (mode === "savings" && solanaBalance === null && !solanaLoading) {
      loadSolanaBalance();
    }
  }, [mode, solanaBalance, solanaLoading, loadSolanaBalance]);

  useEffect(() => {
    if (mode !== "savings") {
      return;
    }

    if (hasFetchedSavings) {
      return;
    }

    const fetchSavingsPositions = async () => {
      setSavingsLoading(true);
      setError(null);
      const entries: StakeEntry[] = [];

      try {
        const maplePoolId =
          "0x356B8d89c1e1239Cbbb9dE4815c39A1474d5BA7D".toLowerCase();

        const ethWalletResp = await walletService.getPrimaryWallet("ethereum");
        if (ethWalletResp.success && ethWalletResp.wallet) {
          const ethAddress = ethWalletResp.wallet.wallet_address;
          const mapleResp = await mapleService.getPositions(
            ethAddress,
            maplePoolId
          );

          if (
            mapleResp.success &&
            mapleResp.data &&
            mapleResp.data.hasPositions &&
            mapleResp.data.positions &&
            mapleResp.data.positions.length > 0
          ) {
            const totalAvailable = mapleResp.data.positions.reduce(
              (sum, position) => {
                const value = parseFloat(position.availableBalance || "0");
                return sum + (isNaN(value) ? 0 : value);
              },
              0
            );

            if (totalAvailable > 0) {
              entries.push({
                id: `maple-${maplePoolId}`,
                name: "Maple",
                yourStake: totalAvailable,
                apy: 0.25,
                fee: 0.01,
                isSavings: true,
              });
            }
          }
        }

        const solWalletResp = await walletService.getPrimaryWallet("solana");
        if (solWalletResp.success && solWalletResp.wallet) {
          const solBalanceResp = await walletService.getSolanaBalance(
            solWalletResp.wallet.wallet_address
          );

          if (
            solBalanceResp.success &&
            solBalanceResp.balances &&
            solBalanceResp.balances["usd*"]
          ) {
            const usdStar = solBalanceResp.balances["usd*"];
            const perenaAmount = parseFloat(usdStar.balance || "0");

            if (!isNaN(perenaAmount) && perenaAmount > 0) {
              entries.push({
                id: "perena-usd*",
                name: "Perena",
                yourStake: perenaAmount,
                apy: 0.149,
                fee: 0.01,
                isSavings: true,
              });
            }
          }
        }
      } catch (err) {
        console.error("Failed to fetch savings positions:", err);
        setError("Failed to fetch savings positions");
      } finally {
        setSavingsEntries(entries);
        setHasFetchedSavings(true);
        setSavingsLoading(false);
      }
    };

    fetchSavingsPositions();
  }, [mode, hasFetchedSavings]);

  const stakeEntries: StakeEntry[] = useMemo(
    () => (mode === "savings" ? savingsEntries : lptStakeEntries),
    [mode, savingsEntries, lptStakeEntries]
  );

  const summary: PortfolioSummary | null = useMemo(() => {
    let totalStake = 0;
    let currentStake = 0;
    let lifetimeRewards = 0;
    let lifetimeUnbonded = 0;
    let dailyEarnings = 0;
    let weeklyEarnings = 0;
    let monthlyEarnings = 0;

    if (mode === "savings") {
      totalStake = solanaBalance || 0;
      currentStake = solanaBalance || 0;
      if (delegatorStakeProfile) {
        lifetimeRewards =
          parseFloat(delegatorStakeProfile.lifetimeRewards) || 0;
        lifetimeUnbonded =
          parseFloat(delegatorStakeProfile.lifetimeUnbonded) || 0;
      }
    } else {
      if (delegatorStakeProfile) {
        totalStake = parseFloat(delegatorStakeProfile.currentStake) || 0;
        currentStake = totalStake;
        lifetimeRewards =
          parseFloat(delegatorStakeProfile.lifetimeRewards) || 0;
        lifetimeUnbonded =
          parseFloat(delegatorStakeProfile.lifetimeUnbonded) || 0;
      }

      if (userDelegation) {
        const bondedAmount = parseFloat(userDelegation.bondedAmount) || 0;
        const delegateId = userDelegation.delegate?.id || "";

        const orchestrator =
          orchestrators.length > 0
            ? orchestrators.find((orch) => orch.address === delegateId)
            : null;

        let apyPercentage = 0;
        if (orchestrator?.apy) {
          const apyValue = orchestrator.apy;
          if (typeof apyValue === "string") {
            apyPercentage = parseFloat(apyValue.replace("%", "")) || 0;
          } else {
            apyPercentage = typeof apyValue === "number" ? apyValue : 0;
          }
        }

        const rewardCutPercentage = orchestrator?.reward
          ? parseFloat(orchestrator.reward) / 10000
          : 0;
        const rewardCutDecimal = rewardCutPercentage / 100;

        if (bondedAmount > 0 && apyPercentage > 0) {
          const grossDailyEarnings = (bondedAmount * apyPercentage) / (100 * 365);
          const grossWeeklyEarnings = grossDailyEarnings * 7;
          const grossMonthlyEarnings = grossDailyEarnings * 30;

          dailyEarnings = grossDailyEarnings * (1 - rewardCutDecimal);
          weeklyEarnings = grossWeeklyEarnings * (1 - rewardCutDecimal);
          monthlyEarnings = grossMonthlyEarnings * (1 - rewardCutDecimal);
        }
      }
    }

    const averageApy = mode === "savings" ? 14.9 : 68;

    return {
      totalStake,
      currentStake,
      lifetimeRewards,
      lifetimeUnbonded,
      dailyEarnings,
      weeklyEarnings,
      monthlyEarnings,
      averageApy,
    };
  }, [
    mode,
    solanaBalance,
    delegatorStakeProfile,
    userDelegation,
    orchestrators,
  ]);

  const unbonding: UnbondingInfo = useMemo(() => {
    if (!delegatorTransactions?.transactions) {
      return {
        pending: { count: 0, totalAmount: 0, timeRemaining: null },
        completed: { count: 0, totalAmount: 0, validatorId: null },
      };
    }

    const pending: DelegatorTransaction[] = [];
    const completed: DelegatorTransaction[] = [];

    delegatorTransactions.transactions.forEach((tx) => {
      if (tx.type === "unbond" && tx.status === "pending") {
        pending.push(tx);
      } else if (tx.type === "unbond" && tx.status === "completed") {
        completed.push(tx);
      }
    });

    const pendingTotal = pending.reduce((sum, tx) => {
      return sum + (parseFloat(tx.amount || "0") || 0);
    }, 0);

    const completedTotal = completed.reduce((sum, tx) => {
      return sum + (parseFloat(tx.amount || "0") || 0);
    }, 0);

    const earliestTime = getEarliestUnbondingTime(pending);
    const latestCompleted = completed.length > 0 ? completed[completed.length - 1] : null;

    return {
      pending: {
        count: pending.length,
        totalAmount: pendingTotal,
        timeRemaining: earliestTime,
      },
      completed: {
        count: completed.length,
        totalAmount: completedTotal,
        validatorId: latestCompleted?.delegate?.id || null,
      },
    };
  }, [delegatorTransactions]);

  const isLoading = useMemo(() => {
    if (mode === "savings") {
      return savingsLoading || (solanaLoading && solanaBalance === null);
    }
    return delegationLoading && !userDelegation && !delegatorStakeProfile;
  }, [mode, savingsLoading, solanaLoading, solanaBalance, delegationLoading, userDelegation, delegatorStakeProfile]);

  const refetch = async () => {
    if (mode === "savings") {
      setHasFetchedSavings(false);
      await loadSolanaBalance();
    }
  };

  const value = useMemo<PortfolioContextValue>(
    () => ({
      mode,
      setMode,
      summary,
      stakeEntries,
      unbonding,
      isLoading,
      error,
      refetch,
    }),
    [mode, summary, stakeEntries, unbonding, isLoading, error]
  );

  return (
    <PortfolioContext.Provider value={value}>{children}</PortfolioContext.Provider>
  );
};

export const usePortfolio = (): PortfolioContextValue => {
  const ctx = useContext(PortfolioContext);
  if (!ctx) throw new Error("usePortfolio must be used within PortfolioProvider");
  return ctx;
};

