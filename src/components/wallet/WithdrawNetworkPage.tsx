import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ChevronLeft, CircleQuestionMark, ChevronRight } from "lucide-react";
import { HelpDrawer } from "@/components/general/HelpDrawer";
import { BottomNavigation } from "@/components/general/BottomNavigation";

interface Network {
  id: string;
  name: string;
  address: string;
}

export const WithdrawNetworkPage: React.FC = () => {
  const navigate = useNavigate();
  const { validatorId } = useParams<{ validatorId: string }>();
  const [selectedNetwork, setSelectedNetwork] = useState<string | null>(null);
  const [showHelpDrawer, setShowHelpDrawer] = useState(false);

  const networks: Network[] = [
    { id: "solana", name: "Solana", address: "0x6f71...a98o" },
    { id: "base", name: "Base", address: "0x6f71...a98o" },
    { id: "lisk", name: "Lisk", address: "0x6f71...a98o" }
  ];

  const handleBackClick = () => {
    // Check if we came from validator details or home page
    if (document.referrer.includes('/validator-details/')) {
      navigate(`/validator-details/${validatorId}`);
    } else {
      navigate('/wallet');
    }
  };

  const handleNetworkSelect = (networkId: string) => {
    setSelectedNetwork(networkId);
  };

  const handleProceed = () => {
    if (selectedNetwork) {
      navigate(`/confirm-withdrawal/${validatorId}?network=${selectedNetwork}`);
    }
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

        <h1 className="text-lg font-medium text-white">Withdraw</h1>

        <button
          onClick={handleHelpClick}
          className="w-8 h-8 bg-[#2a2a2a] rounded-full flex items-center justify-center"
        >
          <CircleQuestionMark color="#86B3F7" size={16} />
        </button>
      </div>

      {/* Withdrawal Amount */}
      <div className="px-6 py-4">
        <div className="bg-[#1a1a1a] rounded-xl p-4 flex items-center space-x-3">
          <div className="w-8 h-8 bg-[#2a2a2a] rounded-full"></div>
          <span className="text-white text-lg font-medium">800,000 LPT</span>
        </div>
      </div>

      {/* Select Withdrawal Network */}
      <div className="flex-1 px-6 py-4">
        <h3 className="text-lg font-semibold text-white mb-4">Select Withdrawal Network</h3>
        
        <div className="space-y-3">
          {networks.map((network) => (
            <button
              key={network.id}
              onClick={() => handleNetworkSelect(network.id)}
              className={`w-full flex items-center justify-between p-4 rounded-xl transition-colors ${
                selectedNetwork === network.id
                  ? "bg-[#C7EF6B]/10 border border-[#C7EF6B]"
                  : "bg-[#1a1a1a] border border-[#2a2a2a]"
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-[#2a2a2a] rounded-full"></div>
                <div className="text-left">
                  <p className="text-white font-medium">{network.name}</p>
                  <p className="text-gray-400 text-sm">{network.address}</p>
                </div>
              </div>
              <ChevronRight 
                size={20} 
                color={selectedNetwork === network.id ? "#C7EF6B" : "#636363"} 
              />
            </button>
          ))}
        </div>
      </div>

      {/* Proceed Button */}
      <div className="px-6 pb-6">
        <button
          onClick={handleProceed}
          disabled={!selectedNetwork}
          className={`w-full py-4 rounded-xl font-semibold text-lg transition-colors ${
            selectedNetwork
              ? "bg-[#C7EF6B] text-black hover:bg-[#B8E55A]"
              : "bg-[#636363] text-white cursor-not-allowed"
          }`}
        >
          Proceed to withdrawal
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

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
};
