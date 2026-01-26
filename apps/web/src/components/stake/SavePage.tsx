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
import { usePortfolio } from "@/contexts/PortfolioContext";
import { perenaService, walletService, mapleService } from "@/services";
import { priceService } from "@/lib/priceService";
import { useWallet } from "@/contexts/WalletContext";
import { formatNumber, parseFormattedNumber } from "@/lib/formatters";
import { usePageTracking } from "@/hooks/usePageTracking";
import { useStablesApy } from "@/hooks/useStablesApy";

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
  const { stablesBalance, loadStablesBalance, ethereumWalletAddress, solanaWalletAddress, ethereumWalletId, solanaWalletId } = useWallet();
  const { refetch: refetchTransactions } = useTransactions();
  const { refetch: refetchPortfolio } = usePortfolio();
  const {
    maple: mapleApy,
    perena: perenaApy,
    isLoading: apyLoading,
  } = useStablesApy();

  const provider = locationState?.provider;
  const tierTitle = locationState?.tierTitle;
  const walletType = locationState?.walletType;
  const isStables = walletType === "savings" || !!provider;

  useEffect(() => {
    if (isStables && stablesBalance === null) {
      loadStablesBalance();
    }
  }, [isStables, stablesBalance, loadStablesBalance]);

  const userCurrency = state.user?.fiat_type || "NGN";
  const currencySymbol = priceService.getCurrencySymbol(userCurrency);

  const walletBalance = stablesBalance ?? 0;

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
        if (!ethereumWalletAddress) {
          setErrorMessage("Wallet not found. Please create a wallet first.");
          setShowErrorDrawer(true);
          setIsSaving(false);
          return;
        }

        const authorizationResp =
          await mapleService.getAuthorization(ethereumWalletAddress);

        if (!authorizationResp.success) {
          setErrorMessage("Sorry, something went wrong. Please try again.");
          setShowErrorDrawer(true);
          setIsSaving(false);
          return;
        }

        // Determine token type - default to USDC
        const tokenType = "USDC";
        const isUSDC = tokenType === "USDC";

        const maplePoolId = isUSDC
          ? import.meta.env.VITE_MAPLE_USDC_POOL_ID
          : import.meta.env.VITE_MAPLE_USDT_POOL_ID;
        const syrupRouterAddress = isUSDC
          ? import.meta.env.VITE_MAPLE_USDC_SYRUP_ROUTER_ADDRESS
          : import.meta.env.VITE_MAPLE_USDT_SYRUP_ROUTER_ADDRESS;
        const amountString = numericAmount.toString();
        const depositData = import.meta.env.VITE_MAPLE_DEPOSIT_DATA;

        if (!ethereumWalletId) {
          setErrorMessage("Ethereum wallet ID not found. Please try again.");
          setShowErrorDrawer(true);
          setIsSaving(false);
          return;
        }

        const approveResponse = await walletService.approveToken(
          1,
          tokenType,
          {
            walletId: ethereumWalletId,
            walletAddress: ethereumWalletAddress,
            amount: amountString,
          },
          maplePoolId
        );

        if (!approveResponse.success) {
          setErrorMessage("Sorry, something went wrong. Please try again.");
          setShowErrorDrawer(true);
          setIsSaving(false);
          return;
        }

        let depositResponse;
        const isAuthorized = authorizationResp.data.isAuthorized;

        if (isAuthorized) {
          depositResponse = await mapleService.executeDeposit({
            walletId: ethereumWalletId,
            walletAddress: ethereumWalletAddress,
            syrupRouterAddress,
            amount: amountString,
            depositData,
          });
        } else {
          depositResponse = await mapleService.executeAuthorizedDeposit({
            walletId: ethereumWalletId,
            walletAddress: ethereumWalletAddress,
            poolId: maplePoolId,
            syrupRouterAddress,
            amount: amountString,
            depositData,
          });
        }

        if (depositResponse.success) {
          setSuccessMessage(
            "Rewards will begin accruing daily at the current APY."
          );
          setShowSuccessDrawer(true);
          setShowConfirmDrawer(false);

          await loadStablesBalance();
          await refetchPortfolio();
          refetchTransactions();
          setIsSaving(false);
          return;
        } else {
          setErrorMessage("Sorry, something went wrong. Please try again.");
          setShowErrorDrawer(true);
          setIsSaving(false);
          return;
        }
      } catch (error) {
        setErrorMessage("Sorry, something went wrong. Please try again.");
        setShowErrorDrawer(true);
        setIsSaving(false);
        return;
      }
    }

    if (provider === "perena") {
      try {
        if (!solanaWalletAddress || !solanaWalletId) {
          setErrorMessage("Solana wallet not found. Please create a wallet first.");
          setShowErrorDrawer(true);
          setIsSaving(false);
          return;
        }

        const mintResponse = await perenaService.mint({
          walletId: solanaWalletId,
          walletAddress: solanaWalletAddress,
          usdcAmount: numericAmount,
        });

        if (mintResponse.success) {
          setSuccessMessage(
            `Rewards will begin accruing daily at the current APY.`
          );
          setShowSuccessDrawer(true);
          setShowConfirmDrawer(false);

          await loadStablesBalance();
          await refetchPortfolio();
          refetchTransactions();
          setIsSaving(false);
          return;
        } else {
          setErrorMessage("Sorry, something went wrong. Please try again.");
          setShowErrorDrawer(true);
          setIsSaving(false);
          return;
        }
      } catch (error) {
        setErrorMessage("Sorry, something went wrong. Please try again.");
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
                      ? `USD Base - Up to ${apyLoading && mapleApy === null ? "..." : mapleApy ? (mapleApy * 100).toFixed(1) : "6.5"}% APY`
                      : `USD Plus - Up to ${apyLoading && perenaApy === null ? "..." : perenaApy ? (perenaApy * 100).toFixed(1) : "14"}% APY`}
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
          className={`w-full py-3 rounded-lg font-semibold text-lg transition-colors ${
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
        title="Vesting Guide"
        content={[
          "Vest your funds to start earning rewards.",
          "Use your existing wallet balance, or top up your balance",
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
        title="Vesting Successful!"
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
