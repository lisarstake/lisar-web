import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from "react";
import { useWallet } from "./WalletContext";
import { useDelegation } from "./DelegationContext";
import { usePrices } from "@/hooks/usePrices";
import { useStablesApy } from "@/hooks/useStablesApy";
import { usePerenaPortfolio } from "@/hooks/usePerenaPortfolio";
import { usePerenaWeeklyYield } from "@/hooks/usePerenaWeeklyYield";

export interface WalletCardData {
  type: "savings" | "staking";
  title: string;
  balance: number;
  displayBalanceValue: number;
  projectedInterestUsd: number;
  projectedInterestNgn: number;
  apyPercent: string;
  isLoading: boolean;
}

interface WalletCardContextValue {
  cardData: WalletCardData[];
  displayCurrency: "USD" | "NGN";
  setDisplayCurrency: (c: "USD" | "NGN") => void;
  showBalance: boolean;
  setShowBalance: (v: boolean) => void;
  displayFiatSymbol: string;
}

const WalletCardContext = createContext<WalletCardContextValue | undefined>(
  undefined,
);

export const WalletCardProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [displayCurrency, setDisplayCurrency] = useState<"USD" | "NGN">("USD");
  const [showBalance, setShowBalance] = useState(() => {
    const saved = localStorage.getItem("wallet_show_balance");
    return saved ? JSON.parse(saved) : false;
  });

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "wallet_show_balance" && e.newValue) {
        setShowBalance(JSON.parse(e.newValue));
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const {
    stablesBalance,
    highyieldBalance,
    solanaWalletAddress,
    stablesLoading,
    highyieldLoading,
  } = useWallet();
  const { delegatorStakeProfile, isLoading: delegationLoading } =
    useDelegation();
  const { prices } = usePrices();
  const {
    perena: perenaApy,
    growth: growthApy,
    isLoading: apyLoading,
  } = useStablesApy();
  const { data: perenaPortfolio } = usePerenaPortfolio(solanaWalletAddress);
  const { data: perenaWeeklyYield, isLoading: weeklyYieldLoading } =
    usePerenaWeeklyYield(solanaWalletAddress);

  useEffect(() => {
    localStorage.setItem("wallet_display_currency", displayCurrency);
  }, [displayCurrency]);

  useEffect(() => {
    localStorage.setItem("wallet_show_balance", JSON.stringify(showBalance));
  }, [showBalance]);

  const savingsBalance = stablesBalance ?? 0;
  const stakingBalance = useMemo(() => {
    return delegatorStakeProfile
      ? parseFloat(delegatorStakeProfile.currentStake || "0")
      : 0;
  }, [delegatorStakeProfile]);

  const cardData = useMemo<WalletCardData[]>(() => {
    const savingsDisplayValue =
      displayCurrency === "NGN"
        ? savingsBalance * (prices.ngn || 0)
        : savingsBalance;
    const savingsInterestUsd =
      perenaWeeklyYield?.yieldAmount ??
      perenaPortfolio?.earnings ??
      savingsBalance * (perenaApy ?? 0.14) * (7 / 365);
    const savingsInterestNgn = savingsInterestUsd * (prices.ngn || 0);

    const stakingUsdValue = stakingBalance * (prices.lpt || 0);
    const stakingDisplayValue =
      displayCurrency === "NGN"
        ? stakingUsdValue * (prices.ngn || 0)
        : stakingUsdValue;
    const stakingInterestUsd = stakingUsdValue * (growthApy ?? 0.6) * (7 / 365);
    const stakingInterestNgn = stakingInterestUsd * (prices.ngn || 0);

    return [
      {
        type: "savings",
        title: "Savings",
        balance: savingsBalance,
        displayBalanceValue: savingsDisplayValue,
        projectedInterestUsd: savingsInterestUsd,
        projectedInterestNgn: savingsInterestNgn,
        apyPercent:
          apyLoading && perenaApy === null
            ? ".."
            : perenaApy
              ? (perenaApy * 100).toFixed(1)
              : "14",
        isLoading: stablesLoading,
      },
      {
        type: "staking",
        title: "Growth",
        balance: stakingBalance,
        displayBalanceValue: stakingDisplayValue,
        projectedInterestUsd: stakingInterestUsd,
        projectedInterestNgn: stakingInterestNgn,
        apyPercent: growthApy !== null ? (growthApy * 100).toFixed(1) : "..",
        isLoading: highyieldLoading || delegationLoading,
      },
    ];
  }, [
    savingsBalance,
    stakingBalance,
    displayCurrency,
    prices,
    perenaApy,
    growthApy,
    perenaPortfolio?.earnings,
    perenaWeeklyYield?.yieldAmount,
    apyLoading,
    stablesLoading,
    highyieldLoading,
    delegationLoading,
    weeklyYieldLoading,
  ]);

  const displayFiatSymbol = displayCurrency === "NGN" ? "₦" : "$";

  const value = useMemo<WalletCardContextValue>(
    () => ({
      cardData,
      displayCurrency,
      setDisplayCurrency,
      showBalance,
      setShowBalance,
      displayFiatSymbol,
    }),
    [cardData, displayCurrency, showBalance, displayFiatSymbol],
  );

  return (
    <WalletCardContext.Provider value={value}>
      {children}
    </WalletCardContext.Provider>
  );
};

export const useWalletCard = (): WalletCardContextValue => {
  const ctx = useContext(WalletCardContext);
  if (!ctx)
    throw new Error("useWalletCard must be used within WalletCardProvider");
  return ctx;
};
