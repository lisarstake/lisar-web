import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { walletService } from "@/services";
import { priceService } from "@/lib/priceService";
import { useAuth } from "@/contexts/AuthContext";

type WalletState = {
  balanceLpt: number;
  fiatCurrency: string; // e.g. USD, NGN
  fiatSymbol: string;   // e.g. $, ₦
  fiatValue: number;    // numeric value for formatting at render
  address?: string;
  walletId?: string;
};

type WalletContextValue = {
  wallet: WalletState | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
};

const WalletContext = createContext<WalletContextValue | undefined>(undefined);

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { state } = useAuth();
  const [wallet, setWallet] = useState<WalletState | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    if (!state.user?.wallet_id || !state.user?.wallet_address) {
      setWallet(null);
      return;
    }
    try {
      setIsLoading(true);
      setError(null);

      const balanceResp = await walletService.getBalance(state.user.wallet_address, "LPT");
      if (!balanceResp.success) {
        throw new Error("Failed to fetch wallet balance");
      }

      const balanceLpt = parseFloat(balanceResp.balance || "0");
      const fiatCurrency = state.user.fiat_type || "USD";
      const fiatSymbol = priceService.getCurrencySymbol(fiatCurrency);
      const fiatValue = priceService.convertLptToFiat(balanceLpt, fiatCurrency);

      setWallet({
        balanceLpt,
        fiatCurrency,
        fiatSymbol,
        fiatValue,
        address: state.user.wallet_address,
        walletId: state.user.wallet_id,
      });
    } catch (e: any) {
      setError(e?.message || "Failed to load wallet data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Load wallet data when user logs in
    if (state.user?.wallet_id && state.user?.wallet_address) {
      load();
    } else {
      setWallet(null);
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.user?.wallet_id, state.user?.wallet_address, state.user?.fiat_type]);

  const value = useMemo<WalletContextValue>(() => ({ wallet, isLoading, error, refetch: load }), [wallet, isLoading, error]);

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
};

export const useWallet = (): WalletContextValue => {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error("useWallet must be used within WalletProvider");
  return ctx;
};


