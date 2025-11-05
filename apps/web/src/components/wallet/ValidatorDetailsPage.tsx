import React, { useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ChevronLeft, CircleQuestionMark } from "lucide-react";
import { HelpDrawer } from "@/components/general/HelpDrawer";
import { ShareDrawer } from "@/components/general/ShareDrawer";
import { BottomNavigation } from "@/components/general/BottomNavigation";
import { ValidatorRewardsChart } from "@/components/wallet/ValidatorRewardsChart";
import { ValidatorActionButtons } from "@/components/wallet/ValidatorActionButtons";
import { ValidatorAboutSection } from "@/components/wallet/ValidatorAboutSection";
import { useOrchestrators } from "@/contexts/OrchestratorContext";
import { useDelegation } from "@/contexts/DelegationContext";

export const ValidatorDetailsPage: React.FC = () => {
  const navigate = useNavigate();
  const { validatorId } = useParams<{ validatorId: string }>();
  const [showHelpDrawer, setShowHelpDrawer] = useState(false);
  const [showShareDrawer, setShowShareDrawer] = useState(false);
  const { orchestrators, orchestratorRewards, isLoading, error } =
    useOrchestrators();
  const { userDelegation, delegatorTransactions } = useDelegation();

  // Find the orchestrator by address
  const currentValidator = orchestrators.find(
    (orch) => orch.address === validatorId
  );

  // Get the 4 latest rounds for the chart
  const latestRewards = useMemo(() => {
    if (!validatorId || !orchestratorRewards[validatorId]) return [];
    
    const rewards = orchestratorRewards[validatorId].rewards;
    if (!rewards || rewards.length === 0) return [];
    
    // Filter rewards for this validator and sort by round (descending)
    const validatorRewards = rewards
      .filter(reward => reward.delegate === validatorId)
      .sort((a, b) => parseInt(b.round) - parseInt(a.round))
      .slice(0, 4)
      .reverse(); // Reverse to show oldest to newest
    
    return validatorRewards;
  }, [orchestratorRewards, validatorId]);

  // Filter transactions for this specific validator
  const validatorTransactions = delegatorTransactions
    ? {
        pending: delegatorTransactions.pendingStakeTransactions.filter(
          (tx) => tx.delegate.id === validatorId
        ),
        completed: delegatorTransactions.completedStakeTransactions.filter(
          (tx) => tx.delegate.id === validatorId
        ),
        currentRound: parseInt(delegatorTransactions.currentRound),
      }
    : { pending: [], completed: [], currentRound: 0 };

  // Check if user has a stake with validator
  const hasStakeWithValidator = Boolean(
    userDelegation &&
    userDelegation.delegate.id === validatorId &&
    parseFloat(userDelegation.bondedAmount) > 0
  );

  const pendingUnbondingTransactions = validatorTransactions.pending;
  const withdrawableTransactions = validatorTransactions.completed;

  const hasWithdrawableAmount = withdrawableTransactions.length > 0;
  const hasPendingUnbonding = pendingUnbondingTransactions.length > 0;

  // Calculate total amounts
  const totalStakedAmount = hasStakeWithValidator
    ? parseFloat(userDelegation?.bondedAmount || "0")
    : 0;
  const totalWithdrawableAmount = withdrawableTransactions.reduce(
    (total, tx) => total + parseFloat(tx.amount),
    0
  );
  const totalPendingAmount = pendingUnbondingTransactions.reduce(
    (total, tx) => total + parseFloat(tx.amount),
    0
  );

  // If not found, redirect back to validator page
  if (!isLoading && !currentValidator && !error) {
    navigate("/validator");
    return null;
  }

  const handleBackClick = () => {
    navigate(-1);
  };

  const handleStakeClick = () => {
    navigate(`/stake/${currentValidator?.address}`);
  };

  const handleWithdrawClick = () => {
    navigate(`/withdraw-network/${currentValidator?.address}`);
  };

  const handleUnstakeClick = () => {
    navigate(`/unstake-amount/${currentValidator?.address}`);
  };

  const handleShareClick = () => {
    setShowShareDrawer(true);
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

        <h1 className="text-lg font-medium text-white">
          {currentValidator?.ensIdentity?.name || currentValidator?.ensName
            ? (currentValidator?.ensIdentity?.name || currentValidator?.ensName).length > 16
              ? (currentValidator?.ensIdentity?.name || currentValidator?.ensName).slice(0, 16) + ".."
              : (currentValidator?.ensIdentity?.name || currentValidator?.ensName)
            : "Unknown V.."}
        </h1>

        <button
          onClick={handleHelpClick}
          className="w-8 h-8 bg-[#2a2a2a] rounded-full flex items-center justify-center"
        >
          <CircleQuestionMark color="#86B3F7" size={16} />
        </button>
      </div>

      {/* Current Round */}
      <div className="px-6 py-4 text-center">
        <p className="text-white/70 text-sm mb-2">Total Stake</p>
        <h2 className="text-2xl font-bold text-white">
          {currentValidator
            ? Math.round(
                parseFloat(currentValidator.totalStake)
              ).toLocaleString()
            : "0"}{" "}
          LPT
        </h2>
      </div>

      {/* Graph Section */}
      <ValidatorRewardsChart rewards={latestRewards} isLoading={isLoading} />

      {/* Action Buttons */}
      <ValidatorActionButtons
        validator={currentValidator}
        hasStakeWithValidator={hasStakeWithValidator}
        hasWithdrawableAmount={hasWithdrawableAmount}
        onStakeClick={handleStakeClick}
        onUnstakeClick={handleUnstakeClick}
        onWithdrawClick={handleWithdrawClick}
        onShareClick={handleShareClick}
      />

      {/* About Section */}
      <ValidatorAboutSection
        validator={currentValidator}
        hasStakeWithValidator={hasStakeWithValidator}
        hasWithdrawableAmount={hasWithdrawableAmount}
        hasPendingUnbonding={hasPendingUnbonding}
        totalStakedAmount={totalStakedAmount}
        totalWithdrawableAmount={totalWithdrawableAmount}
        totalPendingAmount={totalPendingAmount}
      />

      {/* Help Drawer */}
      <HelpDrawer
        isOpen={showHelpDrawer}
        onClose={() => setShowHelpDrawer(false)}
        title="Validator Guide"
        content={[
          "Review this validator's performance, APY, total stake, and fees before staking.",
          "APY shows your potential earnings, total stake shows community trust, and fees show the validator's charge.",
          "Click 'Stake' to start earning or 'Unstake' to remove your current stake.",
        ]}
      />

      {/* Share Drawer */}
      <ShareDrawer
        isOpen={showShareDrawer}
        onClose={() => setShowShareDrawer(false)}
        validatorName={currentValidator?.ensName || "Unknown Validator"}
        validatorId={validatorId || ""}
      />

      {/* Bottom Navigation */}
      <BottomNavigation currentPath="/validator" />
    </div>
  );
};
