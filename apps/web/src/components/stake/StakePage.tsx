import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
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

export const StakePage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { validatorId } = useParams<{ validatorId: string }>();

  const [lptAmount, setLptAmount] = useState(() => {
    const state = location.state as { lptAmount?: string } | null;
    return state?.lptAmount || "0";
  });

  // Only set amount from state on initial mount, not on every state change
  // This prevents loops when navigating back from deposit page
  useEffect(() => {
    const state = location.state as { lptAmount?: string } | null;
    if (state?.lptAmount && lptAmount === "0") {
      setLptAmount(state.lptAmount);
    }
  }, []); // Empty dependency array - only run on mount

  const [showHelpDrawer, setShowHelpDrawer] = useState(false);
  const [showConfirmDrawer, setShowConfirmDrawer] = useState(false);
  const [isStaking, setIsStaking] = useState(false);
  const [showErrorDrawer, setShowErrorDrawer] = useState(false);
  const [showSuccessDrawer, setShowSuccessDrawer] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const { orchestrators } = useOrchestrators();
  const { state } = useAuth();
  const { wallet, refetch: refetchWallet } = useWallet();
  const { refetch: refetchDelegation } = useDelegation();
  const { refetch: refetchTransactions } = useTransactions();

  // Find the orchestrator by address (validatorId is the address)
  const currentValidator = orchestrators.find(
    (orch) => orch.address === validatorId
  );

  // Get user's preferred currency
  const userCurrency = state.user?.fiat_type || "NGN";
  const currencySymbol = priceService.getCurrencySymbol(userCurrency);

  // User's wallet balance
  const walletBalanceLpt = wallet?.balanceLpt || 0;

  const pageTitle = "Stake";

  const [fiatEquivalent, setFiatEquivalent] = useState(0);

  useEffect(() => {
    const calculateFiat = async () => {
      const numericAmount = parseFloat(lptAmount.replace(/,/g, "")) || 0;
      if (numericAmount > 0) {
        const fiatValue = await priceService.convertLptToFiat(
          numericAmount,
          userCurrency
        );
        setFiatEquivalent(fiatValue);
      } else {
        setFiatEquivalent(0);
      }
    };
    calculateFiat();
  }, [lptAmount, userCurrency]);

  const handleBackClick = () => {
    navigate(-1);
  };

  const handleAmountSelect = (amount: string) => {
    const numericAmount = parseFormattedNumber(amount);
    setLptAmount(numericAmount);
  };

  const handleMaxClick = () => {
    // Leave a small balance to avoid transaction issues (0.01%)
    const buffer = Math.max(0.001, walletBalanceLpt * 0.0001);
    const maxAmount = Math.max(0, walletBalanceLpt - buffer);
    setLptAmount(maxAmount.toString());
  };

  const handleProceed = async () => {
    const numericAmount = parseFloat(lptAmount.replace(/,/g, "")) || 0;

    if (numericAmount > walletBalanceLpt) {
      navigate("/deposit", {
        state: { lptAmount, returnTo: `/stake/${validatorId}` },
      });
      return;
    }

    setShowConfirmDrawer(true);
  };

  const handleStake = async () => {
    setIsStaking(true);

    if (!currentValidator) {
      setErrorMessage("Validator not found. Please try again.");
      setShowErrorDrawer(true);
      setIsStaking(false);
      return;
    }

    if (!lptAmount || parseFloat(lptAmount.replace(/,/g, "")) <= 0) {
      setErrorMessage("Please enter a valid amount to stake.");
      setShowErrorDrawer(true);
      setIsStaking(false);
      return;
    }

    if (!state.user) {
      setErrorMessage("User not authenticated. Please log in and try again.");
      setShowErrorDrawer(true);
      setIsStaking(false);
      return;
    }

    const stakeRequest: StakeRequest = {
      walletId: state.user.wallet_id,
      walletAddress: state.user.wallet_address,
      orchestratorAddress: currentValidator.address,
      amount: lptAmount.replace(/,/g, ""), // Remove commas from amount
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
          setSuccessMessage(
            "Staking successful! Your tokens have been staked."
          );
          setShowSuccessDrawer(true);
          setShowConfirmDrawer(false);

          await refetchWallet();
          refetchDelegation();
          refetchTransactions();
          setIsStaking(false);
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

    setIsStaking(false);
    setShowConfirmDrawer(false);

    if (lastError) {
      const errorMsg =
        lastError instanceof Error
          ? lastError.message
          : "An error occurred while staking. Please try again.";
      setErrorMessage(errorMsg);
    } else if (lastResponse) {
      setErrorMessage(
        lastResponse.error ||
          lastResponse.message ||
          "Staking failed. Please check your balance and try again."
      );
    } else {
      setErrorMessage("Staking failed. Please try again.");
    }

    setShowErrorDrawer(true);
  };

  const handleHelpClick = () => {
    setShowHelpDrawer(true);
  };

  // Check if user has insufficient funds
  const numericAmount = parseFloat(lptAmount.replace(/,/g, "")) || 0;
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
          <ChevronLeft color="#C7EF6B" />
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
          <div className="bg-[#1a1a1a] rounded-xl p-4 flex items-center gap-3">
            <input
              type="text"
              value={lptAmount ? formatNumber(lptAmount) : ""}
              onChange={(e) => {
                const rawValue = parseFormattedNumber(e.target.value);
                let numericValue = rawValue.replace(/[^0-9.]/g, "");
                const parts = numericValue.split(".");
                if (parts.length > 2) {
                  numericValue = parts[0] + "." + parts.slice(1).join("");
                }
                setLptAmount(numericValue);
              }}
              placeholder="LPT"
              className="flex-1 bg-transparent text-white text-lg font-medium focus:outline-none"
            />
            <button
              onClick={handleMaxClick}
              className="text-[#C7EF6B] text-sm font-medium transition-colors"
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

        {/* Predefined LPT Amounts */}
        <div className="pb-4">
          <div className="flex space-x-3">
            {["10", "50", "100"].map((amount) => {
              const isActive =
                lptAmount === amount ||
                parseFloat(lptAmount || "0") === parseFloat(amount);
              return (
                <button
                  key={amount}
                  onClick={() => handleAmountSelect(amount)}
                  className={`flex-1 py-3 px-4 rounded-xl text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-[#C7EF6B] text-black"
                      : "bg-[#1a1a1a] text-white/80 hover:bg-[#2a2a2a]"
                  }`}
                >
                  {formatNumber(amount)} LPT
                </button>
              );
            })}
          </div>
        </div>

        {/* Wallet Balance Info */}
        <div className="py-4">
          <h3 className="text-base font-medium text-white/90 mb-2">
            Payment method
          </h3>
          <div className="bg-[#1a1a1a] rounded-xl p-4 border border-[#2a2a2a]">
            <div className="flex items-center space-x-3">
              <Wallet2 size={20} color="#86B3F7" />
              <div className="flex-1">
                <div>
                  <span className="text-white font-normal">Wallet balance</span>
                  <span className="text-gray-400 text-sm ml-2">
                    {walletBalanceLpt.toLocaleString()} LPT
                  </span>
                </div>
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
          disabled={!lptAmount || parseFloat(lptAmount) <= 0 || isStaking}
          className={`w-full py-4 rounded-xl font-semibold text-lg transition-colors ${
            lptAmount && parseFloat(lptAmount) > 0 && !isStaking
              ? "bg-[#C7EF6B] text-black hover:bg-[#B8E55A]"
              : "bg-[#636363] text-white cursor-not-allowed"
          }`}
        >
          {isStaking ? (
            <span className="flex items-center justify-center gap-2">
              <LoaderCircle className="animate-spin h-5 w-5 text-white" />
              Processing..
            </span>
          ) : hasInsufficientFunds ? (
            "Proceed to Deposit"
          ) : (
            "Stake"
          )}
        </button>
      </div>

      {/* Help Drawer */}
      <HelpDrawer
        isOpen={showHelpDrawer}
        onClose={() => setShowHelpDrawer(false)}
        title="Staking Guide"
        content={[
          "Stake to a validator to start earning rewards. To get started, choose an amount you want to stake and a payment method.",
          "Use your existing wallet balance, or deposit with fiat money or tokens from another wallet or exchange.",
          "Review all details before confirming your stake to ensure everything is correct.",
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
          navigate("/portfolio");
        }}
        title="Staking Successful!"
        message={successMessage}
      />

      {/* Confirm Stake Drawer */}
      <ActionDrawer
        isOpen={showConfirmDrawer}
        onClose={() => !isStaking && setShowConfirmDrawer(false)}
        title="Proceed to Stake"
        content={[
          `You are about to stake ${formatNumber(lptAmount.replace(/,/g, ""))} LPT to ${currentValidator?.ensName || "this validator"}.`,
          "Once confirmed, your tokens will be staked and you will start earning rewards! 💲",
          "You can unstake at anytime.",
        ]}
        actions={[
          {
            label: "Stake",
            onClick: handleStake,
          },
          {
            label: "Cancel",
            onClick: () => setShowConfirmDrawer(false),
            variant: "secondary",
          },
        ]}
        isProcessing={isStaking}
      />

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
};
