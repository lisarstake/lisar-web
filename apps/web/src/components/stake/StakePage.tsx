import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ChevronLeft,
  CircleQuestionMark,
  ChevronRight,
  ArrowLeftRight,
  Wallet2,
  CreditCard,
  ScanQrCode,
} from "lucide-react";
import { OnrampWebSDK } from "@onramp.money/onramp-web-sdk";
import { HelpDrawer } from "@/components/general/HelpDrawer";
import { BottomNavigation } from "@/components/general/BottomNavigation";
import { ErrorDrawer } from "@/components/ui/ErrorDrawer";
import { SuccessDrawer } from "@/components/ui/SuccessDrawer";
import { useOrchestrators } from "@/contexts/OrchestratorContext";
import { useAuth } from "@/contexts/AuthContext";
import { delegationService } from "@/services";
import { StakeRequest } from "@/services/delegation/types";
import { usePrices } from "@/hooks/usePrices";
import { priceService } from "@/lib/priceService";
import { useWallet } from "@/contexts/WalletContext";
import { getFiatType } from "@/lib/onramp";

export const StakePage: React.FC = () => {
  const navigate = useNavigate();
  const { validatorId } = useParams<{ validatorId: string }>();
  const [fiatAmount, setFiatAmount] = useState("0");
  const [lptAmount, setLptAmount] = useState("0");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<
    string | null
  >(null);
  const [showHelpDrawer, setShowHelpDrawer] = useState(false);
  const [isStaking, setIsStaking] = useState(false);
  const [showErrorDrawer, setShowErrorDrawer] = useState(false);
  const [showSuccessDrawer, setShowSuccessDrawer] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const onrampInstanceRef = useRef<OnrampWebSDK | null>(null);
  const { orchestrators } = useOrchestrators();
  const { state } = useAuth();
  const { prices } = usePrices();
  const { wallet } = useWallet();

  // Find the orchestrator by address (validatorId is the address)
  const currentValidator = orchestrators.find(
    (orch) => orch.address === validatorId
  );

  // Get user's preferred currency
  const userCurrency = state.user?.fiat_type || "NGN";
  const currencySymbol = priceService.getCurrencySymbol(userCurrency);

  // User's wallet balance
  const walletBalanceLpt = wallet?.balanceLpt || 0;
  const walletCurrency = "LPT";

  // Determine if this is a deposit flow (from wallet) or stake flow (from validator details)
  const urlParams = new URLSearchParams(window.location.search);
  const isDepositFlow = urlParams.get("deposit") === "true";
  const pageTitle = isDepositFlow ? "Deposit" : "Stake";

  // Initialize amounts with real price data
  useEffect(() => {
    const initializeAmounts = async () => {
      if (prices.lpt > 0) {
        const lptAmount = 0;
        const fiatValue = await priceService.convertLptToFiat(
          lptAmount,
          userCurrency
        );
        setFiatAmount(Math.round(fiatValue).toString());
      }
    };
    initializeAmounts();
  }, [prices.lpt, userCurrency]);

  // Clean up onramp instance when component unmounts
  useEffect(() => {
    return () => {
      if (onrampInstanceRef.current) {
        try {
          onrampInstanceRef.current.close();
        } catch (error) {
          console.error("Error closing onramp widget:", error);
        }
      }
    };
  }, []);

  const handleBackClick = () => {
    navigate(-1);
  };

  const handleAmountSelect = async (amount: string) => {
    setLptAmount(amount);
    const numericAmount = parseInt(amount.replace(/,/g, ""));
    const fiatValue = await priceService.convertLptToFiat(
      numericAmount,
      userCurrency
    );
    setFiatAmount(Math.round(fiatValue).toString());
  };

  const handlePaymentMethodSelect = (method: string) => {
    setSelectedPaymentMethod(method);
  };

  const handleProceed = async () => {
    if (selectedPaymentMethod === "onchain") {
      const depositParam = isDepositFlow ? "?deposit=true" : "";
      navigate(`/deposit/${currentValidator?.address}${depositParam}`);
    } else if (selectedPaymentMethod === "fiat") {
      await handleFundWallet();
    } else if (selectedPaymentMethod === "wallet") {
      await handleStake();
    }
  };

  const handleFundWallet = async () => {
    if (!state.user || !fiatAmount || parseFloat(fiatAmount) <= 0) {
      setErrorMessage("Please enter a valid amount to deposit.");
      setShowErrorDrawer(true);
      return;
    }

    if (!state.user.wallet_address) {
      setErrorMessage(
        "No wallet available. Please ensure you have a wallet connected."
      );
      setShowErrorDrawer(true);
      return;
    }

    try {
      const numericAmount = parseFloat(fiatAmount.replace(/,/g, ""));
      const fiatType = getFiatType(userCurrency);

      const onramp = new OnrampWebSDK({
        appId: import.meta.env.VITE_ONRAMP_APP_ID || 1674103,
        walletAddress: state.user.wallet_address,
        flowType: 1,
        fiatType: fiatType,
        paymentMethod: 2, // Instant transfer
        fiatAmount: numericAmount,
        coinCode: "lpt",
        network: "arbitrum",
        theme: {
          lightMode: {
            baseColor: "#C7EF6B",
            inputRadius: "8px",
            buttonRadius: "8px",
          },
          darkMode: {
            baseColor: "#6A8F2A",
            inputRadius: "8px",
            buttonRadius: "8px",
          },
          default: "darkMode",
        },
        isRestricted: true,
      });

      onramp.on("TX_EVENTS", async (e) => {
        switch (e.type) {
          case "ONRAMP_WIDGET_TX_COMPLETED":
            setSuccessMessage(
              "Payment completed successfully! Your LPT tokens will be sent to your wallet shortly."
            );
            setShowSuccessDrawer(true);
            break;

          case "ONRAMP_WIDGET_TX_SENDING_FAILED":
          case "ONRAMP_WIDGET_TX_PURCHASING_FAILED":
          case "ONRAMP_WIDGET_TX_FINDING_FAILED":
            setErrorMessage(
              "Payment failed. Please try again or contact support if the issue persists."
            );
            setShowErrorDrawer(true);
            break;
        }
      });

      onramp.on("WIDGET_EVENTS", async (e) => {
        switch (e.type) {
          case "ONRAMP_WIDGET_CLOSE_REQUEST_CONFIRMED":
            setErrorMessage("Payment cancelled, please try again.");
            setShowErrorDrawer(true);
            break;

          case "ONRAMP_WIDGET_FAILED":
            setErrorMessage("Payment widget failed to load. Please try again.");
            setShowErrorDrawer(true);
            break;
        }
      });

      onrampInstanceRef.current = onramp;

      onramp.show();
    } catch (error) {
      console.error("Failed to initialize onramp widget:", error);
      setErrorMessage("Failed to initialize payment widget. Please try again.");
      setShowErrorDrawer(true);
    }
  };

  const handleStake = async () => {
    if (!currentValidator || !lptAmount || !state.user) return;

    setIsStaking(true);
    try {
      const stakeRequest: StakeRequest = {
        walletId: state.user.wallet_id,
        walletAddress: state.user.wallet_address,
        orchestratorAddress: currentValidator.address,
        amount: lptAmount.replace(/,/g, ""), // Remove commas from amount
      };

      const response = await delegationService.stake(stakeRequest);

      if (response.success) {
        navigate("/wallet");
      } else {
        console.error("Staking failed");
      }
    } catch (error) {
      console.error("Staking error:", error);
    } finally {
      setIsStaking(false);
    }
  };

  const handleHelpClick = () => {
    setShowHelpDrawer(true);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-8">
        <button
          onClick={handleBackClick}
          className="w-8 h-8 flex items-center justify-center"
        >
          <ChevronLeft color="#C7EF6B" />
        </button>

        <h1 className="text-lg font-medium text-white">{pageTitle}</h1>

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
            value={`${currencySymbol} ${fiatAmount}`}
            onChange={async (e) => {
              const value = e.target.value.replace(/[^0-9]/g, "");
              setFiatAmount(value);
              const numericAmount = parseInt(value) || 0;
              const lptValue = await priceService.convertFiatToLpt(
                numericAmount,
                userCurrency
              );
              setLptAmount(Math.round(lptValue).toString());
            }}
            className="w-full bg-transparent text-white text-lg font-medium focus:outline-none"
          />
        </div>

        {/* Conversion Arrow */}
        <div className="flex justify-center">
          <ArrowLeftRight
            size={20}
            color="#C7EF6B"
            className="font-extrabold"
          />
        </div>

        {/* LPT Amount */}
        <div className="bg-[#1a1a1a] rounded-xl p-4">
          <input
            type="text"
            value={`${lptAmount} LPT`}
            className="w-full bg-transparent text-white text-lg font-medium focus:outline-none"
            readOnly
            tabIndex={-1}
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

      {/* Payment Method Selection */}
      <div className="flex-1 px-6 py-4">
        <h3 className="text-lg font-medium text-white mb-4">
          {isDepositFlow ? "Preferred Method" : "Preferred Method"}
        </h3>

        <div className="space-y-3">
          {/* Wallet Balance Option - Only show for stake flow */}
          {!isDepositFlow && (
            <button
              onClick={() => handlePaymentMethodSelect("wallet")}
              disabled={
                parseInt(lptAmount.replace(/,/g, "")) > walletBalanceLpt
              }
              className={`w-full flex items-center justify-between p-4 rounded-xl transition-colors ${
                selectedPaymentMethod === "wallet"
                  ? "bg-[#C7EF6B]/10 border border-[#C7EF6B]"
                  : parseInt(lptAmount.replace(/,/g, "")) > walletBalanceLpt
                    ? "bg-[#1a1a1a] border border-[#2a2a2a] opacity-50 cursor-not-allowed"
                    : "bg-[#1a1a1a] border border-[#2a2a2a] hover:bg-[#2a2a2a]"
              }`}
            >
              <div className="flex items-center space-x-3">
                <Wallet2
                  size={20}
                  color={
                    selectedPaymentMethod === "wallet" ? "#C7EF6B" : "#86B3F7"
                  }
                />
                <div className="flex items-center space-x-2">
                  <span className="text-white font-normal">Wallet balance</span>
                  <span className="text-gray-400 text-xs mt-0.5">
                    ({walletBalanceLpt.toLocaleString()} {walletCurrency})
                  </span>
                </div>
              </div>
              <ChevronRight
                size={20}
                color={
                  selectedPaymentMethod === "wallet" ? "#C7EF6B" : "#636363"
                }
              />
            </button>
          )}

          <button
            onClick={() => handlePaymentMethodSelect("fiat")}
            className={`w-full flex items-center justify-between p-4 rounded-xl transition-colors ${
              selectedPaymentMethod === "fiat"
                ? "bg-[#C7EF6B]/10 border border-[#C7EF6B]"
                : "bg-[#1a1a1a] border border-[#2a2a2a] hover:bg-[#2a2a2a]"
            }`}
          >
            <div className="flex items-center space-x-3">
              <CreditCard
                size={20}
                color={selectedPaymentMethod === "fiat" ? "#C7EF6B" : "#86B3F7"}
              />
              <span className="text-white font-normal">Fiat payment</span>
            </div>
            <ChevronRight
              size={20}
              color={selectedPaymentMethod === "fiat" ? "#C7EF6B" : "#636363"}
            />
          </button>

          <button
            onClick={() => handlePaymentMethodSelect("onchain")}
            className={`w-full flex items-center justify-between p-4 rounded-xl transition-colors ${
              selectedPaymentMethod === "onchain"
                ? "bg-[#C7EF6B]/10 border border-[#C7EF6B]"
                : "bg-[#1a1a1a] border border-[#2a2a2a] hover:bg-[#2a2a2a]"
            }`}
          >
            <div className="flex items-center space-x-3">
              <ScanQrCode
                size={20}
                color={
                  selectedPaymentMethod === "onchain" ? "#C7EF6B" : "#86B3F7"
                }
              />
              <span className="text-white font-normal">On-Chain transfer</span>
            </div>
            <ChevronRight
              size={20}
              color={
                selectedPaymentMethod === "onchain" ? "#C7EF6B" : "#636363"
              }
            />
          </button>
        </div>
      </div>

      {/* Proceed Button */}
      <div className="px-6 pb-24">
        <button
          onClick={handleProceed}
          disabled={!selectedPaymentMethod || isStaking}
          className={`w-full py-4 rounded-xl font-semibold text-lg transition-colors ${
            selectedPaymentMethod && !isStaking
              ? "bg-[#C7EF6B] text-black hover:bg-[#B8E55A]"
              : "bg-[#636363] text-white cursor-not-allowed"
          }`}
        >
          {isStaking
            ? "Processing..."
            : isDepositFlow
              ? "Proceed to Deposit"
              : selectedPaymentMethod === "onchain" ||
                  selectedPaymentMethod === "fiat"
                ? "Proceed to Deposit"
                : "Proceed to Stake"}
        </button>
      </div>

      {/* Help Drawer */}
      <HelpDrawer
        isOpen={showHelpDrawer}
        onClose={() => setShowHelpDrawer(false)}
        title="Staking Guide"
        content={[
          "Stake to a validator to start earning rewards. To get started, choose an amount you want to stake and a payment method.",
          "Use your existing wallet balance, or deposit with fiat money or tokens from another wallet or exchange.",
          "Review all details before confirming your stake to ensure everything is correct.",
        ]}
      />

      {/* Error Drawer */}
      <ErrorDrawer
        isOpen={showErrorDrawer}
        onClose={() => setShowErrorDrawer(false)}
        title="Payment Error"
        message={errorMessage}
      />

      {/* Success Drawer */}
      <SuccessDrawer
        isOpen={showSuccessDrawer}
        onClose={() => setShowSuccessDrawer(false)}
        title="Payment Successful!"
        message={successMessage}
      />

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
};
