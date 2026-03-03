import React, { useState, useEffect, useRef, useCallback } from "react";
import { Drawer } from "vaul";
import {
  X,
  Info,
  CheckCircle2,
  Circle,
  Copy,
  LoaderCircle,
} from "lucide-react";
import { formatNumber } from "@/lib/formatters";
import { rampService } from "@/services/ramp";
import { walletService } from "@/services";
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
  const [isConfirming, setIsConfirming] = useState(false);
  const [progressStep, setProgressStep] = useState(0);
  const [orderData, setOrderData] = useState<OrderData | null>(null);
  const [orderError, setOrderError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(1800);
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hasCreatedOrder = useRef(false);

  const isBuy = details.type === "buy";

  const stopPolling = useCallback(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  }, []);

  // Create order when drawer opens
  useEffect(() => {
    if (isOpen && !hasCreatedOrder.current) {
      hasCreatedOrder.current = true;
      createOrder();
    }
  }, [isOpen]);

  const createOrder = async () => {
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
          if (response.data.status === "completed") {
            setProgressStep(2);
          } else if (
            response.data.status === "pending" ||
            response.data.status === "processing"
          ) {
            startPolling(response.data.id);
          }
        } else {
          setOrderError(response.error?.message || "Failed to create order");
        }
      } else {
        if (
          !details.bankCode ||
          !details.bankAccountNumber ||
          !details.bankAccountName
        ) {
          setOrderError(
            "Bank account details not available. Please link your bank account.",
          );
          setIsCreatingOrder(false);
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
          if (response.data.status === "completed") {
            setProgressStep(2);
          } else if (
            response.data.status === "pending" ||
            response.data.status === "processing"
          ) {
            startPolling(response.data.id);
          }
        } else {
          setOrderError(response.error?.message || "Failed to create order");
        }
      }
    } catch (error) {
      setOrderError("An error occurred. Please try again.");
    } finally {
      setIsCreatingOrder(false);
    }
  };

  const startPolling = useCallback(
    (orderId: string) => {
      stopPolling();

      pollingRef.current = setInterval(async () => {
        try {
          const response = await rampService.getOrder(orderId);
          if (response.success && response.data) {
            const order = response.data;
            setOrderData(order);

            if (order.status === "completed") {
              setProgressStep(2);
              stopPolling();
            } else if (
              order.status === "failed" ||
              order.status === "cancelled"
            ) {
              setOrderError(`Order ${order.status}. Please try again.`);
              stopPolling();
            } else {
              setProgressStep(1);
            }
          }
        } catch (error) {
          console.error("Polling error:", error);
        }
      }, 20000);
    },
    [stopPolling],
  );

  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setIsConfirming(false);
        setProgressStep(0);
        setOrderData(null);
        setOrderError("");
        setTimeLeft(1800);
        hasCreatedOrder.current = false;
      }, 300);
      stopPolling();
    }
  }, [isOpen, stopPolling]);

  useEffect(() => {
    if (isOpen && details.type === "buy" && !isConfirming && timeLeft > 0) {
      const timerId = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timerId);
    }
  }, [isOpen, details.type, isConfirming, timeLeft]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error("Failed to copy", err);
    }
  };

  const handleStartConfirmation = async () => {
    if (!orderData?.id) {
      setOrderError("Order not created yet. Please try again.");
      return;
    }

    setIsSubmitting(true);
    setOrderError("");

    try {
      if (isBuy) {
        setIsConfirming(true);
        startPolling(orderData.id);
      } else {
        const cryptoAddress = orderData.cryptoAddress;
        if (!cryptoAddress) {
          setOrderError("Crypto address not available from order.");
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
          // LPT transfer
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

        if (transferResponse?.success) {
          setIsConfirming(true);
          startPolling(orderData.id);
        } else {
          setOrderError(
            transferResponse?.error || "Failed to transfer tokens.",
          );
        }
      }
    } catch (error) {
      setOrderError("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFinish = () => {
    stopPolling();
    onConfirm();
    onClose();
  };

  const bankName = isBuy ? orderData?.paymentAccount?.bankName : details.bankName;
  const accountName = isBuy ? 
    orderData?.paymentAccount?.accountName :
    details.bankAccountName;
  const accountNumber = isBuy ?
    orderData?.paymentAccount?.accountNumber :
    details.bankAccountNumber;

  const title = isBuy ? "Buy Crypto" : "Sell Crypto";
  const actionText = isBuy ? "I have sent" : "Confirm";

  const Skeleton = ({ className = "" }: { className?: string }) => (
    <div className={`animate-pulse bg-gray-700 rounded ${className}`} />
  );

  return (
    <Drawer.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm" />
        <Drawer.Content className="bg-[#1C1C1E] flex flex-col rounded-t-4xl h-auto mt-24 max-h-[90vh] fixed bottom-0 left-0 right-0 z-50">
          <div className="p-4 bg-[#1C1C1E] rounded-t-4xl flex-1 overflow-y-auto scrollbar-hide">
            {!isConfirming && (
              <div className="flex items-center justify-between mb-6 pt-2">
                <div className="w-10"></div>
                <Drawer.Title className="text-white text-lg font-semibold">
                  {title}
                </Drawer.Title>
                <button
                  onClick={onClose}
                  className="w-10 h-10 bg-[#2C2C2E] rounded-full flex items-center justify-center text-white transition-colors hover:bg-[#3C3C3E]"
                >
                  <X size={20} />
                </button>
              </div>
            )}

            {!isConfirming && (
              <>
                <div className="flex flex-col items-center justify-center mb-4">
                  <div className="w-20 h-20 bg-[#C7EF6B]/20 rounded-full flex items-center justify-center mb-4 relative overflow-hidden">
                    <img
                      src="/ramp.png"
                      alt="Ramp"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <p className="text-gray-400 text-sm mb-1">
                    {isBuy ? "You're buying" : "You're selling"}
                  </p>
                  <h2 className="text-[#C7EF6B] text-2xl font-bold mb-1">
                    {formatNumber(details.tokenAmount, 2)} {details.tokenName}
                  </h2>
                </div>

                <div className="bg-[#2C2C2E] rounded-2xl p-4 mb-6 space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-1 text-gray-400 text-sm">
                      {isBuy ? "You're spending" : "You're receiving"}
                    </div>
                    <span className="text-white text-sm font-medium">
                      {details.fiatCurrency}{" "}
                      {formatNumber(details.fiatAmount, 2)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-1 text-gray-400 text-sm">
                      Price of {details.tokenName}
                    </div>
                    <span className="text-white text-sm font-medium">
                      {details.fiatCurrency}{" "}
                      {formatNumber(
                        orderData?.exchangeRate ?? details.exchangeRate,
                        2,
                      )}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-1 text-gray-400 text-sm">
                      Estimated processing time
                    </div>
                    <span className="text-white text-sm font-medium">
                      {details.processingTime}
                    </span>
                  </div>

                  {isBuy &&
                    (isCreatingOrder ? (
                      <>
                        <div className="w-full h-px bg-gray-700 my-2"></div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400 text-sm">
                            Bank Name
                          </span>
                          <Skeleton className="h-4 w-24" />
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400 text-sm">
                            Account Number
                          </span>
                          <Skeleton className="h-4 w-20" />
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400 text-sm">
                            Account Name
                          </span>
                          <Skeleton className="h-4 w-32" />
                        </div>
                      </>
                    ) : bankName && accountNumber ? (
                      <>
                        <div className="w-full h-px bg-gray-700 my-2"></div>

                        <div className="flex justify-between items-center">
                          <span className="text-gray-400 text-sm">
                            Bank Name
                          </span>
                          <span className="text-white text-sm font-medium">
                            {bankName}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400 text-sm">
                            Account Number
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="text-white text-sm font-medium">
                              {accountNumber}
                            </span>
                            <button
                              onClick={() => handleCopy(accountNumber)}
                              className="text-[#C7EF6B] hover:text-white transition-colors"
                            >
                              <Copy size={14} />
                            </button>
                          </div>
                        </div>
                        {accountName && (
                          <div className="flex justify-between items-center">
                            <span className="text-gray-400 text-sm">
                              Account Name
                            </span>
                            <span className="text-white text-sm font-medium">
                              {accountName}
                            </span>
                          </div>
                        )}
                      </>
                    ) : null)}

                  {!isBuy && bankName && accountNumber && (
                      <>
                        <div className="w-full h-[1px] bg-gray-700 my-2"></div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400 text-sm">
                            Recipient Bank
                          </span>
                          <span className="text-white text-sm font-medium">
                            {bankName}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400 text-sm">
                            Recipient Name
                          </span>
                          <span className="text-white text-sm font-medium">
                            {accountName}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400 text-sm">
                            Recipient Account
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="text-white text-sm font-medium">
                              {accountNumber}
                            </span>
                          </div>
                        </div>
                      </>
                    ) }

                  {isBuy && orderData && (
                    <>
                      <div className="w-full h-[1px] bg-gray-700 my-2"></div>
                      <div className="text-center">
                        <p className="text-xs text-gray-400 font-medium">
                          Please send exactly {details.fiatSymbol}
                          {formatNumber(details.fiatAmount, 2)}. Valid for{" "}
                          {formatTime(timeLeft)}
                        </p>
                      </div>
                    </>
                  )}
                </div>

                <div className="pb-8">
                  <button
                    onClick={handleStartConfirmation}
                    disabled={
                      isSubmitting ||
                      externalLoading ||
                      isCreatingOrder ||
                      !orderData
                    }
                    className="w-full py-3 rounded-xl font-semibold text-lg bg-[#C7EF6B] text-black hover:bg-[#B8E55A] transition-colors flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <LoaderCircle className="w-6 h-6 animate-spin text-black" />
                    ) : (
                      actionText
                    )}
                  </button>
                </div>
              </>
            )}

            {isConfirming && (
              <div className="flex flex-col items-center px-4 py-8">
                <div className="flex flex-col items-center justify-center mb-4">
                  <div className="w-20 h-20 bg-[#C7EF6B]/20 rounded-full flex items-center justify-center mb-4 relative overflow-hidden">
                    <img
                      src="/ramp.png"
                      alt="Ramp"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                <h2 className="text-white text-xl font-bold mb-2 tracking-wide">
                  {orderData?.status === "completed"
                    ? "Payment Complete!"
                    : "Confirming Payment"}
                </h2>
                <p className="text-gray-400 text-sm mb-12">
                  {orderData?.status === "completed"
                    ? "Your transaction has been completed successfully."
                    : "Please do not close or cancel this page"}
                </p>

                <div className="relative w-full max-w-[280px] mb-12 px-6">
                  <div className="absolute left-[39px] top-[24px] bottom-[24px] w-[2px] bg-gray-700 z-0 h-[60px]"></div>

                  <div className="flex items-center gap-6 mb-12 relative z-10">
                    <div className="w-8 h-8 rounded-full bg-[#1C1C1E] flex items-center justify-center">
                      {progressStep >= 1 ? (
                        <div className="w-8 h-8 rounded-full bg-[#C7EF6B] flex items-center justify-center">
                          <CheckCircle2 size={24} className="text-black" />
                        </div>
                      ) : (
                        <Circle
                          size={32}
                          className="text-gray-600 bg-[#1C1C1E] rounded-full"
                        />
                      )}
                    </div>
                    <span
                      className={`font-medium text-[15px] flex-1 ${progressStep >= 1 ? "text-[#C7EF6B]" : "text-gray-500"}`}
                    >
                      Processing Payment
                    </span>
                  </div>

                  <div className="flex items-center gap-6 relative z-10">
                    <div className="w-8 h-8 rounded-full bg-[#1C1C1E] flex items-center justify-center">
                      {progressStep >= 2 ? (
                        <div className="w-8 h-8 rounded-full bg-[#C7EF6B] flex items-center justify-center">
                          <CheckCircle2 size={24} className="text-black" />
                        </div>
                      ) : (
                        <Circle
                          size={32}
                          className="text-gray-600 bg-[#1C1C1E] rounded-full"
                        />
                      )}
                    </div>
                    <span
                      className={`font-medium text-[15px] flex-1 ${progressStep >= 2 ? "text-[#C7EF6B]" : "text-gray-500"}`}
                    >
                      Payment Confirmed
                    </span>
                  </div>
                </div>

                <div className="w-full mt-4 pb-4">
                  <button
                    onClick={handleFinish}
                    disabled={
                      progressStep < 2 && orderData?.status !== "completed"
                    }
                    className="w-full py-3 rounded-xl font-semibold text-lg text-black transition-colors bg-[#C7EF6B] hover:bg-[#B8E55A] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Finish
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
