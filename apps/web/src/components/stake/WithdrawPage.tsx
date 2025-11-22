import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import {
  ChevronLeft,
  CircleQuestionMark,
  LoaderCircle,
  Wallet2,
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

export const WithdrawPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [lptAmount, setLptAmount] = useState(() => {
    const state = location.state as { lptAmount?: string } | null;
    return state?.lptAmount || "0";
  });

  const [withdrawalAddress, setWithdrawalAddress] = useState("");

  useEffect(() => {
    const state = location.state as { lptAmount?: string } | null;
    if (state?.lptAmount) {
      setLptAmount(state.lptAmount);
    }
  }, [location.state]);

  const [showHelpDrawer, setShowHelpDrawer] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [showErrorDrawer, setShowErrorDrawer] = useState(false);
  const [showSuccessDrawer, setShowSuccessDrawer] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const { state } = useAuth();
  const { wallet } = useWallet();
  const { refetch: refetchDelegation } = useDelegation();
  const { refetch: refetchTransactions } = useTransactions();

  // Get user's preferred currency
  const userCurrency = state.user?.fiat_type || "NGN";
  const currencySymbol = priceService.getCurrencySymbol(userCurrency);

  // User's wallet balance
  const walletBalanceLpt = wallet?.balanceLpt || 0;

  const pageTitle = "Send";

  const handleBackClick = () => {
    navigate(-1);
  };

  const handleAmountSelect = (amount: string) => {
    const numericAmount = parseFormattedNumber(amount);
    setLptAmount(numericAmount);
  };

  const handleMaxClick = () => {
    setLptAmount(walletBalanceLpt.toString());
  };

  const handleProceed = async () => {
    const numericAmount = parseFloat(lptAmount.replace(/,/g, "")) || 0;

    if (!withdrawalAddress || withdrawalAddress.trim() === "") {
      setErrorMessage("Please enter a fiat receiving address.");
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

    if (!state.user.wallet_id || !state.user.wallet_address) {
      setErrorMessage("Wallet information not found. Please try again.");
      setShowErrorDrawer(true);
      return;
    }

    setIsWithdrawing(true);
    try {
      const numericAmount = lptAmount.replace(/,/g, "");

      // Step 1: Approve LPT for the withdrawal address
      const approveResponse = await walletService.approveLpt({
        walletId: state.user.wallet_id,
        walletAddress: state.user.wallet_address,
        spender: state.user.wallet_address,
        amount: numericAmount,
      });

      if (!approveResponse.success) {
        setErrorMessage(
          approveResponse.message ||
            approveResponse.error ||
            "Failed to approve LPT. Please try again."
        );
        setShowErrorDrawer(true);
        return;
      }

      // Step 2: Send LPT to the destination address
      const sendResponse = await walletService.sendLpt({
        walletId: state.user.wallet_id,
        walletAddress: state.user.wallet_address,
        to: withdrawalAddress,
        amount: numericAmount,
      });

      if (!sendResponse.success) {
        setErrorMessage(
          sendResponse.message ||
            sendResponse.error ||
            "Failed to send LPT. Please try again."
        );
        setShowErrorDrawer(true);
        return;
      }

      setSuccessMessage(`Withdraw successful!`);
      setShowSuccessDrawer(true);

      // Refetch delegation and transaction data
      refetchDelegation();
      refetchTransactions();
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

  // Check if user has insufficient funds
  const numericAmount = parseFloat(lptAmount.replace(/,/g, "")) || 0;
  const hasInsufficientFunds =
    numericAmount > 0 && numericAmount > walletBalanceLpt;

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
        {/* Withdrawal Address Input */}
        <div className="pt-4">
          <h3 className="text-base font-medium text-white/90 mb-2">
            Destination address
          </h3>
          <div className="bg-[#1a1a1a] rounded-xl p-4 border border-[#2a2a2a]">
            <input
              type="text"
              value={withdrawalAddress}
              onChange={(e) => setWithdrawalAddress(e.target.value)}
              placeholder="0x738...3652"
              className="w-full bg-transparent text-white text-base font-normal focus:outline-none placeholder-gray-500"
            />
          </div>
        </div>

        {/* Amount Input Field */}
        <div className="py-2">
          <h3 className="text-base font-medium text-white/90 mb-2">Amount</h3>
          <div className="bg-[#1a1a1a] rounded-xl p-4 flex items-center gap-3">
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
              placeholder="LPT"
              className="flex-1 bg-transparent text-white text-base font-medium focus:outline-none"
            />
            <button
              onClick={handleMaxClick}
              className="text-[#C7EF6B] text-sm font-medium transition-colors"
            >
              Max
            </button>
          </div>
        </div>

        {/* Predefined LPT Amounts */}
        <div className="py-4">
          <div className="flex space-x-3">
            {["10", "50", "100"].map((amount) => {
              const isActive =
                lptAmount === amount ||
                parseFloat(lptAmount || "0") === parseFloat(amount);
              return (
                <button
                  key={amount}
                  onClick={() => handleAmountSelect(amount)}
                  className={`flex-1 py-3 px-4 rounded-xl text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-[#C7EF6B] text-black"
                      : "bg-[#1a1a1a] text-white/80 hover:bg-[#2a2a2a]"
                  }`}
                >
                  {formatNumber(amount)} <span className="text-xs">LPT</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Wallet Balance Info */}
        <div className="py-4">
          <h3 className="text-base font-medium text-white/90 mb-2">
            Available balance
          </h3>
          <div className="bg-[#1a1a1a] rounded-xl p-4 border border-[#2a2a2a]">
            <div className="flex items-center space-x-3">
              <Wallet2 size={20} color="#86B3F7" />
              <div className="flex-1">
                <div>
                  <span className="text-gray-400 text-sm">
                    {walletBalanceLpt.toLocaleString()} LPT
                  </span>
                </div>
              </div>
            </div>
          </div>
          {hasInsufficientFunds && (
            <p className="text-gray-400 text-xs mt-2 pl-2">
              Insufficient funds, ensure you have enough LPT in your wallet
            </p>
          )}
        </div>
      </div>

      {/* Proceed Button - Fixed at bottom */}
      <div className="px-6 py-4 bg-[#050505] pb-24">
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
          className={`w-full py-4 rounded-xl font-semibold text-lg transition-colors ${
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
            "Send"
          )}
        </button>
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
          navigate("/portfolio");
        }}
        title="Withdraw Successful!"
        message={successMessage}
      />

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
};
