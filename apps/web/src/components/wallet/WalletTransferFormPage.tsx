import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  Check,
  Copy,
  ClipboardPaste,
  LoaderCircle,
} from "lucide-react";
import { BottomNavigation } from "@/components/general/BottomNavigation";
import { ErrorDrawer } from "@/components/general/ErrorDrawer";
import {
  RampDrawer,
  type RampTransactionDetails,
} from "@/components/general/RampDrawer";
import { SuccessDrawer } from "@/components/general/SuccessDrawer";
import { useAuth } from "@/contexts/AuthContext";
import { useWallet } from "@/contexts/WalletContext";
import { usePrices } from "@/hooks/usePrices";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import QRCode from "qrcode";
import {
  virtualAccountService,
} from "@/services/virtual-account";
import { rampService } from "@/services/ramp";
import type { BankInfo } from "@/services/ramp/types";
import { perenaService, walletService } from "@/services";
import { WithdrawalConfirmationDrawer } from "@/components/general/FiatWithdrawalDrawer";
import { formatNumber, parseFormattedNumber } from "@/lib/formatters";

type TransferMode = "deposit" | "withdraw";
type TransferAsset = "naira" | "crypto";
const MIN_WITHDRAWAL_NAIRA = 100;
const MAX_WITHDRAWAL_NAIRA = 500000;
const WITHDRAWAL_FEE_NAIRA = 50;

type SupportedToken = "USDC" | "USDT" | "LPT";
type SupportedNetwork = "Solana" | "Arbitrum";

const TOKEN_CONFIG: Record<
  SupportedToken,
  { icon: string; networks: SupportedNetwork[] }
> = {
  USDC: { icon: "/usdc.svg", networks: ["Solana"] },
  USDT: { icon: "/usdt.svg", networks: ["Solana"] },
  LPT: { icon: "/livepeer.webp", networks: ["Arbitrum"] },
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
  const {
    solanaWalletAddress,
    solanaWalletId,
    ethereumWalletAddress,
    stablesBalance,
    highyieldBalance,
    refreshAllWalletData,
  } = useWallet();
  const qrCanvasRef = useRef<HTMLCanvasElement>(null);

  const safeMode: TransferMode = mode === "withdraw" ? "withdraw" : "deposit";
  const safeAsset: TransferAsset = asset === "crypto" ? "crypto" : "naira";
  const safeWalletType = searchParams.get("walletType") === "staking" ? "staking" : "savings";
  const preferredToken: SupportedToken =
    safeWalletType === "staking" ? "LPT" : "USDC";
  const isNairaWithdraw = safeMode === "withdraw" && safeAsset === "naira";

  const [amount, setAmount] = useState("");
  const [bankCode, setBankCode] = useState("");
  const [banks, setBanks] = useState<BankInfo[]>([]);
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");
  const [lookupError, setLookupError] = useState("");
  const [isLookingUpAccount, setIsLookingUpAccount] = useState(false);
  const [isSubmittingWithdraw, setIsSubmittingWithdraw] = useState(false);
  const [isSubmittingCryptoWithdraw, setIsSubmittingCryptoWithdraw] =
    useState(false);
  const [showWithdrawFlow, setShowWithdrawFlow] = useState(false);
  const [showCryptoWithdrawSuccess, setShowCryptoWithdrawSuccess] =
    useState(false);
  const [showCryptoWithdrawError, setShowCryptoWithdrawError] = useState(false);
  const [showDepositNairaRampDrawer, setShowDepositNairaRampDrawer] =
    useState(false);
  const [depositNairaErrorMessage, setDepositNairaErrorMessage] = useState("");
  const [depositNairaRampDetails, setDepositNairaRampDetails] =
    useState<RampTransactionDetails | null>(null);
  const [cryptoWithdrawErrorMessage, setCryptoWithdrawErrorMessage] =
    useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [copied, setCopied] = useState(false);
  const [selectedToken, setSelectedToken] = useState<SupportedToken>(
    preferredToken,
  );
  const [selectedNetwork, setSelectedNetwork] =
    useState<SupportedNetwork>("Solana");

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

  const loadBanks = useCallback(async () => {
    if (!isNairaWithdraw) return;

    const response = await rampService.getBanks();
    if (response.success && response.data?.length) {
      setBanks(response.data);
      setBankCode((prev) => prev || response.data?.[0]?.code || "");
      return;
    }

    setBanks([]);
    setBankCode("");
  }, [isNairaWithdraw]);

  const handleDepositNairaContinue = useCallback(() => {
    const parsedAmount = Number(amount.replace(/,/g, "").trim());
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setDepositNairaErrorMessage("Select a valid amount to continue.");
      return;
    }
    if (!tokenRateInNgn) {
      setDepositNairaErrorMessage("Rate unavailable right now. Please try again.");
      return;
    }

    const cryptoAddress =
      tokenSymbol === "LPT"
        ? ethereumWalletAddress || state.user?.wallet_address || null
        : solanaWalletAddress || null;
    if (!cryptoAddress) {
      setDepositNairaErrorMessage("Wallet address not available. Please try again.");
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
      processingTime: "1 minute",
      paymentMethodText: "Bank transfer",
      cryptoAddress,
      customerEmail: state.user?.email || "",
      customerName: state.user?.full_name || "Lisar User",
    });
    setDepositNairaErrorMessage("");
    setShowDepositNairaRampDrawer(true);
  }, [
    amount,
    ethereumWalletAddress,
    solanaWalletAddress,
    state.user?.email,
    state.user?.full_name,
    state.user?.wallet_address,
    tokenRateInNgn,
    tokenSymbol,
  ]);

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
        const availableStableBalance = stablesBalance || 0;
        if (parsedAmount > availableStableBalance) {
          setCryptoWithdrawErrorMessage("Amount exceeds available USDC balance.");
          setShowCryptoWithdrawError(true);
          return;
        }
        if (!solanaWalletAddress || !solanaWalletId) {
          setCryptoWithdrawErrorMessage("Solana wallet is unavailable. Please try again.");
          setShowCryptoWithdrawError(true);
          return;
        }

        const burnResp = await perenaService.burn({
          walletId: solanaWalletId,
          walletAddress: solanaWalletAddress,
          usdStarAmount: parsedAmount,
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
      } else {
        const availableLptBalance = highyieldBalance || 0;
        if (parsedAmount > availableLptBalance) {
          setCryptoWithdrawErrorMessage("Amount exceeds available LPT balance.");
          setShowCryptoWithdrawError(true);
          return;
        }
        if (!state.user?.wallet_id || !state.user?.wallet_address) {
          setCryptoWithdrawErrorMessage("Wallet details are unavailable. Please try again.");
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
    state.user?.wallet_address,
    state.user?.wallet_id,
    walletAddress,
  ]);

  const handleConfirm = useCallback(() => {
    if (safeAsset === "crypto") {
      void handleCryptoWithdraw();
      return;
    }
    if (!isNairaWithdraw) return;

    const parsedAmount = Number(amount.replace(/,/g, "").trim());
    if (
      !parsedAmount ||
      parsedAmount < MIN_WITHDRAWAL_NAIRA ||
      parsedAmount > MAX_WITHDRAWAL_NAIRA
    ) {
      return;
    }

    if (!bankCode || accountNumber.length !== 10 || !accountName.trim()) {
      return;
    }
    setShowWithdrawFlow(true);
  }, [
    accountName,
    accountNumber,
    amount,
    bankCode,
    handleCryptoWithdraw,
    isNairaWithdraw,
    safeAsset,
  ]);

  const confirmWithdrawal = useCallback(async (_pin: string) => {
    if (!isNairaWithdraw) return { success: false, error: "Invalid state" };
    const parsedAmount = Number(amount.replace(/,/g, "").trim());
    if (
      !parsedAmount ||
      parsedAmount < MIN_WITHDRAWAL_NAIRA ||
      parsedAmount > MAX_WITHDRAWAL_NAIRA
    ) {
      return { success: false, error: "Invalid amount" };
    }

    const withdrawalTotalAmount = Math.max(
      parsedAmount + WITHDRAWAL_FEE_NAIRA,
      0,
    );
    const idempotencyKey =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `wd-${Date.now()}-${Math.random().toString(36).slice(2)}-${accountNumber}`;

    setIsSubmittingWithdraw(true);
    try {
      const response = await virtualAccountService.withdraw({
        amount: withdrawalTotalAmount,
        accountNumber,
        accountName,
        bankCode,
        narration: "Lisar payout",
        idempotencyKey,
      });

      if (!response.success) {
        return {
          success: false,
          error: response.error?.message || "Withdrawal failed",
        };
      }
      await refreshAllWalletData();
      return { success: true };
    } catch (error) {
      return { success: false, error: "Withdrawal failed" };
    } finally {
      setIsSubmittingWithdraw(false);
    }
  }, [
    accountName,
    accountNumber,
    amount,
    bankCode,
    isNairaWithdraw,
    refreshAllWalletData,
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
    return ethereumWalletAddress || state.user?.wallet_address || "No wallet address";
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

  useEffect(() => {
    if (!isNairaWithdraw) return;
    loadBanks();
  }, [isNairaWithdraw, loadBanks]);

  useEffect(() => {
    if (!isNairaWithdraw) return;
    if (!bankCode || accountNumber.length !== 10) {
      setAccountName("");
      setLookupError("");
      return;
    }

    let ignore = false;
    const runLookup = async () => {
      setIsLookingUpAccount(true);
      setLookupError("");
      try {
        const response = await rampService.lookupAccount({
          accountNumber,
          bankCode,
        });

        if (!ignore) {
          if (response.success && response.data?.accountName) {
            setAccountName(response.data.accountName);
            setLookupError("");
          } else {
            setAccountName("");
            setLookupError(
              "Account not found",
            );
          }
        }
      } catch (error) {
        if (!ignore) {
          setAccountName("");
          setLookupError("Account not found");
        }
      } finally {
        if (!ignore) {
          setIsLookingUpAccount(false);
        }
      }
    };

    runLookup();

    return () => {
      ignore = true;
    };
  }, [accountNumber, bankCode, isNairaWithdraw]);

  const walletTokenLabel = safeWalletType === "staking" ? "LPT" : "USDC";
  const cryptoAvailableBalance =
    safeWalletType === "staking"
      ? highyieldBalance || 0
      : stablesBalance || 0;

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
  const selectedBankName =
    banks.find((bank) => bank.code === bankCode)?.name || "Selected bank";
  const hasValidWithdrawalAmount =
    Number.isFinite(numericAmount) &&
    numericAmount >= MIN_WITHDRAWAL_NAIRA &&
    numericAmount <= MAX_WITHDRAWAL_NAIRA;
  const amountWarning =
    isNairaWithdraw && amount.trim()
      ? numericAmount < MIN_WITHDRAWAL_NAIRA
        ? `Minimum withdrawal is ₦${MIN_WITHDRAWAL_NAIRA.toLocaleString()}`
        : numericAmount > MAX_WITHDRAWAL_NAIRA
          ? `Maximum withdrawal is ₦${MAX_WITHDRAWAL_NAIRA.toLocaleString()}`
          : ""
      : "";
  const cryptoAmountWarning =
    isWithdraw &&
    safeAsset === "crypto" &&
    amount.trim() &&
    Number.isFinite(numericAmount) &&
    numericAmount > cryptoAvailableBalance
      ? `Amount exceeds available ${walletTokenLabel} balance`
      : "";
  const isDisabled = isWithdraw
    ? !amount.trim() ||
    (safeAsset === "crypto"
      ? !walletAddress.trim() ||
      !Number.isFinite(numericAmount) ||
      numericAmount <= 0 ||
      numericAmount > cryptoAvailableBalance ||
      isSubmittingCryptoWithdraw
      : !bankCode.trim() ||
      accountNumber.length !== 10 ||
      !accountName.trim() ||
      !hasValidWithdrawalAmount ||
      isLookingUpAccount ||
      isSubmittingWithdraw)
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
      <div className="flex-1 overflow-y-auto">
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
              <div>
                <label className="mb-2 block text-sm text-white/70">
                  Amount {safeAsset === "naira" ? "(NGN)" : ""}
                </label>
                <input
                  type="text"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder={safeAsset === "naira" ? "0" : "0"}
                  className="w-full rounded-lg bg-[#151515] px-4 py-3.5 text-base text-white outline-none"
                />
                {amountWarning ? (
                  <p className="mt-2 text-xs text-amber-300 ml-1">{amountWarning}</p>
                ) : null}
                {cryptoAmountWarning ? (
                  <p className="mt-2 text-xs text-amber-300 ml-1">{cryptoAmountWarning}</p>
                ) : null}
              </div>

              {safeAsset === "naira" ? (
                <>
                  <div>
                    <label className="mb-2 block text-sm text-white/70">
                      Bank
                    </label>
                    <Select value={bankCode} onValueChange={setBankCode}>
                      <SelectTrigger className="w-full bg-[#151515] text-white border-none py-6">
                        <SelectValue placeholder="Select bank" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#151515] text-white border-none">
                        {banks.map((bank) => (
                          <SelectItem
                            key={bank.code}
                            value={bank.code}
                            className="focus:bg-white/10 focus:text-white"
                          >
                            {bank.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="mb-2 block text-sm text-white/70">
                      Account number
                    </label>
                    <input
                      type="text"
                      value={accountNumber}
                      onChange={(e) =>
                        setAccountNumber(
                          e.target.value.replace(/\D/g, "").slice(0, 10),
                        )
                      }
                      placeholder="Enter account number"
                      className="w-full rounded-lg bg-[#151515] px-4 py-3.5 text-base text-white outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm text-white/70">
                      Account name
                    </label>
                    <input
                      type="text"
                      value={accountName}
                      onChange={(e) => setAccountName(e.target.value)}
                      placeholder={
                        isLookingUpAccount
                          ? "Fetching account..."
                          : "Account name"
                      }
                      readOnly
                      className="w-full rounded-lg bg-[#151515] px-4 py-3.5 text-base text-white outline-none"
                    />
                    {lookupError ? (
                      <p className="mt-2 text-xs text-amber-300 ml-1">{lookupError}</p>
                    ) : null}
                  </div>
                </>
              ) : (
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
                  <p className="mt-2 text-xs text-white/60">
                    Available: {cryptoAvailableBalance.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 4,
                    })}{" "}
                    {walletTokenLabel}
                  </p>
                </div>
              )}
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
              <p className="text-gray-400 text-xs mt-2 pl-2">
                {tokenRateInNgn && numericAmount > 0
                  ? `≈ ${(numericAmount / tokenRateInNgn).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 4,
                    })} ${tokenSymbol}`
                  : `≈ 0.00 ${tokenSymbol}`}
              </p>

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
                <p className="mt-3 text-xs text-amber-300">{depositNairaErrorMessage}</p>
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
                <p className="mt-2 px-1 text-base text-white">{selectedNetwork}</p>
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
                    Send only {selectedToken} on the {selectedNetwork} network to
                    this address.
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
              isDepositNairaFlow
                ? handleDepositNairaContinue
                : handleConfirm
            }
            disabled={isPrimaryActionDisabled}
            className={`h-12 w-full rounded-full text-base font-semibold transition-colors ${isPrimaryActionDisabled
              ? "bg-[#505050] text-white/40"
              : "bg-[#c7ef6b] text-black"
              }`}
          >
            {isLookingUpAccount || isSubmittingCryptoWithdraw ? (
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

      <WithdrawalConfirmationDrawer
        isOpen={showWithdrawFlow}
        onClose={() => setShowWithdrawFlow(false)}
        bankName={selectedBankName}
        accountNumber={accountNumber}
        accountName={accountName}
        amount={numericAmount}
        fee={WITHDRAWAL_FEE_NAIRA}
        onConfirmWithdrawal={confirmWithdrawal}
      />

      {depositNairaRampDetails ? (
        <RampDrawer
          isOpen={showDepositNairaRampDrawer}
          onClose={() => setShowDepositNairaRampDrawer(false)}
          details={depositNairaRampDetails}
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

const nairaDepositPresetAmounts = [50_000, 100_000, 500_000, 1_000_000] as const;
