import React, { useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ChevronLeft, CircleQuestionMark } from "lucide-react";
import { HelpDrawer } from "@/components/general/HelpDrawer";
import { BottomNavigation } from "@/components/general/BottomNavigation";
import { WithdrawalSuccessDrawer } from "./WithdrawalSuccessDrawer";

export const ConfirmWithdrawalPage: React.FC = () => {
  const navigate = useNavigate();
  const { validatorId } = useParams<{ validatorId: string }>();
  const [searchParams] = useSearchParams();
  const [isProcessing, setIsProcessing] = useState(false);
  const [showHelpDrawer, setShowHelpDrawer] = useState(false);
  const [showSuccessDrawer, setShowSuccessDrawer] = useState(false);

  const selectedNetwork = searchParams.get('network') || 'arbitrum';
  const networkName = selectedNetwork === 'solana' ? 'Solana' : 
                     selectedNetwork === 'base' ? 'Base' : 
                     selectedNetwork === 'lisk' ? 'Lisk' : 'Arbitrum One';

  const handleBackClick = () => {
    navigate(`/withdraw-network/${validatorId}`);
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
        <h2 className="text-4xl font-bold text-white">800,000 LPT</h2>
      </div>

      {/* Confirmation Details Card */}
      <div className="flex-1 px-6 py-4">
        <div className="bg-[#1a1a1a] rounded-xl p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">To</span>
              <span className="text-white font-medium">Alex wallet 0x6f71...a98o</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Network</span>
              <span className="text-white font-medium">{networkName}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Network fee</span>
              <span className="text-white font-medium">1,200LPT</span>
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
          {isProcessing ? "Processing..." : "Proceed to withdrawal"}
        </button>
      </div>

      {/* Help Drawer */}
      <HelpDrawer
        isOpen={showHelpDrawer}
        onClose={() => setShowHelpDrawer(false)}
        title="About Lisar"
        subtitle="A quick guide on how to use the withdrawal feature"
        content={[
          "Lorem ipsum dolor sit amet consectetur. Quam sed dictum amet eu convallis eu. Ac sit ultricies leo cras. Convallis lectus diam purus interdum habitant. Sit vestibulum in orci ut non sit. Blandit lectus id sed pulvinar risus purus adipiscing placerat.",
          "Lorem ipsum dolor sit amet consectetur. Quam sed dictum amet eu convallis eu. Ac sit ultricies leo cras. Convallis lectus diam purus interdum habitant. Sit vestibulum in orci ut non sit. Blandit lectus id sed pulvinar risus purus adipiscing placerat.",
          "Lorem ipsum dolor sit amet consectetur. Quam sed dictum amet eu convallis eu. Ac sit ultricies leo cras. Convallis lectus diam purus interdum habitant. Sit vestibulum in orci ut non sit. Blandit lectus id sed pulvinar risus purus adipiscing placerat."
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
