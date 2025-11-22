import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import {
  ChevronLeft,
  CircleQuestionMark,
  ChevronRight,
  CreditCard,
  ScanQrCode,
  LoaderCircle,
} from "lucide-react";
import { OnrampWebSDK } from "@onramp.money/onramp-web-sdk";
import { HelpDrawer } from "@/components/general/HelpDrawer";
import { BottomNavigation } from "@/components/general/BottomNavigation";
import { ErrorDrawer } from "@/components/ui/ErrorDrawer";
import { SuccessDrawer } from "@/components/ui/SuccessDrawer";
import { useAuth } from "@/contexts/AuthContext";
import { priceService } from "@/lib/priceService";
import { getFiatType } from "@/lib/onramp";
import { formatNumber, parseFormattedNumber } from "@/lib/formatters";

export const DepositPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const locationState = location.state as {
    lptAmount?: string;
    returnTo?: string;
  } | null;
  const preservedAmount = locationState?.lptAmount;
  const returnTo = locationState?.returnTo;
  const [fiatAmount, setFiatAmount] = useState("0");

  const [lptEquivalent, setLptEquivalent] = useState(0);
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
  const { state } = useAuth();

  // Get user's preferred currency
  const userCurrency = state.user?.fiat_type || "NGN";
  const currencySymbol = priceService.getCurrencySymbol(userCurrency);

  const pageTitle = "Deposit";

  // Initialize fiat amount from preserved LPT amount
  useEffect(() => {
    const initializeFromLpt = async () => {
      if (preservedAmount) {
        const numericLpt = parseFloat(preservedAmount.replace(/,/g, "")) || 0;
        if (numericLpt > 0) {
          const fiatValue = await priceService.convertLptToFiat(
            numericLpt,
            userCurrency
          );
          setFiatAmount(fiatValue.toFixed(2));
        }
      }
    };
    initializeFromLpt();
  }, [preservedAmount, userCurrency]);

  // Calculate LPT equivalent of fiat amount
  useEffect(() => {
    const calculateLpt = async () => {
      const numericAmount = parseFloat(fiatAmount.replace(/,/g, "")) || 0;
      if (numericAmount > 0) {
        const lptValue = await priceService.convertFiatToLpt(
          numericAmount,
          userCurrency
        );
        setLptEquivalent(lptValue);
      } else {
        setLptEquivalent(0);
      }
    };
    calculateLpt();
  }, [fiatAmount, userCurrency]);

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
    if (returnTo && preservedAmount) {
      navigate(returnTo, {
        state: { lptAmount: preservedAmount },
      });
    } else {
      navigate(-1);
    }
  };

  const handleAmountSelect = (amount: string) => {
    const numericAmount = parseFormattedNumber(amount);
    setFiatAmount(numericAmount);
  };

  const handlePaymentMethodSelect = (method: string) => {
    setSelectedPaymentMethod(method);
  };

  const handleProceed = async () => {
    if (selectedPaymentMethod === "onchain") {
      navigate("/deposit-address");
    } else if (selectedPaymentMethod === "fiat") {
      await handleFundWallet();
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

  const handleHelpClick = () => {
    setShowHelpDrawer(true);
  };

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
        {/* Amount Input Field */}
        <div className="py-6">
          <div className="bg-[#1a1a1a] rounded-xl p-4">
            <input
              type="text"
              value={fiatAmount ? formatNumber(fiatAmount) : ""}
              onChange={(e) => {
                const rawValue = parseFormattedNumber(e.target.value);
                let numericValue = rawValue.replace(/[^0-9.]/g, "");
                const parts = numericValue.split(".");
                if (parts.length > 2) {
                  numericValue = parts[0] + "." + parts.slice(1).join("");
                }
                setFiatAmount(numericValue);
              }}
              placeholder={currencySymbol}
              className="w-full bg-transparent text-white text-lg font-medium focus:outline-none"
            />
          </div>
          <p className="text-gray-400 text-xs mt-2 pl-2">
            ≈{" "}
            {lptEquivalent.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}{" "}
            LPT
          </p>
        </div>

        {/* Predefined Fiat Amounts */}
        <div className="pb-4">
          <div className="flex space-x-3">
            {["15000", "50000", "100000"].map((amount) => {
              const isActive =
                fiatAmount === amount ||
                parseFloat(fiatAmount || "0") === parseFloat(amount);
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
                  {currencySymbol}
                  {formatNumber(amount)}
                </button>
              );
            })}
          </div>
        </div>

        {/* Payment Method Selection */}
        <div className="py-4">
          <h3 className="text-base font-medium text-white/90 mb-2">
            Preferred method
          </h3>

          <div className="space-y-3">
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
                  color={
                    selectedPaymentMethod === "fiat" ? "#C7EF6B" : "#86B3F7"
                  }
                />
                <span className="text-white font-normal">Fiat deposit</span>
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
                <span className="text-white font-normal">
                  On-Chain deposit
                </span>
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
      </div>

      {/* Proceed Button - Fixed at bottom */}
      <div className="px-6 py-4 bg-[#050505] pb-32">
        <button
          onClick={handleProceed}
          disabled={
            !selectedPaymentMethod ||
            !fiatAmount ||
            parseFloat(fiatAmount) <= 0 ||
            isStaking
          }
          className={`w-full py-4 rounded-xl font-semibold text-lg transition-colors ${
            selectedPaymentMethod &&
            fiatAmount &&
            parseFloat(fiatAmount) > 0 &&
            !isStaking
              ? "bg-[#C7EF6B] text-black hover:bg-[#B8E55A]"
              : "bg-[#636363] text-white cursor-not-allowed"
          }`}
        >
          {isStaking ? (
            <span className="flex items-center justify-center gap-2">
              <LoaderCircle className="animate-spin h-5 w-5 text-white" />
              Processing...
            </span>
          ) : (
            "Proceed to Deposit"
          )}
        </button>
      </div>

      {/* Help Drawer */}
      <HelpDrawer
        isOpen={showHelpDrawer}
        onClose={() => setShowHelpDrawer(false)}
        title="Deposit Guide"
        content={[
          "Deposit funds to your wallet. Choose an amount and a payment method.",
          "You can deposit with fiat money or tokens from another wallet or exchange.",
          "Review all details before confirming your deposit to ensure everything is correct.",
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
        onClose={() => setShowSuccessDrawer(false)}
        title="Payment Successful!"
        message={successMessage}
      />

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
};
