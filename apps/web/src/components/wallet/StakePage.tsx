import React, { useState, useEffect } from "react";
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
import { HelpDrawer } from "@/components/general/HelpDrawer";
import { BottomNavigation } from "@/components/general/BottomNavigation";
import { useOrchestrators } from "@/contexts/OrchestratorContext";
import { useAuth } from "@/contexts/AuthContext";
import { delegationService } from "@/services";
import { StakeRequest } from "@/services/delegation/types";
import { usePrices } from "@/hooks/usePrices";
import { priceService } from "@/lib/priceService";

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
  const { orchestrators } = useOrchestrators();
  const { state } = useAuth();
  const { prices } = usePrices();

  // Find the orchestrator by address (validatorId is the address)
  const currentValidator = orchestrators.find(orch => orch.address === validatorId);

  // Get user's preferred currency
  const userCurrency = state.user?.fiat_type || 'NGN';
  const currencySymbol = priceService.getCurrencySymbol(userCurrency);

  // Mock wallet balance (keeping as requested)
  const walletData = {
    balance: 5000, // Mock balance
    currency: 'LPT',
    fiatValue: '$100,000',
    fiatCurrency: 'USD'
  };

  // Determine if this is a deposit flow (from wallet) or stake flow (from validator details)
  const urlParams = new URLSearchParams(window.location.search);
  const isDepositFlow = urlParams.get("deposit") === "true";
  const pageTitle = isDepositFlow ? "Deposit" : "Stake";

  // Initialize amounts with real price data
  useEffect(() => {
    const initializeAmounts = async () => {
      if (prices.lpt > 0) {
        const lptAmount = 0;
        const fiatValue = await priceService.convertLptToFiat(lptAmount, userCurrency);
        setFiatAmount(Math.round(fiatValue).toString());
      }
    };
    initializeAmounts();
  }, [prices.lpt, userCurrency]);

  const handleBackClick = () => {
    navigate(-1);
  };

  const handleAmountSelect = async (amount: string) => {
    setLptAmount(amount);
    const numericAmount = parseInt(amount.replace(/,/g, ""));
    const fiatValue = await priceService.convertLptToFiat(numericAmount, userCurrency);
    setFiatAmount(Math.round(fiatValue).toString());
  };

  const handlePaymentMethodSelect = (method: string) => {
    setSelectedPaymentMethod(method);
  };

  const handleProceed = async () => {
    if (selectedPaymentMethod === "onchain") {
      const depositParam = isDepositFlow ? "?deposit=true" : "";
      navigate(`/deposit/${currentValidator?.address}${depositParam}`);
    } else if (selectedPaymentMethod === "wallet") {
      await handleStake();
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
              const value = e.target.value.replace(/[^0-9]/g, '');
              setFiatAmount(value);
              const numericAmount = parseInt(value) || 0;
              const lptValue = await priceService.convertFiatToLpt(numericAmount, userCurrency);
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
                parseInt(lptAmount.replace(/,/g, "")) > walletData.balance
              }
              className={`w-full flex items-center justify-between p-4 rounded-xl transition-colors ${
                selectedPaymentMethod === "wallet"
                  ? "bg-[#C7EF6B]/10 border border-[#C7EF6B]"
                  : parseInt(lptAmount.replace(/,/g, "")) > walletData.balance
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
                    ({walletData.balance.toLocaleString()} {walletData.currency}
                    )
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
          "Review all details before confirming your stake to ensure everything is correct."
        ]}
      />

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
};
