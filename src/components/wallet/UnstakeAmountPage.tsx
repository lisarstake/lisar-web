import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ChevronLeft, CircleQuestionMark, ArrowLeftRight } from "lucide-react";
import { HelpDrawer } from "@/components/general/HelpDrawer";
import { BottomNavigation } from "@/components/general/BottomNavigation";

export const UnstakeAmountPage: React.FC = () => {
  const navigate = useNavigate();
  const { validatorId } = useParams<{ validatorId: string }>();
  const [fiatAmount, setFiatAmount] = useState("100,000");
  const [lptAmount, setLptAmount] = useState("5,000");
  const [showHelpDrawer, setShowHelpDrawer] = useState(false);

  const handleBackClick = () => {
    navigate(`/validator-details/${validatorId}`);
  };

  const handleAmountSelect = (amount: string) => {
    setLptAmount(amount);
    // Convert to fiat (mock conversion)
    const numericAmount = parseInt(amount.replace(/,/g, ""));
    setFiatAmount((numericAmount * 20).toLocaleString());
  };

  const handleProceed = () => {
    navigate(`/confirm-unstake/${validatorId}?amount=${lptAmount}`);
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

      {/* Amount Input Fields */}
      <div className="px-6 py-6 space-y-2">
        {/* Fiat Amount */}
        <div className="bg-[#1a1a1a] rounded-xl p-4">
          <input
            type="text"
            value={`₦ ${fiatAmount} NGN`}
            readOnly
            className="w-full bg-transparent text-white text-lg font-medium focus:outline-none"
          />
        </div>

        {/* Conversion Arrow */}
        <div className="flex justify-center">
          <ArrowLeftRight size={20} color="#C7EF6B" className="font-extrabold" />
        </div>

        {/* LPT Amount */}
        <div className="bg-[#1a1a1a] rounded-xl p-4">
          <input
            type="text"
            value={`${lptAmount} LPT`}
            readOnly
            className="w-full bg-transparent text-white text-lg font-medium focus:outline-none"
          />
        </div>
      </div>

      {/* Predefined LPT Amounts */}
      <div className="px-6 py-4">
        <div className="flex space-x-3">
          {["1,000", "5,000", "10,000"].map((amount) => (
            <button
              key={amount}
              onClick={() => handleAmountSelect(amount)}
              className={`flex-1 py-3 px-4 rounded-xl text-sm font-medium transition-colors ${
                lptAmount === amount
                  ? "bg-[#C7EF6B] text-black"
                  : "bg-[#1a1a1a] text-white hover:bg-[#2a2a2a]"
              }`}
            >
              {amount}
            </button>
          ))}
        </div>
      </div>

      {/* Proceed Button */}
      <div className="flex-1 flex items-end px-6 pb-6">
        <button
          onClick={handleProceed}
          className="w-full py-4 rounded-xl font-semibold text-lg bg-[#C7EF6B] text-black hover:bg-[#B8E55A] transition-colors"
        >
          Proceed to Unstake
        </button>
      </div>

      {/* Help Drawer */}
      <HelpDrawer
        isOpen={showHelpDrawer}
        onClose={() => setShowHelpDrawer(false)}
        title="About Lisar"
        subtitle="A quick guide on how to use the unstaking feature"
        content={[
          "Lorem ipsum dolor sit amet consectetur. Quam sed dictum amet eu convallis eu. Ac sit ultricies leo cras. Convallis lectus diam purus interdum habitant. Sit vestibulum in orci ut non sit. Blandit lectus id sed pulvinar risus purus adipiscing placerat."
        ]}
      />

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
};
