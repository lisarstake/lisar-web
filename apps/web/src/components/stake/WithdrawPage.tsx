import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import {
  ChevronLeft,
  CircleQuestionMark,
  LoaderCircle,
  Wallet2,
  Copy,
} from "lucide-react";
import { HelpDrawer } from "@/components/general/HelpDrawer";
import { BottomNavigation } from "@/components/general/BottomNavigation";
import { ErrorDrawer } from "@/components/ui/ErrorDrawer";
import { SuccessDrawer } from "@/components/ui/SuccessDrawer";
import { useAuth } from "@/contexts/AuthContext";
import { useDelegation } from "@/contexts/DelegationContext";
import { useTransactions } from "@/contexts/TransactionContext";
import { priceService } from "@/lib/priceService";
import { useWallet } from "@/contexts/WalletContext";
import { formatNumber, parseFormattedNumber } from "@/lib/formatters";
import { walletService } from "@/services/wallet";
import { getFiatType } from "@/lib/onramp";

export const WithdrawPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const locationState = location.state as {
    lptAmount?: string;
    walletType?: string;
    provider?: "maple" | "perena";
    tierNumber?: number;
    tierTitle?: string;
  } | null;

  const [lptAmount, setLptAmount] = useState(() => {
    return locationState?.lptAmount || "0";
  });

  const [withdrawalAddress, setWithdrawalAddress] = useState("");
  const [isWithdrawalLaunched, setIsWithdrawalLaunched] = useState(false);
  
  const walletType = locationState?.walletType;
  const selectedProvider = locationState?.provider;
  const isStables = walletType === "savings";
  const coinCode = isStables
    ? selectedProvider === "maple"
      ? "usdc"
      : selectedProvider === "perena"
      ? "usdc"
      : "usdc"
    : "lpt";
  const network = isStables
    ? selectedProvider === "maple"
      ? "ethereum"
      : selectedProvider === "perena"
      ? "spl"
      : "spl"
    : "arbitrum";
  const tokenName = isStables ? "USDC" : "LPT";

  useEffect(() => {
    if (locationState?.lptAmount) {
      setLptAmount(locationState.lptAmount);
    }
  }, [locationState]);

  const [showHelpDrawer, setShowHelpDrawer] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [showErrorDrawer, setShowErrorDrawer] = useState(false);
  const [showSuccessDrawer, setShowSuccessDrawer] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [fiatEquivalent, setFiatEquivalent] = useState(0);
  const { state } = useAuth();
  const { wallet, solanaBalance } = useWallet();
  const { refetch: refetchDelegation } = useDelegation();
  const { refetch: refetchWallet } = useWallet();
  const { refetch: refetchTransactions } = useTransactions();

  // Get user's preferred currency
  const userCurrency = state.user?.fiat_type || "NGN";
  const currencySymbol = priceService.getCurrencySymbol(userCurrency);

  // User's wallet balance:
  // - For High Yield: LPT balance
  // - For Stables: combined stables balance from WalletContext (Solana + EVM)
  const walletBalance =
    isStables ? solanaBalance || 0 : wallet?.balanceLpt || 0;

  const pageTitle = "Withdraw";

  const handleBackClick = () => {
    navigate(-1);
  };

  const handleAmountSelect = (amount: string) => {
    const numericAmount = parseFormattedNumber(amount);
    setLptAmount(numericAmount);
  };

  useEffect(() => {
    const calculateFiat = async () => {
      const numericAmount = parseFloat(lptAmount.replace(/,/g, "")) || 0;
      if (numericAmount > 0) {
        const fiatValue = await priceService.convertLptToFiat(
          numericAmount,
          userCurrency
        );
        setFiatEquivalent(fiatValue);
      } else {
        setFiatEquivalent(0);
      }
    };
    calculateFiat();
  }, [lptAmount, userCurrency]);

  const handleMaxClick = () => {
    setLptAmount(walletBalance.toString());
  };

  const handleProceed = async () => {
    if (isStables && !selectedProvider) {
      setErrorMessage("Provider not selected. Please go back and select a tier.");
      setShowErrorDrawer(true);
      return;
    }

    const numericAmount = parseFloat(lptAmount.replace(/,/g, "")) || 0;

    if (!withdrawalAddress || withdrawalAddress.trim() === "") {
      setErrorMessage("Please enter a withdrawal address.");
      setShowErrorDrawer(true);
      return;
    }

    handleWithdraw();
  };

  const handleWithdraw = async () => {
    if (!lptAmount || parseFloat(lptAmount.replace(/,/g, "")) <= 0) {
      setErrorMessage("Please enter a valid amount to Withdraw.");
      setShowErrorDrawer(true);
      return;
    }

    if (!withdrawalAddress || withdrawalAddress.trim() === "") {
      setErrorMessage("Please enter a fiat receiving address.");
      setShowErrorDrawer(true);
      return;
    }

    if (!state.user) {
      setErrorMessage("User not authenticated. Please log in and try again.");
      setShowErrorDrawer(true);
      return;
    }

    if (isStables && !selectedProvider) {
      setErrorMessage("Please select a provider (USD Base or USD Plus).");
      setShowErrorDrawer(true);
      return;
    }

    setIsWithdrawing(true);
    try {
      const numericAmount = lptAmount.replace(/,/g, "");

      if (isStables && selectedProvider) {
        if (selectedProvider === "maple") {
          const ethWalletResp = await walletService.getPrimaryWallet("ethereum");
          if (!ethWalletResp.success || !ethWalletResp.wallet) {
            setErrorMessage("Ethereum wallet not found. Please create a wallet first.");
            setShowErrorDrawer(true);
            setIsWithdrawing(false);
            return;
          }

          const sendResponse = await walletService.sendToken(
            1,
            "USDC",
            {
              walletId: ethWalletResp.wallet.wallet_id,
              walletAddress: ethWalletResp.wallet.wallet_address,
              to: withdrawalAddress,
              amount: numericAmount,
            }
          );

          if (!sendResponse.success) {
            setErrorMessage(
              sendResponse.error || "Failed to withdraw USDC. Please try again."
            );
            setShowErrorDrawer(true);
            setIsWithdrawing(false);
            return;
          }
        } else if (selectedProvider === "perena") {
          const solWalletResp = await walletService.getPrimaryWallet("solana");
          if (!solWalletResp.success || !solWalletResp.wallet) {
            setErrorMessage("Solana wallet not found. Please create a wallet first.");
            setShowErrorDrawer(true);
            setIsWithdrawing(false);
            return;
          }

          const sendResponse = await walletService.sendSolana({
            walletId: solWalletResp.wallet.wallet_id,
            fromAddress: solWalletResp.wallet.wallet_address,
            toAddress: withdrawalAddress,
            token: "USDC",
            amount: parseFloat(numericAmount),
          });

          if (!sendResponse.success) {
            setErrorMessage(
              sendResponse.error || "Failed to withdraw USDC. Please try again."
            );
            setShowErrorDrawer(true);
            setIsWithdrawing(false);
            return;
          }
        }
      } else {
        const approveResponse = await walletService.approveLpt({
          walletId: state.user.wallet_id,
          walletAddress: state.user.wallet_address,
          spender: state.user.wallet_address,
          amount: numericAmount,
        });

        if (!approveResponse.success) {
          const friendlyApprovalMsg =
            "We couldn't complete the withdrawal. Please double-check the details and try again.";
          const serverApprovalMsg =
            approveResponse.message || approveResponse.error || "";
          setErrorMessage(
            serverApprovalMsg ? `${friendlyApprovalMsg}` : friendlyApprovalMsg
          );
          setShowErrorDrawer(true);
          setIsWithdrawing(false);
          return;
        }

        const sendResponse = await walletService.sendLpt({
          walletId: state.user.wallet_id,
          walletAddress: state.user.wallet_address,
          to: withdrawalAddress,
          amount: numericAmount,
        });

        if (!sendResponse.success) {
          const friendlySendMsg =
            "We couldn't complete the withdrawal. Please double-check the details and try again.";
          const serverSendMsg = sendResponse.message || sendResponse.error || "";
          setErrorMessage(serverSendMsg ? `${friendlySendMsg}` : friendlySendMsg);
          setShowErrorDrawer(true);
          setIsWithdrawing(false);
          return;
        }
      }

      await Promise.all([
        refetchDelegation(),
        refetchWallet(),
        refetchTransactions(),
      ]);

      setWithdrawalAddress("");
      setLptAmount("0");

      setSuccessMessage(
        `Withdrawal processed successfully. Return to the previous screen and click "I have sent" to complete the withdrawal.`
      );
      setShowSuccessDrawer(true);
    } catch (error) {
      const errorMsg =
        error instanceof Error
          ? error.message
          : "An error occurred while processing your Withdraw. Please try again.";
      setErrorMessage(errorMsg);
      setShowErrorDrawer(true);
    } finally {
      setIsWithdrawing(false);
    }
  };

  const handleHelpClick = () => {
    setShowHelpDrawer(true);
  };

  const handleLaunchWithdrawal = () => {
    const appId = import.meta.env.VITE_ONRAMP_APP_ID || "1674103";
    const fiatType = getFiatType(userCurrency);

    const params = new URLSearchParams({
      appId: appId.toString(),
      coinCode: coinCode,
      network: network,
      coinAmount: "0",
      fiatType: "6",
      // fiatType: fiatType.toString(),
    });

    const offrampUrl = `https://onramp.money/main/sell/?${params.toString()}`;
    window.open(offrampUrl, "_blank");
    setIsWithdrawalLaunched(true);
  };

  const handlePasteAddress = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setWithdrawalAddress(text.trim());
    } catch (err) {
      console.error("Failed to paste:", err);
    }
  };
  const handlePasteAmount = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setLptAmount(text.trim());
    } catch (err) {
      console.error("Failed to paste:", err);
    }
  };

  // Check if user has insufficient funds
  const numericAmount = parseFloat(lptAmount.replace(/,/g, "")) || 0;
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

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-6 pb-28 scrollbar-hide">
        {/* Provider Indicator for Stables */}
        {isStables && selectedProvider && locationState?.tierTitle && (
          <div className="py-4">
            <div className="bg-[#1a1a1a] rounded-lg p-4 border border-[#2a2a2a]">
              <div className="flex items-center gap-3">
                <img
                  src={selectedProvider === "maple" ? "/maple.svg" : "/perena2.png"}
                  alt={selectedProvider}
                  className="w-8 h-8 object-contain"
                />
                <div>
                  <p className="text-white/90 text-sm font-medium">
                    {locationState.tierTitle}
                  </p>
                  <p className="text-gray-400 text-xs">
                    {selectedProvider === "maple"
                      ? "USD Base - Up to 6.5% APY"
                      : "USD Plus - Up to 14% APY"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Withdrawal Address Input */}
        <div className="pt-1">
          <h3 className="text-base font-medium text-white/90 mb-2">
            Withdrawal Address
          </h3>
          <div className="bg-[#1a1a1a] rounded-lg p-3 border border-[#2a2a2a] relative">
            <input
              type="text"
              value={withdrawalAddress}
              onChange={(e) => setWithdrawalAddress(e.target.value)}
              placeholder="0x738....3652"
              disabled={!isWithdrawalLaunched}
              className={`w-full bg-transparent text-base font-normal focus:outline-none placeholder-gray-500 pr-12 ${
                !isWithdrawalLaunched
                  ? "text-white/50 cursor-not-allowed"
                  : "text-white"
              }`}
            />
            <button
              type="button"
              onClick={handlePasteAddress}
              disabled={!isWithdrawalLaunched}
              className={`absolute right-4 top-1/2 -translate-y-1/2 text-xs font-medium transition-colors ${
                !isWithdrawalLaunched
                  ? "text-gray-500 cursor-not-allowed"
                  : "text-[#C7EF6B] hover:text-[#B8E55A]"
              }`}
            >
              Paste
            </button>
          </div>
        </div>

        {/* Network Input
        <div className="pt-4">
          <h3 className="text-base font-medium text-white/90 mb-2">Network</h3>
          <div className="bg-[#1a1a1a] rounded-lg p-3 border border-[#2a2a2a]">
            <input
              type="text"
              value={network}
              disabled
              className="w-full bg-transparent text-white text-base font-normal focus:outline-none opacity-60 cursor-not-allowed"
            />
          </div>
        </div> */}

        {/* Amount Input Field */}
        <div className="py-2">
          <h3 className="text-base font-medium text-white/90 mb-2">Amount</h3>
          <div className="bg-[#1a1a1a] rounded-lg p-3 flex items-center gap-3">
            <input
              type="text"
              value={lptAmount ? formatNumber(lptAmount) : ""}
              onChange={(e) => {
                const rawValue = parseFormattedNumber(e.target.value);
                let numericValue = rawValue.replace(/[^0-9.]/g, "");
                const parts = numericValue.split(".");
                if (parts.length > 2) {
                  numericValue = parts[0] + "." + parts.slice(1).join("");
                }
                setLptAmount(numericValue);
              }}
              placeholder={tokenName}
              disabled={!isWithdrawalLaunched}
              className={`flex-1 bg-transparent text-base font-medium focus:outline-none ${
                !isWithdrawalLaunched
                  ? "text-white/50 cursor-not-allowed"
                  : "text-white"
              }`}
            />
            <button
              onClick={handlePasteAmount}
              disabled={!isWithdrawalLaunched}
              className={`text-xs font-medium transition-colors ${
                !isWithdrawalLaunched
                  ? "text-gray-500 cursor-not-allowed"
                  : "text-[#C7EF6B] hover:text-[#B8E55A]"
              }`}
            >
              Paste
            </button>
          </div>
          {/* <p className="text-gray-400 text-xs mt-2 pl-2">
            ≈ {currencySymbol}
            {fiatEquivalent.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p> */}
        </div>

        {/* Predefined LPT Amounts */}
        {/* <div className="py-4">
          <div className="flex space-x-3">
            {["10", "50", "100"].map((amount) => {
              const isActive =
                lptAmount === amount ||
                parseFloat(lptAmount || "0") === parseFloat(amount);
              return (
                <button
                  key={amount}
                  onClick={() => handleAmountSelect(amount)}
                  disabled={!isWithdrawalLaunched}
                  className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-colors ${
                    !isWithdrawalLaunched
                      ? "bg-[#1a1a1a] text-white/30 cursor-not-allowed"
                      : isActive
                        ? "bg-[#C7EF6B] text-black"
                        : "bg-[#1a1a1a] text-white/80 hover:bg-[#2a2a2a]"
                  }`}
                >
                  {formatNumber(amount)} <span className="text-xs">LPT</span>
                </button>
              );
            })}
          </div>
        </div> */}

        {/* Wallet Balance Info */}
        <div className="py-4">
          <h3 className="text-base font-medium text-white/90 mb-2">
            Available balance
          </h3>
          <div className="bg-[#1a1a1a] rounded-lg p-4 border border-[#2a2a2a]">
            <div className="flex items-center space-x-3">
              <Wallet2 size={20} color="#86B3F7" />
              <div className="flex-1">
                <div>
                  <span className="text-gray-400 text-sm">
                    {walletBalance.toLocaleString()} {tokenName}
                  </span>
                </div>
              </div>
            </div>
          </div>
          {hasInsufficientFunds && (
            <p className="text-red-300 text-xs mt-2 pl-2">
              Insufficient funds, ensure you have enough {tokenName} in your wallet
            </p>
          )}
          {/* Guide */}
          <div className="mt-3 p-3 bg-[#1a1a1a] rounded-lg border border-[#2a2a2a]">
            <div className="text-gray-400 text-xs leading-relaxed space-y-2">
              <p className="font-medium mb-2">To Withdraw:</p>
              <div className="space-y-1.5">
                <p>1. Click "Get Address" to initiate withdrawal</p>
                <p>2. Complete the details and copy the address provided</p>
                <p>
                  3. Paste the address, exact amount and send to complete the
                  withdrawal
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons - Fixed at bottom */}
      <div className="px-6 py-4 bg-[#050505] pb-24 space-y-3">
        {!isWithdrawalLaunched ? (
          <button
            onClick={handleLaunchWithdrawal}
            className="w-full py-4 rounded-lg font-semibold text-lg bg-[#C7EF6B] text-black hover:bg-[#B8E55A] transition-colors"
          >
            Get Address
          </button>
        ) : (
          <button
            onClick={handleProceed}
            disabled={
              !lptAmount ||
              parseFloat(lptAmount) <= 0 ||
              !withdrawalAddress ||
              withdrawalAddress.trim() === "" ||
              hasInsufficientFunds ||
              isWithdrawing
            }
            className={`w-full py-4 rounded-lg font-semibold text-lg transition-colors ${
              lptAmount &&
              parseFloat(lptAmount) > 0 &&
              withdrawalAddress &&
              withdrawalAddress.trim() !== "" &&
              !hasInsufficientFunds &&
              !isWithdrawing
                ? "bg-[#C7EF6B] text-black hover:bg-[#B8E55A]"
                : "bg-[#636363] text-white cursor-not-allowed"
            }`}
          >
            {isWithdrawing ? (
              <span className="flex items-center justify-center gap-2">
                <LoaderCircle className="animate-spin h-5 w-5 text-white" />
                Processing..
              </span>
            ) : (
              "Withdraw"
            )}
          </button>
        )}
      </div>

      {/* Help Drawer */}
      <HelpDrawer
        isOpen={showHelpDrawer}
        onClose={() => setShowHelpDrawer(false)}
        title="Withdraw Guide"
        content={[
          "Withdraw from your wallet balance to other exchanges or wallets.",
          "Enter the amount and the address and confirm the withdrawal.",
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
          setTimeout(() => {
            navigate("/wallet");
          }, 3000);
        }}
        title="Withdraw Successful!"
        message={successMessage}
      />

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
};
