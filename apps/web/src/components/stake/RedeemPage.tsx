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
import { OTPVerificationDrawer } from "@/components/auth/OTPVerificationDrawer";
import { useAuth } from "@/contexts/AuthContext";
import { useTransactions } from "@/contexts/TransactionContext";
import { usePortfolio, type StakeEntry } from "@/contexts/PortfolioContext";
import { perenaService, walletService, mapleService } from "@/services";
import { totpService } from "@/services/totp";
import { priceService } from "@/lib/priceService";
import { useWallet } from "@/contexts/WalletContext";
import {
  formatNumber,
  formatStables,
  parseFormattedNumber,
} from "@/lib/formatters";
import { usePageTracking } from "@/hooks/usePageTracking";
import { useStablesApy } from "@/hooks/useStablesApy";

export const RedeemPage: React.FC = () => {
  // Track redeem page visit
  usePageTracking("Redeem Page", { page_type: "redeem" });
  const navigate = useNavigate();
  const location = useLocation();

  const locationState = location.state as {
    entry?: StakeEntry;
    walletType?: string;
  } | null;

  const selectedEntry = locationState?.entry;
  const isMaple = selectedEntry?.name.toLowerCase().includes("maple");
  const isPerena = selectedEntry?.name.toLowerCase().includes("perena");

  const [usdcAmount, setUsdcAmount] = useState("0");
  const [showHelpDrawer, setShowHelpDrawer] = useState(false);
  const [showConfirmDrawer, setShowConfirmDrawer] = useState(false);
  const [showOTPDrawer, setShowOTPDrawer] = useState(false);
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [showErrorDrawer, setShowErrorDrawer] = useState(false);
  const [showSuccessDrawer, setShowSuccessDrawer] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const { state } = useAuth();
  const {
    loadStablesBalance,
    ethereumWalletAddress,
    solanaWalletAddress,
    ethereumWalletId,
    solanaWalletId,
  } = useWallet();
  const { refetch: refetchTransactions } = useTransactions();
  const { refetch: refetchPortfolio } = usePortfolio();
  const {
    maple: mapleApy,
    perena: perenaApy,
    isLoading: apyLoading,
  } = useStablesApy();

  const maxRedeemable = selectedEntry?.yourStake || 0;

  const userCurrency = state.user?.fiat_type || "NGN";
  const currencySymbol = priceService.getCurrencySymbol(userCurrency);

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
    setUsdcAmount(maxRedeemable.toString());
  };

  const handleProceed = async () => {
    const numericAmount = parseFloat(usdcAmount.replace(/,/g, "")) || 0;

    if (numericAmount <= 0) {
      setErrorMessage("Please enter a valid amount to redeem.");
      setShowErrorDrawer(true);
      return;
    }

    if (numericAmount > maxRedeemable) {
      setErrorMessage(
        `Maximum redeemable amount is ${formatNumber(
          maxRedeemable.toString()
        )} USDC.`
      );
      setShowErrorDrawer(true);
      return;
    }

    setShowConfirmDrawer(true);
  };

  const handleRedeem = async () => {
    setIsRedeeming(true);
    setShowConfirmDrawer(false);
    setShowOTPDrawer(true);
  };

  const handleOTPVerify = async (code: string) => {
    const response = await totpService.verify({ token: code });
    if (response.success) {
      setShowOTPDrawer(false);
      setIsRedeeming(true);

      if (!selectedEntry) {
        setErrorMessage("No position selected. Please try again.");
        setShowErrorDrawer(true);
        setIsRedeeming(false);
        return response;
      }

      const numericAmount = parseFloat(usdcAmount.replace(/,/g, "")) || 0;

      if (numericAmount <= 0) {
        setErrorMessage("Please enter a valid amount to redeem.");
        setShowErrorDrawer(true);
        setIsRedeeming(false);
        return response;
      }

      if (numericAmount > maxRedeemable) {
        setErrorMessage(
          `Maximum redeemable amount is ${formatNumber(
            maxRedeemable.toString()
          )} USDC.`
        );
        setShowErrorDrawer(true);
        setIsRedeeming(false);
        return response;
      }

      try {
        if (isMaple) {
          if (!ethereumWalletAddress || !ethereumWalletId) {
            setErrorMessage(
              "Ethereum wallet not found. Please create a wallet first."
            );
            setShowErrorDrawer(true);
            setIsRedeeming(false);
            return response;
          }

          const maplePoolId = import.meta.env.VITE_MAPLE_USDC_POOL_ID;
          const positionsResp = await mapleService.getPositions(
            ethereumWalletAddress,
            maplePoolId
          );

          if (
            !positionsResp.success ||
            !positionsResp.data?.hasPositions ||
            !positionsResp.data.positions ||
            positionsResp.data.positions.length === 0
          ) {
            setErrorMessage("No positions found. Please try again.");
            setShowErrorDrawer(true);
            setIsRedeeming(false);
            return response;
          }

          const totalShares = positionsResp.data.positions.reduce(
            (sum, position) => {
              const shares = parseFloat(position.redeemableSharesRaw || "0");
              return sum + (isNaN(shares) ? 0 : shares);
            },
            0
          );

          if (totalShares <= 0) {
            setErrorMessage("No shares available for withdrawal.");
            setShowErrorDrawer(true);
            setIsRedeeming(false);
            return response;
          }

          // Shares are 1:1 with USDC, so use the amount directly
          const sharesToRedeem = numericAmount.toString();

          const redeemResp = await mapleService.requestRedeem({
            walletId: ethereumWalletId,
            walletAddress: ethereumWalletAddress,
            poolAddress: maplePoolId,
            shares: sharesToRedeem,
          });

          if (redeemResp.success) {
            setSuccessMessage(
              "Your funds will be available in your wallet shortly."
            );
            setShowSuccessDrawer(true);

            await loadStablesBalance();
            await refetchPortfolio();
            refetchTransactions();
            setIsRedeeming(false);
            return response;
          } else {
            setErrorMessage(
              redeemResp.error ||
                "Failed to request withdrawal. Please try again."
            );
            setShowErrorDrawer(true);
            setIsRedeeming(false);
            return response;
          }
        } else if (isPerena) {
          if (!solanaWalletAddress || !solanaWalletId) {
            setErrorMessage(
              "Solana wallet not found. Please create a wallet first."
            );
            setShowErrorDrawer(true);
            setIsRedeeming(false);
            return response;
          }

          const burnResp = await perenaService.burn({
            walletId: solanaWalletId,
            walletAddress: solanaWalletAddress,
            usdStarAmount: numericAmount,
          });

          if (burnResp.success) {
            setSuccessMessage(
              "Your funds will be available in your wallet shortly."
            );
            setShowSuccessDrawer(true);

            await loadStablesBalance();
            await refetchPortfolio();
            refetchTransactions();
            setIsRedeeming(false);
            return response;
          } else {
            setErrorMessage(
              burnResp.error || "Failed to withdraw. Please try again."
            );
            setShowErrorDrawer(true);
            setIsRedeeming(false);
            return response;
          }
        } else {
          setErrorMessage("Invalid position type. Please try again.");
          setShowErrorDrawer(true);
          setIsRedeeming(false);
          return response;
        }
      } catch (error) {
        const errorMsg =
          error instanceof Error
            ? error.message
            : "An error occurred while processing withdrawal. Please try again.";
        setErrorMessage(errorMsg);
        setShowErrorDrawer(true);
        setIsRedeeming(false);
        return response;
      }
    }
    return response;
  };

  const handleOTPSuccess = () => {
    setShowOTPDrawer(false);
  };

  const handleHelpClick = () => {
    setShowHelpDrawer(true);
  };

  const numericAmount = parseFloat(usdcAmount.replace(/,/g, "")) || 0;
  const hasExceededMax = numericAmount > maxRedeemable;

  if (!selectedEntry) {
    return (
      <div className="h-screen bg-[#050505] text-white flex flex-col items-center justify-center">
        <p className="text-white/70">No position selected</p>
        <button
          onClick={handleBackClick}
          className="mt-4 text-[#86B3F7] hover:underline"
        >
          Go back
        </button>
      </div>
    );
  }

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

        <h1 className="text-lg font-medium text-white">Redeem</h1>

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
        <div className="">
          <div className="bg-[#1a1a1a] rounded-lg p-3 border border-[#2a2a2a]">
            <div className="flex items-center gap-3">
              <img
                src={
                  isMaple
                    ? "/maple.svg"
                    : isPerena
                      ? "/perena2.png"
                      : "/highyield-1.svg"
                }
                alt={selectedEntry.name}
                className="w-8 h-8 object-contain"
              />
              <div>
                <p className="text-white/90 text-sm font-medium">
                  {isMaple
                    ? "USD Base"
                    : isPerena
                      ? "USD Plus"
                      : selectedEntry.name}
                </p>
                <p className="text-gray-400 text-xs">
                  {isMaple
                    ? `Up to ${apyLoading && mapleApy === null ? "..." : mapleApy ? (mapleApy * 100).toFixed(1) : "6.5"}% APY`
                    : isPerena
                      ? `Up to ${apyLoading && perenaApy === null ? "..." : perenaApy ? (perenaApy * 100).toFixed(1) : "14"}% APY`
                      : `${(selectedEntry.apy * 100).toFixed(1)}% APY`}
                </p>
              </div>
            </div>
          </div>
        </div>

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
          {hasExceededMax && (
            <p className="text-[#FF6B6B] text-xs mt-1 pl-2">
              Maximum redeemable: {formatNumber(maxRedeemable.toString())} USDC
            </p>
          )}
        </div>

        {/* Predefined USDC Amounts */}
        <div className="pb-4">
          <div className="flex space-x-3">
            {[maxRedeemable * 0.25, maxRedeemable * 0.5, maxRedeemable * 0.75]
              .filter((amount) => amount > 0)
              .map((amount, index) => {
                const amountStr = amount.toFixed(2);
                const isActive =
                  usdcAmount === amountStr ||
                  Math.abs(parseFloat(usdcAmount || "0") - amount) < 0.01;
                return (
                  <button
                    key={index}
                    onClick={() => handleAmountSelect(amountStr)}
                    className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-[#86B3F7] text-black"
                        : "bg-[#1a1a1a] text-white/80 hover:bg-[#2a2a2a]"
                    }`}
                  >
                    {formatNumber(amountStr)} USDC
                  </button>
                );
              })}
          </div>
        </div>

        {/* Vested Amount Info */}
        <div className="py-4">
          <h3 className="text-base font-medium text-white/90 mb-2">
            Vested amount
          </h3>
          <div className="bg-[#1a1a1a] rounded-lg p-4 border border-[#2a2a2a]">
            <div className="flex items-center space-x-3">
              <Wallet2 size={20} color="#86B3F7" />
              <div className="flex-1">
                <span className="text-gray-400 text-sm">
                  {formatStables(maxRedeemable)} USDC
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Proceed Button - Fixed at bottom */}
      <div className="px-6 py-4 bg-[#050505] pb-24">
        <button
          onClick={handleProceed}
          disabled={
            !usdcAmount ||
            parseFloat(usdcAmount) <= 0 ||
            isRedeeming ||
            hasExceededMax
          }
          className={`w-full py-3 rounded-lg font-semibold text-lg transition-colors ${
            usdcAmount &&
            parseFloat(usdcAmount) > 0 &&
            !isRedeeming &&
            !hasExceededMax
              ? "bg-[#86B3F7] text-black hover:bg-[#6da7fd]"
              : "bg-[#636363] text-white cursor-not-allowed"
          }`}
        >
          {isRedeeming ? (
            <span className="flex items-center justify-center gap-2">
              <LoaderCircle className="animate-spin h-5 w-5 text-white" />
              Processing..
            </span>
          ) : (
            "Redeem"
          )}
        </button>
      </div>

      {/* Help Drawer */}
      <HelpDrawer
        isOpen={showHelpDrawer}
        onClose={() => setShowHelpDrawer(false)}
        title="Redeeming Guide"
        content={[
          "Redeem your vested funds to withdraw them back to your wallet.",
          "Enter the amount you want to redeem (up to your vested amount).",
          "Review all details before confirming your redemption.",
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
          navigate("/portfolio/positions", {
            state: { walletType: "savings" },
          });
        }}
        title="Redemption Successful!"
        message={successMessage}
      />

      {/* Confirm Redeem Drawer */}
      <ActionDrawer
        isOpen={showConfirmDrawer}
        onClose={() => !isRedeeming && setShowConfirmDrawer(false)}
        title="Proceed to Redeem"
        content={[
          `You are about to redeem ${formatNumber(
            usdcAmount.replace(/,/g, "")
          )} USDC${isMaple ? " from USD Base" : isPerena ? " from USD Plus" : ""}.`,
          "Once confirmed, your funds will be processed and available in your wallet.",
        ]}
        actions={[
          {
            label: "Redeem",
            onClick: handleRedeem,
          },
          {
            label: "Cancel",
            onClick: () => setShowConfirmDrawer(false),
            variant: "secondary",
          },
        ]}
        isProcessing={isRedeeming}
      />

      {/* OTP Verification Drawer */}
      <OTPVerificationDrawer
        isOpen={showOTPDrawer}
        onClose={() => !isRedeeming && setShowOTPDrawer(false)}
        title="Redeem Verification"
        description="Enter the 6-digit code from your Authenticator App to proceed."
        onVerify={handleOTPVerify}
        onSuccess={handleOTPSuccess}
        showSuccessDrawer={false}
      />

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
};
