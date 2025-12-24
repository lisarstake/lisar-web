import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ChevronLeft, CircleQuestionMark } from "lucide-react";
import { HelpDrawer } from "@/components/general/HelpDrawer";
import { BottomNavigation } from "@/components/general/BottomNavigation";
import { useOrchestrators } from "@/contexts/OrchestratorContext";
import { useDelegation } from "@/contexts/DelegationContext";
import { useAuth } from "@/contexts/AuthContext";
import { usePrices } from "@/hooks/usePrices";
import { priceService } from "@/lib/priceService";
import { formatNumber, parseFormattedNumber } from "@/lib/formatters";

export const UnstakeAmountPage: React.FC = () => {
  const navigate = useNavigate();
  const { validatorId } = useParams<{ validatorId: string }>();
  const [lptAmount, setLptAmount] = useState("0");
  const [showHelpDrawer, setShowHelpDrawer] = useState(false);
  const [fiatEquivalent, setFiatEquivalent] = useState(0);
  const { orchestrators } = useOrchestrators();
  const { userDelegation } = useDelegation();
  const { state } = useAuth();
  const { prices } = usePrices();

  // Find the orchestrator by address (validatorId is the address)
  const currentValidator = orchestrators.find(
    (orch) => orch.address === validatorId
  );

  // Get user's current stake with this validator
  const hasStakeWithValidator =
    userDelegation &&
    userDelegation.delegate.id === validatorId &&
    parseFloat(userDelegation.bondedAmount) > 0;

  const currentStake = hasStakeWithValidator
    ? parseFloat(userDelegation.bondedAmount)
    : 0;
  const userCurrency = state.user?.fiat_type || "NGN";
  const currencySymbol = priceService.getCurrencySymbol(userCurrency);

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
    setLptAmount(currentStake.toString());
  };

  const handleProceed = () => {
    navigate(
      `/confirm-unstake/${currentValidator?.address}?amount=${lptAmount}`
    );
  };

  const handleHelpClick = () => {
    setShowHelpDrawer(true);
  };

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

        <h1 className="text-lg font-medium text-white">Unstake</h1>

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
              const isActive = lptAmount === amount || parseFloat(lptAmount || "0") === parseFloat(amount);
              return (
                <button
                  key={amount}
                  onClick={() => handleAmountSelect(amount)}
                  className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-colors ${
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

        {/* Current Stake Display */}
        {hasStakeWithValidator && (
          <div className="py-4">
            <h3 className="text-base font-medium text-white/90 mb-2">
              Current stake
            </h3>
            <div className="bg-[#1a1a1a] rounded-lg p-4 border border-[#2a2a2a]">
              <div className="flex justify-between items-center">
                <span className="text-white font-normal">Staked amount</span>
                <span className="text-[#C7EF6B] font-medium">
                  {currentStake.toLocaleString()} LPT
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Proceed Button - Fixed at bottom */}
      <div className="px-6 py-4 bg-[#050505] pb-24">
        <button
          onClick={handleProceed}
          disabled={
            !lptAmount ||
            parseFloat(lptAmount) > currentStake ||
            parseFloat(lptAmount) <= 0
          }
          className={`w-full py-4 rounded-lg font-semibold text-lg transition-colors ${
            lptAmount &&
            parseFloat(lptAmount) <= currentStake &&
            parseFloat(lptAmount) > 0
              ? "bg-[#C7EF6B] text-black hover:bg-[#B8E55A]"
              : "bg-[#636363] text-white cursor-not-allowed"
          }`}
        >
           Proceed to Unstake
        </button>
      </div>

      {/* Help Drawer */}
      <HelpDrawer
        isOpen={showHelpDrawer}
        onClose={() => setShowHelpDrawer(false)}
        title="Unstaking Guide"
        content={[
          "Choose how much you want to unstake from this validator.",
          "You can unstake part or all of your stake. You won't earn rewards during the unlocking period.",
          "Your funds will be available after the unlocking period ends.",
        ]}
      />

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
};
