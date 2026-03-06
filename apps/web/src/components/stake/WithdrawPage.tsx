import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  LoaderCircle,
  Wallet2,
  ArrowLeft,
  ChevronRight,
  ScanQrCode,
  CreditCard,
} from "lucide-react";
import { BottomNavigation } from "@/components/general/BottomNavigation";
import { ErrorDrawer } from "@/components/ui/ErrorDrawer";
import { SuccessDrawer } from "@/components/ui/SuccessDrawer";
import {
  RampDrawer,
  RampTransactionDetails,
} from "@/components/general/RampDrawer";
import { AccountNotLinkedDrawer } from "@/components/general/AccountNotLinkedDrawer";
import { useAuth } from "@/contexts/AuthContext";
import { useDelegation } from "@/contexts/DelegationContext";
import { useTransactions } from "@/contexts/TransactionContext";
import { priceService } from "@/lib/priceService";
import { useWallet } from "@/contexts/WalletContext";
import { formatNumber, parseFormattedNumber } from "@/lib/formatters";
import { walletService } from "@/services";
import { useStablesApy } from "@/hooks/useStablesApy";

export const WithdrawPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const locationState = location.state as {
    amount?: string;
    walletType?: string;
    provider?: "maple" | "perena";
    tierNumber?: number;
    tierTitle?: string;
  } | null;

  const [amount, setAmount] = useState(() => {
    return locationState?.amount || "";
  });

  const [withdrawalAddress, setWithdrawalAddress] = useState("");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<
    string | null
  >(null);

  const walletType = locationState?.walletType;
  const selectedProvider = locationState?.provider;
  const isStables = walletType === "savings";

  const coinCode = isStables
    ? selectedProvider === "maple"
      ? "usdc"
      : selectedProvider === "perena"
        ? "usdc"
        : "usdc"
    : "lpt";

  const network = isStables
    ? selectedProvider === "maple"
      ? "ethereum"
      : selectedProvider === "perena"
        ? "solana"
        : "solana"
    : "arbitrum";

  const tokenName = isStables ? "USDC" : "LPT";

  useEffect(() => {
    if (locationState?.amount) {
      setAmount(locationState.amount);
    }
  }, [locationState]);

  const [showFiatDrawer, setShowFiatDrawer] = useState(false);
  const [showBankLinkedDrawer, setShowBankLinkedDrawer] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [showErrorDrawer, setShowErrorDrawer] = useState(false);
  const [showSuccessDrawer, setShowSuccessDrawer] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [fiatEquivalent, setFiatEquivalent] = useState(0);
  const [step, setStep] = useState(1);

  const { state } = useAuth();
  const {
    wallet,
    stablesBalance,
    refetch: refetchWallet,
    ethereumWalletAddress,
    solanaWalletAddress,
    ethereumWalletId,
    solanaWalletId,
  } = useWallet();
  const { refetch: refetchDelegation } = useDelegation();
  const { refetch: refetchTransactions } = useTransactions();
  const {
    maple: mapleApy,
    perena: perenaApy,
    isLoading: apyLoading,
  } = useStablesApy();

  const userCurrency = state.user?.fiat_type || "NGN";
  const currencySymbol = priceService.getCurrencySymbol(userCurrency);

  const walletBalance = isStables
    ? stablesBalance || 0
    : wallet?.balanceLpt || 0;

  const pageTitle = "Withdraw";

  const handleAmountSelect = (amount: string) => {
    const numericAmount = parseFormattedNumber(amount);
    setAmount(numericAmount);
  };

  const handlePaymentMethodSelect = (method: string) => {
    setSelectedPaymentMethod(method);
  };

  useEffect(() => {
    const calculateFiat = async () => {
      const numericAmount = parseFloat(amount.replace(/,/g, "")) || 0;
      if (numericAmount > 0) {
        if (isStables) {
          const fiatValue = await priceService.convertUsdToFiat(
            numericAmount,
            userCurrency,
          );
          setFiatEquivalent(fiatValue);
        } else {
          const fiatValue = await priceService.convertLptToFiat(
            numericAmount,
            userCurrency,
          );
          setFiatEquivalent(fiatValue);
        }
      } else {
        setFiatEquivalent(0);
      }
    };
    calculateFiat();
  }, [amount, userCurrency, isStables]);

  const handleProceed = () => {
    if (selectedPaymentMethod === "fiat") {
      if (userCurrency === "NGN") {
        const linked = state.user?.linked_account;
        const hasLinkedAccount = !!(
          linked?.account_number && linked?.bank_code
        );
        if (!hasLinkedAccount) {
          setShowBankLinkedDrawer(true);
          return;
        }
      }
      setShowFiatDrawer(true);
      return;
    }

    if (selectedPaymentMethod === "onchain") {
      setStep(2);
      return;
    }
  };

  const handleFiatConfirm = () => {
    setShowFiatDrawer(false);
  };

  const handlePasteAddress = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setWithdrawalAddress(text.trim());
    } catch (err) {
      // Paste failed - silent fail
    }
  };

  const numericAmount = parseFloat(amount.replace(/,/g, "")) || 0;
  const hasInsufficientFunds =
    numericAmount > 0 && numericAmount > walletBalance;

  const handleBackClick = () => {
    if (step === 2) {
      setStep(1);
    } else {
      navigate(-1);
    }
  };

  const handleConfirmTransfer = async () => {
    if (!amount || parseFloat(amount.replace(/,/g, "")) <= 0) {
      setErrorMessage("Please enter a valid amount to Withdraw.");
      setShowErrorDrawer(true);
      return;
    }

    if (!withdrawalAddress || withdrawalAddress.trim() === "") {
      setErrorMessage("Please enter a receiving address.");
      setShowErrorDrawer(true);
      return;
    }

    if (!state.user) {
      setErrorMessage("User not authenticated. Please log in and try again.");
      setShowErrorDrawer(true);
      return;
    }

    setIsWithdrawing(true);
    try {
      const numericAmountStr = amount.replace(/,/g, "");

      if (isStables && selectedProvider) {
        if (selectedProvider === "maple") {
          if (!ethereumWalletAddress || !ethereumWalletId) {
            setErrorMessage(
              "Ethereum wallet not found. Please create a wallet first.",
            );
            setShowErrorDrawer(true);
            setIsWithdrawing(false);
            return;
          }

          const sendResponse = await walletService.sendToken(1, "USDC", {
            walletId: ethereumWalletId,
            walletAddress: ethereumWalletAddress,
            to: withdrawalAddress,
            amount: numericAmountStr,
          });

          if (!sendResponse.success) {
            setErrorMessage(
              sendResponse.error ||
              "Failed to withdraw USDC. Please try again.",
            );
            setShowErrorDrawer(true);
            setIsWithdrawing(false);
            return;
          }
        } else if (selectedProvider === "perena") {
          if (!solanaWalletAddress || !solanaWalletId) {
            setErrorMessage(
              "Solana wallet not found. Please create a wallet first.",
            );
            setShowErrorDrawer(true);
            setIsWithdrawing(false);
            return;
          }

          const sendResponse = await walletService.sendSolana({
            walletId: solanaWalletId,
            fromAddress: solanaWalletAddress,
            toAddress: withdrawalAddress,
            token: "USDC",
            amount: parseFloat(numericAmountStr),
          });

          if (!sendResponse.success) {
            setErrorMessage(
              sendResponse.error ||
              "Failed to withdraw USDC. Please try again.",
            );
            setShowErrorDrawer(true);
            setIsWithdrawing(false);
            return;
          }
        }
      } else {
        const approveResponse = await walletService.approveLpt({
          walletId: state.user.wallet_id,
          walletAddress: state.user.wallet_address,
          spender: state.user.wallet_address,
          amount: numericAmountStr,
        });

        if (!approveResponse.success) {
          const friendlyApprovalMsg =
            "We couldn't complete the withdrawal. Please double-check the details and try again.";
          const serverApprovalMsg =
            approveResponse.message || approveResponse.error || "";
          setErrorMessage(
            serverApprovalMsg ? `${friendlyApprovalMsg}` : friendlyApprovalMsg,
          );
          setShowErrorDrawer(true);
          setIsWithdrawing(false);
          return;
        }

        const sendResponse = await walletService.sendLpt({
          walletId: state.user.wallet_id,
          walletAddress: state.user.wallet_address,
          to: withdrawalAddress,
          amount: numericAmountStr,
        });

        if (!sendResponse.success) {
          const friendlySendMsg =
            "We couldn't complete the withdrawal. Please double-check the details and try again.";
          const serverSendMsg =
            sendResponse.message || sendResponse.error || "";
          setErrorMessage(
            serverSendMsg ? `${friendlySendMsg}` : friendlySendMsg,
          );
          setShowErrorDrawer(true);
          setIsWithdrawing(false);
          return;
        }
      }

      await Promise.all([
        refetchDelegation(),
        refetchWallet(),
        refetchTransactions(),
      ]);

      setWithdrawalAddress("");
      setAmount("");
      setStep(1);

      setSuccessMessage(
        `Withdrawal processed successfully. Return to the previous screen and check your wallet.`,
      );
      setShowSuccessDrawer(true);
    } catch (error) {
      const errorMsg =
        error instanceof Error
          ? error.message
          : "An error occurred while processing your Withdraw. Please try again.";
      setErrorMessage(errorMsg);
      setShowErrorDrawer(true);
    } finally {
      setIsWithdrawing(false);
    }
  };

  return (
    <div className="h-screen bg-[#050505] text-white flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 pt-8 pb-4">
        <button
          onClick={handleBackClick}
          className="h-10 w-10 rounded-full bg-[#13170a] flex items-center justify-center"
        >
          <ArrowLeft className="text-white" size={22} />
        </button>

        <h1 className="absolute left-1/2 -translate-x-1/2 text-lg font-medium text-white">{pageTitle}</h1>

        <div className="w-8 h-8" />
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-6 pb-28 scrollbar-hide">
        {step === 1 ? (
          <>
            {/* Amount Input Field */}
            <div className="py-6">
              <span className="text-white/80 text-base font-medium ml-1">
                Amount
              </span>
              <div className="bg-[#13170a] rounded-lg p-3 mt-1">
                <input
                  type="text"
                  value={amount ? formatNumber(amount) : ""}
                  onChange={(e) => {
                    const rawValue = parseFormattedNumber(e.target.value);
                    let numericValue = rawValue.replace(/[^0-9.]/g, "");
                    const parts = numericValue.split(".");
                    if (parts.length > 2) {
                      numericValue = parts[0] + "." + parts.slice(1).join("");
                    }
                    setAmount(numericValue);
                  }}
                  placeholder={tokenName}
                  className="w-full bg-transparent text-white text-lg font-medium focus:outline-none"
                />
              </div>
              <p className="text-gray-400 text-xs mt-2 pl-2">
                ≈ {currencySymbol}{" "}
                {fiatEquivalent.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
              {hasInsufficientFunds && (
                <p className="text-red-300 text-xs mt-2 pl-2">
                  Insufficient funds (Max: {walletBalance.toLocaleString()}{" "}
                  {tokenName})
                </p>
              )}
            </div>

            {/* Predefined Token Amounts (Percentages) */}
            <div className="pb-4">
              <div className="flex space-x-3">
                {[10, 25, 50, 75].map((percentage) => {
                  const calculatedAmount = (
                    walletBalance *
                    (percentage / 100)
                  ).toString();
                  const isActive =
                    amount &&
                    Math.abs(
                      parseFloat(amount) - parseFloat(calculatedAmount),
                    ) < 0.0001;

                  return (
                    <button
                      key={percentage}
                      onClick={() => handleAmountSelect(calculatedAmount)}
                      className={`flex-1 py-3 px-4 rounded-full text-sm font-medium transition-colors ${isActive
                        ? "bg-[#C7EF6B] text-black"
                        : "bg-[#13170a] text-white/80 hover:bg-[#2a2a2a]"
                        }`}
                    >
                      {percentage}%
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Payment Method Selection */}
            <div className="py-4">
              <h3 className="text-base font-medium text-white/90 mb-2">
                Preferred method
              </h3>

              <div className="space-y-3">
                <button
                  onClick={() => handlePaymentMethodSelect("fiat")}
                  className={`w-full flex items-center justify-between p-4 rounded-xl transition-colors ${selectedPaymentMethod === "fiat"
                    ? "bg-[#C7EF6B]/10 border border-[#C7EF6B]"
                    : "bg-[#13170a] border border-[#2a2a2a] hover:bg-[#2a2a2a]"
                    }`}
                >
                  <div className="flex items-center space-x-3">
                    <CreditCard
                      size={20}
                      color={
                        selectedPaymentMethod === "fiat" ? "#C7EF6B" : "#86B3F7"
                      }
                    />
                    <span className="text-white font-normal">
                      Withdraw {userCurrency}
                    </span>
                  </div>
                  <ChevronRight
                    size={20}
                    color={
                      selectedPaymentMethod === "fiat" ? "#C7EF6B" : "#636363"
                    }
                  />
                </button>

                <button
                  onClick={() => handlePaymentMethodSelect("onchain")}
                  className={`w-full flex items-center justify-between p-4 rounded-xl transition-colors ${selectedPaymentMethod === "onchain"
                    ? "bg-[#C7EF6B]/10 border border-[#C7EF6B]"
                    : "bg-[#13170a] border border-[#2a2a2a] hover:bg-[#2a2a2a]"
                    }`}
                >
                  <div className="flex items-center space-x-3">
                    <ScanQrCode
                      size={20}
                      color={
                        selectedPaymentMethod === "onchain"
                          ? "#C7EF6B"
                          : "#86B3F7"
                      }
                    />
                    <span className="text-white font-normal">
                      Transfer to wallet
                    </span>
                  </div>
                  <ChevronRight
                    size={20}
                    color={
                      selectedPaymentMethod === "onchain"
                        ? "#C7EF6B"
                        : "#636363"
                    }
                  />
                </button>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Address Input - Step 2 */}
            <div className="pt-6">
              <h3 className="text-base font-medium text-white/90 mb-2">
                Recipient Address
              </h3>
              <div className="bg-[#13170a] rounded-lg p-3 border border-[#2a2a2a] relative">
                <input
                  type="text"
                  value={withdrawalAddress}
                  onChange={(e) => setWithdrawalAddress(e.target.value)}
                  placeholder="Enter wallet address"
                  className="w-full bg-transparent text-base font-normal text-white focus:outline-none placeholder-gray-500 pr-12"
                />
                <button
                  type="button"
                  onClick={handlePasteAddress}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-medium text-[#C7EF6B] hover:text-[#B8E55A] transition-colors"
                >
                  Paste
                </button>
              </div>
            </div>

            {/* Network - Step 2 */}
            <div className="pt-4">
              <h3 className="text-base font-medium text-white/90 mb-2">
                Network
              </h3>
              <div className="bg-[#13170a] rounded-lg p-3 border border-[#2a2a2a] relative">
                <input
                  type="text"
                  value={network}
                  readOnly
                  className="w-full bg-transparent text-base font-normal text-white focus:outline-none placeholder-gray-500 pr-12"
                />
              </div>
            </div>

            {/* Transfer Summary - Step 2 */}
            <div className="py-6">
              <h3 className="text-base font-medium text-white/90 mb-2">
                Transfer Summary
              </h3>
              <div className="bg-[#13170a] rounded-lg p-4 border border-[#2a2a2a]">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-gray-400 text-sm">Amount to send</span>
                  <span className="text-white text-sm font-medium">
                    {formatNumber(amount)} {tokenName}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-[#2a2a2a]">
                  <span className="text-gray-400 text-sm">
                    Available balance
                  </span>
                  <div className="flex items-center space-x-2">
                    <Wallet2 size={16} color="#86B3F7" />
                    <span className="text-white text-sm font-medium">
                      {walletBalance.toLocaleString()} {tokenName}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Proceed Button */}
      <div className="px-6 py-3 bg-[#050505] pb-36">
        {step === 1 ? (
          <button
            onClick={handleProceed}
            disabled={
              !selectedPaymentMethod ||
              !amount ||
              parseFloat(amount) <= 0 ||
              hasInsufficientFunds
            }
            className={`w-full py-3 rounded-full font-semibold text-lg transition-colors ${selectedPaymentMethod &&
              amount &&
              parseFloat(amount) > 0 &&
              !hasInsufficientFunds
              ? "bg-[#C7EF6B] text-black hover:bg-[#B8E55A]"
              : "bg-[#636363] text-white cursor-not-allowed"
              }`}
          >
            Continue
          </button>
        ) : (
          <button
            onClick={handleConfirmTransfer}
            disabled={!withdrawalAddress.trim() || isWithdrawing}
            className={`w-full py-3 rounded-full font-semibold text-lg transition-colors ${withdrawalAddress.trim() && !isWithdrawing
              ? "bg-[#C7EF6B] text-black hover:bg-[#B8E55A]"
              : "bg-[#636363] text-white cursor-not-allowed"
              }`}
          >
            {isWithdrawing ? (
              <span className="flex items-center justify-center gap-2">
                <LoaderCircle className="animate-spin h-5 w-5 text-white" />
                Processing...
              </span>
            ) : (
              "Confirm Transfer"
            )}
          </button>
        )}
      </div>

      {/* Error Drawer */}
      <ErrorDrawer
        isOpen={showErrorDrawer}
        onClose={() => setShowErrorDrawer(false)}
        title="Something went wrong"
        message={errorMessage}
      />

      {/* Success Drawer */}
      <SuccessDrawer
        isOpen={showSuccessDrawer}
        onClose={() => {
          setShowSuccessDrawer(false);
          setTimeout(() => {
            navigate("/wallet");
          }, 3000);
        }}
        title="Withdraw Successful!"
        message={successMessage}
      />

      {/* Fiat Transaction Drawer */}
      <RampDrawer
        isOpen={showFiatDrawer}
        onClose={() => setShowFiatDrawer(false)}
        onConfirm={handleFiatConfirm}
        details={{
          type: "sell",
          tokenAmount: parseFloat(amount.replace(/,/g, "")) || 0,
          tokenName: tokenName,
          fiatAmount: fiatEquivalent || 0,
          fiatSymbol: currencySymbol,
          fiatCurrency: userCurrency,
          exchangeRate: 0,
          fee: 0,
          cryptoAddress: null,
          processingTime: "2-3mins",
          paymentMethodText: `${userCurrency} bank transfer`,
          bankCode: state.user?.linked_account?.bank_code ?? undefined,
          bankName: state.user?.linked_account?.bank_name ?? undefined,
          bankAccountNumber:
            state.user?.linked_account?.account_number ?? undefined,
          bankAccountName: state.user?.full_name || "",
          customerEmail: state.user?.email || "",
          customerName: state.user?.full_name || "",
        }}
      />

      {/* Account Not Linked Drawer */}
      <AccountNotLinkedDrawer
        isOpen={showBankLinkedDrawer}
        onClose={() => setShowBankLinkedDrawer(false)}
        onLinkAccount={() => {
          setShowBankLinkedDrawer(false);
          navigate("/profile");
        }}
      />

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
};
