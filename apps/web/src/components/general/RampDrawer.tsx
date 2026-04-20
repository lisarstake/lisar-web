import React, { useCallback, useEffect, useRef, useState } from "react";
import { Drawer } from "vaul";
import { LoaderCircle, X } from "lucide-react";
import { formatNumber } from "@/lib/formatters";
import { rampService } from "@/services/ramp";
import {
  delegationService,
  perenaService,
  virtualAccountService,
  walletService,
} from "@/services";
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
  lptWithdrawalMode?: "unbond" | "unlocked";
  unbondingLockId?: number;
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
  const [transferError, setTransferError] = useState("");
  const [orderSetupFailed, setOrderSetupFailed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successBodyMessage, setSuccessBodyMessage] = useState("");
  const hasCreatedOrder = useRef(false);

  const isBuy = details.type === "buy";
  const genericFailureMessage = isBuy
    ? "Sorry your deposit couldn't not be completed at the moment, please try again."
    : "Sorry your withdrawal couldn't not be completed at the moment, please try again.";
  const defaultSuccessMessage = isBuy
    ? `Great, you've successfully deposited ${details.fiatSymbol}${formatNumber(
      details.fiatAmount || 0,
      2,
    )} to your wallet.`
    : `Great, you've successfully withdrawn ${formatNumber(
      details.tokenAmount || 0,
      4,
    )} ${details.tokenName} to your naira balance.`;
  const logPrefix = `[RampDrawer][${isBuy ? "BUY" : "SELL"}]`;
  const log = useCallback((step: string, payload?: unknown) => {
    if (payload !== undefined) {

      return;
    }

  }, [logPrefix]);
  const logError = useCallback((step: string, payload?: unknown) => {
    if (payload !== undefined) {
      console.error(`${logPrefix} ${step}`, payload);
      return;
    }
    console.error(`${logPrefix} ${step}`);
  }, [logPrefix]);

  const resolveBankCode = useCallback(async (bankName: string) => {
    log("resolveBankCode:start", { bankName });
    const response = await rampService.getBanks();
    if (!response.success || !response.data?.length) {
      logError("resolveBankCode:failed", response);
      return null;
    }

    const normalize = (value: string) =>
      value.toLowerCase().replace(/[^a-z0-9]/g, "");
    const target = normalize(bankName);

    const exact = response.data.find((bank) => normalize(bank.name) === target);
    if (exact) {
      log("resolveBankCode:matched-exact", { bankCode: exact.code });
      return exact.code;
    }

    const fuzzy = response.data.find((bank) => {
      const candidate = normalize(bank.name);
      return candidate.includes(target) || target.includes(candidate);
    });
    log("resolveBankCode:matched-fuzzy", { bankCode: fuzzy?.code || null });
    return fuzzy?.code || null;
  }, [log, logError]);

  const createOrder = useCallback(async () => {
    log("createOrder:start", {
      details,
      mode: isBuy ? "deposit" : "withdraw",
    });
    if (!details.cryptoAddress && !isBuy && details.tokenName !== "LPT") {
      logError("createOrder:missing-crypto-address");
      setOrderSetupFailed(true);
      setOrderData(null);
      return;
    }

    setIsCreatingOrder(true);
    setOrderSetupFailed(false);

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
          log("createOrder:buy-success", {
            id: response.data.id,
            status: response.data.status,
            fiatAmount: response.data.fiatAmount,
            cryptoAmount: response.data.cryptoAmount,
            paymentAccount: response.data.paymentAccount,
          });
          setOrderData(response.data);
        } else {
          logError("createOrder:buy-failed", response);
          setOrderSetupFailed(true);
          setOrderData(null);
        }
      } else {
        if (
          details.tokenName === "LPT" &&
          details.lptWithdrawalMode !== "unlocked"
        ) {
          const now = new Date().toISOString();
          const pseudoOrder: OrderData = {
            id: `lpt-unstake-${Date.now()}`,
            type: "sell",
            status: "ready_for_unstake",
            fiatAmount: details.fiatAmount,
            fiatCurrency: details.fiatCurrency,
            cryptoAmount: details.tokenAmount,
            cryptoCurrency: "LPT",
            cryptoNetwork: "arbitrum",
            customerEmail: details.customerEmail || "",
            customerName: details.customerName || "",
            createdAt: now,
            updatedAt: now,
            expiresAt: now,
            exchangeRate: 0
          };
          log("createOrder:lpt-skip-sell-order", pseudoOrder);
          setOrderData(pseudoOrder);
          return;
        }

        if (
          !details.bankCode ||
          !details.bankAccountNumber ||
          !details.bankAccountName
        ) {
          logError("createOrder:sell-missing-bank-details", {
            bankCode: details.bankCode,
            bankAccountNumber: details.bankAccountNumber,
            bankAccountName: details.bankAccountName,
          });
          setOrderSetupFailed(true);
          setOrderData(null);
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
          log("createOrder:sell-success", {
            id: response.data.id,
            status: response.data.status,
            fiatAmount: response.data.fiatAmount,
            cryptoAmount: response.data.cryptoAmount,
            cryptoAddress: response.data.cryptoAddress,
          });
          setOrderData(response.data);
        } else {
          logError("createOrder:sell-failed", response);
          setOrderSetupFailed(true);
          setOrderData(null);
        }
      }
    } catch (error) {
      logError("createOrder:exception", error);
      setOrderSetupFailed(true);
      setOrderData(null);
    } finally {
      setIsCreatingOrder(false);
      log("createOrder:complete");
    }
  }, [details, genericFailureMessage, isBuy, log, logError]);

  useEffect(() => {
    if (isOpen && !hasCreatedOrder.current) {
      log("drawer:opened");
      hasCreatedOrder.current = true;
      createOrder();
    }
  }, [createOrder, isOpen, log]);

  useEffect(() => {
    if (!isOpen) {
      log("drawer:closed-reset");
      setTimeout(() => {
        setOrderData(null);
        setTransferError("");
        setOrderSetupFailed(false);
        setIsSubmitting(false);
        setIsCreatingOrder(false);
        setShowSuccess(false);
        setSuccessBodyMessage("");
        hasCreatedOrder.current = false;
      }, 250);
    }
  }, [isOpen, log]);

  const handleStart = async () => {
    log("button:clicked", {
      action: isBuy ? "deposit" : "withdraw",
      orderId: orderData?.id || null,
      fiatAmount: details.fiatAmount,
      tokenAmount: details.tokenAmount,
      tokenName: details.tokenName,
    });
    if (!orderData?.id) {
      logError("button:clicked-without-order");
      if (orderSetupFailed) {
        await createOrder();
      }
      return;
    }

    setIsSubmitting(true);
    setTransferError("");

    try {
      if (isBuy) {
        log("deposit:start", { orderId: orderData.id });
        const paymentAccount = orderData.paymentAccount;
        if (!paymentAccount) {
          logError("deposit:missing-payment-account", orderData);
          setTransferError(genericFailureMessage);
          setIsSubmitting(false);
          return;
        }

        const bankCode = await resolveBankCode(paymentAccount.bankName);
        if (!bankCode) {
          logError("deposit:bank-code-resolution-failed", {
            bankName: paymentAccount.bankName,
          });
          setTransferError(genericFailureMessage);
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
          logError("deposit:transfer-failed", transferResp);
          setTransferError(genericFailureMessage);
          setIsSubmitting(false);
          return;
        }

        log("deposit:transfer-success", transferResp);
        setSuccessBodyMessage(defaultSuccessMessage);
        setShowSuccess(true);
      } else {
        log("withdraw:start", { orderId: orderData.id });
        const numericAmount = details.tokenAmount.toString();

        if (
          details.tokenName === "LPT" &&
          details.lptWithdrawalMode !== "unlocked"
        ) {
          if (!state.user?.wallet_id || !state.user?.wallet_address) {
            setTransferError(genericFailureMessage);
            setIsSubmitting(false);
            return;
          }

          const unbondResp = await delegationService.unbond({
            walletId: state.user.wallet_id,
            walletAddress: state.user.wallet_address,
            amount: numericAmount,
          });
          log("withdraw:lpt-unbond-response", unbondResp);

          if (!unbondResp.success) {
            logError("withdraw:lpt-unbond-failed", unbondResp);
            setTransferError(genericFailureMessage);
            setIsSubmitting(false);
            return;
          }

          setSuccessBodyMessage(
            `Great, you've successfully withdrawn ${formatNumber(
              details.tokenAmount || 0,
              4,
            )} LPT. Your funds will be available for withdrawal in the next 7 days.`,
          );
          setShowSuccess(true);
          return;
        }

        const cryptoAddress = orderData.cryptoAddress;
        if (!cryptoAddress) {
          logError("withdraw:missing-crypto-address", orderData);
          setTransferError(genericFailureMessage);
          setIsSubmitting(false);
          return;
        }

        let transferResponse;

        if (details.tokenName === "USDC") {
          const network = orderData.cryptoNetwork;
          if (network === "solana") {
            if (!solanaWalletAddress || !solanaWalletId) {
              setTransferError(genericFailureMessage);
              setIsSubmitting(false);
              return;
            }

            const burnResp = await perenaService.burn({
              walletId: solanaWalletId,
              walletAddress: solanaWalletAddress,
              usdStarAmount: details.tokenAmount,
            });
            log("withdraw:usdc-burn-response", burnResp);

            if (!burnResp.success) {
              logError("withdraw:usdc-burn-failed", burnResp);
              setTransferError(genericFailureMessage);
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
            log("withdraw:send-solana-response", transferResponse);
          } else {
            if (!ethereumWalletAddress || !ethereumWalletId) {
              setTransferError(genericFailureMessage);
              setIsSubmitting(false);
              return;
            }
            transferResponse = await walletService.sendToken(1, "USDC", {
              walletId: ethereumWalletId,
              walletAddress: ethereumWalletAddress,
              to: cryptoAddress,
              amount: numericAmount,
            });
            log("withdraw:send-evm-usdc-response", transferResponse);
          }
        } else {
          if (!state.user?.wallet_id || !state.user?.wallet_address) {
            setTransferError(genericFailureMessage);
            setIsSubmitting(false);
            return;
          }

          if (details.lptWithdrawalMode === "unlocked") {
            if (!details.unbondingLockId) {
              setTransferError(genericFailureMessage);
              setIsSubmitting(false);
              return;
            }

            const withdrawStakeResp = await delegationService.withdrawStake({
              walletId: state.user.wallet_id,
              walletAddress: state.user.wallet_address,
              unbondingLockId: details.unbondingLockId,
            });
            log("withdraw:lpt-withdraw-stake-response", withdrawStakeResp);

            if (!withdrawStakeResp.success) {
              logError("withdraw:lpt-withdraw-stake-failed", withdrawStakeResp);
              setTransferError(genericFailureMessage);
              setIsSubmitting(false);
              return;
            }
          }

          const approveResponse = await walletService.approveLpt({
            walletId: state.user.wallet_id,
            walletAddress: state.user.wallet_address,
            spender: cryptoAddress,
            amount: numericAmount,
          });
          log("withdraw:approve-lpt-response", approveResponse);
          if (!approveResponse.success) {
            logError("withdraw:approve-lpt-failed", approveResponse);
            setTransferError(genericFailureMessage);
            setIsSubmitting(false);
            return;
          }
          transferResponse = await walletService.sendLpt({
            walletId: state.user.wallet_id,
            walletAddress: state.user.wallet_address,
            to: cryptoAddress,
            amount: numericAmount,
          });
          log("withdraw:send-lpt-response", transferResponse);
        }

        if (!transferResponse?.success) {
          logError("withdraw:transfer-failed", transferResponse);
          setTransferError(genericFailureMessage);
          setIsSubmitting(false);
          return;
        }

        log("withdraw:transfer-success", transferResponse);
        setSuccessBodyMessage(defaultSuccessMessage);
        setShowSuccess(true);
      }
    } catch (error) {
      logError("transfer:exception", error);
      setTransferError(genericFailureMessage);
    } finally {
      setIsSubmitting(false);
      log("button:completed");
    }
  };

  const handleDone = () => {
    log("success:done-clicked");
    onConfirm();
    onClose();
  };

  const actionText = isBuy ? "Deposit" : "Withdraw";
  const hasErrorState = Boolean(transferError);
  const summaryFiatAmount =
    details.tokenName === "LPT" ? details.fiatAmount : orderData?.fiatAmount;
  const summaryTokenAmount =
    details.tokenName === "LPT" ? details.tokenAmount : orderData?.cryptoAmount;
  const summaryTokenName =
    details.tokenName === "LPT" ? details.tokenName : orderData?.cryptoCurrency;
  const summaryRate =
    details.tokenName === "LPT" ? details.exchangeRate : orderData?.exchangeRate;
  const estimatedCompletionText =
    !isBuy && details.tokenName === "LPT" && details.lptWithdrawalMode !== "unlocked"
      ? "About 7 days"
      : "About 1 minute";

  const LoadingValue = () => (
    <span className="inline-flex items-center">
      <LoaderCircle className="w-4 h-4 animate-spin text-white/70" />
    </span>
  );

  const handleRetry = () => {
    log("error:retry-close-drawer");
    onClose();
  };

  return (
    <Drawer.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm" />
        <Drawer.Content className="bg-[#050505] border-t border-[#505050] flex flex-col rounded-t-4xl h-auto max-h-[90vh] fixed bottom-0 left-0 right-0 z-50">
          <div className="p-4 bg-[#050505] rounded-t-4xl flex-1 overflow-y-auto scrollbar-hide">
            {!showSuccess ? (
              <>
                <div className="flex justify-end pt-2">
                  <button
                    onClick={onClose}
                    className="w-10 h-10 bg-[#2a2a2a] rounded-full flex items-center justify-center text-white transition-colors hover:bg-[#1a1f10]"
                  >
                    <X size={20} />
                  </button>
                </div>
                {hasErrorState ? (
                  <div className="flex flex-col items-center px-4">
                    <div className="w-20 h-20 bg-gray-500/15 rounded-full flex items-center justify-center my-4 relative overflow-hidden">
                      <img
                        src="/error.png"
                        alt="Error"
                        className="object-cover h-16 w-16"
                      />
                    </div>
                    <h2 className="text-white text-lg font-semibold mb-2 tracking-wide text-center">
                      {isBuy ? 'Deposit failed' : 'Withdrawal failed'}
                    </h2>
                    <p className="text-white/80 text-sm mb-4 text-center max-w-[280px]">
                      {transferError}
                    </p>
                    <div className="w-full space-y-3 pb-4">
                      <button
                        onClick={handleRetry}
                        className="w-full h-12 rounded-full font-semibold text-lg text-black transition-colors bg-[#C7EF6B] hover:bg-[#B8E55A] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
                      >
                        Try again
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex flex-col items-center justify-center mb-6">
                      <div className="w-20 h-20 bg-[#C7EF6B]/20 rounded-full flex items-center justify-center mb-4 relative overflow-hidden">
                        <img
                          src="/ramp.png"
                          alt="Ramp"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <p className="text-gray-400 text-sm mb-1 text-center">
                        {isBuy
                          ? `You are about to deposit ${details.fiatSymbol}${formatNumber(
                            details.fiatAmount || 0,
                            2,
                          )} for`
                          : `You are about to withdraw ${formatNumber(
                            details.tokenAmount || 0,
                            4,
                          )} ${details.tokenName} for`}
                      </p>
                      <h2 className="text-[#C7EF6B] text-2xl font-semibold text-center min-h-[2.25rem] flex items-center">
                        {orderData ? (
                          isBuy
                            ? `${formatNumber(summaryTokenAmount || 0, 4)} ${summaryTokenName || details.tokenName}`
                            : `${details.fiatSymbol}${formatNumber(summaryFiatAmount || 0, 2)}`
                        ) : orderSetupFailed ? (
                          ""
                        ) : (
                          <LoadingValue />
                        )}
                      </h2>
                    </div>

                    <div className="bg-[#2a2a2a] rounded-2xl p-4 mb-5 space-y-3">
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
                          ) : orderSetupFailed ? (
                            "not assigned"
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
                          ) : orderSetupFailed ? (
                            "not assigned"
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
                          ) : orderSetupFailed ? (
                            "not assigned"
                          ) : (
                            <LoadingValue />
                          )}
                        </p>
                      </div>
                      <div className="flex justify-between items-center">
                        <p className="text-sm text-white/60">Estimated completion</p>
                        <p className="text-sm font-medium text-white">{estimatedCompletionText}</p>
                      </div>

                    </div>

                    <div className="pb-3">
                      <button
                        onClick={orderSetupFailed ? createOrder : handleStart}
                        disabled={
                          isSubmitting ||
                          externalLoading ||
                          isCreatingOrder ||
                          (!orderData && !orderSetupFailed)
                        }
                        className="w-full h-12 rounded-full font-semibold text-lg bg-[#C7EF6B] text-black hover:bg-[#B8E55A] transition-colors flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
                      >
                        {isSubmitting || isCreatingOrder ? (
                          <LoaderCircle className="w-6 h-6 animate-spin text-black" />
                        ) : (
                          orderSetupFailed ? "Retry" : actionText
                        )}
                      </button>
                    </div>
                  </>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center px-4">
                <div className="w-20 h-20 bg-[#C7EF6B]/20 rounded-full flex items-center justify-center my-4 relative overflow-hidden">
                  <img
                    src="/fund.png"
                    alt="Success"
                    className="h-18 w-18 object-cover"
                  />
                </div>
                <h2 className="text-white text-lg font-semibold mb-2 tracking-wide text-center">
                  {isBuy ? 'Deposit successful' : 'Withdrawal successful'}
                </h2>
                <p className="text-white/80 text-sm mb-4 text-center">
                  {successBodyMessage || defaultSuccessMessage}
                </p>
                <div className="w-full mt-2 pb-4">
                  <button
                    onClick={handleDone}
                    className="w-full h-12 rounded-full font-semibold text-lg text-black transition-colors bg-[#C7EF6B] hover:bg-[#B8E55A]"
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
