import React, { useCallback, useEffect, useRef, useState } from "react";
import { Drawer } from "vaul";
import { LoaderCircle, X } from "lucide-react";
import { formatNumber } from "@/lib/formatters";
import { rampService } from "@/services/ramp";
import { virtualAccountService, walletService } from "@/services";
import { useAuth } from "@/contexts/AuthContext";
import { useWallet } from "@/contexts/WalletContext";
import type { OrderData } from "@/services/ramp";

export interface RampTransactionDetails {
  type: "buy" | "sell";
  tokenAmount: number;
  tokenName: string;
  fiatAmount: number;
  fiatSymbol: string;
  fiatCurrency: string;
  exchangeRate: number;
  fee: number;
  processingTime: string;
  paymentMethodText: string;
  cryptoAddress: string | null;
  bankCode?: string;
  bankAccountNumber?: string;
  bankAccountName?: string;
  customerEmail?: string;
  customerName?: string;
  bankName?: string;
}

interface RampDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  details: RampTransactionDetails;
  onConfirm: () => void;
  isLoading?: boolean;
}

export const RampDrawer: React.FC<RampDrawerProps> = ({
  isOpen,
  onClose,
  details,
  onConfirm,
  isLoading: externalLoading = false,
}) => {
  const { state } = useAuth();
  const {
    solanaWalletId,
    solanaWalletAddress,
    ethereumWalletId,
    ethereumWalletAddress,
  } = useWallet();

  const [orderData, setOrderData] = useState<OrderData | null>(null);
  const [orderError, setOrderError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const hasCreatedOrder = useRef(false);

  const isBuy = details.type === "buy";

  const resolveBankCode = useCallback(async (bankName: string) => {
    const response = await rampService.getBanks();
    if (!response.success || !response.data?.length) return null;

    const normalize = (value: string) =>
      value.toLowerCase().replace(/[^a-z0-9]/g, "");
    const target = normalize(bankName);

    const exact = response.data.find((bank) => normalize(bank.name) === target);
    if (exact) return exact.code;

    const fuzzy = response.data.find((bank) => {
      const candidate = normalize(bank.name);
      return candidate.includes(target) || target.includes(candidate);
    });
    return fuzzy?.code || null;
  }, []);

  const createOrder = useCallback(async () => {
    if (!details.cryptoAddress && !isBuy) {
      setOrderError("Wallet address not available. Please try again.");
      return;
    }

    setIsCreatingOrder(true);
    setOrderError("");

    try {
      if (isBuy) {
        const response = await rampService.createBuyOrder({
          fiatAmount: details.fiatAmount,
          fiatCurrency: details.fiatCurrency,
          cryptoCurrency: details.tokenName === "LPT" ? "LPT" : "USDC",
          cryptoNetwork: details.tokenName === "LPT" ? "arbitrum" : "solana",
          cryptoAddress: details.cryptoAddress || "",
          customerEmail: details.customerEmail || "",
          customerName: details.customerName || "",
        });

        if (response.success && response.data) {
          setOrderData(response.data);
        } else {
          setOrderError(response.error?.message || "Failed to create order");
        }
      } else {
        if (
          !details.bankCode ||
          !details.bankAccountNumber ||
          !details.bankAccountName
        ) {
          setOrderError("Naira receiving account not available.");
          return;
        }

        const response = await rampService.createSellOrder({
          cryptoAmount: details.tokenAmount,
          cryptoCurrency: details.tokenName === "LPT" ? "LPT" : "USDC",
          cryptoNetwork: details.tokenName === "LPT" ? "arbitrum" : "solana",
          fiatCurrency: details.fiatCurrency,
          bankAccountNumber: details.bankAccountNumber,
          bankCode: details.bankCode,
          bankAccountName: details.bankAccountName,
          customerEmail: details.customerEmail || "",
          customerName: details.customerName || "",
        });

        if (response.success && response.data) {
          setOrderData(response.data);
        } else {
          setOrderError(response.error?.message || "Failed to create order");
        }
      }
    } catch (error) {
      setOrderError("An error occurred. Please try again.");
    } finally {
      setIsCreatingOrder(false);
    }
  }, [details, isBuy]);

  useEffect(() => {
    if (isOpen && !hasCreatedOrder.current) {
      hasCreatedOrder.current = true;
      createOrder();
    }
  }, [createOrder, isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setOrderData(null);
        setOrderError("");
        setIsSubmitting(false);
        setIsCreatingOrder(false);
        setShowSuccess(false);
        hasCreatedOrder.current = false;
      }, 250);
    }
  }, [isOpen]);

  const handleStart = async () => {
    if (!orderData?.id) {
      setOrderError("Order not ready yet. Please try again.");
      return;
    }

    setIsSubmitting(true);
    setOrderError("");

    try {
      if (isBuy) {
        const paymentAccount = orderData.paymentAccount;
        if (!paymentAccount) {
          setOrderError("Payment account details not available.");
          setIsSubmitting(false);
          return;
        }

        const bankCode = await resolveBankCode(paymentAccount.bankName);
        if (!bankCode) {
          setOrderError("Unable to resolve bank code for transfer.");
          setIsSubmitting(false);
          return;
        }

        const idempotencyKey =
          typeof crypto !== "undefined" && "randomUUID" in crypto
            ? crypto.randomUUID()
            : `ramp-buy-${Date.now()}-${Math.random().toString(36).slice(2)}`;

        const transferResp = await virtualAccountService.withdraw({
          amount: details.fiatAmount,
          accountNumber: paymentAccount.accountNumber,
          accountName: paymentAccount.accountName,
          bankCode,
          narration: `Convert to ${details.tokenName}`,
          idempotencyKey,
        });

        if (!transferResp.success) {
          setOrderError(
            transferResp.error?.message ||
            "Failed to transfer from your Naira balance.",
          );
          setIsSubmitting(false);
          return;
        }

        setShowSuccess(true);
      } else {
        const cryptoAddress = orderData.cryptoAddress;
        if (!cryptoAddress) {
          setOrderError("Destination address not available.");
          setIsSubmitting(false);
          return;
        }

        const numericAmount = details.tokenAmount.toString();
        let transferResponse;

        if (details.tokenName === "USDC") {
          const network = orderData.cryptoNetwork;
          if (network === "solana") {
            if (!solanaWalletAddress || !solanaWalletId) {
              setOrderError("Solana wallet not found.");
              setIsSubmitting(false);
              return;
            }
            transferResponse = await walletService.sendSolana({
              walletId: solanaWalletId,
              fromAddress: solanaWalletAddress,
              toAddress: cryptoAddress,
              token: "USDC",
              amount: details.tokenAmount,
            });
          } else {
            if (!ethereumWalletAddress || !ethereumWalletId) {
              setOrderError("Ethereum wallet not found.");
              setIsSubmitting(false);
              return;
            }
            transferResponse = await walletService.sendToken(1, "USDC", {
              walletId: ethereumWalletId,
              walletAddress: ethereumWalletAddress,
              to: cryptoAddress,
              amount: numericAmount,
            });
          }
        } else {
          if (!state.user) {
            setOrderError("User not authenticated.");
            setIsSubmitting(false);
            return;
          }
          const approveResponse = await walletService.approveLpt({
            walletId: state.user.wallet_id,
            walletAddress: state.user.wallet_address,
            spender: cryptoAddress,
            amount: numericAmount,
          });
          if (!approveResponse.success) {
            setOrderError(approveResponse.message || "Failed to approve LPT.");
            setIsSubmitting(false);
            return;
          }
          transferResponse = await walletService.sendLpt({
            walletId: state.user.wallet_id,
            walletAddress: state.user.wallet_address,
            to: cryptoAddress,
            amount: numericAmount,
          });
        }

        if (!transferResponse?.success) {
          setOrderError(transferResponse?.error || "Failed to send token.");
          setIsSubmitting(false);
          return;
        }

        setShowSuccess(true);
      }
    } catch (error) {
      setOrderError("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDone = () => {
    onConfirm();
    onClose();
  };

  const actionText = isBuy ? "Deposit" : "Withdraw";
  const summaryFiatAmount = orderData?.fiatAmount;
  const summaryTokenAmount = orderData?.cryptoAmount;
  const summaryTokenName = orderData?.cryptoCurrency;
  const summaryRate = orderData?.exchangeRate;
  const summaryStatus = orderData?.status;

  const LoadingValue = () => (
    <span className="inline-flex items-center">
      <LoaderCircle className="w-4 h-4 animate-spin text-white/70" />
    </span>
  );

  return (
    <Drawer.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm" />
        <Drawer.Content className="bg-[#050505] border-t border-[#2a2a2a] flex flex-col rounded-t-4xl h-auto mt-24 max-h-[90vh] fixed bottom-0 left-0 right-0 z-50">
          <div className="p-4 bg-[#050505] rounded-t-4xl flex-1 overflow-y-auto scrollbar-hide">
            {!showSuccess ? (
              <>
                <div className="flex justify-end pt-2">
                  <button
                    onClick={onClose}
                    className="w-10 h-10 bg-[#13170a] rounded-full flex items-center justify-center text-white transition-colors hover:bg-[#1a1f10]"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="flex flex-col items-center justify-center mb-6">
                  <div className="w-20 h-20 bg-[#C7EF6B]/20 rounded-full flex items-center justify-center mb-4 relative overflow-hidden">
                    <img
                      src="/ramp.png"
                      alt="Ramp"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {orderData ? (
                    <>
                      <p className="text-gray-400 text-sm mb-1 text-center">
                        {isBuy
                          ? `You are able to convert ${details.fiatSymbol}${formatNumber(
                            summaryFiatAmount || 0,
                            2,
                          )} to`
                          : `You are able to convert ${formatNumber(
                            summaryTokenAmount || 0,
                            4,
                          )} ${summaryTokenName || details.tokenName} for`}
                      </p>
                      <h2 className="text-[#C7EF6B] text-2xl font-semibold mb-2 text-center">
                        {isBuy
                          ? `${formatNumber(summaryTokenAmount || 0, 4)} ${summaryTokenName || details.tokenName}`
                          : `${details.fiatSymbol}${formatNumber(summaryFiatAmount || 0, 2)}`}
                      </h2>
                    </>
                  ) : (
                    <div className="flex flex-col items-center gap-2 mb-2">
                      <LoadingValue />
                      <LoadingValue />
                    </div>
                  )}

                </div>

                <div className="bg-[#13170a] rounded-2xl p-4 mb-5 space-y-3">
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-white/60">
                      {isBuy ? "You are spending" : "You are receiving"}
                    </p>
                    <p className="text-sm font-medium text-white">
                      {orderData ? (
                        <>
                          {details.fiatSymbol}
                          {formatNumber(summaryFiatAmount || 0, 2)}
                        </>
                      ) : (
                        <LoadingValue />
                      )}
                    </p>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-white/60">
                      {isBuy ? "You will receive" : "You will send"}
                    </p>
                    <p className="text-sm font-medium text-white">
                      {orderData ? (
                        <>
                          {formatNumber(summaryTokenAmount || 0, 4)}{" "}
                          {summaryTokenName || details.tokenName}
                        </>
                      ) : (
                        <LoadingValue />
                      )}
                    </p>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-white/60">
                      Price of {orderData ? summaryTokenName : details.tokenName}
                    </p>
                    <p className="text-sm font-medium text-white">
                      {orderData ? (
                        <>
                          {details.fiatSymbol}
                          {formatNumber(summaryRate || 0, 2)}
                        </>
                      ) : (
                        <LoadingValue />
                      )}
                    </p>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-white/60">Estimated completion</p>
                    <p className="text-sm font-medium text-white">About 1 minute</p>
                  </div>
                
                </div>

                {orderError ? (
                  <p className="text-sm text-red-400 mb-4 text-center">
                    {orderError}
                  </p>
                ) : null}

                <div className="pb-8">
                  <button
                    onClick={handleStart}
                    disabled={
                      isSubmitting ||
                      externalLoading ||
                      isCreatingOrder ||
                      !orderData
                    }
                    className="w-full h-12 rounded-full font-semibold text-lg bg-[#C7EF6B] text-black hover:bg-[#B8E55A] transition-colors flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <LoaderCircle className="w-6 h-6 animate-spin text-black" />
                    ) : (
                      actionText
                    )}
                  </button>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center px-4 py-8">
                <div className="w-20 h-20 bg-[#C7EF6B]/20 rounded-full flex items-center justify-center mb-4 relative overflow-hidden">
                  <img
                    src="/fund.png"
                    alt="Success"
                    className="w-full h-full object-cover"
                  />
                </div>
                <h2 className="text-white text-xl font-bold mb-2 tracking-wide text-center">
                  Conversion successful
                </h2>
                <p className="text-gray-400 text-sm mb-10 text-center">
                  Your wallet balance will update in about a minute.
                </p>
                <div className="w-full mt-2 pb-4">
                  <button
                    onClick={handleDone}
                    className="w-full h-14 rounded-full font-semibold text-lg text-black transition-colors bg-[#C7EF6B] hover:bg-[#B8E55A]"
                  >
                    Done
                  </button>
                </div>
              </div>
            )}
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
};
