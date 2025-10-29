import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ChevronLeft,
  CircleQuestionMark,
  ChevronRight,
  Clock,
  CheckCircle,
} from "lucide-react";
import { HelpDrawer } from "@/components/general/HelpDrawer";
import { BottomNavigation } from "@/components/general/BottomNavigation";
import { useOrchestrators } from "@/contexts/OrchestratorContext";
import { useDelegation } from "@/contexts/DelegationContext";

interface Network {
  id: string;
  name: string;
  address: string;
  logo: string;
  isComingSoon?: boolean;
}

export const WithdrawNetworkPage: React.FC = () => {
  const navigate = useNavigate();
  const { validatorId } = useParams<{ validatorId: string }>();
  const [selectedNetwork, setSelectedNetwork] = useState<string | null>(null);
  const [showHelpDrawer, setShowHelpDrawer] = useState(false);
  const { orchestrators } = useOrchestrators();
  const { delegatorTransactions } = useDelegation();

  // Get validator data
  const currentValidator = orchestrators.find(
    (orch) => orch.address === validatorId
  );

  // Get completed (withdrawable) and pending transactions for this validator
  const withdrawableTransactions = delegatorTransactions
    ? delegatorTransactions.completedStakeTransactions.filter(
        (tx) => tx.delegate.id === validatorId
      )
    : [];

  const pendingTransactions = delegatorTransactions
    ? delegatorTransactions.pendingStakeTransactions.filter(
        (tx) => tx.delegate.id === validatorId
      )
    : [];

  const totalWithdrawableAmount = withdrawableTransactions.reduce(
    (total, tx) => total + parseFloat(tx.amount),
    0
  );
  const totalPendingAmount = pendingTransactions.reduce(
    (total, tx) => total + parseFloat(tx.amount),
    0
  );

  const networks: Network[] = [
    {
      id: "livepeer",
      name: "Livepeer",
      address: "0x6f71...a98o",
      logo: "/livepeer.webp",
    },
    {
      id: "usdc",
      name: "USDC",
      address: "0x6f71...a98o",
      logo: "/usdc.svg",
      isComingSoon: true,
    },
    {
      id: "solana",
      name: "Solana",
      address: "",
      logo: "/sol1.svg",
      isComingSoon: true,
    },
    // { id: "base", name: "Base", address: "coming soon", logo: "/base.png" },
    {
      id: "lisk",
      name: "Lisk",
      address: "",
      logo: "/lisk2.png",
      isComingSoon: true,
    },
  ];

  const handleBackClick = () => {
    navigate(-1);
  };

  const handleNetworkSelect = (networkId: string) => {
    setSelectedNetwork(networkId);
  };

  const handleProceed = () => {
    if (selectedNetwork && currentValidator && totalWithdrawableAmount > 0) {
      // Get all unbondingLockIds from withdrawable transactions
      const unbondingLockIds = withdrawableTransactions
        .map((tx) => tx.unbondingLockId)
        .filter((id): id is number => id !== undefined);

      // Calculate total amount and create withdrawal details
      const withdrawalDetails = {
        validatorAddress: currentValidator.address,
        validatorName: currentValidator.ensName || "Unknown Validator",
        network: selectedNetwork,
        amount: totalWithdrawableAmount,
        unbondingLockIds: unbondingLockIds,
        transactions: withdrawableTransactions.map((tx) => ({
          id: tx.id,
          amount: parseFloat(tx.amount),
          unbondingLockId: tx.unbondingLockId,
        })),
      };

      // Encode the withdrawal details as URL parameters
      const params = new URLSearchParams({
        network: selectedNetwork,
        amount: totalWithdrawableAmount.toString(),
        validatorName: currentValidator.ensName || "Unknown Validator",
        unbondingLockIds: JSON.stringify(unbondingLockIds),
      });

      navigate(
        `/confirm-withdrawal/${currentValidator.address}?${params.toString()}`
      );
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
        <div className="bg-[#1a1a1a] rounded-xl p-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-gray-400 text-sm">Withdrawable Amount</span>
          </div>
          <div className="text-white text-lg font-medium">
            {totalWithdrawableAmount.toFixed(2)} LPT
          </div>
        </div>

        {totalPendingAmount > 0 && (
          <div className="bg-[#1a1a1a] rounded-xl p-4 ">
            <div className="flex items-center justify-between mb-1">
              <span className="text-gray-400 text-sm">Pending Unbonding</span>
            </div>
            <div className="text-white text-lg font-medium">
              {totalPendingAmount.toFixed(2)} LPT
            </div>
          </div>
        )}
      </div>

      {/* Select Withdrawal Network */}
      <div className="flex-1 px-6 py-4">
        <h3 className="text-lg font-semibold text-white mb-4">
          Withdrawal Network
        </h3>

        <div className="space-y-3">
          {networks.map((network) => (
            <button
              key={network.id}
              onClick={() =>
                !network.isComingSoon && handleNetworkSelect(network.id)
              }
              disabled={network.isComingSoon}
              className={`w-full flex items-center justify-between rounded-xl transition-colors ${
                network.isComingSoon
                  ? "py-3 px-4 bg-[#1a1a1a] border border-[#2a2a2a] opacity-50 cursor-not-allowed"
                  : "p-4"
              } ${
                !network.isComingSoon && selectedNetwork === network.id
                  ? "bg-[#C7EF6B]/10 border border-[#C7EF6B]"
                  : !network.isComingSoon
                    ? "bg-[#1a1a1a] border border-[#2a2a2a] hover:bg-[#2a2a2a]"
                    : ""
              }`}
            >
              <div className="flex items-center space-x-3">
                <img
                  src={network.logo}
                  alt={network.name}
                  className="w-8 h-8 rounded-full object-cover"
                />
                <div className="text-left">
                  <div className="flex items-center space-x-2">
                    <p className="text-white font-medium">{network.name}</p>
                  </div>
                  {!network.isComingSoon && (
                    <p className="text-gray-400 text-sm">{network.address}</p>
                  )}
                  {network.isComingSoon && (
                    <span className="text-[#C7EF6B] text-[10px] bg-[#C7EF6B]/10 px-2 py-1 rounded-full">
                      Coming Soon
                    </span>
                  )}
                </div>
              </div>
              <ChevronRight
                size={20}
                color={
                  network.isComingSoon
                    ? "#636363"
                    : selectedNetwork === network.id
                      ? "#C7EF6B"
                      : "#636363"
                }
              />
            </button>
          ))}
        </div>
      </div>

      {/* Proceed Button */}
      <div className="px-6 pb-24">
        <button
          onClick={handleProceed}
          disabled={!selectedNetwork || totalWithdrawableAmount <= 0}
          className={`w-full py-4 rounded-xl font-semibold text-lg transition-colors ${
            selectedNetwork && totalWithdrawableAmount > 0
              ? "bg-[#C7EF6B] text-black hover:bg-[#B8E55A]"
              : "bg-[#636363] text-white cursor-not-allowed"
          }`}
        >
          {totalWithdrawableAmount <= 0
            ? "No funds available"
            : "Proceed to withdrawal"}
        </button>
      </div>

      {/* Help Drawer */}
      <HelpDrawer
        isOpen={showHelpDrawer}
        onClose={() => setShowHelpDrawer(false)}
        title="Network Guide"
        content={[
          "Choose which network to withdraw your funds to. Livepeer is free, others have 0.5% conversion fees.",
          "USDC converts to stablecoin, SOL and LSK convert to their respective tokens.",
          "Networks marked 'Coming Soon' are not available yet.",
        ]}
      />

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
};
