import React, { useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ChevronLeft, CircleQuestionMark } from "lucide-react";
import { HelpDrawer } from "@/components/general/HelpDrawer";
import { ActionDrawer } from "@/components/general/ActionDrawer";
import { ShareDrawer } from "@/components/general/ShareDrawer";
import { BottomNavigation } from "@/components/general/BottomNavigation";
import { ValidatorRewardsChart } from "@/components/validator/ValidatorRewardsChart";
import { ValidatorActionButtons } from "@/components/validator/ValidatorActionButtons";
import { ValidatorAboutSection } from "@/components/validator/ValidatorAboutSection";
import { SuccessDrawer } from "@/components/ui/SuccessDrawer";
import { ErrorDrawer } from "@/components/ui/ErrorDrawer";
import { OTPVerificationDrawer } from "@/components/auth/OTPVerificationDrawer";
import { useOrchestrators } from "@/contexts/OrchestratorContext";
import { useDelegation } from "@/contexts/DelegationContext";
import { useTransactions } from "@/contexts/TransactionContext";
import { useAuth } from "@/contexts/AuthContext";
import { delegationService } from "@/services";
import { totpService } from "@/services/totp";

export const ValidatorDetailsPage: React.FC = () => {
  const navigate = useNavigate();
  const { validatorId } = useParams<{ validatorId: string }>();
  const [showHelpDrawer, setShowHelpDrawer] = useState(false);
  const [showShareDrawer, setShowShareDrawer] = useState(false);
  const [showUnstakeRestrictionDrawer, setShowUnstakeRestrictionDrawer] =
    useState(false);
  const [showMoveStakeDrawer, setShowMoveStakeDrawer] = useState(false);
  const [showWithdrawConfirmDrawer, setShowWithdrawConfirmDrawer] =
    useState(false);
  const [showOTPDrawer, setShowOTPDrawer] = useState(false);
  const [pendingAction, setPendingAction] = useState<
    "moveStake" | "rebond" | null
  >(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccessDrawer, setShowSuccessDrawer] = useState(false);
  const [showErrorDrawer, setShowErrorDrawer] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const { orchestrators, orchestratorRewards, isLoading, error } =
    useOrchestrators();
  const { userDelegation, delegatorTransactions, refetch } = useDelegation();
  const { transactions } = useTransactions();
  const { state } = useAuth();

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
      .filter((reward) => reward.delegate === validatorId)
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

  // check if user has just staked
  const justStaked = useMemo(() => {
    if (!hasStakeWithValidator) {
      return false;
    }

    // User can only unstake if currentRound >= startRound
    if (userDelegation && delegatorTransactions) {
      const startRound = parseInt(userDelegation.startRound || "0");
      const currentRound = parseInt(delegatorTransactions.currentRound || "0");

      if (currentRound < startRound) {
        return true;
      }
    }

    return false;
  }, [userDelegation, delegatorTransactions, hasStakeWithValidator]);

  // Check if user has a stake with a different validator
  const hasStakeWithDifferentValidator = useMemo(() => {
    if (!userDelegation || !validatorId) {
      return false;
    }
    const delegateId = userDelegation.delegate.id;
    const bondedAmount = parseFloat(userDelegation.bondedAmount || "0");
    return bondedAmount > 0 && delegateId !== validatorId;
  }, [userDelegation, validatorId]);

  const pendingUnbondingTransactions = validatorTransactions.pending;
  const withdrawableTransactions = validatorTransactions.completed;

  const hasWithdrawableAmount = withdrawableTransactions.length > 0;
  const hasPendingUnbonding = pendingUnbondingTransactions.length > 0;

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

  if (!isLoading && !currentValidator && !error) {
    navigate("/validator");
    return null;
  }

  const handleBackClick = () => {
    navigate(-1);
  };

  const handleStakeClick = () => {
    if (hasStakeWithDifferentValidator) {
      setShowMoveStakeDrawer(true);
    } else {
      navigate(`/stake/${currentValidator?.address}`);
    }
  };

  const handleWithdrawClick = () => {
    setShowWithdrawConfirmDrawer(true);
  };

  const handleUnstakeClick = () => {
    if (justStaked) {
      setShowUnstakeRestrictionDrawer(true);
    } else {
      navigate(`/unstake-amount/${currentValidator?.address}`);
    }
  };

  const handleShareClick = () => {
    setShowShareDrawer(true);
  };

  const handleHelpClick = () => {
    setShowHelpDrawer(true);
  };

  const handleRebond = async () => {
    if (isProcessing) return;
    if (!state.user?.wallet_id || !state.user?.wallet_address || !validatorId) {
      setErrorMessage("Missing wallet information");
      setShowErrorDrawer(true);
      return;
    }

    const withdrawableTransaction = withdrawableTransactions[0];
    if (!withdrawableTransaction || !withdrawableTransaction.unbondingLockId) {
      setErrorMessage("No withdrawable tokens found");
      setShowErrorDrawer(true);
      return;
    }

    setIsProcessing(true);

    try {
      const response = await delegationService.rebond({
        delegatorAddress: state.user.wallet_address,
        unbondingLockId: withdrawableTransaction.unbondingLockId,
        newPosPrev: "0",
        newPosNext: "0",
        walletId: state.user.wallet_id,
      });

      if (response.success) {
        setSuccessMessage(
          "Your tokens have been restaked successfully and will start earning rewards again."
        );
        setShowSuccessDrawer(true);
        setShowWithdrawConfirmDrawer(false);
        setPendingAction(null);
        await refetch();
      } else {
        setErrorMessage(response.message || "Failed to restake tokens");
        setShowErrorDrawer(true);
        setShowWithdrawConfirmDrawer(false);
        setPendingAction(null);
      }
    } catch (error: any) {
      setErrorMessage(error.message || "Failed to restake tokens");
      setShowErrorDrawer(true);
      setShowWithdrawConfirmDrawer(false);
      setPendingAction(null);
    } finally {
      setIsProcessing(false);
      setPendingAction(null);
    }
  };

  const handleOTPVerify = async (code: string) => {
    const response = await totpService.verify({ token: code });

    if (response.success) {
      sessionStorage.setItem("otp_verified", Date.now().toString());
      sessionStorage.setItem("otp_action", pendingAction || "");
    }

    return response;
  };

  const handleOTPSuccess = () => {
    setShowOTPDrawer(false);
    if (!isProcessing) {
      if (pendingAction === "moveStake") {
        handleMoveStake();
      } else if (pendingAction === "rebond") {
        handleRebond();
      }
    }
  };

  const handleMoveStakeWithOTP = () => {
    setPendingAction("moveStake");
    setShowOTPDrawer(true);
  };

  const handleRebondWithOTP = () => {
    setPendingAction("rebond");
    setShowOTPDrawer(true);
  };

  const handleMoveStake = async () => {
    if (isProcessing) return;
    if (
      !state.user?.wallet_id ||
      !state.user?.wallet_address ||
      !validatorId ||
      !userDelegation?.delegate.id
    ) {
      setErrorMessage("Missing required information");
      setShowErrorDrawer(true);
      return;
    }

    const bondedAmount = userDelegation.bondedAmount;
    if (!bondedAmount || parseFloat(bondedAmount) <= 0) {
      setErrorMessage("No stake to move");
      setShowErrorDrawer(true);
      return;
    }

    setIsProcessing(true);

    try {
      const response = await delegationService.moveStake({
        walletId: state.user.wallet_id,
        walletAddress: state.user.wallet_address,
        oldDelegate: userDelegation.delegate.id,
        newDelegate: validatorId,
        amount: bondedAmount,
      });

      if (response.success) {
        setSuccessMessage(
          "Your stake has been successfully moved to the new validator."
        );
        setShowSuccessDrawer(true);
        setShowMoveStakeDrawer(false);
        setPendingAction(null);
        await refetch();
      } else {
        setErrorMessage(response.message || "Failed to move stake");
        setShowErrorDrawer(true);
        setShowMoveStakeDrawer(false);
        setPendingAction(null);
      }
    } catch (error: any) {
      setErrorMessage(error.message || "Failed to move stake");
      setShowErrorDrawer(true);
      setShowMoveStakeDrawer(false);
      setPendingAction(null);
    } finally {
      setIsProcessing(false);
      setPendingAction(null);
    }
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
            ? (currentValidator?.ensIdentity?.name || currentValidator?.ensName)
                .length > 16
              ? (
                  currentValidator?.ensIdentity?.name ||
                  currentValidator?.ensName
                ).slice(0, 16) + ".."
              : currentValidator?.ensIdentity?.name || currentValidator?.ensName
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

      {/* Unstake Restriction Drawer */}
      <HelpDrawer
        isOpen={showUnstakeRestrictionDrawer}
        onClose={() => setShowUnstakeRestrictionDrawer(false)}
        title="Cannot unstake yet"
        content={[
          "You just staked in this round and cannot unstake until the next round begins.",
          "Please wait for the next round before you can unstake your tokens.",
          "You can see the current round (payout time) in the portfolio page.",
        ]}
      />

      {/* Move Stake Drawer */}
      <ActionDrawer
        isOpen={showMoveStakeDrawer}
        onClose={() => !isProcessing && setShowMoveStakeDrawer(false)}
        title="Move your stake?"
        content={[
          "You already have a stake with another validator. You can only stake to one validator at a time.",
          "To stake with this validator, you'll need to move your stake from your current validator.",
        ]}
        actions={[
          {
            label: "Move stake",
            onClick: handleMoveStakeWithOTP,
            confirmation: {
              title: "Are you sure?",
              message:
                "Are you sure you want to move your stake? This will move your tokens to this new validator.",
              confirmLabel: "Yes, move stake",
              cancelLabel: "Go back",
            },
          },
          {
            label: "Got it",
            onClick: () => setShowMoveStakeDrawer(false),
            variant: "secondary",
          },
        ]}
        isProcessing={isProcessing}
      />

      {/* Withdraw Confirm Drawer */}
      <ActionDrawer
        isOpen={showWithdrawConfirmDrawer}
        onClose={() => !isProcessing && setShowWithdrawConfirmDrawer(false)}
        title="Withdraw or restake?"
        content={[
          "You have unstaked tokens ready to withdraw.",
          "You can proceed to withdraw them to your wallet, or restake them with this validator to continue earning rewards.",
        ]}
        actions={[
          {
            label: "Proceed to withdraw",
            onClick: () => {
              setShowWithdrawConfirmDrawer(false);
              navigate(`/withdraw-network/${currentValidator?.address}`);
            },
          },
          {
            label: "Restake",
            onClick: handleRebondWithOTP,
            variant: "secondary",
            confirmation: {
              title: "Are you sure?",
              message:
                "Are you sure you want to restake your tokens with this validator? They will be staked again and start earning rewards.",
              confirmLabel: "Yes, restake",
              cancelLabel: "Go back",
            },
          },
        ]}
        isProcessing={isProcessing}
      />

      {/* Success Drawer */}
      <SuccessDrawer
        isOpen={showSuccessDrawer}
        onClose={() => setShowSuccessDrawer(false)}
        title="Success!"
        message={successMessage}
      />

      {/* Error Drawer */}
      <ErrorDrawer
        isOpen={showErrorDrawer}
        onClose={() => setShowErrorDrawer(false)}
        title="Something went wrong"
        message={errorMessage}
      />

      {/* OTP Verification Drawer */}
      <OTPVerificationDrawer
        isOpen={showOTPDrawer}
        onClose={() => {
          setShowOTPDrawer(false);
          setPendingAction(null);
        }}
        onVerify={handleOTPVerify}
        onSuccess={handleOTPSuccess}
      />

      {/* Bottom Navigation */}
      <BottomNavigation currentPath="/validator" />
    </div>
  );
};
