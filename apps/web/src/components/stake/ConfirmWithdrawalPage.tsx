import React, { useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ChevronLeft, CircleQuestionMark, LoaderCircle } from "lucide-react";
import { HelpDrawer } from "@/components/general/HelpDrawer";
import { BottomNavigation } from "@/components/general/BottomNavigation";
import { SuccessDrawer } from "@/components/ui/SuccessDrawer";
import { ErrorDrawer } from "@/components/ui/ErrorDrawer";
import { OTPVerificationDrawer } from "@/components/auth/OTPVerificationDrawer";
import { useOrchestrators } from "@/contexts/OrchestratorContext";
import { useAuth } from "@/contexts/AuthContext";
import { delegationService } from "@/services";
import { totpService } from "@/services/totp";
import { usePageTracking } from "@/hooks/usePageTracking";
import { trackStake } from "@/lib/mixpanel";

export const ConfirmWithdrawalPage: React.FC = () => {
  // Track withdrawal page visit
  usePageTracking('Confirm Withdrawal Page', { page_type: 'withdrawal_confirm' });
  
  const navigate = useNavigate();
  const { validatorId } = useParams<{ validatorId: string }>();
  const [searchParams] = useSearchParams();
  const [isProcessing, setIsProcessing] = useState(false);
  const [showHelpDrawer, setShowHelpDrawer] = useState(false);
  const [showSuccessDrawer, setShowSuccessDrawer] = useState(false);
  const [showErrorDrawer, setShowErrorDrawer] = useState(false);
  const [showOTPDrawer, setShowOTPDrawer] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [txHash, setTxHash] = useState<string | undefined>(undefined);
  const { orchestrators } = useOrchestrators();
  const { state } = useAuth();

  const currentValidator = orchestrators.find(
    (orch) => orch.address === validatorId
  );

  const selectedNetwork = searchParams.get("network") || "livepeer";
  const withdrawalAmount = searchParams.get("amount") || "0";
  const validatorDisplayName =
    searchParams.get("validatorName") ||
    currentValidator?.ensName ||
    "Unknown Validator";
  const unbondingLockIdsParam = searchParams.get("unbondingLockIds");

  const unbondingLockIds: number[] = unbondingLockIdsParam
    ? JSON.parse(unbondingLockIdsParam)
    : [];

  const walletId = state.user?.wallet_id || "";
  const walletAddress = state.user?.wallet_address || "";

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
        return { token: "ETH", network: "Ethereum" };
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
    setShowOTPDrawer(true);
  };

  const handleOTPVerify = async (code: string) => {
    const response = await totpService.verify({ token: code });

    if (response.success) {
      sessionStorage.setItem("otp_verified", Date.now().toString());
      sessionStorage.setItem("otp_action", "withdraw");
    }

    return response;
  };

  const handleOTPSuccess = () => {
    setShowOTPDrawer(false);
    if (!isProcessing) {
      handleWithdraw();
    }
  };

  const handleWithdraw = async () => {
    if (isProcessing) return;
    if (!walletId || !walletAddress || unbondingLockIds.length === 0) {
      const errorMsg = "Missing wallet information or unbonding lock ID";
      setError(errorMsg);
      setErrorMessage(errorMsg);
      setShowErrorDrawer(true);
      return;
    }

    const unbondingLockId = unbondingLockIds[0];
    const withdrawalParams = {
      walletId,
      walletAddress,
      unbondingLockId,
    };

    setIsProcessing(true);
    setError(null);
    setShowErrorDrawer(false);
    setShowSuccessDrawer(false);

    try {
      const response = await delegationService.withdrawStake(withdrawalParams);

      if (response.success) {
        // Track successful withdrawal
        const amount = parseFloat(lptAmountParam || '0');
        trackStake('withdraw', amount, 'LPT', validatorId);
        
        const successMsg =
          response.message || "Your withdrawal has been processed successfully";
        setSuccessMessage(successMsg);
        setTxHash(response.txHash);
        setShowSuccessDrawer(true);
        setIsProcessing(false);
      } else {
        const errorMsg =
          response.error || response.message || "Failed to withdraw stake";
        setError(errorMsg);
        setErrorMessage(errorMsg);
        setShowErrorDrawer(true);
        setIsProcessing(false);
      }
    } catch (err: any) {
      const errorMsg = err.message || "An error occurred during withdrawal";
      setError(errorMsg);
      setErrorMessage(errorMsg);
      setShowErrorDrawer(true);
      setIsProcessing(false);
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
              <span className="text-white font-medium">
                {walletAddress
                  ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
                  : "0x6f71...a98o"}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-gray-400">Network</span>
              <span className="text-white font-medium">{networkName}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-gray-400">From Validator</span>
              <span className="text-white font-medium">
                {validatorDisplayName}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-gray-400">Network fee</span>
              <span className="text-white font-medium">{conversionFee}</span>
            </div>

            <div className="border-t border-[#2a2a2a] pt-4">
              <div className="text-gray-400 text-xs">
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
          disabled={
            isProcessing ||
            !walletId ||
            !walletAddress ||
            unbondingLockIds.length === 0
          }
          className={`w-full py-4 rounded-xl font-semibold text-lg transition-colors ${
            isProcessing ||
            !walletId ||
            !walletAddress ||
            unbondingLockIds.length === 0
              ? "bg-[#636363] text-white cursor-not-allowed"
              : "bg-[#C7EF6B] text-black hover:bg-[#B8E55A]"
          }`}
        >
          {isProcessing ? (
            <span className="flex items-center justify-center gap-2">
               <LoaderCircle className="animate-spin h-5 w-5 text-white" />
              Processing...
            </span>
          ) : (
            "Withdraw"
          )}
        </button>
      </div>

      {/* Help Drawer */}
      <HelpDrawer
        isOpen={showHelpDrawer}
        onClose={() => setShowHelpDrawer(false)}
        title="Withdrawal Guide"
        content={[
          "Review your withdrawal details including token, amount, network, and fees before confirming.",
          "Network fees apply when converting between different tokens.",
          "Check the summary to see exactly what you'll receive after all fees.",
        ]}
      />

      {/* Success Drawer */}
      <SuccessDrawer
        isOpen={showSuccessDrawer}
        onClose={() => {
          setShowSuccessDrawer(false);
          navigate("/wallet");
        }}
        title="Withdrawal Successful!"
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
        onClose={() => setShowOTPDrawer(false)}
        onVerify={handleOTPVerify}
        onSuccess={handleOTPSuccess}
      />

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
};
