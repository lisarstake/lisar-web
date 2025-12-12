import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { walletService } from "@/services";
import { priceService } from "@/lib/priceService";
import { useAuth } from "@/contexts/AuthContext";

type WalletState = {
  balanceLpt: number;
  fiatCurrency: string;
  fiatSymbol: string;
  address?: string;
  walletId?: string;
  solanaBalance?: number;
  ethereumBalance?: number;
};

type WalletContextValue = {
  wallet: WalletState | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  solanaBalance: number | null;
  ethereumBalance: number | null;
  loadSolanaBalance: () => Promise<void>;
  loadEthereumBalance: () => Promise<void>;
  solanaLoading: boolean;
  ethereumLoading: boolean;
};

const WalletContext = createContext<WalletContextValue | undefined>(undefined);

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { state } = useAuth();
  const [wallet, setWallet] = useState<WalletState | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [solanaBalance, setSolanaBalance] = useState<number | null>(null);
  const [ethereumBalance, setEthereumBalance] = useState<number | null>(null);
  const [solanaLoading, setSolanaLoading] = useState<boolean>(false);
  const [ethereumLoading, setEthereumLoading] = useState<boolean>(false);

  const loadSolanaBalance = async () => {
    if (solanaBalance !== null || solanaLoading) return;
    
    if (!state.user) return;
    
    setSolanaLoading(true);
    try {
      let walletResp = await walletService.getPrimaryWallet("solana");
      
      if (!walletResp.success || !walletResp.wallet) {
        const createResp = await walletService.createSolanaWallet({
          make_primary: true,
        });
        if (createResp.success && createResp.wallet) {
          walletResp = { success: true, wallet: createResp.wallet };
        }
      }
      
      if (walletResp.success && walletResp.wallet) {
        const balanceResp = await walletService.getBalance(
          walletResp.wallet.wallet_address,
          "USDC"
        );
        if (balanceResp.success) {
          const balance = parseFloat(balanceResp.balance || "0");
          setSolanaBalance(balance);
          if (wallet) {
            setWallet({ ...wallet, solanaBalance: balance });
          }
        }
      }
    } catch (error) {
      console.error("Failed to fetch Solana balance:", error);
    } finally {
      setSolanaLoading(false);
    }
  };

  const loadEthereumBalance = async () => {
    if (ethereumBalance !== null || ethereumLoading) return;
    
    if (!state.user) return;
    
    setEthereumLoading(true);
    try {
      const walletResp = await walletService.getPrimaryWallet("ethereum");
      
      if (walletResp.success && walletResp.wallet) {
        const balanceResp = await walletService.getBalance(
          walletResp.wallet.wallet_address,
          "LPT"
        );
        if (balanceResp.success) {
          const balance = parseFloat(balanceResp.balance || "0");
          setEthereumBalance(balance);
          if (wallet) {
            setWallet({ ...wallet, ethereumBalance: balance });
          }
        }
      }
    } catch (error) {
      console.error("Failed to fetch Ethereum balance:", error);
    } finally {
      setEthereumLoading(false);
    }
  };

  const load = async () => {
    if (!state.user?.wallet_id || !state.user?.wallet_address) {
      setWallet(null);
      return;
    }
    try {
      setIsLoading(true);
      setError(null);

      const balanceResp = await walletService.getBalance(
        state.user.wallet_address,
        "LPT"
      );
      if (!balanceResp.success) {
        throw new Error("Failed to fetch wallet balance");
      }

      const balanceLpt = parseFloat(balanceResp.balance || "0");
      const fiatCurrency = state.user.fiat_type || "USD";
      const fiatSymbol = priceService.getCurrencySymbol(fiatCurrency);

      setWallet({
        balanceLpt,
        fiatCurrency,
        fiatSymbol,
        address: state.user.wallet_address,
        walletId: state.user.wallet_id,
        solanaBalance: solanaBalance || undefined,
        ethereumBalance: ethereumBalance || undefined,
      });
    } catch (e: any) {
      setError(e?.message || "Failed to load wallet data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (state.user) {
      loadSolanaBalance();
      loadEthereumBalance();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.user]);

  useEffect(() => {
    if (state.user?.wallet_id && state.user?.wallet_address) {
      load();
    } else {
      setWallet(null);
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    state.user?.wallet_id,
    state.user?.wallet_address,
    state.user?.fiat_type,
  ]);

  const value = useMemo<WalletContextValue>(
    () => ({
      wallet,
      isLoading,
      error,
      refetch: load,
      solanaBalance,
      ethereumBalance,
      loadSolanaBalance,
      loadEthereumBalance,
      solanaLoading,
      ethereumLoading,
    }),
    [wallet, isLoading, error, solanaBalance, ethereumBalance, solanaLoading, ethereumLoading, loadSolanaBalance, loadEthereumBalance]
  );

  return (
    <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
  );
};

export const useWallet = (): WalletContextValue => {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error("useWallet must be used within WalletProvider");
  return ctx;
};
