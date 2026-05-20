import React, { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Drawer } from "vaul";
import { Check, Copy, LoaderCircle, X } from "lucide-react";
import toast from "react-hot-toast";
import { formatNumber } from "@/lib/formatters";
import { pajRampService, perenaService, walletService } from "@/services";
import { useWallet } from "@/contexts/WalletContext";
import { useAuth } from "@/contexts/AuthContext";
import type {
  OffRampOrderData,
  OnRampOrderData,
  RampBank,
} from "@/services/paj-ramp";

export interface PajRampTransactionDetails {
  type: "buy" | "sell";
  tokenAmount: number;
  tokenName: string;
  fiatAmount: number;
  fiatSymbol: string;
  fiatCurrency: string;
  exchangeRate: number;
  fee: number;
  cryptoAddress: string | null;
  customerName?: string;
  bankCode?: string;
  bankAccountNumber?: string;
  bankAccountName?: string;
  bankName?: string;
  mint: string;
  chain: string;
  withdrawSource?: "savings" | "stash" | "combined";
}

interface PajRampDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  details: PajRampTransactionDetails;
  onConfirm: () => void;
  isLoading?: boolean;
}

type Step =
  | "checking_session"
  | "auth_otp"
  | "creating_order"
  | "order_ready"
  | "processing"
  | "success"
  | "error"
  | "no_bank";

export const PajRampDrawer: React.FC<PajRampDrawerProps> = ({
  isOpen,
  onClose,
  details,
  onConfirm,
  isLoading: externalLoading = false,
}) => {
  const navigate = useNavigate();
  const { solanaWalletId, solanaWalletAddress, solanaUsdcBalance, stablesBalance, refreshAllWalletData } =
    useWallet();
  const { state } = useAuth();

  const [step, setStep] = useState<Step>("checking_session");
  const [otp, setOtp] = useState("");
  const [orderData, setOrderData] = useState<
    OnRampOrderData | OffRampOrderData | null
  >(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const hasCheckedSession = useRef(false);

  const isBuy = details.type === "buy";
  const genericFailureMessage = isBuy
    ? "Sorry your deposit couldn't be completed at the moment, please try again."
    : "Sorry your withdrawal couldn't be completed at the moment, please try again.";
  const defaultSuccessMessage = isBuy
    ? `Great, the bank account details below have been assigned for your deposit of ${details.fiatSymbol}${formatNumber(details.fiatAmount || 0, 2)}.`
    : `Great, you've successfully withdrawn ${formatNumber(details.tokenAmount || 0, 4)} ${details.tokenName}.`;

  const resetState = useCallback(() => {
    setStep("checking_session");
    setOtp("");
    setOrderData(null);
    setErrorMessage("");
    setCopiedField(null);
    setIsSubmitting(false);
    hasCheckedSession.current = false;
  }, []);

  useEffect(() => {
    if (!isOpen) {
      const timer = setTimeout(resetState, 250);
      return () => clearTimeout(timer);
    }
  }, [isOpen, resetState]);

  const resolveBankCode = useCallback(async (bankName: string): Promise<string | null> => {
    const response = await pajRampService.getBanks();
    if (!response.success || !response.data?.length) return null;

    const normalize = (value: string) =>
      value.toLowerCase().replace(/[^a-z0-9]/g, "");
    const target = normalize(bankName);

    const exact = response.data.find((bank: RampBank) => normalize(bank.name) === target);
    if (exact) return exact.code;

    const fuzzy = response.data.find((bank: RampBank) => {
      const candidate = normalize(bank.name);
      return candidate.includes(target) || target.includes(candidate);
    });
    return fuzzy?.code || null;
  }, []);

  const createOrder = useCallback(async () => {
    setStep("creating_order");
    setOrderData(null);
    setErrorMessage("");

    try {
      if (isBuy) {
        if (!details.cryptoAddress) {
          setErrorMessage("Wallet address not available. Please try again.");
          setStep("error");
          return;
        }

        const resp = await pajRampService.createOnRampOrder({
          fiatAmount: details.fiatAmount,
          currency: details.fiatCurrency,
          recipient: details.cryptoAddress,
          mint: details.mint,
          chain: details.chain,
        });

        if (resp.success && resp.data) {
          setOrderData(resp.data);
          setStep("order_ready");
        } else {
          setErrorMessage(
            resp.error?.message || genericFailureMessage,
          );
          setStep("error");
        }
      } else {
        let bankCode = details.bankCode || state.user?.linked_account?.bank_code || "";
        const accountNumber = details.bankAccountNumber || state.user?.linked_account?.account_number || "";
        if (!bankCode && details.bankName) {
          const resolved = await resolveBankCode(details.bankName);
          if (!resolved) {
            setErrorMessage("Could not resolve your bank code. Please try again.");
            setStep("error");
            return;
          }
          bankCode = resolved;
        }

        const resp = await pajRampService.createOffRampOrder({
          bank: bankCode || "",
          accountNumber,
          currency: details.fiatCurrency,
          amount: details.tokenAmount,
          fiatAmount: details.fiatAmount,
          mint: details.mint,
          chain: details.chain,
        });

        if (resp.success && resp.data) {
          setOrderData(resp.data);
          setStep("order_ready");
        } else {
          setErrorMessage(
            resp.error?.message || genericFailureMessage,
          );
          setStep("error");
        }
      }
    } catch {
      setErrorMessage(genericFailureMessage);
      setStep("error");
    }
  }, [
    isBuy,
    resolveBankCode,
    details.cryptoAddress,
    details.fiatAmount,
    details.fiatCurrency,
    details.mint,
    details.chain,
    details.tokenAmount,
    details.bankCode,
    details.bankName,
    details.bankAccountNumber,
    state.user?.linked_account,
    genericFailureMessage,
  ]);

  const checkSession = useCallback(async () => {
    setStep("checking_session");
    try {
      const resp = await pajRampService.getSessionStatus();
      if (resp.success && resp.data?.hasActiveSession) {
        if (isBuy) {
          await createOrder();
        } else if (state.user?.linked_account?.bank_code && state.user?.linked_account?.account_number) {
          await createOrder();
        } else {
          setStep("no_bank");
        }
      } else {
        await pajRampService.initiateSession();
        setStep("auth_otp");
      }
    } catch {
      setStep("auth_otp");
    }
  }, [createOrder, isBuy, state.user?.linked_account]);

  useEffect(() => {
    if (!isOpen || hasCheckedSession.current) return;
    hasCheckedSession.current = true;
    checkSession();
  }, [isOpen, checkSession]);

  const handleVerifyOtp = useCallback(async () => {
    const trimmedOtp = otp.trim();
    if (!trimmedOtp) return;

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const resp = await pajRampService.verifySession({
        otp: trimmedOtp,
      });

      if (resp.success) {
        if (isBuy) {
          await createOrder();
        } else if (state.user?.linked_account?.bank_code && state.user?.linked_account?.account_number) {
          await createOrder();
        } else {
          setStep("no_bank");
        }
      } else {
        setErrorMessage(
          resp.error?.message || "Invalid verification code.",
        );
      }
    } catch {
      setErrorMessage("Invalid verification code.");
    } finally {
      setIsSubmitting(false);
    }
  }, [otp, createOrder, isBuy, state.user?.linked_account]);

  const handleStart = useCallback(async () => {
    if (isBuy) {
      toast.success(
        "Confirming transaction. Your stash wallet will be credited accordingly.",
      );
      handleDone();
      return;
    }

    setIsSubmitting(true);
    setStep("processing");
    setErrorMessage("");

    try {
      const offrampData = orderData as OffRampOrderData;
      if (!offrampData?.address) {
        setErrorMessage(genericFailureMessage);
        setStep("error");
        return;
      }

      if (!solanaWalletAddress || !solanaWalletId) {
        setErrorMessage(
          "Solana wallet is unavailable. Please try again.",
        );
        setStep("error");
        return;
      }

      const source = details.withdrawSource;
      if (source === "stash") {
        const sendResp = await walletService.sendSolana({
          walletId: solanaWalletId,
          fromAddress: solanaWalletAddress,
          toAddress: offrampData.address,
          token: "USDC",
          amount: details.tokenAmount,
        });
        if (!sendResp.success) {
          setErrorMessage(sendResp.error || genericFailureMessage);
          setStep("error");
          return;
        }
      } else {
        const burnAmount = source === "combined"
          ? Math.min(details.tokenAmount, stablesBalance ?? 0)
          : details.tokenAmount;

        const burnResp = await perenaService.burn({
          walletId: solanaWalletId,
          walletAddress: solanaWalletAddress,
          usdStarAmount: burnAmount,
        });
        if (!burnResp.success) {
          setErrorMessage(burnResp.error || genericFailureMessage);
          setStep("error");
          return;
        }

        const sendResp = await walletService.sendSolana({
          walletId: solanaWalletId,
          fromAddress: solanaWalletAddress,
          toAddress: offrampData.address,
          token: "USDC",
          amount: details.tokenAmount,
        });
        if (!sendResp.success) {
          setErrorMessage(sendResp.error || genericFailureMessage);
          setStep("error");
          return;
        }
      }

      await refreshAllWalletData();
      setStep("success");
    } catch {
      setErrorMessage(genericFailureMessage);
      setStep("error");
    } finally {
      setIsSubmitting(false);
    }
  }, [
    isBuy,
    orderData,
    solanaWalletAddress,
    solanaWalletId,
    details.tokenAmount,
    details.withdrawSource,
    stablesBalance,
    genericFailureMessage,
    refreshAllWalletData,
  ]);

  const handleDone = () => {
    onConfirm();
    onClose();
  };

  const handleCopy = async (value: string, field: string) => {
    await navigator.clipboard.writeText(value);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 1800);
  };

  const handleRetry = () => {
    if (step !== "error") return;
    createOrder();
  };

  const truncatedAddress = (address: string) =>
    `${address.slice(0, 10)}...${address.slice(-8)}`;

  const LoadingValue = () => (
    <span className="inline-flex items-center">
      <LoaderCircle className="h-4 w-4 animate-spin text-white/70" />
    </span>
  );

  const renderContent = () => {
    switch (step) {
      case "checking_session":
        return (
          <>
            <div className="flex justify-end pt-2">
              <button
                onClick={onClose}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-[#151515] text-white transition-colors hover:bg-[#1a1f10]"
              >
                <X size={20} />
              </button>
            </div>
            <div className="flex flex-col items-center px-4 py-12">
              <LoaderCircle className="mb-4 h-10 w-10 animate-spin text-[#C7EF6B]" />
              <p className="text-sm text-white/60">Loading, please wait</p>
            </div>
          </>
        );

      case "auth_otp":
        return (
          <>
            <div className="flex justify-end pt-2">
              <button
                onClick={onClose}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-[#151515] text-white transition-colors hover:bg-[#1a1f10]"
              >
                <X size={20} />
              </button>
            </div>
            <div className="flex flex-col items-center px-4">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#C7EF6B]/20">
                <img
                  src="/ramp.png"
                  alt="Ramp"
                  className="h-full w-full object-cover"
                />
              </div>
              <h2 className="mb-2 text-lg font-medium text-white">
               Confirm OTP
              </h2>
              <p className="mb-6 text-center text-sm text-white/60 px-4">
                Enter the OTP sent to your registered email or phone
              </p>
              <input
                type="text"
                value={otp}
                onChange={(e) =>
                  setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                }
                placeholder="0000"
                className="mb-1 w-full rounded-lg bg-[#151515] px-4 py-3 text-center text-lg text-white outline-none"
              />
              {errorMessage ? (
                <p className="mb-4 w-full text-left text-xs text-amber-300">
                  {errorMessage}
                </p>
              ) : null}
              <button
                onClick={handleVerifyOtp}
                disabled={otp.length < 4 || isSubmitting}
                className="flex h-12 mt-2 w-full items-center justify-center rounded-full bg-[#C7EF6B] text-lg font-medium text-black transition-colors disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting ? (
                  <LoaderCircle className="h-6 w-6 animate-spin text-black" />
                ) : (
                  "Verify"
                )}
              </button>

            </div>
          </>
        );

      case "creating_order":
        return (
          <>
            <div className="flex justify-end pt-2">
              <button
                onClick={onClose}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-[#151515] text-white transition-colors hover:bg-[#1a1f10]"
              >
                <X size={20} />
              </button>
            </div>
            <div className="flex flex-col items-center px-4 py-12">
              <LoaderCircle className="mb-4 h-10 w-10 animate-spin text-[#C7EF6B]" />
              <p className="text-sm text-white/60">Loading, please wait</p>
            </div>
          </>
        );

      case "order_ready": {
        if (isBuy) {
          const onrampData = orderData as OnRampOrderData;
          const displayFiat = onrampData?.fiatAmount ?? details.fiatAmount;
          const fields = [
            { label: "Bank", value: onrampData?.bank || "—" },
            {
              label: "Account Number",
              value: onrampData?.accountNumber || "—",
              copyable: true,
            },
            {
              label: "Account Name",
              value: onrampData?.accountName || "—",
            },
            {
              label: "Amount",
              value: `${details.fiatSymbol}${formatNumber(displayFiat || 0, 2)}`,
              copyable: true,
            },
          ];

          return (
            <>
              <div className="flex justify-end pt-2">
                <button
                  onClick={onClose}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-[#151515] text-white transition-colors hover:bg-[#1a1f10]"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="flex flex-col items-center px-4">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#C7EF6B]/20">
                  <img
                    src="/ramp.png"
                    alt="Ramp"
                    className="h-full w-full object-cover"
                  />
                </div>
                <p className="mb-1 text-center text-sm text-gray-400">
                  You are about to deposit{" "}
                  {details.fiatSymbol}
                  {formatNumber(displayFiat || 0, 2)} for
                </p>
                <h2 className="mb-4 flex min-h-9 items-center text-center text-xl font-medium text-[#C7EF6B]">
                  {orderData
                    ? `${formatNumber(details.tokenAmount || 0, 4)} ${details.tokenName}`
                    : null}
                </h2>

                <div className="mb-5 w-full space-y-3 rounded-2xl bg-[#151515] p-4">
                  {fields.map((field) => (
                    <div
                      key={field.label}
                      className="flex items-center justify-between"
                    >
                      <p className="text-sm text-white/60">
                        {field.label}
                      </p>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-white">
                          {field.value}
                        </p>
                        {field.copyable ? (
                          <button
                            onClick={() =>
                              handleCopy(field.value, field.label)
                            }
                          >
                            {copiedField === field.label ? (
                              <Check
                                size={14}
                                className="text-[#c7ef6b]"
                              />
                            ) : (
                              <Copy
                                size={14}
                                className="text-white/50"
                              />
                            )}
                          </button>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mb-5 w-full rounded-lg bg-[#151515] p-4">
                  <p className="text-sm font-medium text-[#c7ef6b]">
                    How to complete your deposit
                  </p>
                  <ol className="mt-2 list-inside list-decimal space-y-1 text-xs text-white/75">
                    <li>
                      Send{" "}
                      <span className="font-medium text-white">
                        exactly {details.fiatSymbol}
                        {formatNumber(displayFiat || 0, 2)}
                      </span>{" "}
                      from your bank account to the account details
                      above.
                    </li>
                    <li>
                      Your deposit will be processed automatically
                      once the transfer is confirmed.
                    </li>
                  </ol>
                </div>

                <div className="w-full pb-3">
                  <button
                    onClick={handleStart}
                    disabled={externalLoading}
                    className="flex h-12 w-full items-center justify-center rounded-full bg-[#C7EF6B] text-lg font-medium text-black transition-colors hover:bg-[#B8E55A] disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    Done
                  </button>
                </div>
              </div>
            </>
          );
        }

        const offrampData = orderData as OffRampOrderData;
        const displayFiat = offrampData?.fiatAmount ?? details.fiatAmount;
        return (
          <>
            <div className="flex justify-end pt-2">
              <button
                onClick={onClose}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-[#151515] text-white transition-colors hover:bg-[#1a1f10]"
              >
                <X size={20} />
              </button>
            </div>
            <div className="flex flex-col items-center px-4">
              <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-[#C7EF6B]/20">
                <img
                  src="/ramp.png"
                  alt="Ramp"
                  className="h-full w-full object-cover"
                />
              </div>
              <p className="mb-1 text-center text-sm text-gray-400">
                You are about to withdraw{" "}
                {formatNumber(details.tokenAmount || 0, 4)}{" "}
                {details.tokenName} for
              </p>
              <h2 className="mb-4 flex min-h-[2.25rem] items-center text-center text-2xl font-medium text-[#C7EF6B]">
                {orderData
                  ? `${details.fiatSymbol}${formatNumber(displayFiat || 0, 2)}`
                  : null}
              </h2>

              <div className="mb-5 w-full space-y-3 rounded-2xl bg-[#151515] p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-white/60">Sending</p>
                  <p className="text-sm font-medium text-white">
                    {orderData
                      ? `${formatNumber(offrampData?.amount || details.tokenAmount, 4)} ${details.tokenName}`
                      : null}
                  </p>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-white/60">Receiving</p>
                  <p className="text-sm font-medium text-white">
                    {orderData
                      ? `${details.fiatSymbol}${formatNumber(offrampData?.fiatAmount || details.fiatAmount, 2)}`
                      : null}
                  </p>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-white/60">Rate</p>
                  <p className="text-sm font-medium text-white">
                    {orderData
                      ? `${details.fiatSymbol}${formatNumber(offrampData?.rate ?? details.exchangeRate, 2)}`
                      : null}
                  </p>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-white/60">Fee</p>
                  <p className="text-sm font-medium text-white">
                    {orderData
                      ? `${details.fiatSymbol}${formatNumber(offrampData?.fee ?? details.fee, 2)}`
                      : null}
                  </p>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-white/60">
                    Destination address
                  </p>
                  <p className="max-w-[180px] truncate text-sm font-medium text-white">
                    {orderData
                      ? truncatedAddress(offrampData?.address || "")
                      : null}
                  </p>
                </div>
              </div>

              <div className="w-full pb-3">
                <button
                  onClick={handleStart}
                  disabled={
                    isSubmitting || externalLoading
                  }
                  className="flex h-12 w-full items-center justify-center rounded-full bg-[#C7EF6B] text-lg font-medium text-black transition-colors hover:bg-[#B8E55A] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isSubmitting ? (
                    <LoaderCircle className="h-6 w-6 animate-spin text-black" />
                  ) : (
                    "Confirm Withdrawal"
                  )}
                </button>
              </div>
            </div>
          </>
        );
      }

      case "processing":
        return (
          <>
            <div className="flex justify-end pt-2">
              <button
                onClick={onClose}
                disabled
                className="flex h-10 w-10 items-center justify-center rounded-full bg-[#151515] text-white opacity-50"
              >
                <X size={20} />
              </button>
            </div>
            <div className="flex flex-col items-center px-4 py-12">
              <LoaderCircle className="mb-4 h-10 w-10 animate-spin text-[#C7EF6B]" />
              <p className="text-sm text-white/60">Loading, please wait</p>
            </div>
          </>
        );

      case "success":
        return (
          <div className="flex flex-col items-center px-4">
            <div className="mb-4 mt-4 flex h-20 w-20 items-center justify-center rounded-full bg-[#C7EF6B]/20">
              <img
                src="/fund.png"
                alt="Success"
                className="h-18 w-18 object-cover"
              />
            </div>
            <h2 className="mb-2 text-center text-lg font-medium tracking-wide text-white">
              {isBuy
                ? "Deposit initiated"
                : "Withdrawal successful"}
            </h2>
            <p className="mb-4 text-center text-sm text-white/80">
              {defaultSuccessMessage}
            </p>
            <div className="mb-4 mt-2 w-full pb-4">
              <button
                onClick={handleDone}
                className="flex h-12 w-full items-center justify-center rounded-full bg-[#C7EF6B] text-lg font-medium text-black transition-colors hover:bg-[#B8E55A]"
              >
                Done
              </button>
            </div>
          </div>
        );

      case "error":
        return (
          <>
            <div className="flex justify-end pt-2">
              <button
                onClick={onClose}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-[#151515] text-white transition-colors hover:bg-[#1a1f10]"
              >
                <X size={20} />
              </button>
            </div>
            <div className="flex flex-col items-center px-4">
              <div className="relative mb-4 mt-2 flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-gray-500/15">
                <img
                  src="/error.png"
                  alt="Error"
                  className="h-16 w-16 object-cover"
                />
              </div>
              <h2 className="mb-2 text-center text-lg font-medium tracking-wide text-white">
                {isBuy ? "Deposit failed" : "Withdrawal failed"}
              </h2>
              <p className="mb-4 max-w-[280px] text-center text-sm text-white/80">
                {errorMessage}
              </p>
              <div className="w-full space-y-3 pb-4">
                <button
                  onClick={handleRetry}
                  className="flex h-12 w-full items-center justify-center rounded-full bg-[#C7EF6B] text-lg font-medium text-black transition-colors hover:bg-[#B8E55A] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  Try again
                </button>
              </div>
            </div>
          </>
        );

      case "no_bank":
        return (
          <>
            <div className="flex justify-end pt-2">
              <button
                onClick={onClose}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-[#151515] text-white transition-colors hover:bg-[#1a1f10]"
              >
                <X size={20} />
              </button>
            </div>
            <div className="flex flex-col items-center px-4">
              <div className="relative mb-4 mt-2 flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-gray-500/15">
                <img
                  src="/error.png"
                  alt="Bank required"
                  className="h-16 w-16 object-cover"
                />
              </div>
              <h2 className="mb-2 text-center text-lg font-medium tracking-wide text-white">
                Bank account required
              </h2>
              <p className="mb-6 max-w-[280px] text-center text-sm text-white/80">
                You need to link a bank account before you can withdraw. Set it
                up in your settings, then come back to try again.
              </p>
              <div className="w-full space-y-3 pb-4">
                <button
                  onClick={() => {
                    onClose();
                    navigate("/settings/recipients");
                  }}
                  className="flex h-12 w-full items-center justify-center rounded-full bg-[#C7EF6B] text-lg font-medium text-black"
                >
                  Set up bank account
                </button>
              </div>
            </div>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <Drawer.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" />
        <Drawer.Content className="fixed bottom-0 left-0 right-0 z-50 flex h-auto max-h-[90vh] flex-col rounded-t-4xl border-t border-[#505050] bg-[#050505]">
          <div className="scrollbar-hide flex-1 overflow-y-auto rounded-t-4xl bg-[#050505] p-4">
            {renderContent()}
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
};
