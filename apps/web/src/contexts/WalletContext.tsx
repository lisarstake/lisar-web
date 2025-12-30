import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useRef,
  useCallback,
} from "react";
import { walletService, mapleService, perenaService } from "@/services";
import { priceService } from "@/lib/priceService";
import { useAuth } from "@/contexts/AuthContext";

type WalletState = {
  balanceLpt: number;
  fiatCurrency: string;
  fiatSymbol: string;
  address?: string;
  walletId?: string;
  stablesBalance?: number;
  highyieldBalance?: number;
};

type WalletContextValue = {
  wallet: WalletState | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  stablesBalance: number | null;
  highyieldBalance: number | null;
  solanaUsdcBalance: number | null; // Solana USDC balance (for Perena)
  ethereumUsdcBalance: number | null; // Ethereum USDC balance (for Maple)
  solanaWalletAddress: string | null;
  ethereumWalletAddress: string | null;
  loadStablesBalance: () => Promise<void>;
  loadHighyieldBalance: () => Promise<void>;
  stablesLoading: boolean;
  highyieldLoading: boolean;
  // APY values (cached)
  mapleApy: number | null;
  perenaApy: number | null;
  apyLoading: boolean;
  loadApys: () => Promise<void>;
};

const WalletContext = createContext<WalletContextValue | undefined>(undefined);

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { state } = useAuth();
  const [wallet, setWallet] = useState<WalletState | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [stablesBalance, setStablesBalance] = useState<number | null>(null);
  const [highyieldBalance, setHighyieldBalance] = useState<number | null>(null);
  const [solanaUsdcBalance, setSolanaUsdcBalance] = useState<number | null>(null);
  const [ethereumUsdcBalance, setEthereumUsdcBalance] = useState<number | null>(null);
  const [solanaWalletAddress, setSolanaWalletAddress] = useState<string | null>(null);
  const [ethereumWalletAddress, setEthereumWalletAddress] = useState<string | null>(null);
  const [stablesLoading, setStablesLoading] = useState<boolean>(false);
  const [highyieldLoading, setHighyieldLoading] = useState<boolean>(false);
  const [mapleApy, setMapleApy] = useState<number | null>(null);
  const [perenaApy, setPerenaApy] = useState<number | null>(null);
  const [apyLoading, setApyLoading] = useState<boolean>(false);
  const apyTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const apyFetchedRef = useRef({ maple: false, perena: false });

  const loadStablesBalance = async () => {
    if (stablesBalance !== null || stablesLoading) return;
    
    if (!state.user) return;
    
    setStablesLoading(true);
    try {
      // Fetch Solana USD balances (USDC, USDT, USD*)
      let solStableBalance = 0;
      let solWalletResp = await walletService.getPrimaryWallet("solana");

      if (!solWalletResp.success || !solWalletResp.wallet) {
        const createResp = await walletService.createSolanaWallet({
          make_primary: true,
        });
        if (createResp.success && createResp.wallet) {
          solWalletResp = { success: true, wallet: createResp.wallet };
        }
      }

      if (solWalletResp.success && solWalletResp.wallet) {
        setSolanaWalletAddress(solWalletResp.wallet.wallet_address);
        const balanceResp = await walletService.getSolanaBalance(
          solWalletResp.wallet.wallet_address
        );
        if (balanceResp.success && balanceResp.balances) {
          const { usdc, usdt, ["usd*"]: usdStar } = balanceResp.balances;

          const solUsdc = usdc ? parseFloat(usdc.balance || "0") : 0;
          const solUsdt = usdt ? parseFloat(usdt.balance || "0") : 0;
          const solUsdStar = usdStar ? parseFloat(usdStar.balance || "0") : 0;

          solStableBalance = solUsdc + solUsdt + solUsdStar;
          
          // Store Solana USDC balance separately
          setSolanaUsdcBalance(solUsdc);
        } else {
          setSolanaUsdcBalance(0);
        }
      } else {
        setSolanaUsdcBalance(0);
      }

      // Fetch Ethereum USDC + USDT balances
      let evmStableBalance = 0;
      const ethWalletResp = await walletService.getPrimaryWallet("ethereum");

      if (ethWalletResp.success && ethWalletResp.wallet) {
        const evmAddress = ethWalletResp.wallet.wallet_address;
        setEthereumWalletAddress(evmAddress);

        const [usdcResp, usdtResp] = await Promise.all([
          walletService.getBalance(evmAddress, "USDC"),
          walletService.getBalance(evmAddress, "USDT"),
        ]);

        const ethUsdc = usdcResp.success ? parseFloat(usdcResp.balance || "0") : 0;
        const ethUsdt = usdtResp.success ? parseFloat(usdtResp.balance || "0") : 0;

        evmStableBalance = ethUsdc + ethUsdt;
        
        // Store Ethereum USDC balance separately
        setEthereumUsdcBalance(ethUsdc);
      } else {
        setEthereumUsdcBalance(0);
      }

      const totalStableBalance = solStableBalance + evmStableBalance;

      setStablesBalance(totalStableBalance);
      if (wallet) {
        setWallet({ ...wallet, stablesBalance: totalStableBalance });
      }
    } catch (error) {
      console.error("Failed to fetch stables balance:", error);
    } finally {
      setStablesLoading(false);
    }
  };

  const loadHighyieldBalance = async () => {
    if (highyieldBalance !== null || highyieldLoading) return;
    
    if (!state.user) return;
    
    setHighyieldLoading(true);
    try {
      const walletResp = await walletService.getPrimaryWallet("ethereum");
      
      if (walletResp.success && walletResp.wallet) {
        setEthereumWalletAddress(walletResp.wallet.wallet_address);
        const balanceResp = await walletService.getBalance(
          walletResp.wallet.wallet_address,
          "LPT"
        );
        if (balanceResp.success) {
          const balance = parseFloat(balanceResp.balance || "0");
          setHighyieldBalance(balance);
          if (wallet) {
            setWallet({ ...wallet, highyieldBalance: balance });
          }
        }
      }
    } catch (error) {
      console.error("Failed to fetch High Yield balance:", error);
    } finally {
      setHighyieldLoading(false);
    }
  };

  const loadApys = useCallback(async () => {
    // Only fetch if not already cached
    if ((mapleApy !== null && perenaApy !== null) || apyLoading) return;
    
    setApyLoading(true);
    apyFetchedRef.current = { maple: false, perena: false };

    // Set timeout to use fallback after 1 minute if still loading
    apyTimeoutRef.current = setTimeout(() => {
      setMapleApy((prev) => {
        if (prev === null) {
          return 0.065; // Fallback 6.5% if still null after 1 minute
        }
        return prev;
      });
      setPerenaApy((prev) => {
        if (prev === null) {
          return 0.14; // Fallback 14% if still null after 1 minute
        }
        return prev;
      });
      setApyLoading(false);
    }, 60000); // 1 minute

    // Fetch Maple APY
    try {
      const maplePoolId = import.meta.env.VITE_MAPLE_POOL_ID;
      
      if (maplePoolId) {
        const mapleResp = await mapleService.getPoolApy(maplePoolId);
        
        if (mapleResp.success && mapleResp.data) {
          const weeklyApy = mapleResp.data.weeklyApy;
          const mapleApyDecimal = weeklyApy / 100;
          setMapleApy(mapleApyDecimal);
        } else {
          setMapleApy(0.065);
        }
      } else {
        setMapleApy(0.065);
      }
      apyFetchedRef.current.maple = true;
    } catch (err) {
      setMapleApy(0.065);
      apyFetchedRef.current.maple = true;
    }

    // Fetch Perena APY
    try {
      const currentTime = new Date().toISOString();
      const perenaResp = await perenaService.getApy(currentTime);
      
      if (perenaResp.success && perenaResp.data) {
        const apyValue = perenaResp.data.apy;
        const perenaApyDecimal = apyValue / 100;
        setPerenaApy(perenaApyDecimal);
      } else {
        setPerenaApy(0.14);
      }
      apyFetchedRef.current.perena = true;
    } catch (err) {
      setPerenaApy(0.14);
      apyFetchedRef.current.perena = true;
    }

    // Clear timeout and set loading to false if both values are fetched
    if (apyFetchedRef.current.maple && apyFetchedRef.current.perena) {
      if (apyTimeoutRef.current) {
        clearTimeout(apyTimeoutRef.current);
      }
      setApyLoading(false);
    }
  }, [mapleApy, perenaApy, apyLoading]);

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
        stablesBalance: stablesBalance || undefined,
        highyieldBalance: highyieldBalance || undefined,
      });
    } catch (e: any) {
      setError(e?.message || "Failed to load wallet data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (state.user) {
      loadStablesBalance();
      loadHighyieldBalance();
      loadApys();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.user]);

  // Cleanup APY timeout on unmount
  useEffect(() => {
    return () => {
      if (apyTimeoutRef.current) {
        clearTimeout(apyTimeoutRef.current);
      }
    };
  }, []);

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
      stablesBalance,
      highyieldBalance,
      solanaUsdcBalance,
      ethereumUsdcBalance,
      solanaWalletAddress,
      ethereumWalletAddress,
      loadStablesBalance,
      loadHighyieldBalance,
      stablesLoading,
      highyieldLoading,
      mapleApy,
      perenaApy,
      apyLoading,
      loadApys,
    }),
    [wallet, isLoading, error, stablesBalance, highyieldBalance, solanaUsdcBalance, ethereumUsdcBalance, solanaWalletAddress, ethereumWalletAddress, stablesLoading, highyieldLoading, loadStablesBalance, loadHighyieldBalance, mapleApy, perenaApy, apyLoading, loadApys]
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
