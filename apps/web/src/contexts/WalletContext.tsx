import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useRef,
  useCallback,
} from "react";
import {
  walletService,
  mapleService,
  perenaService,
  virtualAccountService,
} from "@/services";
import type { VirtualAccountDetails } from "@/services/virtual-account";
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
  refreshAllWalletData: () => Promise<void>;
  stablesBalance: number | null;
  highyieldBalance: number | null;
  solanaUsdcBalance: number | null;
  solanaUsdtBalance: number | null;
  ethereumUsdcBalance: number | null;
  nairaBalance: number | null;
  virtualAccount: VirtualAccountDetails | null;
  solanaWalletAddress: string | null;
  ethereumWalletAddress: string | null;
  solanaWalletId: string | null;
  ethereumWalletId: string | null;
  loadStablesBalance: (force?: boolean) => Promise<void>;
  loadHighyieldBalance: (force?: boolean) => Promise<void>;
  loadNairaBalance: (force?: boolean) => Promise<void>;
  loadVirtualAccountDetails: (
    force?: boolean,
  ) => Promise<VirtualAccountDetails | null>;
  setVirtualAccountDetails: (details: VirtualAccountDetails | null) => void;
  stablesLoading: boolean;
  highyieldLoading: boolean;
  virtualAccountLoading: boolean;
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
  const [solanaUsdcBalance, setSolanaUsdcBalance] = useState<number | null>(
    null,
  );
  const [solanaUsdtBalance, setSolanaUsdtBalance] = useState<number | null>(
    null,
  );
  const [ethereumUsdcBalance, setEthereumUsdcBalance] = useState<number | null>(
    null,
  );
  const [nairaBalance, setNairaBalance] = useState<number | null>(null);
  const [virtualAccount, setVirtualAccount] =
    useState<VirtualAccountDetails | null>(null);
  const [solanaWalletAddress, setSolanaWalletAddress] = useState<string | null>(
    null,
  );
  const [ethereumWalletAddress, setEthereumWalletAddress] = useState<
    string | null
  >(null);
  const [solanaWalletId, setSolanaWalletId] = useState<string | null>(null);
  const [ethereumWalletId, setEthereumWalletId] = useState<string | null>(null);
  const [stablesLoading, setStablesLoading] = useState<boolean>(false);
  const [highyieldLoading, setHighyieldLoading] = useState<boolean>(false);
  const [virtualAccountLoading, setVirtualAccountLoading] =
    useState<boolean>(false);
  const [mapleApy, setMapleApy] = useState<number | null>(null);
  const [perenaApy, setPerenaApy] = useState<number | null>(null);
  const [apyLoading, setApyLoading] = useState<boolean>(false);

  const apyTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const stablesLoadingRef = useRef(false);
  const highyieldLoadingRef = useRef(false);
  const nairaLoadingRef = useRef(false);
  const virtualAccountLoadingRef = useRef(false);

  const loadStablesBalance = useCallback(
    async (force: boolean = false) => {
      if (stablesLoadingRef.current) return;
      if (!force && stablesBalance !== null) return;
      if (!state.user) return;

      stablesLoadingRef.current = true;
      setStablesLoading(true);

      try {
        const [solWalletResult, ethWalletResult] = await Promise.allSettled([
          walletService.getPrimaryWallet("solana"),
          walletService.getPrimaryWallet("ethereum"),
        ]);

        let solStableBalance = 0;
        let evmStableBalance = 0;

        // Process Solana results
        if (
          solWalletResult.status === "fulfilled" &&
          solWalletResult.value.success &&
          solWalletResult.value.wallet
        ) {
          const solWallet = solWalletResult.value.wallet;
          setSolanaWalletAddress(solWallet.wallet_address);
          setSolanaWalletId(solWallet.wallet_id);

          const balanceResp = await walletService.getSolanaBalance(
            solWallet.wallet_address,
          );
          if (balanceResp.success && balanceResp.balances) {
            const { usdc, usdt, ["usd*"]: usdStar } = balanceResp.balances;
            const solUsdc = usdc ? parseFloat(usdc.balance || "0") : 0;
            const solUsdt = usdt ? parseFloat(usdt.balance || "0") : 0;
            const solUsdStar = usdStar ? parseFloat(usdStar.balance || "0") : 0;

            const usdStarPriceResp = await perenaService.getPrice();
            const usdStarPrice = usdStarPriceResp.success && usdStarPriceResp.data?.price
              ? usdStarPriceResp.data.price
              : 1;
            solStableBalance = solUsdStar * usdStarPrice;

            setSolanaUsdcBalance(solUsdc);
            setSolanaUsdtBalance(solUsdt);
          }
        }

        // Process Ethereum results
        if (
          ethWalletResult.status === "fulfilled" &&
          ethWalletResult.value.success &&
          ethWalletResult.value.wallet
        ) {
          const ethWallet = ethWalletResult.value.wallet;
          setEthereumWalletAddress(ethWallet.wallet_address);
          setEthereumWalletId(ethWallet.wallet_id);

          const [usdcResp, usdtResp] = await Promise.all([
            walletService.getBalance(ethWallet.wallet_address, "USDC"),
            walletService.getBalance(ethWallet.wallet_address, "USDT"),
          ]);

          const ethUsdc = usdcResp.success
            ? parseFloat(usdcResp.balance || "0")
            : 0;
          const ethUsdt = usdtResp.success
            ? parseFloat(usdtResp.balance || "0")
            : 0;
          evmStableBalance = ethUsdc + ethUsdt;
          setEthereumUsdcBalance(ethUsdc);
        }

        const totalStableBalance = solStableBalance + evmStableBalance;
        setStablesBalance(totalStableBalance);

        if (wallet) {
          setWallet({ ...wallet, stablesBalance: totalStableBalance });
        }
      } catch (error) {
      } finally {
        setStablesLoading(false);
        stablesLoadingRef.current = false;
      }
    },
    [stablesBalance, state.user, wallet],
  );

  const loadHighyieldBalance = useCallback(
    async (force: boolean = false) => {
      if (highyieldLoadingRef.current) return;
      if (!force && highyieldBalance !== null) return;
      if (!state.user) return;

      highyieldLoadingRef.current = true;
      setHighyieldLoading(true);

      try {
        const walletResp = await walletService.getPrimaryWallet("ethereum");
        if (!walletResp.success || !walletResp.wallet) {
          setHighyieldBalance(0);
          return;
        }

        const ethWallet = walletResp.wallet;
        setEthereumWalletAddress(ethWallet.wallet_address);
        setEthereumWalletId(ethWallet.wallet_id);

        const balanceResp = await walletService.getBalance(
          ethWallet.wallet_address,
          "LPT",
        );

        if (balanceResp.success) {
          const balance = parseFloat(balanceResp.balance || "0");
          setHighyieldBalance(balance);
          if (wallet) {
            setWallet({ ...wallet, highyieldBalance: balance });
          }
        } else {
          setHighyieldBalance(0);
        }
      } catch (error) {
        setHighyieldBalance(0);
      } finally {
        setHighyieldLoading(false);
        highyieldLoadingRef.current = false;
      }
    },
    [highyieldBalance, state.user, wallet],
  );

  const loadNairaBalance = useCallback(
    async (force: boolean = false) => {
      if (nairaLoadingRef.current) return;
      if (!force && nairaBalance !== null) return;
      if (!state.user) return;

      nairaLoadingRef.current = true;
      try {
        const response = await virtualAccountService.getBalance();
        if (response.success && response.data) {
          setNairaBalance(response.data.available_balance || 0);
        } else {
          setNairaBalance(Number(state.user?.fiat_balance || 0));
        }
      } catch (error) {
        setNairaBalance(Number(state.user?.fiat_balance || 0));
      } finally {
        nairaLoadingRef.current = false;
      }
    },
    [nairaBalance, state.user],
  );

  const loadVirtualAccountDetails = useCallback(
    async (force: boolean = false): Promise<VirtualAccountDetails | null> => {
      if (virtualAccountLoadingRef.current) return virtualAccount;
      if (!force && virtualAccount) return virtualAccount;
      if (!state.user) return null;

      virtualAccountLoadingRef.current = true;
      setVirtualAccountLoading(true);
      try {
        const response = await virtualAccountService.getVirtualAccount();
        if (response.success && response.data) {
          setVirtualAccount(response.data);
          return response.data;
        }
        setVirtualAccount(null);
        return null;
      } catch (error) {
        setVirtualAccount(null);
        return null;
      } finally {
        setVirtualAccountLoading(false);
        virtualAccountLoadingRef.current = false;
      }
    },
    [state.user, virtualAccount],
  );

  const setVirtualAccountDetails = useCallback(
    (details: VirtualAccountDetails | null) => {
      setVirtualAccount(details);
    },
    [],
  );

  const loadApys = useCallback(async () => {
    if ((mapleApy !== null && perenaApy !== null) || apyLoading) return;

    setApyLoading(true);

    apyTimeoutRef.current = setTimeout(() => {
      setMapleApy((prev) => prev ?? 0.065);
      setPerenaApy((prev) => prev ?? 0.14);
      setApyLoading(false);
    }, 10000);

    const [mapleResult, perenaResult] = await Promise.allSettled([
      (async () => {
        const maplePoolId = import.meta.env.VITE_MAPLE_POOL_ID;
        if (!maplePoolId) return 0.065;
        const mapleResp = await mapleService.getPoolApy(maplePoolId);
        return mapleResp.success && mapleResp.data
          ? mapleResp.data.weeklyApy / 100
          : 0.065;
      })(),
      (async () => {
        const currentTime = new Date().toISOString();
        const perenaResp = await perenaService.getApy(currentTime);
        return perenaResp.success && perenaResp.data
          ? perenaResp.data.apy / 100
          : 0.14;
      })(),
    ]);

    if (mapleResult.status === "fulfilled") setMapleApy(mapleResult.value);
    if (perenaResult.status === "fulfilled") setPerenaApy(perenaResult.value);

    if (apyTimeoutRef.current) {
      clearTimeout(apyTimeoutRef.current);
    }
    setApyLoading(false);
  }, [mapleApy, perenaApy, apyLoading]);

  const load = useCallback(async () => {
    if (!state.user?.wallet_id || !state.user?.wallet_address) {
      setWallet(null);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const balanceResp = await walletService.getBalance(
        state.user.wallet_address,
        "LPT",
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
  }, [
    state.user?.wallet_id,
    state.user?.wallet_address,
    state.user?.fiat_type,
    stablesBalance,
    highyieldBalance,
  ]);

  const refreshAllWalletData = useCallback(async () => {
    await Promise.all([
      load(),
      loadStablesBalance(true),
      loadHighyieldBalance(true),
      loadNairaBalance(true),
      loadVirtualAccountDetails(true),
    ]);
  }, [
    load,
    loadStablesBalance,
    loadHighyieldBalance,
    loadNairaBalance,
    loadVirtualAccountDetails,
  ]);

  // Initial load on mount
  useEffect(() => {
    if (state.user) {
      Promise.all([
        loadStablesBalance(),
        loadHighyieldBalance(),
        loadNairaBalance(),
        loadVirtualAccountDetails(),
        loadApys(),
      ]);
    }
  }, [state.user]);

  // Cleanup
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
      refreshAllWalletData,
      stablesBalance,
      highyieldBalance,
      solanaUsdcBalance,
      solanaUsdtBalance,
      ethereumUsdcBalance,
      nairaBalance,
      virtualAccount,
      solanaWalletAddress,
      ethereumWalletAddress,
      solanaWalletId,
      ethereumWalletId,
      loadStablesBalance,
      loadHighyieldBalance,
      loadNairaBalance,
      loadVirtualAccountDetails,
      setVirtualAccountDetails,
      stablesLoading,
      highyieldLoading,
      virtualAccountLoading,
      mapleApy,
      perenaApy,
      apyLoading,
      loadApys,
    }),
    [
      wallet,
      isLoading,
      error,
      load,
      refreshAllWalletData,
      stablesBalance,
      highyieldBalance,
      solanaUsdcBalance,
      solanaUsdtBalance,
      ethereumUsdcBalance,
      nairaBalance,
      virtualAccount,
      solanaWalletAddress,
      ethereumWalletAddress,
      solanaWalletId,
      ethereumWalletId,
      stablesLoading,
      highyieldLoading,
      virtualAccountLoading,
      mapleApy,
      perenaApy,
      apyLoading,
      loadStablesBalance,
      loadHighyieldBalance,
      loadNairaBalance,
      loadVirtualAccountDetails,
      setVirtualAccountDetails,
      loadApys,
    ],
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
