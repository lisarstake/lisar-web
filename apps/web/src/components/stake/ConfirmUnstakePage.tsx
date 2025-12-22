import React, { useMemo, useState, useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ChevronLeft, CircleQuestionMark, LoaderCircle } from "lucide-react";
import { HelpDrawer } from "@/components/general/HelpDrawer";
import { BottomNavigation } from "@/components/general/BottomNavigation";
import { SuccessDrawer } from "@/components/ui/SuccessDrawer";
import { ErrorDrawer } from "@/components/ui/ErrorDrawer";
import { OTPVerificationDrawer } from "@/components/auth/OTPVerificationDrawer";
import { useOrchestrators } from "@/contexts/OrchestratorContext";
import { useAuth } from "@/contexts/AuthContext";
import { useWallet } from "@/contexts/WalletContext";
import { priceService } from "@/lib/priceService";
import { delegationService } from "@/services";
import { totpService } from "@/services/totp";
import { UnbondRequest } from "@/services/delegation/types";

export const ConfirmUnstakePage: React.FC = () => {
  const navigate = useNavigate();
  const { validatorId } = useParams<{ validatorId: string }>();
  const [searchParams] = useSearchParams();
  const [isProcessing, setIsProcessing] = useState(false);
  const [showHelpDrawer, setShowHelpDrawer] = useState(false);
  const [showSuccessDrawer, setShowSuccessDrawer] = useState(false);
  const [showErrorDrawer, setShowErrorDrawer] = useState(false);
  const [showOTPDrawer, setShowOTPDrawer] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const { orchestrators } = useOrchestrators();
  const { state } = useAuth();
  const { refetch: refetchWallet } = useWallet();

  const currentValidator = orchestrators.find(
    (orch) => orch.address === validatorId
  );

  const unstakeAmount = searchParams.get("amount") || "0";
  const unstakeAmountNum = useMemo(
    () => parseFloat(unstakeAmount.replace(/,/g, "")) || 0,
    [unstakeAmount]
  );
  const fiatCurrency = state.user?.fiat_type || "USD";
  const fiatSymbol = priceService.getCurrencySymbol(fiatCurrency);
  const [fiatAmountNum, setFiatAmountNum] = useState(0);

  useEffect(() => {
    const calculateFiat = async () => {
      const fiatValue = await priceService.convertLptToFiat(
        unstakeAmountNum,
        fiatCurrency
      );
      setFiatAmountNum(fiatValue);
    };
    calculateFiat();
  }, [unstakeAmountNum, fiatCurrency]);

  const fiatAmount = useMemo(
    () => fiatAmountNum.toLocaleString(),
    [fiatAmountNum]
  );

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
      sessionStorage.setItem("otp_action", "unstake");
    }

    return response;
  };

  const handleOTPSuccess = () => {
    setShowOTPDrawer(false);
    if (!isProcessing) {
      handleUnstake();
    }
  };

  const handleUnstake = async () => {
    if (isProcessing) return;
    if (!currentValidator) return;
    const walletId = state.user?.wallet_id;
    const walletAddress = state.user?.wallet_address;
    if (!walletId || !walletAddress) return;

    setIsProcessing(true);
    try {
      const unbondRequest: UnbondRequest = {
        walletId,
        walletAddress,
        amount: unstakeAmount.replace(/,/g, ""),
      };

      const response = await delegationService.unbond(unbondRequest);

      if (response.success) {
        await refetchWallet();
        setShowSuccessDrawer(true);
      } else {
        setErrorMessage("Failed to unstake. Please try again.");
        setShowErrorDrawer(true);
      }
    } catch (error) {
      console.error("Unbonding error:", error);
      setErrorMessage("An unexpected error occurred. Please try again.");
      setShowErrorDrawer(true);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleHelpClick = () => {
    setShowHelpDrawer(true);
  };

  return (
    <div className="h-screen bg-[#181818] text-white flex flex-col">
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
         <CircleQuestionMark color="#9ca3af" size={16} />
        </button>
      </div>

      {/* Unstake Amount */}
      <div className="text-center px-6 py-8">
        <h2 className="text-4xl font-bold text-white">{unstakeAmount} LPT</h2>
        <p className="text-white/70 text-lg mt-2">
          ≈ {fiatSymbol}
          {fiatAmount} {fiatCurrency}
        </p>
      </div>

      {/* Confirmation Details Card */}
      <div className="flex-1 px-6 py-4">
        <div className="bg-[#1a1a1a] rounded-xl p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">From</span>
              <span className="text-white font-medium">
                {currentValidator?.ensName ||
                  (currentValidator?.address
                    ? `${currentValidator.address.substring(0, 6)}...${currentValidator.address.substring(currentValidator.address.length - 4)}`
                    : "-")}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-gray-400">To</span>
              <span className="text-white font-medium">
                {state.user?.wallet_address
                  ? `${state.user.wallet_address.substring(0, 6)}...${state.user.wallet_address.substring(state.user.wallet_address.length - 4)}`
                  : "Your wallet"}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-gray-400">Network fee</span>
              <span className="text-white font-medium">0 LPT</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-gray-400">You will receive</span>
              <span className="text-[#C7EF6B] font-medium">
                {unstakeAmountNum.toLocaleString()} LPT
              </span>
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
          {isProcessing ? (
            <span className="flex items-center justify-center gap-2">
               <LoaderCircle className="animate-spin h-5 w-5 text-white" />
              Processing...
            </span>
          ) : (
            "Unstake"
          )}
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
          "Your funds will be available after the unbonding period ends.",
        ]}
      />

      {/* Success Drawer */}
      <SuccessDrawer
        isOpen={showSuccessDrawer}
        onClose={() => {
          setShowSuccessDrawer(false);
          navigate("/wallet");
        }}
        title="Unstake Successful!"
        message="You've unstaked successfully and your funds will be available after the unbonding period."
      />

      {/* Error Drawer */}
      <ErrorDrawer
        isOpen={showErrorDrawer}
        onClose={() => setShowErrorDrawer(false)}
        title="Something went wrong"
        message={errorMessage}
        onRetry={() => {
          setShowErrorDrawer(false);
          handleProceed();
        }}
        retryText="Try Again"
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
