import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  Check,
  ChevronDown,
  Copy,
  ClipboardPaste,
  LoaderCircle,
  WalletCards,
} from "lucide-react";
import { BottomNavigation } from "@/components/general/BottomNavigation";
import { ErrorDrawer } from "@/components/general/ErrorDrawer";
import toast from "react-hot-toast";
import { PajRampDrawer } from "@/components/general/PajRampDrawer";
import type { PajRampTransactionDetails } from "@/components/general/PajRampDrawer";
import { SuccessDrawer } from "@/components/general/SuccessDrawer";
import { useAuth } from "@/contexts/AuthContext";
import { useWallet } from "@/contexts/WalletContext";
import { useWalletCard } from "@/contexts/WalletCardContext";
import { usePrices } from "@/hooks/usePrices";
import QRCode from "qrcode";
import { OnrampWebSDK } from "@onramp.money/onramp-web-sdk";
import { getFiatType } from "@/lib/onramp";
import { priceService } from "@/lib/priceService";
import { perenaService, walletService } from "@/services";
import { formatNumber, parseFormattedNumber } from "@/lib/formatters";

type TransferMode = "deposit" | "withdraw";
type TransferAsset = "naira" | "crypto";

type SupportedToken = "USDC" | "USDT" | "LPT";
type SupportedNetwork = "Solana" | "Arbitrum";
type WithdrawSource = "savings" | "stash" | "combined";

const TOKEN_CONFIG: Record<
  SupportedToken,
  { icon: string; networks: SupportedNetwork[] }
> = {
  USDC: { icon: "/usdc.svg", networks: ["Solana"] },
  USDT: { icon: "/usdt.svg", networks: ["Solana"] },
  LPT: { icon: "/livepeer.webp", networks: ["Arbitrum"] },
};

const TOKEN_MINT: Record<string, string> = {
  USDC: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
  USDT: "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB",
  LPT: "",
};

const TOKEN_CHAIN: Record<string, string> = {
  USDC: "SOLANA",
  USDT: "SOLANA",
  LPT: "arbitrum",
};

export const WalletTransferFormPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { mode, asset } = useParams<{
    mode: TransferMode;
    asset: TransferAsset;
  }>();
  const { state } = useAuth();
  const { prices } = usePrices();
  const { displayCurrency, displayFiatSymbol } = useWalletCard();
  const {
    solanaWalletAddress,
    solanaWalletId,
    solanaUsdcBalance,
    ethereumWalletAddress,
    stablesBalance,
    highyieldBalance,
    refreshAllWalletData,
  } = useWallet();
  const qrCanvasRef = useRef<HTMLCanvasElement>(null);

  const safeMode: TransferMode = mode === "withdraw" ? "withdraw" : "deposit";
  const safeAsset: TransferAsset = asset === "crypto" ? "crypto" : "naira";
  const safeWalletType =
    searchParams.get("walletType") === "staking" ? "staking" : "savings";
  const preferredToken: SupportedToken =
    safeWalletType === "staking" ? "LPT" : "USDC";
  const isNairaWithdraw = safeMode === "withdraw" && safeAsset === "naira";

  const [amount, setAmount] = useState("");
  const [isSubmittingCryptoWithdraw, setIsSubmittingCryptoWithdraw] =
    useState(false);
  const [showCryptoWithdrawSuccess, setShowCryptoWithdrawSuccess] =
    useState(false);
  const [showCryptoWithdrawError, setShowCryptoWithdrawError] = useState(false);
  const [showDepositNairaRampDrawer, setShowDepositNairaRampDrawer] =
    useState(false);
  const [depositNairaErrorMessage, setDepositNairaErrorMessage] = useState("");
  const [depositNairaRampDetails, setDepositNairaRampDetails] =
    useState<PajRampTransactionDetails | null>(null);
  const [showWithdrawNairaRampDrawer, setShowWithdrawNairaRampDrawer] =
    useState(false);
  const [withdrawNairaRampDetails, setWithdrawNairaRampDetails] =
    useState<PajRampTransactionDetails | null>(null);
  const [cryptoWithdrawErrorMessage, setCryptoWithdrawErrorMessage] =
    useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [copied, setCopied] = useState(false);
  const [withdrawSource, setWithdrawSource] = useState<WithdrawSource>("combined");
  const [showSourcePicker, setShowSourcePicker] = useState(false);
  const [selectedToken, setSelectedToken] =
    useState<SupportedToken>(preferredToken);
  const [selectedNetwork, setSelectedNetwork] =
    useState<SupportedNetwork>("Solana");

  const onrampInstanceRef = useRef<OnrampWebSDK | null>(null);
  const userCurrency = state.user?.fiat_type || "NGN";

  useEffect(() => {
    setSelectedToken(preferredToken);
  }, [preferredToken]);
  /*
  const [instantOfframp, setInstantOfframp] = useState(false);
  const [offrampAddress, setOfframpAddress] = useState("");
  const [timerSeconds, setTimerSeconds] = useState(0);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  useEffect(() => {
    if (instantOfframp) {
      setTimerSeconds(600);
    } else {
      setTimerSeconds(0);
    }
  }, [instantOfframp]);

  useEffect(() => {
    if (!instantOfframp || timerSeconds <= 0) return;
    const timer = setInterval(() => {
      setTimerSeconds((prev) => {
        if (prev <= 1) {
          setInstantOfframp(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [instantOfframp, timerSeconds]);
  */

  const tokenSymbol = safeWalletType === "staking" ? "LPT" : "USDC";
  const tokenRateInNgn = useMemo(() => {
    const ngnPerUsd = prices.ngn || 0;
    if (!ngnPerUsd) return 0;
    if (tokenSymbol === "LPT") {
      return (prices.lpt || 0) * ngnPerUsd;
    }
    return ngnPerUsd;
  }, [prices.lpt, prices.ngn, tokenSymbol]);

  // Clean up onramp instance when component unmounts
  useEffect(() => {
    return () => {
      if (onrampInstanceRef.current) {
        try {
          onrampInstanceRef.current.close();
          refreshAllWalletData();
        } catch {}
      }
    };
  }, [refreshAllWalletData]);

  const handleDepositNairaContinue = useCallback(async () => {
    const parsedAmount = Number(amount.replace(/,/g, "").trim());
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setDepositNairaErrorMessage("Select a valid amount to continue.");
      return;
    }

    if (safeWalletType === "savings") {
      if (!tokenRateInNgn) {
        setDepositNairaErrorMessage(
          "Rate unavailable right now. Please try again.",
        );
        return;
      }

      const cryptoAddress =
        tokenSymbol === "LPT"
          ? ethereumWalletAddress || state.user?.wallet_address || null
          : solanaWalletAddress || null;
      if (!cryptoAddress) {
        setDepositNairaErrorMessage(
          "Wallet address not available. Please try again.",
        );
        return;
      }

      const tokenAmount = parsedAmount / tokenRateInNgn;
      setDepositNairaRampDetails({
        type: "buy",
        tokenAmount,
        tokenName: tokenSymbol,
        fiatAmount: parsedAmount,
        fiatSymbol: "₦",
        fiatCurrency: "NGN",
        exchangeRate: tokenRateInNgn,
        fee: 0,
        cryptoAddress,
        customerEmail: state.user?.email || "",
        customerName: state.user?.full_name || "Lisar User",
        mint: TOKEN_MINT[tokenSymbol],
        chain: TOKEN_CHAIN[tokenSymbol] || "solana",
      });
      setDepositNairaErrorMessage("");
      setShowDepositNairaRampDrawer(true);
      return;
    }

    const walletAddress =
      tokenSymbol === "LPT"
        ? ethereumWalletAddress || state.user?.wallet_address
        : solanaWalletAddress;

    if (!walletAddress) {
      setDepositNairaErrorMessage(
        "Wallet address not available. Please try again."
      );
      return;
    }

    const coinCode = tokenSymbol === "LPT" ? "lpt" : "usdc";
    const network = tokenSymbol === "LPT" ? "arbitrum" : "spl";
    const fiatType = getFiatType(userCurrency);

    try {
      const onramp = new OnrampWebSDK({
        appId: import.meta.env.VITE_ONRAMP_APP_ID,
        walletAddress,
        flowType: 1,
        fiatType,
        paymentMethod: 2,
        fiatAmount: parsedAmount,
        coinCode,
        network,
        theme: {
          lightMode: {
            baseColor: "#C7EF6B",
            inputRadius: "8px",
            buttonRadius: "8px",
          },
          darkMode: {
            baseColor: "#6A8F2A",
            inputRadius: "8px",
            buttonRadius: "8px",
          },
          default: "darkMode",
        },
        isRestricted: true,
      });

      onramp.on("WIDGET_EVENTS", async (event) => {
        if (
          event.type === "ONRAMP_WIDGET_CLOSE_REQUEST_CONFIRMED" ||
          event.type === "ONRAMP_WIDGET_CLOSE"
        ) {
          await refreshAllWalletData();
        }
      });

      onrampInstanceRef.current = onramp;
      onramp.show();
      setDepositNairaErrorMessage("");
    } catch (error) {
      setDepositNairaErrorMessage("Failed to initialize payment widget. Please try again.");
    }
  }, [
    amount,
    ethereumWalletAddress,
    solanaWalletAddress,
    state.user?.email,
    state.user?.full_name,
    state.user?.wallet_address,
    tokenRateInNgn,
    tokenSymbol,
    userCurrency,
    safeWalletType,
    refreshAllWalletData,
  ]);

  const walletTokenLabel = safeWalletType === "staking" ? "LPT" : "USDC";

  const stashBalance = safeWalletType === "savings" ? (solanaUsdcBalance ?? 0) : 0;
  const savingsBalance = safeWalletType === "savings" ? (stablesBalance ?? 0) : 0;
  const combinedBalance = stashBalance + savingsBalance;

  const activeBalance = safeWalletType === "staking"
    ? (highyieldBalance ?? 0)
    : (withdrawSource === "stash" ? stashBalance
      : withdrawSource === "savings" ? savingsBalance
      : combinedBalance);

  const sourceFiatBalance = activeBalance * tokenRateInNgn;

  const handleCryptoWithdraw = useCallback(async () => {
    const parsedAmount = Number(amount.replace(/,/g, "").trim());
    const destinationAddress = walletAddress.trim();

    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setCryptoWithdrawErrorMessage("Enter a valid amount.");
      setShowCryptoWithdrawError(true);
      return;
    }

    if (!destinationAddress) {
      setCryptoWithdrawErrorMessage("Enter a destination wallet address.");
      setShowCryptoWithdrawError(true);
      return;
    }

    setIsSubmittingCryptoWithdraw(true);
    try {
      if (safeWalletType === "savings") {
        if (parsedAmount > activeBalance) {
          setCryptoWithdrawErrorMessage(
            "Amount exceeds available USDC balance.",
          );
          setShowCryptoWithdrawError(true);
          return;
        }
        if (!solanaWalletAddress || !solanaWalletId) {
          setCryptoWithdrawErrorMessage(
            "Solana wallet is unavailable. Please try again.",
          );
          setShowCryptoWithdrawError(true);
          return;
        }

        if (withdrawSource === "stash") {
          const sendResp = await walletService.sendSolana({
            walletId: solanaWalletId,
            fromAddress: solanaWalletAddress,
            toAddress: destinationAddress,
            token: "USDC",
            amount: parsedAmount,
          });
          if (!sendResp.success) {
            setCryptoWithdrawErrorMessage(
              sendResp.error || "Unable to complete transfer right now.",
            );
            setShowCryptoWithdrawError(true);
            return;
          }
        } else {
          const burnAmount = withdrawSource === "combined"
            ? Math.min(parsedAmount, savingsBalance)
            : parsedAmount;

          const burnResp = await perenaService.burn({
            walletId: solanaWalletId,
            walletAddress: solanaWalletAddress,
            usdStarAmount: burnAmount,
          });
          if (!burnResp.success) {
            setCryptoWithdrawErrorMessage(
              burnResp.error || "Unable to process withdrawal right now.",
            );
            setShowCryptoWithdrawError(true);
            return;
          }

          const sendResp = await walletService.sendSolana({
            walletId: solanaWalletId,
            fromAddress: solanaWalletAddress,
            toAddress: destinationAddress,
            token: "USDC",
            amount: parsedAmount,
          });
          if (!sendResp.success) {
            setCryptoWithdrawErrorMessage(
              sendResp.error || "Unable to complete transfer right now.",
            );
            setShowCryptoWithdrawError(true);
            return;
          }
        }
      } else {
        const availableLptBalance = highyieldBalance || 0;
        if (parsedAmount > availableLptBalance) {
          setCryptoWithdrawErrorMessage(
            "Amount exceeds available LPT balance.",
          );
          setShowCryptoWithdrawError(true);
          return;
        }
        if (!state.user?.wallet_id || !state.user?.wallet_address) {
          setCryptoWithdrawErrorMessage(
            "Wallet details are unavailable. Please try again.",
          );
          setShowCryptoWithdrawError(true);
          return;
        }

        const amountValue = parsedAmount.toString();
        const approveResp = await walletService.approveLpt({
          walletId: state.user.wallet_id,
          walletAddress: state.user.wallet_address,
          spender: destinationAddress,
          amount: amountValue,
        });
        if (!approveResp.success) {
          setCryptoWithdrawErrorMessage(
            approveResp.error || "Unable to approve LPT transfer.",
          );
          setShowCryptoWithdrawError(true);
          return;
        }

        const sendResp = await walletService.sendLpt({
          walletId: state.user.wallet_id,
          walletAddress: state.user.wallet_address,
          to: destinationAddress,
          amount: amountValue,
        });
        if (!sendResp.success) {
          setCryptoWithdrawErrorMessage(
            sendResp.error || "Unable to complete transfer right now.",
          );
          setShowCryptoWithdrawError(true);
          return;
        }
      }

      await refreshAllWalletData();
      setAmount("");
      setWalletAddress("");
      setShowCryptoWithdrawSuccess(true);
    } catch (error) {
      setCryptoWithdrawErrorMessage(
        "Unable to complete this transfer right now. Please try again.",
      );
      setShowCryptoWithdrawError(true);
    } finally {
      setIsSubmittingCryptoWithdraw(false);
    }
  }, [
    amount,
    highyieldBalance,
    refreshAllWalletData,
    safeWalletType,
    solanaWalletAddress,
    solanaWalletId,
    stablesBalance,
    solanaUsdcBalance,
    state.user?.wallet_address,
    state.user?.wallet_id,
    walletAddress,
    withdrawSource,
    activeBalance,
    savingsBalance,
    stashBalance,
  ]);

  const handleConfirm = useCallback(() => {
    if (safeAsset === "crypto") {
      void handleCryptoWithdraw();
      return;
    }
    if (!isNairaWithdraw) return;

    const parsedAmount = Number(amount.replace(/,/g, "").trim());
    if (!parsedAmount || parsedAmount <= 0) return;

    if (safeWalletType === "savings") {
      if (!tokenRateInNgn) return;
      const tokenAmount = parsedAmount / tokenRateInNgn;
      if (tokenAmount > activeBalance) {
        toast.error("Amount exceeds available USDC balance.");
        return;
      }
      setWithdrawNairaRampDetails({
        type: "sell",
        tokenAmount,
        tokenName: tokenSymbol,
        fiatAmount: parsedAmount,
        fiatSymbol: "₦",
        fiatCurrency: "NGN",
        exchangeRate: tokenRateInNgn,
        fee: 0,
        cryptoAddress: solanaWalletAddress || null,
        customerEmail: state.user?.email || "",
        customerName: state.user?.full_name || "Lisar User",
        mint: TOKEN_MINT[tokenSymbol],
        chain: TOKEN_CHAIN[tokenSymbol] || "solana",
        withdrawSource: safeWalletType === "savings" ? withdrawSource : undefined,
      });
      setShowWithdrawNairaRampDrawer(true);
    } else {
      const walletAddress =
        ethereumWalletAddress || state.user?.wallet_address;
      if (!walletAddress) return;

      try {
        const onramp = new OnrampWebSDK({
          appId: import.meta.env.VITE_ONRAMP_APP_ID,
          walletAddress,
          flowType: 2,
          coinCode: "lpt",
          network: "arbitrum",
          fiatAmount: parsedAmount,
          fiatType: getFiatType("NGN"),
          theme: {
            lightMode: {
              baseColor: "#C7EF6B",
              inputRadius: "8px",
              buttonRadius: "8px",
            },
            darkMode: {
              baseColor: "#6A8F2A",
              inputRadius: "8px",
              buttonRadius: "8px",
            },
            default: "darkMode",
          },
          isRestricted: true,
        });

        onramp.on("WIDGET_EVENTS", async (event) => {
          if (
            event.type === "ONRAMP_WIDGET_CLOSE_REQUEST_CONFIRMED" ||
            event.type === "ONRAMP_WIDGET_CLOSE"
          ) {
            await refreshAllWalletData();
          }
        });

        onrampInstanceRef.current = onramp;
        onramp.show();
      } catch {
        // OnrampWebSDK handles its own errors internally
      }
    }
  }, [
    amount,
    handleCryptoWithdraw,
    isNairaWithdraw,
    safeAsset,
    safeWalletType,
    tokenRateInNgn,
    tokenSymbol,
    solanaWalletAddress,
    state.user?.email,
    state.user?.full_name,
    ethereumWalletAddress,
    state.user?.wallet_address,
    refreshAllWalletData,
    activeBalance,
    withdrawSource,
  ]);

  const currentTokenConfig = TOKEN_CONFIG[selectedToken];
  const availableNetworks = currentTokenConfig.networks;

  useEffect(() => {
    if (!availableNetworks.includes(selectedNetwork)) {
      setSelectedNetwork(availableNetworks[0]);
    }
  }, [availableNetworks, selectedNetwork]);

  const cryptoDepositAddress = useMemo(() => {
    if (selectedNetwork === "Solana") {
      return solanaWalletAddress || "No wallet address";
    }
    return (
      ethereumWalletAddress || state.user?.wallet_address || "No wallet address"
    );
  }, [
    ethereumWalletAddress,
    selectedNetwork,
    solanaWalletAddress,
    state.user?.wallet_address,
  ]);

  /*
  const generateOfframpAddress = (network: SupportedNetwork) => {
    if (network === "Solana") {
      const alphabet =
        "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
      let value = "";
      for (let i = 0; i < 44; i += 1) {
        value += alphabet[Math.floor(Math.random() * alphabet.length)];
      }
      return value;
    }

    const hex = "0123456789abcdef";
    let value = "0x";
    for (let i = 0; i < 40; i += 1) {
      value += hex[Math.floor(Math.random() * hex.length)];
    }
    return value;
  };

  useEffect(() => {
    if (!instantOfframp) return;
    setOfframpAddress(generateOfframpAddress(selectedNetwork));
  }, [instantOfframp, selectedNetwork]);
  */

  const effectiveDepositAddress = cryptoDepositAddress;

  const truncatedCryptoAddress = useMemo(() => {
    if (
      !effectiveDepositAddress ||
      effectiveDepositAddress === "No wallet address"
    ) {
      return effectiveDepositAddress;
    }
    return `${effectiveDepositAddress.slice(0, 10)}...${effectiveDepositAddress.slice(-15)}`;
  }, [effectiveDepositAddress]);

  /*
  const conversionRateNgn = useMemo(() => {
    const ngnRate = prices.ngn || 0;
    if (!ngnRate) return 0;
    if (selectedToken === "LPT") {
      return (prices.lpt || 0) * ngnRate;
    }
    return ngnRate;
  }, [prices.ngn, prices.lpt, selectedToken]);
  */

  useEffect(() => {
    if (safeMode !== "deposit" || safeAsset !== "crypto") return;
    if (!qrCanvasRef.current || !effectiveDepositAddress) return;

    QRCode.toCanvas(qrCanvasRef.current, effectiveDepositAddress, {
      width: 160,
      margin: 1,
      color: { dark: "#000000", light: "#FFFFFF" },
    });
  }, [safeMode, safeAsset, effectiveDepositAddress]);

  const pageTitle = useMemo(() => {
    if (safeMode === "deposit" && safeAsset === "naira") return "Deposit Naira";
    if (safeMode === "deposit" && safeAsset === "crypto") {
      return `Deposit ${walletTokenLabel}`;
    }
    if (safeMode === "withdraw" && safeAsset === "naira") return "Send Naira";
    return `Send ${walletTokenLabel}`;
  }, [safeAsset, safeMode, walletTokenLabel]);

  const isWithdraw = safeMode === "withdraw";
  const numericAmount = Number(amount.replace(/,/g, "").trim());
  const cryptoAmountWarning =
    isWithdraw &&
    safeAsset === "crypto" &&
    amount.trim() &&
    Number.isFinite(numericAmount) &&
    numericAmount > activeBalance
      ? `Amount exceeds available ${walletTokenLabel} balance`
      : "";
  const isDisabled = isWithdraw
    ? !amount.trim() ||
      (safeAsset === "crypto"
        ? !walletAddress.trim() ||
          !Number.isFinite(numericAmount) ||
          numericAmount <= 0 ||
          numericAmount > activeBalance ||
          isSubmittingCryptoWithdraw
        : !Number.isFinite(numericAmount) || numericAmount <= 0)
    : false;
  const isDepositNairaFlow = safeMode === "deposit" && safeAsset === "naira";
  const isDepositNairaDisabled = numericAmount <= 0 || !tokenRateInNgn;
  const isPrimaryActionDisabled = isDepositNairaFlow
    ? isDepositNairaDisabled
    : isDisabled;

  const handleCopy = async (value: string) => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col">
      <div className="flex-1">
        <div className="flex items-center justify-between px-6 pt-8 pb-4">
          <button
            onClick={() => navigate(-1)}
            className="h-10 w-10 rounded-full bg-[#151515] flex items-center justify-center"
          >
            <ArrowLeft className="text-white" size={22} />
          </button>
          <h1 className="text-lg font-medium">{pageTitle}</h1>
          <div className="w-8" />
        </div>

        <div className="px-6 pb-32">
          {isWithdraw ? (
            <div className="space-y-5 pt-4">
              {safeAsset === "naira" ? (
                <div className="pt-4">
                  <label className="mb-2 block text-sm text-white/70">
                    Amount (NGN)
                  </label>
                  <div className="bg-[#151515] rounded-lg p-3 flex items-center gap-1 mt-2">
                    <span className="text-white/50 text-lg font-medium">₦</span>
                    <input
                      type="text"
                      value={amount ? formatNumber(amount) : ""}
                      onChange={(e) => {
                        const rawValue = parseFormattedNumber(e.target.value);
                        let numericValue = rawValue.replace(/[^₦0-9.]/g, "");
                        numericValue = numericValue.replace(/₦/g, "");
                        const parts = numericValue.split(".");
                        if (parts.length > 2) {
                          numericValue = `${parts[0]}.${parts.slice(1).join("")}`;
                        }
                        setAmount(numericValue);
                      }}
                      placeholder="0"
                      className="flex-1 bg-transparent text-white text-lg font-medium focus:outline-none"
                    />
                  </div>
                  <div className="flex space-x-3 mt-4">
                    {[25, 50, 75, 100].map((percent) => {
                      const nextAmount = (sourceFiatBalance * (percent / 100)).toFixed(2);
                      const isActive =
                        numericAmount > 0 &&
                        Math.abs(numericAmount / (sourceFiatBalance || 1) * 100 - percent) < 5;
                      return (
                        <button
                          key={percent}
                          onClick={() => {
                            setAmount(nextAmount);
                          }}
                          className={`flex-1 py-2.5 px-2 rounded-full text-sm font-medium transition-colors ${
                            isActive
                              ? "bg-[#C7EF6B] text-black"
                              : "bg-[#151515] text-white/80 hover:bg-[#1a1f10]"
                          }`}
                        >
                          {percent}%
                        </button>
                      );
                    })}
                  </div>
                  <div className="rounded-lg bg-[#151515] p-4 mt-4 relative">
                    <button
                      type="button"
                      onClick={() => safeWalletType === "savings" && setShowSourcePicker((v) => !v)}
                      className="w-full text-left"
                    >
                      <h3 className="text-sm text-white/60 mb-0.5 flex items-center gap-1.5">
                        <WalletCards size={16} /> Available balance
                      </h3>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-100 text-sm font-medium">
                          {displayFiatSymbol}{sourceFiatBalance.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                          {" • "}{activeBalance.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 4,
                          })} {walletTokenLabel}
                        </span>
                        {safeWalletType === "savings" && (
                          <ChevronDown size={16} className="text-white/60" />
                        )}
                      </div>
                    </button>
                    {showSourcePicker && safeWalletType === "savings" && (
                      <div className="mt-2 space-y-1 border-t border-white/10 pt-2">
                        {(["combined", "savings", "stash"] as const).map((source) => {
                          const bal = source === "combined" ? combinedBalance
                            : source === "savings" ? savingsBalance
                            : stashBalance;
                          const label = source === "combined" ? "Combined"
                            : source === "savings" ? "Savings"
                            : "Stash";
                          const sub = source === "combined" ? "Burn savings first, then stash"
                            : source === "savings" ? "USDC earning yield"
                            : "Idle USDC in wallet";
                          return (
                            <button
                              key={source}
                              type="button"
                              onClick={() => { setWithdrawSource(source); setShowSourcePicker(false); }}
                              className={`w-full flex items-center justify-between p-2 rounded-lg text-xs ${
                                withdrawSource === source ? "bg-[#C7EF6B]/10 text-white" : "text-white/70 hover:bg-white/5"
                              }`}
                            >
                              <div className="text-left">
                                <span className="font-medium">{label}</span>
                                <p className="text-[10px] text-white/50">{sub}</p>
                              </div>
                              <div className="text-right">
                                <p>{bal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })} USDC</p>
                                <p className="text-[10px] text-white/50">
                                  ₦{(bal * tokenRateInNgn).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </p>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div>
                  <label className="mb-2 block text-sm text-white/70">
                    Amount
                  </label>
                  <input
                    type="text"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0"
                    className="w-full rounded-lg bg-[#151515] px-4 py-3.5 text-base text-white outline-none"
                  />
                  {cryptoAmountWarning ? (
                    <p className="mt-2 text-xs text-amber-300 ml-1">
                      {cryptoAmountWarning}
                    </p>
                  ) : null}
                </div>
              )}

              {safeAsset !== "naira" ? (
                <div>
                  <label className="mb-2 block text-sm text-white/70">
                    Wallet address
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={walletAddress}
                      onChange={(e) => setWalletAddress(e.target.value)}
                      placeholder="Paste wallet address"
                      className="w-full rounded-lg bg-[#151515] pr-12 pl-4 py-3.5 text-base text-white outline-none"
                    />
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          const text = await navigator.clipboard.readText();
                          setWalletAddress(text);
                        } catch (err) {
                          console.error("Failed to read clipboard");
                        }
                      }}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                    >
                      <ClipboardPaste size={18} className="text-white/60" />
                    </button>
                  </div>
                  {activeBalance > 0 && (
                    <div className="rounded-lg bg-[#151515] p-4 mt-4 relative">
                      <button
                        type="button"
                        onClick={() => safeWalletType === "savings" && setShowSourcePicker((v) => !v)}
                        className="w-full text-left"
                      >
                        <h3 className="text-sm text-white/60 mb-0.5 flex items-center gap-1.5">
                          <WalletCards size={16} /> Available balance
                        </h3>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-100 text-sm font-medium">
                            {activeBalance.toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 4,
                            })}{" "}
                            {walletTokenLabel}
                          </span>
                          {safeWalletType === "savings" && (
                            <ChevronDown size={16} className="text-white/60" />
                          )}
                        </div>
                      </button>
                      {showSourcePicker && safeWalletType === "savings" && (
                        <div className="mt-2 space-y-1 border-t border-white/10 pt-2">
                          {(["combined", "savings", "stash"] as const).map((source) => {
                            const bal = source === "combined" ? combinedBalance
                              : source === "savings" ? savingsBalance
                              : stashBalance;
                            const label = source === "combined" ? "Combined"
                              : source === "savings" ? "Savings"
                              : "Stash";
                            const sub = source === "combined" ? "Burn savings first, then stash"
                              : source === "savings" ? "USDC earning yield"
                              : "Idle USDC in wallet";
                            return (
                              <button
                                key={source}
                                type="button"
                                onClick={() => { setWithdrawSource(source); setShowSourcePicker(false); }}
                                className={`w-full flex items-center justify-between p-2 rounded-lg text-xs ${
                                  withdrawSource === source ? "bg-[#C7EF6B]/10 text-white" : "text-white/70 hover:bg-white/5"
                                }`}
                              >
                                <div className="text-left">
                                  <span className="font-medium">{label}</span>
                                  <p className="text-[10px] text-white/50">{sub}</p>
                                </div>
                                <div className="text-right">
                                  <p>{bal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })} USDC</p>
                                  <p className="text-[10px] text-white/50">
                                    ₦{(bal * tokenRateInNgn).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                  </p>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          ) : safeAsset === "naira" ? (
            <div className="pt-4">
              <div className="bg-[#151515] rounded-lg p-3 flex items-center gap-3 mt-2">
                <input
                  type="text"
                  value={amount ? `₦${formatNumber(amount)}` : ""}
                  onChange={(e) => {
                    const rawValue = parseFormattedNumber(e.target.value);
                    let numericValue = rawValue.replace(/[^0-9.]/g, "");
                    const parts = numericValue.split(".");
                    if (parts.length > 2) {
                      numericValue = `${parts[0]}.${parts.slice(1).join("")}`;
                    }
                    setAmount(numericValue);
                    setDepositNairaErrorMessage("");
                  }}
                  placeholder="Select amount"
                  className="flex-1 bg-transparent text-white text-lg font-medium focus:outline-none"
                />
              </div>
              <div className="pt-4">
                <div className="flex space-x-3">
                  {nairaDepositPresetAmounts.map((preset) => {
                    const isActive = numericAmount === preset;
                    return (
                      <button
                        key={preset}
                        onClick={() => {
                          setAmount(String(preset));
                          setDepositNairaErrorMessage("");
                        }}
                        className={`flex-1 py-2.5 px-2 rounded-full text-sm font-medium transition-colors ${
                          isActive
                            ? "bg-[#C7EF6B] text-black"
                            : "bg-[#151515] text-white/80 hover:bg-[#1a1f10]"
                        }`}
                      >
                        ₦{preset >= 1_000_000 ? "1M" : `${preset / 1000}K`}
                      </button>
                    );
                  })}
                </div>
              </div>

              {depositNairaErrorMessage ? (
                <p className="mt-3 text-xs text-amber-300">
                  {depositNairaErrorMessage}
                </p>
              ) : null}
            </div>
          ) : (
            <div className="pt-4 space-y-5">
              <div className="rounded-lg bg-[#151515] p-3">
                <p className="text-sm text-white/60">Cryptocurrency</p>
                <div className="mt-2 flex items-center gap-2 px-1">
                  <img
                    src={currentTokenConfig.icon}
                    alt={selectedToken}
                    className="h-6 w-6 rounded-full object-cover"
                  />
                  <p className="text-base text-white">{selectedToken}</p>
                </div>
              </div>

              <div className="rounded-lg bg-[#151515] p-3">
                <p className="text-sm text-white/60">Network</p>
                <p className="mt-2 px-1 text-base text-white">
                  {selectedNetwork}
                </p>
              </div>

              {/*
            <div className="rounded-lg bg-[#151515] p-4 space-y-2">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <p className="text-sm text-white">Instant Offramp</p>
                  <Tooltip
                    content="Tokens sent will be converted to fiat and credited to your NGN wallet."
                    centered
                  >
                    <Info size={14} className="text-white/50 cursor-help" />
                  </Tooltip>
                </div>
                <Switch
                  checked={instantOfframp}
                  onCheckedChange={setInstantOfframp}
                />
              </div>
              {instantOfframp && (
                <div className="flex items-center gap-2">
                  <p className="text-xs text-white/60">
                    Rate ≈{" "}
                    <span className="text-[#c7ef6b]">
                      ₦
                      {conversionRateNgn.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  </p>

                  <div className="h-3 w-px bg-white/20" />

                  <p className="text-xs text-white/60">
                    Complete deposit within{" "}
                    <span className="text-[#c7ef6b] font-medium">
                      {formatTimer(timerSeconds)}
                    </span>
                  </p>
                </div>
              )}
            </div>
            */}

              <div className="space-y-2">
                <p className="text-sm text-white/60">Wallet address</p>
                <div className="rounded-lg bg-[#151515] p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-base text-white/80 break-all">
                      {truncatedCryptoAddress}
                    </p>
                    <button
                      onClick={() => handleCopy(effectiveDepositAddress)}
                      className="shrink-0"
                    >
                      {copied ? (
                        <Check size={16} className="text-[#c7ef6b]" />
                      ) : (
                        <Copy size={16} className="text-white/70" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex justify-center">
                <div className="rounded-lg bg-white p-3">
                  <canvas ref={qrCanvasRef} className="h-40 w-40" />
                </div>
              </div>

              <div className="rounded-lg bg-[#151515] p-4 mb-10">
                <p className="text-sm text-[#c7ef6b] font-medium mb-2">
                  Important
                </p>
                <ul className="space-y-2 text-xs text-white/75 list-disc pl-5">
                  <li>
                    Send only {selectedToken} on the {selectedNetwork} network
                    to this address.
                  </li>
                  <li>
                    Sending unsupported tokens or using the wrong network may
                    result in loss of funds.
                  </li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>

      {(isWithdraw || (safeMode === "deposit" && safeAsset === "naira")) && (
        <div className="px-6 pb-24 pt-3 bg-[#050505] shrink-0">
          <button
            onClick={
              isDepositNairaFlow ? handleDepositNairaContinue : handleConfirm
            }
            disabled={isPrimaryActionDisabled}
            className={`h-12 w-full rounded-full text-base font-semibold transition-colors ${
              isPrimaryActionDisabled
                ? "bg-[#505050] text-white/40"
                : "bg-[#c7ef6b] text-black"
            }`}
          >
            {isSubmittingCryptoWithdraw ? (
              <span className="inline-flex items-center gap-2">
                <LoaderCircle size={16} className="animate-spin" />
                Loading...
              </span>
            ) : (
              "Continue"
            )}
          </button>
        </div>
      )}

      {depositNairaRampDetails ? (
        <PajRampDrawer
          isOpen={showDepositNairaRampDrawer}
          onClose={() => setShowDepositNairaRampDrawer(false)}
          details={depositNairaRampDetails}
          onConfirm={async () => {
            await refreshAllWalletData();
            navigate(`/wallet/${safeWalletType}`);
          }}
        />
      ) : null}

      {withdrawNairaRampDetails ? (
        <PajRampDrawer
          isOpen={showWithdrawNairaRampDrawer}
          onClose={() => setShowWithdrawNairaRampDrawer(false)}
          details={withdrawNairaRampDetails}
          onConfirm={async () => {
            await refreshAllWalletData();
            navigate(`/wallet/${safeWalletType}`);
          }}
        />
      ) : null}

      <SuccessDrawer
        isOpen={showCryptoWithdrawSuccess}
        onClose={() => {
          setShowCryptoWithdrawSuccess(false);
          navigate(`/wallet/${safeWalletType}`);
        }}
        title="Withdrawal successful"
        message={`Your ${walletTokenLabel} has been sent to the destination wallet.`}
      />

      <ErrorDrawer
        isOpen={showCryptoWithdrawError}
        onClose={() => setShowCryptoWithdrawError(false)}
        title="Withdrawal failed"
        message={cryptoWithdrawErrorMessage}
      />

      <BottomNavigation currentPath="/wallet" />
    </div>
  );
};

const nairaDepositPresetAmounts = [
  50_000, 100_000, 500_000, 1_000_000,
] as const;
