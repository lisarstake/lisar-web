import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  ChevronLeft,
  CircleQuestionMark,
  LoaderCircle,
  Wallet2,
} from "lucide-react";
import { HelpDrawer } from "@/components/general/HelpDrawer";
import { ActionDrawer } from "@/components/general/ActionDrawer";
import { BottomNavigation } from "@/components/general/BottomNavigation";
import { ErrorDrawer } from "@/components/ui/ErrorDrawer";
import { SuccessDrawer } from "@/components/ui/SuccessDrawer";
import { useOrchestrators } from "@/contexts/OrchestratorContext";
import { useAuth } from "@/contexts/AuthContext";
import { useDelegation } from "@/contexts/DelegationContext";
import { useTransactions } from "@/contexts/TransactionContext";
import { delegationService } from "@/services";
import { StakeRequest } from "@/services/delegation/types";
import { priceService } from "@/lib/priceService";
import { useWallet } from "@/contexts/WalletContext";
import { formatNumber, parseFormattedNumber } from "@/lib/formatters";
import { usePageTracking } from "@/hooks/usePageTracking";

export const SavePage: React.FC = () => {
  // Track save page visit
  usePageTracking("Save Page", { page_type: "save" });
  const navigate = useNavigate();
  const location = useLocation();

  const locationState = location.state as {
    usdcAmount?: string;
    walletType?: string;
  } | null;

  const [usdcAmount, setUsdcAmount] = useState(() => {
    return locationState?.usdcAmount || "0";
  });

  // Only set amount from state on initial mount, not on every state change
  useEffect(() => {
    if (locationState?.usdcAmount && usdcAmount === "0") {
      setUsdcAmount(locationState.usdcAmount);
    }
  }, []);

  const [showHelpDrawer, setShowHelpDrawer] = useState(false);
  const [showConfirmDrawer, setShowConfirmDrawer] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showErrorDrawer, setShowErrorDrawer] = useState(false);
  const [showSuccessDrawer, setShowSuccessDrawer] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const { orchestrators } = useOrchestrators();
  const { state } = useAuth();
  const { wallet, refetch: refetchWallet } = useWallet();
  const { delegatorStakeProfile, refetch: refetchDelegation } = useDelegation();
  const { refetch: refetchTransactions } = useTransactions();

  // For stables, use the first available orchestrator
  const currentValidator = orchestrators?.[0];

  // Get user's preferred currency
  const userCurrency = state.user?.fiat_type || "NGN";
  const currencySymbol = priceService.getCurrencySymbol(userCurrency);

  // For stables, use staked balance (which represents USDC savings)
  const walletBalanceUsdc = delegatorStakeProfile
    ? parseFloat(delegatorStakeProfile.currentStake) || 0
    : 0;

  const pageTitle = "Save";

  const [fiatEquivalent, setFiatEquivalent] = useState(0);

  useEffect(() => {
    const calculateFiat = async () => {
      const numericAmount = parseFloat(usdcAmount.replace(/,/g, "")) || 0;
      if (numericAmount > 0) {
        const prices = await priceService.getPrices();
        let convertedValue = numericAmount;
        switch (userCurrency.toUpperCase()) {
          case "NGN":
            convertedValue = numericAmount * prices.ngn;
            break;
          case "EUR":
            convertedValue = numericAmount * prices.eur;
            break;
          case "GBP":
            convertedValue = numericAmount * prices.gbp;
            break;
          case "USD":
          default:
            convertedValue = numericAmount;
        }
        setFiatEquivalent(convertedValue);
      } else {
        setFiatEquivalent(0);
      }
    };
    calculateFiat();
  }, [usdcAmount, userCurrency]);

  const handleBackClick = () => {
    navigate(-1);
  };

  const handleAmountSelect = (amount: string) => {
    const numericAmount = parseFormattedNumber(amount);
    setUsdcAmount(numericAmount);
  };

  const handleMaxClick = () => {
    // Use wallet LPT balance for now (will be converted to USDC equivalent)
    const walletBalanceLpt = wallet?.balanceLpt || 0;
    const buffer = Math.max(0.001, walletBalanceLpt * 0.0001);
    const maxAmount = Math.max(0, walletBalanceLpt - buffer);
    setUsdcAmount(maxAmount.toString());
  };

  const handleProceed = async () => {
    const numericAmount = parseFloat(usdcAmount.replace(/,/g, "")) || 0;
    const walletBalanceLpt = wallet?.balanceLpt || 0;

    if (numericAmount > walletBalanceLpt) {
      navigate("/deposit", {
        state: {
          usdcAmount: usdcAmount,
          returnTo: "/save",
          walletType: "savings",
        },
      });
      return;
    }

    setShowConfirmDrawer(true);
  };

  const handleSave = async () => {
    setIsSaving(true);

    if (!usdcAmount || parseFloat(usdcAmount.replace(/,/g, "")) <= 0) {
      setErrorMessage("Please enter a valid amount to save.");
      setShowErrorDrawer(true);
      setIsSaving(false);
      return;
    }

    if (!state.user) {
      setErrorMessage("User not authenticated. Please log in and try again.");
      setShowErrorDrawer(true);
      setIsSaving(false);
      return;
    }

    const stakeRequest: StakeRequest = {
      walletId: state.user.wallet_id,
      walletAddress: state.user.wallet_address,
      orchestratorAddress: currentValidator.address,
      amount: usdcAmount.replace(/,/g, ""), // Remove commas from amount
    };

    // Retry logic: temporary fix until error fixed
    let lastError: Error | null = null;
    let lastResponse: {
      success: boolean;
      message?: string;
      error?: string;
    } | null = null;

    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const response = await delegationService.stake(stakeRequest);

        if (response.success) {
          setSuccessMessage("Saving successful! Your funds have been saved.");
          setShowSuccessDrawer(true);
          setShowConfirmDrawer(false);

          await refetchWallet();
          refetchDelegation();
          refetchTransactions();
          setIsSaving(false);
          return;
        } else {
          lastResponse = response;
        }
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
      }

      if (
        attempt === 0 &&
        (lastError || (lastResponse && !lastResponse.success))
      ) {
        continue;
      }
    }

    setIsSaving(false);
    setShowConfirmDrawer(false);

    if (lastError) {
      const errorMsg =
        lastError instanceof Error
          ? lastError.message
          : "An error occurred while saving. Please try again.";
      setErrorMessage(errorMsg);
    } else if (lastResponse) {
      setErrorMessage(
        lastResponse.error ||
          lastResponse.message ||
          "Saving failed. Please check your balance and try again."
      );
    } else {
      setErrorMessage("Saving failed. Please try again.");
    }

    setShowErrorDrawer(true);
  };

  const handleHelpClick = () => {
    setShowHelpDrawer(true);
  };

  // Check if user has insufficient funds
  const numericAmount = parseFloat(usdcAmount.replace(/,/g, "")) || 0;
  const walletBalanceLpt = wallet?.balanceLpt || 0;
  const hasInsufficientFunds =
    numericAmount > 0 && numericAmount > walletBalanceLpt;

  return (
    <div className="h-screen bg-[#050505] text-white flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-8">
        <button
          onClick={handleBackClick}
          className="w-8 h-8 flex items-center justify-center"
        >
          <ChevronLeft color="#86B3F7" />
        </button>

        <h1 className="text-lg font-medium text-white">{pageTitle}</h1>

        <button
          onClick={handleHelpClick}
          className="w-8 h-8 bg-[#2a2a2a] rounded-full flex items-center justify-center"
        >
          <CircleQuestionMark color="#86B3F7" size={16} />
        </button>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-6 pb-28 scrollbar-hide">
        {/* Amount Input Field */}
        <div className="py-6">
          <div className="bg-[#1a1a1a] rounded-lg p-3 flex items-center gap-3">
            <input
              type="text"
              value={usdcAmount ? formatNumber(usdcAmount) : ""}
              onChange={(e) => {
                const rawValue = parseFormattedNumber(e.target.value);
                let numericValue = rawValue.replace(/[^0-9.]/g, "");
                const parts = numericValue.split(".");
                if (parts.length > 2) {
                  numericValue = parts[0] + "." + parts.slice(1).join("");
                }
                setUsdcAmount(numericValue);
              }}
              placeholder="USDC"
              className="flex-1 bg-transparent text-white text-lg font-medium focus:outline-none"
            />
            <button
              onClick={handleMaxClick}
              className="text-[#86B3F7] text-sm font-medium transition-colors"
            >
              Max
            </button>
          </div>
          <p className="text-gray-400 text-xs mt-2 pl-2">
            ≈ {currencySymbol}
            {fiatEquivalent.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>
        </div>

        {/* Predefined USDC Amounts */}
        <div className="pb-4">
          <div className="flex space-x-3">
            {["10", "50", "100"].map((amount) => {
              const isActive =
                usdcAmount === amount ||
                parseFloat(usdcAmount || "0") === parseFloat(amount);
              return (
                <button
                  key={amount}
                  onClick={() => handleAmountSelect(amount)}
                  className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-[#86B3F7] text-black"
                      : "bg-[#1a1a1a] text-white/80 hover:bg-[#2a2a2a]"
                  }`}
                >
                  {formatNumber(amount)} USDC
                </button>
              );
            })}
          </div>
        </div>

        {/* Wallet Balance Info */}
        <div className="py-4">
          <h3 className="text-base font-medium text-white/90 mb-2">
            Wallet balance
          </h3>
          <div className="bg-[#1a1a1a] rounded-lg p-4 border border-[#2a2a2a]">
            <div className="flex items-center space-x-3">
              <Wallet2 size={20} color="#86B3F7" />
              <div className="flex-1">
                <span className="text-gray-400 text-sm">
                  {walletBalanceLpt.toLocaleString()} USDC
                </span>
              </div>
            </div>
          </div>
          {hasInsufficientFunds && (
            <p className="text-gray-400 text-xs mt-2 pl-2">
              Insufficient funds, please top up your balance to continue
            </p>
          )}
        </div>
      </div>

      {/* Proceed Button - Fixed at bottom */}
      <div className="px-6 py-4 bg-[#050505] pb-24">
        <button
          onClick={handleProceed}
          disabled={!usdcAmount || parseFloat(usdcAmount) <= 0 || isSaving}
          className={`w-full py-4 rounded-lg font-semibold text-lg transition-colors ${
            usdcAmount && parseFloat(usdcAmount) > 0 && !isSaving
              ? "bg-[#86B3F7] text-black hover:bg-[#6da7fd]"
              : "bg-[#636363] text-white cursor-not-allowed"
          }`}
        >
          {isSaving ? (
            <span className="flex items-center justify-center gap-2">
              <LoaderCircle className="animate-spin h-5 w-5 text-white" />
              Processing..
            </span>
          ) : hasInsufficientFunds ? (
            "Proceed to Deposit"
          ) : (
            "Save"
          )}
        </button>
      </div>

      {/* Help Drawer */}
      <HelpDrawer
        isOpen={showHelpDrawer}
        onClose={() => setShowHelpDrawer(false)}
        title="Saving Guide"
        content={[
          "Save your funds to start earning stable returns. To get started, choose an amount you want to save and a payment method.",
          "Use your existing wallet balance, or deposit with fiat money or tokens from another wallet or exchange.",
          "Review all details before confirming your save to ensure everything is correct.",
        ]}
      />

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
          navigate("/portfolio", { state: { walletType: "savings" } });
        }}
        title="Saving Successful!"
        message={successMessage}
      />

      {/* Confirm Save Drawer */}
      <ActionDrawer
        isOpen={showConfirmDrawer}
        onClose={() => !isSaving && setShowConfirmDrawer(false)}
        title="Proceed to Save"
        content={[
          `You are about to save ${formatNumber(usdcAmount.replace(/,/g, ""))} USDC.`,
          "Once confirmed you will start earning yields! 💲",
          "You can withdraw at anytime you want.",
        ]}
        actions={[
          {
            label: "Save",
            onClick: handleSave,
          },
          {
            label: "Cancel",
            onClick: () => setShowConfirmDrawer(false),
            variant: "secondary",
          },
        ]}
        isProcessing={isSaving}
      />

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
};
