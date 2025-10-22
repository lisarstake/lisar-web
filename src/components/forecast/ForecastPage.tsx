import React, { useState } from "react";
import { ChevronDown, CircleQuestionMark } from "lucide-react";
import { HelpDrawer } from "@/components/general/HelpDrawer";
import { BottomNavigation } from "@/components/general/BottomNavigation";

interface Orchestrator {
  id: string;
  name: string;
  apy: number;
}

export const ForecastPage: React.FC = () => {
  const [showHelpDrawer, setShowHelpDrawer] = useState(false);
  const [selectedOrchestrator, setSelectedOrchestrator] = useState<Orchestrator>({
    id: "1",
    name: "streamplace.eth",
    apy: 65.6
  });
  const [delegationAmount, setDelegationAmount] = useState("2,000");

  const orchestrators: Orchestrator[] = [
    { id: "1", name: "streamplace.eth", apy: 65.6 },
    { id: "2", name: "neuralstream.eth", apy: 12.5 },
    { id: "3", name: "livepeer.org", apy: 11.8 }
  ];

  const handleHelpClick = () => {
    setShowHelpDrawer(true);
  };

  const handleOrchestratorSelect = (orchestrator: Orchestrator) => {
    setSelectedOrchestrator(orchestrator);
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDelegationAmount(e.target.value);
  };

  // Calculate returns based on delegation amount and APY
  const numericAmount = parseFloat(delegationAmount.replace(/,/g, "")) || 0;
  const dailyReturn = (numericAmount * selectedOrchestrator.apy / 100) / 365;
  const monthlyReturn = dailyReturn * 30;
  const yearlyReturn = numericAmount * selectedOrchestrator.apy / 100;
  const totalValue = numericAmount + yearlyReturn;

  return (
    <div className="h-screen bg-[#050505] text-white flex flex-col">
      {/* Content - Scrollable */}
      <div className="flex-1 overflow-y-auto px-6 pb-20">
        {/* Header - Scrollable */}
        <div className="flex items-center justify-between py-8">
          <h1 className="text-lg font-medium text-white">Yield Calculator</h1>
          
         
        </div>

        {/* Select Orchestrator */}
        <div className="mb-6">
          <label className="block text-gray-400 text-sm font-medium mb-3">
            Select Orchestrator
          </label>
          <div className="relative">
            <select
              value={selectedOrchestrator.id}
              onChange={(e) => {
                const selected = orchestrators.find(o => o.id === e.target.value);
                if (selected) handleOrchestratorSelect(selected);
              }}
              className="w-full p-4 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl text-white appearance-none focus:border-[#C7EF6B] focus:outline-none"
            >
              {orchestrators.map((orchestrator) => (
                <option key={orchestrator.id} value={orchestrator.id}>
                  {orchestrator.name} - APY: {orchestrator.apy}%
                </option>
              ))}
            </select>
            <ChevronDown 
              size={20} 
              color="#C7EF6B" 
              className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none"
            />
          </div>
        </div>

        {/* Delegation Amount */}
        <div className="mb-8">
          <label className="block text-gray-400 text-sm font-medium mb-3">
            Delegation amount (NGN)
          </label>
          <input
            type="text"
            value={delegationAmount}
            onChange={handleAmountChange}
            className="w-full p-4 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl text-white focus:border-[#C7EF6B] focus:outline-none"
            placeholder="Enter amount"
          />
        </div>

        {/* Total Projected Return */}
        <div className="mb-8">
          <div className="bg-[#1a1a1a] rounded-xl p-6 text-center">
            <h2 className="text-gray-400 text-sm font-medium mb-2">Total Projected Return</h2>
            <div className="text-3xl font-bold text-white mb-1">
              {totalValue.toLocaleString()} NGN
            </div>
            <div className="text-[#C7EF6B] text-sm">
              = {selectedOrchestrator.apy}% APY
            </div>
          </div>
        </div>

        {/* Return Breakdown */}
        <div className="mb-8">
          <h3 className="text-white font-medium mb-4">Return Breakdown</h3>
          <div className="bg-[#1a1a1a] rounded-xl p-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Daily</span>
              <span className="text-white font-medium">{dailyReturn.toFixed(0)} NGN</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Monthly</span>
              <span className="text-white font-medium">{monthlyReturn.toFixed(0)} NGN</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Network Yearly fee</span>
              <span className="text-white font-medium">{yearlyReturn.toFixed(0)} NGN</span>
            </div>
            <div className="flex justify-between items-center border-t border-[#2a2a2a] pt-3">
              <span className="text-white font-medium">Total Value</span>
              <span className="text-white font-bold">{totalValue.toLocaleString()} NGN</span>
            </div>
          </div>
        </div>

        {/* Important Disclaimer */}
        <div className="mb-6">
          <p className="text-orange-400 text-xs leading-relaxed">
            These calculations are estimates based on current APY and LPT price. Actual returns may vary.
          </p>
        </div>
      </div>

      {/* Help Drawer */}
      <HelpDrawer
        isOpen={showHelpDrawer}
        onClose={() => setShowHelpDrawer(false)}
        title="About Lisar"
        subtitle="A quick guide on how to use the yield calculator"
        content={[
          "Lorem ipsum dolor sit amet consectetur. Quam sed dictum amet eu convallis eu. Ac sit ultricies leo cras. Convallis lectus diam purus interdum habitant. Sit vestibulum in orci ut non sit. Blandit lectus id sed pulvinar risus purus adipiscing placerat."
        ]}
      />

      {/* Bottom Navigation */}
      <BottomNavigation currentPath="/forecast" />
    </div>
  );
};
