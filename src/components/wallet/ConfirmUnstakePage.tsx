import React, { useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ChevronLeft, CircleQuestionMark } from "lucide-react";
import { HelpDrawer } from "@/components/general/HelpDrawer";
import { BottomNavigation } from "@/components/general/BottomNavigation";
import { UnstakeSuccessDrawer } from "./UnstakeSuccessDrawer";
import { orchestrators } from "@/data/orchestrators";
import { getValidatorDisplayName } from "@/utils/routing";

export const ConfirmUnstakePage: React.FC = () => {
  const navigate = useNavigate();
  const { validatorId } = useParams<{ validatorId: string }>();
  const [searchParams] = useSearchParams();
  const [isProcessing, setIsProcessing] = useState(false);
  const [showHelpDrawer, setShowHelpDrawer] = useState(false);
  const [showSuccessDrawer, setShowSuccessDrawer] = useState(false);

  // Get validator data
  const validatorName = getValidatorDisplayName(validatorId);
  const currentValidator = orchestrators.find(o => o.name === validatorName) || orchestrators[0];

  const unstakeAmount = searchParams.get("amount") || "5,000";
  const fiatAmount = (
    parseInt(unstakeAmount.replace(/,/g, "")) * 20
  ).toLocaleString();

  const handleBackClick = () => {
    navigate(`/unstake-amount/${currentValidator.slug}`);
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

        <h1 className="text-lg font-medium text-white">Confirm Unstake</h1>

        <button
          onClick={handleHelpClick}
          className="w-8 h-8 bg-[#2a2a2a] rounded-full flex items-center justify-center"
        >
          <CircleQuestionMark color="#86B3F7" size={16} />
        </button>
      </div>

      {/* Unstake Amount */}
      <div className="text-center px-6 py-8">
        <h2 className="text-4xl font-bold text-white">{unstakeAmount} LPT</h2>
        <p className="text-white/70 text-lg mt-2">≈ ₦{fiatAmount} NGN</p>
      </div>

      {/* Confirmation Details Card */}
      <div className="flex-1 px-6 py-4">
        <div className="bg-[#1a1a1a] rounded-xl p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">From</span>
              <span className="text-white font-medium">neuralstream.eth</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-gray-400">To</span>
              <span className="text-white font-medium">Your wallet</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-gray-400">Network fee</span>
              <span className="text-white font-medium">50 LPT</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-gray-400">You will receive</span>
              <span className="text-[#C7EF6B] font-medium">
                {parseInt(unstakeAmount.replace(/,/g, "")) - 50} LPT
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Proceed Button */}
      <div className="px-6 pb-6">
        <button
          onClick={handleProceed}
          disabled={isProcessing}
          className={`w-full py-4 rounded-xl font-semibold text-lg transition-colors ${
            isProcessing
              ? "bg-[#636363] text-white cursor-not-allowed"
              : "bg-[#C7EF6B] text-black hover:bg-[#B8E55A]"
          }`}
        >
          {isProcessing ? "Processing..." : "Proceed to Unstake"}
        </button>
      </div>

      {/* Help Drawer */}
      <HelpDrawer
        isOpen={showHelpDrawer}
        onClose={() => setShowHelpDrawer(false)}
        title="Unstaking Guide"
        content={[
          "Review your unstaking details including validator, amount, and unbonding period before confirming.",
          "You won't earn rewards during the unbonding period, and there's a small network fee.",
          "Your funds will be available after the unbonding period ends."
        ]}
      />

      {/* Success Drawer */}
      <UnstakeSuccessDrawer
        isOpen={showSuccessDrawer}
        onClose={() => setShowSuccessDrawer(false)}
      />

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
};
