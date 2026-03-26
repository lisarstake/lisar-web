import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  ArrowLeft,
  LoaderCircle,
  Wallet2,
  WalletCards,
} from "lucide-react";
import { ActionDrawer } from "@/components/general/ActionDrawer";
import { BottomNavigation } from "@/components/general/BottomNavigation";
import { ErrorDrawer } from "@/components/general/ErrorDrawer";
import { SuccessDrawer } from "@/components/general/SuccessDrawer";
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
  const [showConfirmDrawer, setShowConfirmDrawer] = useState(false);
  const [showOTPDrawer, setShowOTPDrawer] = useState(false);
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [showErrorDrawer, setShowErrorDrawer] = useState(false);
  const [showSuccessDrawer, setShowSuccessDrawer] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const { state } = useAuth();
  const {
    refreshAllWalletData,
    ethereumWalletAddress,
    solanaWalletAddress,
    ethereumWalletId,
    solanaWalletId,
  } = useWallet();
  const { refetch: refetchTransactions } = useTransactions();
  const { refetch: refetchPortfolio } = usePortfolio()

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

            await Promise.all([
              refreshAllWalletData(),
              refetchPortfolio(),
              refetchTransactions(),
            ]);
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

            await Promise.all([
              refreshAllWalletData(),
              refetchPortfolio(),
              refetchTransactions(),
            ]);
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

  const numericAmount = parseFloat(usdcAmount.replace(/,/g, "")) || 0;
  const hasExceededMax = numericAmount > maxRedeemable;
  const activePercent = useMemo(() => {
    if (!maxRedeemable || maxRedeemable <= 0 || !Number.isFinite(numericAmount)) {
      return null;
    }
    const ratio = (numericAmount / maxRedeemable) * 100;
    const clampedRatio = Math.min(100, Math.max(0, ratio));
    return presetPercents.reduce((closest, current) => {
      const currentDiff = Math.abs(current - clampedRatio);
      const closestDiff = Math.abs(closest - clampedRatio);
      return currentDiff < closestDiff ? current : closest;
    }, presetPercents[0]);
  }, [maxRedeemable, numericAmount]);

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
      <div className="flex items-center justify-between px-6 pt-8 pb-4">
        <button
          onClick={handleBackClick}
          className="h-10 w-10 rounded-full bg-[#13170a] flex items-center justify-center"
        >
          <ArrowLeft className="text-white" size={22} />
        </button>

        <div className="w-8 h-8" />
        <div className="w-8 h-8" />
      </div>


      <div className="flex-1 overflow-y-auto px-6 pb-28 scrollbar-hide">
        {/* Amount Input Field */}
        <div className="pt-2 pb-4">
          <div className="bg-[#13170a] rounded-lg p-3 flex items-center gap-3">
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
            {presetPercents.map((percent) => {
              const amount = (maxRedeemable * (percent / 100)).toFixed(2);
              const isActive = activePercent === percent && numericAmount > 0;
              return (
                <button
                  key={percent}
                  onClick={() => handleAmountSelect(amount)}
                  className={`flex-1 py-2.5 px-2 rounded-full text-sm font-medium transition-colors ${isActive
                    ? "bg-[#C7EF6B] text-black"
                    : "bg-[#13170a] text-white/80 hover:bg-[#1a1f10]"
                    }`}
                >
                  {percent}%
                </button>
              );
            })}
          </div>
        </div>

        {/* Balance */}
        <div className="rounded-lg bg-[#13170a] p-4 mt-3">
          <h3 className="text-sm text-white/60 mb-0.5 flex items-center gap-1.5">
            <WalletCards size={16} /> Wallet balance
          </h3>
          <div className="bg-[#13170a] rounded-lg border border-[#13170a]">
            <div className="flex items-center space-x-3">

              <div className="flex-1">
                <span className="text-gray-100 text-sm font-medium">
                  {(maxRedeemable ?? 0).toLocaleString(
                    undefined,
                    {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    },
                  )} USDC
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Proceed Button - Fixed at bottom */}
      <div className="px-6 py-3.5 bg-[#050505] pb-24">
        <button
          onClick={handleProceed}
          disabled={
            !usdcAmount ||
            parseFloat(usdcAmount) <= 0 ||
            isRedeeming ||
            hasExceededMax
          }
          className={`w-full py-3 rounded-full font-semibold text-lg transition-colors ${usdcAmount &&
            parseFloat(usdcAmount) > 0 &&
            !isRedeeming &&
            !hasExceededMax
            ? "bg-[#C7EF6B] text-black hover:bg-[#B8E55A]"
            : "bg-[#636363] text-white cursor-not-allowed"
            }`}
        >
          {isRedeeming ? (
            <span className="flex items-center justify-center gap-2">
              <LoaderCircle className="animate-spin h-5 w-5 text-white" />
              Processing..
            </span>
          ) : (
            "Withdraw"
          )}
        </button>
      </div>

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
  const presetPercents = [25, 50, 75, 100] as const;
