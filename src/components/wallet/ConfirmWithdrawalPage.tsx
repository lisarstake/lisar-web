import React, { useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ChevronLeft, CircleQuestionMark } from "lucide-react";
import { HelpDrawer } from "@/components/general/HelpDrawer";
import { BottomNavigation } from "@/components/general/BottomNavigation";
import { WithdrawalSuccessDrawer } from "./WithdrawalSuccessDrawer";
import { orchestrators } from "@/data/orchestrators";
import { getValidatorDisplayName } from "@/utils/routing";

export const ConfirmWithdrawalPage: React.FC = () => {
  const navigate = useNavigate();
  const { validatorId } = useParams<{ validatorId: string }>();
  const [searchParams] = useSearchParams();
  const [isProcessing, setIsProcessing] = useState(false);
  const [showHelpDrawer, setShowHelpDrawer] = useState(false);
  const [showSuccessDrawer, setShowSuccessDrawer] = useState(false);

  // Get validator data
  const validatorName = getValidatorDisplayName(validatorId);
  const currentValidator = orchestrators.find(o => o.name === validatorName) || orchestrators[0];

  const selectedNetwork = searchParams.get("network") || "livepeer";
  const withdrawalAmount = searchParams.get("amount") || "0";
  const validatorDisplayName = searchParams.get("validatorName") || "Unknown Validator";
  const locksData = searchParams.get("locks");

  // Parse locks data if available
  const locks = locksData ? JSON.parse(locksData) : [];

  // Get token name and network name based on selected network
  const getTokenInfo = () => {
    switch (selectedNetwork) {
      case "solana":
        return { token: "SOL", network: "Solana" };
      case "livepeer":
        return { token: "LPT", network: "Arbitrum One" };
      case "usdc":
        return { token: "USDC", network: "Arbitrum One" };
      case "lisk":
        return { token: "LSK", network: "Arbitrum One" };
      case "base":
        return { token: "LPT", network: "Base" };
      default:
        return { token: "LPT", network: "Arbitrum One" };
    }
  };

  const { token, network: networkName } = getTokenInfo();

  // Determine if this is a cross-chain withdrawal (conversion)
  const isCrossChain = selectedNetwork !== "livepeer";
  const conversionFee = isCrossChain ? "0.5%" : "0%";
  const networkFee = isCrossChain ? "0.5 LPT" : "0 LPT";

  const handleBackClick = () => {
    navigate(-1);
  };

  const handleProceed = () => {
    setIsProcessing(true);
    // Simulate processing time
    setTimeout(() => {
      setIsProcessing(false);
      setShowSuccessDrawer(true);
    }, 2000);
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

        <h1 className="text-lg font-medium text-white">Confirm Withdrawal</h1>

        <button
          onClick={handleHelpClick}
          className="w-8 h-8 bg-[#2a2a2a] rounded-full flex items-center justify-center"
        >
          <CircleQuestionMark color="#86B3F7" size={16} />
        </button>
      </div>

      {/* Withdrawal Amount */}
      <div className="text-center px-6 py-8">
        <h2 className="text-4xl font-bold text-white">
          {parseFloat(withdrawalAmount).toFixed(2)} LPT
        </h2>
      </div>

      {/* Confirmation Details Card */}
      <div className="flex-1 px-6 py-4">
        <div className="bg-[#1a1a1a] rounded-xl p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Token</span>
              <span className="text-white font-medium">{token}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-gray-400">To</span>
              <span className="text-white font-medium">0x6f71...a98o</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-gray-400">Network</span>
              <span className="text-white font-medium">{networkName}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-gray-400">From Validator</span>
              <span className="text-white font-medium">{validatorDisplayName}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-gray-400">Network fee</span>
              <span className="text-white font-medium">{conversionFee}</span>
            </div>

            <div className="border-t border-[#2a2a2a] pt-4">
              <div className="text-gray-400 text-sm">
                {isCrossChain
                  ? "You are withdrawing your staking rewards to another network. We will swap your LPT to " +
                    token +
                    " at a 0.5% processing fee."
                  : "You are withdrawing your staking rewards on the same network (Livepeer). No fee applies."}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Proceed Button */}
      <div className="px-6 pb-24">
        <button
          onClick={handleProceed}
          disabled={isProcessing}
          className={`w-full py-4 rounded-xl font-semibold text-lg transition-colors ${
            isProcessing
              ? "bg-[#636363] text-white cursor-not-allowed"
              : "bg-[#C7EF6B] text-black hover:bg-[#B8E55A]"
          }`}
        >
          {isProcessing ? "Processing..." : "Proceed to withdrawal"}
        </button>
      </div>

      {/* Help Drawer */}
      <HelpDrawer
        isOpen={showHelpDrawer}
        onClose={() => setShowHelpDrawer(false)}
        title="Withdrawal Guide"
        content={[
          "Review your withdrawal details including token, amount, network, and fees before confirming.",
          "Conversion fees apply when converting between different tokens, network fees cover transaction processing.",
          "Check the summary to see exactly what you'll receive after all fees."
        ]}
      />

      {/* Success Drawer */}
      <WithdrawalSuccessDrawer
        isOpen={showSuccessDrawer}
        onClose={() => setShowSuccessDrawer(false)}
      />

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
};
