import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ChevronLeft, Info, CircleQuestionMark } from "lucide-react";
import { BottomNavigation } from "@/components/general/BottomNavigation";
import { HelpDrawer } from "@/components/general/HelpDrawer";
import { EmptyState } from "@/components/general/EmptyState";
import { usePortfolio, type StakeEntry } from "@/contexts/PortfolioContext";
import { formatEarnings } from "@/lib/formatters";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { OTPVerificationDrawer } from "@/components/auth/OTPVerificationDrawer";
import { totpService } from "@/services/totp";
import { Button } from "../ui/button";
import { mapleService, perenaService, walletService } from "@/services";
import { ErrorDrawer } from "@/components/ui/ErrorDrawer";
import { SuccessDrawer } from "@/components/ui/SuccessDrawer";
import { LoaderCircle } from "lucide-react";

interface StakeEntryItemProps {
  entry: StakeEntry;
  onClick: () => void;
}

const StakeEntryItem: React.FC<StakeEntryItemProps> = ({ entry, onClick }) => {
  const avatar = entry.name.toLowerCase().includes("perena")
    ? "/perena2.png"
    : entry.name.toLowerCase().includes("maple")
      ? "/maple.svg"
      : "/highyield-1.svg";

  return (
    <div
      className="bg-linear-to-br from-[#0f0f0f] to-[#151515] rounded-xl p-4 border border-[#2a2a2a] cursor-pointer hover:border-[#C7EF6B]/30 transition-colors"
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          {avatar && (
            <img
              src={avatar}
              alt={entry.name}
              className={`w-12 h-12 rounded-full ${avatar.includes("highyield") ? "object-cover" : "object-contain"}`}
            />
          )}
          <div>
            <p className="text-gray-100 font-medium mb-0.5">
              {entry.name.length > 20
                ? `${entry.name.substring(0, 16)}..`
                : entry.name}
            </p>
            <p className="text-gray-400 text-xs">
              {formatEarnings(entry.yourStake)}{" "}
              {entry.isSavings ? "USDC" : "LPT"}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p
            className={`font-medium mb-0.5 text-sm ${entry.isSavings ? "text-[#86B3F7]" : "text-[#C7EF6B]"}`}
          >
            {(entry.apy * 100).toFixed(1)}% p/a
          </p>
          <p className="text-gray-400 text-xs">{entry.fee * 100}% fee</p>
        </div>
      </div>
    </div>
  );
};

const StakeEntrySkeleton: React.FC = () => {
  return (
    <div className="bg-linear-to-br from-[#0f0f0f] to-[#151515] rounded-xl p-4 border border-[#2a2a2a]">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <Skeleton className="w-12 h-12 rounded-full bg-[#2a2a2a]" />
          <div>
            <Skeleton className="h-4 w-32 mb-2 bg-[#2a2a2a]" />
            <Skeleton className="h-3 w-20 bg-[#2a2a2a]" />
          </div>
        </div>
        <div className="text-right">
          <Skeleton className="h-4 w-16 mb-1 bg-[#2a2a2a]" />
          <Skeleton className="h-3 w-12 bg-[#2a2a2a]" />
        </div>
      </div>
    </div>
  );
};

export const PositionsPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showHelpDrawer, setShowHelpDrawer] = useState(false);
  const [showPositionDrawer, setShowPositionDrawer] = useState(false);
  const [showOTPDrawer, setShowOTPDrawer] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<StakeEntry | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showErrorDrawer, setShowErrorDrawer] = useState(false);
  const [showSuccessDrawer, setShowSuccessDrawer] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const walletType =
    (location.state as { walletType?: string })?.walletType || "staking";
  const isSavings = walletType === "savings";

  const { setMode, stakeEntries, isLoading } = usePortfolio();

  useEffect(() => {
    setMode(isSavings ? "savings" : "staking");
  }, [isSavings, setMode]);

  const handleBackClick = () => {
    navigate(-1);
  };

  const handleStakeClick = (entry: StakeEntry) => {
    if (isSavings && entry.isSavings) {
      setSelectedEntry(entry);
      setShowPositionDrawer(true);
    } else {
      navigate(`/validator-details/${entry.id}`);
    }
  };

  const handleWithdrawClick = () => {
    setShowPositionDrawer(false);
    setShowOTPDrawer(true);
  };

  const handleOTPVerify = async (code: string) => {
    const response = await totpService.verify({ token: code });
    if (response.success) {
      setShowOTPDrawer(false);
      setIsProcessing(true);

      if (!selectedEntry) {
        setErrorMessage("No position selected. Please try again.");
        setShowErrorDrawer(true);
        setIsProcessing(false);
        return response;
      }

      const isMaple = selectedEntry.name.toLowerCase().includes("maple");

      try {
        if (isMaple) {
          const ethWalletResp =
            await walletService.getPrimaryWallet("ethereum");
          if (!ethWalletResp.success || !ethWalletResp.wallet) {
            setErrorMessage(
              "Ethereum wallet not found. Please create a wallet first."
            );
            setShowErrorDrawer(true);
            setIsProcessing(false);
            return response;
          }

          const maplePoolId =
            import.meta.env.VITE_MAPLE_POOL_ID;
          const positionsResp = await mapleService.getPositions(
            ethWalletResp.wallet.wallet_address,
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
            setIsProcessing(false);
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
            setIsProcessing(false);
            return response;
          }

          const redeemResp = await mapleService.requestRedeem({
            walletId: ethWalletResp.wallet.wallet_id,
            walletAddress: ethWalletResp.wallet.wallet_address,
            poolAddress: maplePoolId,
            shares: totalShares.toString(),
          });

          if (redeemResp.success) {
            setSuccessMessage(
              "Withdrawal request submitted successfully. Your funds will be available after processing."
            );
            setShowSuccessDrawer(true);
          } else {
            setErrorMessage(
              redeemResp.error ||
                "Failed to request withdrawal. Please try again."
            );
            setShowErrorDrawer(true);
          }
        } else {
          const solWalletResp = await walletService.getPrimaryWallet("solana");
          if (!solWalletResp.success || !solWalletResp.wallet) {
            setErrorMessage(
              "Solana wallet not found. Please create a wallet first."
            );
            setShowErrorDrawer(true);
            setIsProcessing(false);
            return response;
          }

          const burnResp = await perenaService.burn({
            walletId: solWalletResp.wallet.wallet_id,
            walletAddress: solWalletResp.wallet.wallet_address,
            usdStarAmount: selectedEntry.yourStake,
          });

          if (burnResp.success) {
            setSuccessMessage(
              "Withdrawal successful! Your USDC will be available in your wallet shortly."
            );
            setShowSuccessDrawer(true);
          } else {
            setErrorMessage(
              burnResp.error || "Failed to withdraw. Please try again."
            );
            setShowErrorDrawer(true);
          }
        }
      } catch (error) {
        const errorMsg =
          error instanceof Error
            ? error.message
            : "An error occurred while processing withdrawal. Please try again.";
        setErrorMessage(errorMsg);
        setShowErrorDrawer(true);
      } finally {
        setIsProcessing(false);
      }
    }
    return response;
  };

  const handleOTPSuccess = () => {
    setShowOTPDrawer(false);
  };

  return (
    <div className="h-screen bg-[#181818] text-white flex flex-col">
      <div className="flex-1 overflow-y-auto px-6 pb-20 scrollbar-hide">
        {/* Header */}
        <div className="flex items-center justify-between py-8 mb-2">
          <button
            onClick={handleBackClick}
            className="w-8 h-8 flex items-center justify-center"
          >
            <ChevronLeft color="#C7EF6B" />
          </button>
          <h1 className="text-lg font-medium text-white">My Vest</h1>
          <button
            onClick={() => setShowHelpDrawer(true)}
            className="w-8 h-8 bg-[#2a2a2a] rounded-full flex items-center justify-center"
          >
           <CircleQuestionMark color="#9ca3af" size={16} />
          </button>
        </div>

        {/* Stakes List */}
        {isLoading ? (
          <div className="mb-6">
            <h2 className="text-white/70 text-sm font-medium mb-4 px-2">
              Active vests
            </h2>
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <StakeEntrySkeleton key={i} />
              ))}
            </div>
          </div>
        ) : stakeEntries.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center px-6 h-[70vh]">
            <EmptyState
              icon={Info}
              iconColor="#86B3F7"
              iconBgColor="#2a2a2a"
              title="No active positions"
              description="You don't have any active positions yet."
            />
          </div>
        ) : (
          <div className="mb-6">
            <h2 className="text-white/70 text-sm font-medium mb-4 px-2">
              Active vests
            </h2>
            <div className="space-y-3">
              {stakeEntries.map((entry) => (
                <StakeEntryItem
                  key={entry.id}
                  entry={entry}
                  onClick={() => handleStakeClick(entry)}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      <HelpDrawer
        isOpen={showHelpDrawer}
        onClose={() => setShowHelpDrawer(false)}
        title="My Vests"
        content={[
          "View all your active vests across different validators.",
          "Each position shows the validator name, your staked amount, APY, and fee.",
          "Click to view detailed information and manage your vest.",
        ]}
      />

      {/* Position Info Drawer for Stables */}
      {selectedEntry && (
        <Drawer
          open={showPositionDrawer}
          onOpenChange={(open) => !open && setShowPositionDrawer(false)}
        >
            <DrawerContent>
              <DrawerHeader>
                <div className="flex items-center justify-center gap-1.5 mb-3">
                  <img
                    src={
                      selectedEntry.name.toLowerCase().includes("maple")
                        ? "/maple.svg"
                        : "/perena2.png"
                    }
                    alt={selectedEntry.name}
                    className="w-8 h-8 object-contain"
                  />
                  <DrawerTitle className="text-xl font-semibold text-white/90">
                    {selectedEntry.name.toLowerCase().includes("maple")
                      ? "USD Base"
                      : "USD Plus"}
                  </DrawerTitle>
                </div>
              </DrawerHeader>
            <div className="space-y-3">
              <div className="bg-[#1a1a1a] rounded-lg p-4 border border-[#2a2a2a] space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-white/70 text-sm">Vested Amount</span>
                  <span className="text-white/90 font-medium">
                    {formatEarnings(selectedEntry.yourStake)} USDC
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/70 text-sm">APY</span>
                  <span className="text-white/90 font-medium">
                    {(selectedEntry.apy * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/70 text-sm">Fee</span>
                  <span className="text-white/90">
                    {(selectedEntry.fee * 100).toFixed(1)}%
                  </span>
                </div>
                <p className="text-xs text-white/50 mt-2">
                  Withdrawals are processed instantly but might take longer when
                  processing many withdrawals.
                </p>
              </div>
            </div>

            <DrawerFooter className="space-y-1">
              <button
                onClick={handleWithdrawClick}
                disabled={isProcessing}
                className={`w-full py-4 rounded-xl font-semibold text-lg transition-colors ${
                  isProcessing
                    ? "bg-[#636363] text-white cursor-not-allowed opacity-70"
                    : "bg-[#C7EF6B] text-black hover:bg-[#B8E55A]"
                }`}
              >
                {isProcessing ? (
                  <span className="flex items-center justify-center gap-2">
                    <LoaderCircle className="animate-spin h-5 w-5" />
                    Processing...
                  </span>
                ) : (
                  "Withdraw"
                )}
              </button>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      )}

      {/* OTP Verification Drawer */}
      <OTPVerificationDrawer
        isOpen={showOTPDrawer}
        onClose={() => !isProcessing && setShowOTPDrawer(false)}
        title="Secure Withdrawal"
        description="Enter the 6-digit code from your Authenticator App to proceed with withdrawal."
        onVerify={handleOTPVerify}
        onSuccess={handleOTPSuccess}
        showSuccessDrawer={false}
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
          setShowPositionDrawer(false);
          setSelectedEntry(null);
        }}
        title="Withdrawal Successful!"
        message={successMessage}
      />

      <BottomNavigation currentPath="/portfolio" />
    </div>
  );
};
