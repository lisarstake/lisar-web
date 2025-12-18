import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  ChevronLeft,
  CircleQuestionMark,
  LoaderCircle,
  Wallet2,
} from "lucide-react";
import { HelpDrawer } from "@/components/general/HelpDrawer";
import { ActionDrawer } from "@/components/general/ActionDrawer";
import { BottomNavigation } from "@/components/general/BottomNavigation";
import { ErrorDrawer } from "@/components/ui/ErrorDrawer";
import { SuccessDrawer } from "@/components/ui/SuccessDrawer";
import { useAuth } from "@/contexts/AuthContext";
import { useTransactions } from "@/contexts/TransactionContext";
import {
  perenaService,
  walletService,
  mapleService,
} from "@/services";
import { priceService } from "@/lib/priceService";
import { useWallet } from "@/contexts/WalletContext";
import { formatNumber, parseFormattedNumber } from "@/lib/formatters";
import { usePageTracking } from "@/hooks/usePageTracking";

export const SavePage: React.FC = () => {
  // Track save page visit
  usePageTracking("Save Page", { page_type: "save" });
  const navigate = useNavigate();
  const location = useLocation();

  const locationState = location.state as {
    usdcAmount?: string;
    walletType?: string;
    provider?: "maple" | "perena";
    tierNumber?: number;
    tierTitle?: string;
  } | null;

  const [usdcAmount, setUsdcAmount] = useState(() => {
    return locationState?.usdcAmount || "0";
  });

  // Only set amount from state on initial mount, not on every state change
  useEffect(() => {
    if (locationState?.usdcAmount && usdcAmount === "0") {
      setUsdcAmount(locationState.usdcAmount);
    }
  }, []);

  const [showHelpDrawer, setShowHelpDrawer] = useState(false);
  const [showConfirmDrawer, setShowConfirmDrawer] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showErrorDrawer, setShowErrorDrawer] = useState(false);
  const [showSuccessDrawer, setShowSuccessDrawer] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const { state } = useAuth();
  const {
    solanaBalance,
    loadSolanaBalance,
  } = useWallet();
  const { refetch: refetchTransactions } = useTransactions();

  const provider = locationState?.provider;
  const tierTitle = locationState?.tierTitle;
  const walletType = locationState?.walletType;
  const isStables = walletType === "savings" || !!provider;

  useEffect(() => {
    if (isStables && solanaBalance === null) {
      loadSolanaBalance();
    }
  }, [isStables, solanaBalance, loadSolanaBalance]);

  const userCurrency = state.user?.fiat_type || "NGN";
  const currencySymbol = priceService.getCurrencySymbol(userCurrency);

  const walletBalance = solanaBalance ?? 0;

  const [fiatEquivalent, setFiatEquivalent] = useState(0);

  useEffect(() => {
    const calculateFiat = async () => {
      const numericAmount = parseFloat(usdcAmount.replace(/,/g, "")) || 0;
      if (numericAmount > 0) {
        const prices = await priceService.getPrices();
        let convertedValue = numericAmount;
        switch (userCurrency.toUpperCase()) {
          case "NGN":
            convertedValue = numericAmount * prices.ngn;
            break;
          case "EUR":
            convertedValue = numericAmount * prices.eur;
            break;
          case "GBP":
            convertedValue = numericAmount * prices.gbp;
            break;
          case "USD":
          default:
            convertedValue = numericAmount;
        }
        setFiatEquivalent(convertedValue);
      } else {
        setFiatEquivalent(0);
      }
    };
    calculateFiat();
  }, [usdcAmount, userCurrency]);

  const handleBackClick = () => {
    navigate(-1);
  };

  const handleAmountSelect = (amount: string) => {
    const numericAmount = parseFormattedNumber(amount);
    setUsdcAmount(numericAmount);
  };

  const handleMaxClick = () => {
    const buffer = Math.max(0.001, walletBalance * 0.0001);
    const maxAmount = Math.max(0, walletBalance - buffer);
    setUsdcAmount(maxAmount.toString());
  };

  const handleProceed = async () => {
    const numericAmount = parseFloat(usdcAmount.replace(/,/g, "")) || 0;

    if (numericAmount > walletBalance) {
      navigate("/deposit", {
        state: {
          usdcAmount: usdcAmount,
          returnTo: "/save",
          walletType: isStables ? "savings" : "staking",
        },
      });
      return;
    }

    setShowConfirmDrawer(true);
  };

  const handleSave = async () => {
    setIsSaving(true);

    if (!usdcAmount || parseFloat(usdcAmount.replace(/,/g, "")) <= 0) {
      setErrorMessage("Please enter a valid amount to vest.");
      setShowErrorDrawer(true);
      setIsSaving(false);
      return;
    }

    if (!state.user) {
      setErrorMessage("User not authenticated. Please log in and try again.");
      setShowErrorDrawer(true);
      setIsSaving(false);
      return;
    }

    const numericAmount = parseFloat(usdcAmount.replace(/,/g, ""));

    if (provider === "maple") {
      try {
        const ethWalletResp = await walletService.getPrimaryWallet("ethereum");

        if (!ethWalletResp.success || !ethWalletResp.wallet) {
          setErrorMessage("Wallet not found. Please create a wallet first.");
          setShowErrorDrawer(true);
          setIsSaving(false);
          return;
        }

        const ethAddress = ethWalletResp.wallet.wallet_address;
        const ethWalletId = ethWalletResp.wallet.wallet_id;

        const authorizationResp =
          await mapleService.getAuthorization(ethAddress);

        if (!authorizationResp.success) {
          setErrorMessage(
            authorizationResp.error ||
              "Failed to check authorization status. Please try again."
          );
          setShowErrorDrawer(true);
          setIsSaving(false);
          return;
        }

        const maplePoolId = import.meta.env.VITE_MAPLE_POOL_ID; 
        const syrupRouterAddress = import.meta.env.VITE_MAPLE_SYRUP_ROUTER_ADDRESS;
        const amountString = numericAmount.toString();
        const depositData = import.meta.env.VITE_MAPLE_DEPOSIT_DATA;

        const approveResponse = await walletService.approveToken(
          1,
          "USDC",
          {
            walletId: ethWalletId,
            walletAddress: ethAddress,
            amount: amountString,
          },
          maplePoolId
        );

        if (!approveResponse.success) {
          setErrorMessage(
            approveResponse.error || "Failed to approve token spending. Please try again."
          );
          setShowErrorDrawer(true);
          setIsSaving(false);
          return;
        }

        let depositResponse;

        if (authorizationResp.data.isAuthorized) {
          depositResponse = await mapleService.executeDeposit({
            walletId: ethWalletId,
            walletAddress: ethAddress,
            syrupRouterAddress,
            amount: amountString,
            depositData,
          });
        } else {
          depositResponse = await mapleService.executeAuthorizedDeposit({
            walletId: ethWalletId,
            walletAddress: ethAddress,
            poolId: maplePoolId,
            syrupRouterAddress,
            amount: amountString,
            depositData,
          });
        }

        if (depositResponse.success) {
          setSuccessMessage(
            "Vesting successful! Rewards will begin accruing daily at the current APY."
          );
          setShowSuccessDrawer(true);
          setShowConfirmDrawer(false);

          await loadSolanaBalance();
          refetchTransactions();
          setIsSaving(false);
          return;
        } else {
          setErrorMessage(
            depositResponse.error || "Failed to vest. Please try again."
          );
          setShowErrorDrawer(true);
          setIsSaving(false);
          return;
        }
      } catch (error) {
        const errorMsg =
          error instanceof Error
            ? error.message
            : "An error occurred while vesting. Please try again.";
        setErrorMessage(errorMsg);
        setShowErrorDrawer(true);
        setIsSaving(false);
        return;
      }
    }

    if (provider === "perena") {
      try {
        const solWalletResp = await walletService.getPrimaryWallet("solana");

        if (!solWalletResp.success || !solWalletResp.wallet) {
          setErrorMessage("Wallet not found. Please create a wallet first.");
          setShowErrorDrawer(true);
          setIsSaving(false);
          return;
        }

        const mintResponse = await perenaService.mint({
          walletId: solWalletResp.wallet.wallet_id,
          walletAddress: solWalletResp.wallet.wallet_address,
          usdcAmount: numericAmount,
        });

        if (mintResponse.success) {
          setSuccessMessage(
            `Vesting successful! Rewards will begin accruing daily at the current APY.`
          );
          setShowSuccessDrawer(true);
          setShowConfirmDrawer(false);

          await loadSolanaBalance();
          refetchTransactions();
          setIsSaving(false);
          return;
        } else {
          setErrorMessage(
            mintResponse.error || "Failed to vest. Please try again."
          );
          setShowErrorDrawer(true);
          setIsSaving(false);
          return;
        }
      } catch (error) {
        const errorMsg =
          error instanceof Error
            ? error.message
            : "An error occurred while vesting. Please try again.";
        setErrorMessage(errorMsg);
        setShowErrorDrawer(true);
        setIsSaving(false);
        return;
      }
    }

    if (!provider || (provider !== "maple" && provider !== "perena")) {
      setErrorMessage("Invalid provider. Please select a valid tier.");
      setShowErrorDrawer(true);
      setIsSaving(false);
      return;
    }
  };

  const handleHelpClick = () => {
    setShowHelpDrawer(true);
  };

  const numericAmount = parseFloat(usdcAmount.replace(/,/g, "")) || 0;
  const hasInsufficientFunds =
    numericAmount > 0 && numericAmount > walletBalance;

  return (
    <div className="h-screen bg-[#050505] text-white flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-8">
        <button
          onClick={handleBackClick}
          className="w-8 h-8 flex items-center justify-center"
        >
          <ChevronLeft color="#86B3F7" />
        </button>

        <h1 className="text-lg font-medium text-white">Vest</h1>

        <button
          onClick={handleHelpClick}
          className="w-8 h-8 bg-[#2a2a2a] rounded-full flex items-center justify-center"
        >
          <CircleQuestionMark color="#86B3F7" size={16} />
        </button>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-6 pb-28 scrollbar-hide">
        {/* Provider Indicator */}
        {provider && tierTitle && (
          <div className="">
            <div className="bg-[#1a1a1a] rounded-lg p-4 border border-[#2a2a2a]">
              <div className="flex items-center gap-3">
                <img
                  src={provider === "maple" ? "/maple.svg" : "/perena2.png"}
                  alt={provider}
                  className="w-8 h-8 object-contain"
                />
                <div>
                  <p className="text-white/90 text-sm font-medium">
                    {tierTitle}
                  </p>
                  <p className="text-gray-400 text-xs">
                    {provider === "maple"
                      ? "USD Base - Up to 6.5% APY"
                      : "USD Plus - Up to 14% APY"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Amount Input Field */}
        <div className="py-6">
          <div className="bg-[#1a1a1a] rounded-lg p-3 flex items-center gap-3">
            <input
              type="text"
              value={usdcAmount ? formatNumber(usdcAmount) : ""}
              onChange={(e) => {
                const rawValue = parseFormattedNumber(e.target.value);
                let numericValue = rawValue.replace(/[^0-9.]/g, "");
                const parts = numericValue.split(".");
                if (parts.length > 2) {
                  numericValue = parts[0] + "." + parts.slice(1).join("");
                }
                setUsdcAmount(numericValue);
              }}
              placeholder="USDC"
              className="flex-1 bg-transparent text-white text-lg font-medium focus:outline-none"
            />
            <button
              onClick={handleMaxClick}
              className="text-[#86B3F7] text-sm font-medium transition-colors"
            >
              Max
            </button>
          </div>
          <p className="text-gray-400 text-xs mt-2 pl-2">
            ≈ {currencySymbol}
            {fiatEquivalent.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>
        </div>

        {/* Predefined USDC Amounts */}
        <div className="pb-4">
          <div className="flex space-x-3">
            {["10", "50", "100"].map((amount) => {
              const isActive =
                usdcAmount === amount ||
                parseFloat(usdcAmount || "0") === parseFloat(amount);
              return (
                <button
                  key={amount}
                  onClick={() => handleAmountSelect(amount)}
                  className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-[#86B3F7] text-black"
                      : "bg-[#1a1a1a] text-white/80 hover:bg-[#2a2a2a]"
                  }`}
                >
                  {formatNumber(amount)} USDC
                </button>
              );
            })}
          </div>
        </div>

        {/* Wallet Balance Info */}
        <div className="py-4">
          <h3 className="text-base font-medium text-white/90 mb-2">
            Wallet balance
          </h3>
          <div className="bg-[#1a1a1a] rounded-lg p-4 border border-[#2a2a2a]">
            <div className="flex items-center space-x-3">
              <Wallet2 size={20} color="#86B3F7" />
              <div className="flex-1">
                <span className="text-gray-400 text-sm">
                  {walletBalance.toLocaleString()} USDC
                </span>
              </div>
            </div>
          </div>
          {hasInsufficientFunds && (
            <p className="text-gray-400 text-xs mt-2 pl-2">
              Insufficient funds, please top up your balance to continue
            </p>
          )}
        </div>
      </div>

      {/* Proceed Button - Fixed at bottom */}
      <div className="px-6 py-4 bg-[#050505] pb-24">
        <button
          onClick={handleProceed}
          disabled={!usdcAmount || parseFloat(usdcAmount) <= 0 || isSaving}
          className={`w-full py-4 rounded-lg font-semibold text-lg transition-colors ${
            usdcAmount && parseFloat(usdcAmount) > 0 && !isSaving
              ? "bg-[#86B3F7] text-black hover:bg-[#6da7fd]"
              : "bg-[#636363] text-white cursor-not-allowed"
          }`}
        >
          {isSaving ? (
            <span className="flex items-center justify-center gap-2">
              <LoaderCircle className="animate-spin h-5 w-5 text-white" />
              Processing..
            </span>
          ) : hasInsufficientFunds ? (
            "Top up balance"
          ) : (
            "Vest"
          )}
        </button>
      </div>

      {/* Help Drawer */}
      <HelpDrawer
        isOpen={showHelpDrawer}
        onClose={() => setShowHelpDrawer(false)}
        title="Saving Guide"
        content={[
          "Save your funds to start earning stable returns. To get started, choose an amount you want to save and a payment method.",
          "Use your existing wallet balance, or deposit with fiat money or tokens from another wallet or exchange.",
          "Review all details before confirming your save to ensure everything is correct.",
        ]}
      />

      {/* Error Drawer */}
      <ErrorDrawer
        isOpen={showErrorDrawer}
        onClose={() => setShowErrorDrawer(false)}
        title="Something went wrong"
        message={errorMessage}
      />

      {/* Success Drawer */}
      <SuccessDrawer
        isOpen={showSuccessDrawer}
        onClose={() => {
          setShowSuccessDrawer(false);
          navigate("/portfolio", { state: { walletType: "savings" } });
        }}
        title="Saving Successful!"
        message={successMessage}
      />

      {/* Confirm Save Drawer */}
      <ActionDrawer
        isOpen={showConfirmDrawer}
        onClose={() => !isSaving && setShowConfirmDrawer(false)}
        title="Proceed to Vest"
        content={[
          `You are about to vest ${formatNumber(usdcAmount.replace(/,/g, ""))} USDC${provider ? ` on ${provider === "maple" ? "USD Base" : "USD Plus"}` : ""}.`,
          "Once confirmed you will begin earning rewards daily at the current APY.",
        ]}
        actions={[
          {
            label: "Vest",
            onClick: handleSave,
          },
          {
            label: "Cancel",
            onClick: () => setShowConfirmDrawer(false),
            variant: "secondary",
          },
        ]}
        isProcessing={isSaving}
      />

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
};
