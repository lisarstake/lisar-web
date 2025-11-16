import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ChevronLeft, CircleQuestionMark, AlertCircle, RefreshCw, ExternalLink } from "lucide-react";
import { HelpDrawer } from "@/components/general/HelpDrawer";
import { BottomNavigation } from "@/components/general/BottomNavigation";
import { transactionService } from "@/services";
import { TransactionData, TransactionType } from "@/services/transactions/types";
import { getArbitrumScanUrl } from "@/lib/utils";

export const TransactionDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { transactionId } = useParams<{ transactionId: string }>();
  const [showHelpDrawer, setShowHelpDrawer] = useState(false);
  const [transaction, setTransaction] = useState<TransactionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTransaction = async () => {
      if (!transactionId) return;
      
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await transactionService.getTransactionById(transactionId);
        
        if (response.success && response.data) {
          setTransaction(response.data);
        } else {
          setError(response.message || "Failed to fetch transaction");
        }
      } catch (err) {
        setError("An error occurred while fetching transaction");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransaction();
  }, [transactionId]);

  const handleBackClick = () => {
    navigate(-1);
  };

  const handleHelpClick = () => {
    setShowHelpDrawer(true);
  };

  const getAmountColor = (type: TransactionType) => {
    switch (type) {
      case "deposit":
      case "delegation":
        return "text-[#C7EF6B]";
      case "withdrawal":
      case "undelegation":
        return "text-[#FF6B6B]";
      default:
        return "text-[#C7EF6B]";
    }
  };

  const getAmountPrefix = (type: TransactionType) => {
    switch (type) {
      case "deposit":
      case "delegation":
        return "+";
      case "withdrawal":
      case "undelegation":
        return "-";
      default:
        return "+";
    }
  };

  const getTransactionTitle = (type: TransactionType) => {
    switch (type) {
      case "deposit":
        return "Deposit";
      case "withdrawal":
        return "Withdrawal";
      case "delegation":
        return "Stake";
      case "undelegation":
        return "Unstake";
      default:
        return "Transaction";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const handleRetry = async () => {
    if (!transactionId) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await transactionService.getTransactionById(transactionId);
      
      if (response.success && response.data) {
        setTransaction(response.data);
      } else {
        setError(response.message || "Failed to fetch transaction");
      }
    } catch (err) {
      setError("An error occurred while fetching transaction");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="h-screen bg-[#050505] text-white flex flex-col">
        <div className="flex items-center justify-between px-6 py-8">
          <button
            onClick={handleBackClick}
            className="w-8 h-8 flex items-center justify-center"
          >
            <ChevronLeft color="#C7EF6B" />
          </button>
          <h1 className="text-lg font-medium text-white">Transaction Details</h1>
          <div className="w-8 h-8"></div>
        </div>
        <div className="flex flex-col items-center justify-center flex-1">
          <div className="w-8 h-8 border-2 border-[#C7EF6B] border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-400">Loading transaction..</p>
        </div>
      </div>
    );
  }

  if (error || !transaction) {
    return (
      <div className="h-screen bg-[#050505] text-white flex flex-col">
        <div className="flex items-center justify-between px-6 py-8">
          <button
            onClick={handleBackClick}
            className="w-8 h-8 flex items-center justify-center"
          >
            <ChevronLeft color="#C7EF6B" />
          </button>
          <h1 className="text-lg font-medium text-white">Transaction Details</h1>
          <div className="w-8 h-8"></div>
        </div>
        <div className="flex flex-col items-center justify-center flex-1 px-6">
          <div className="w-12 h-12 bg-gray-100/10 rounded-full flex items-center justify-center mb-6">
            <AlertCircle className="w-6 h-6 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">Error</h3>
          <p className="text-gray-400 text-center mb-6 max-w-sm">
            {error || "Transaction not found"}
          </p>
          <button
            onClick={handleRetry}
            className="flex items-center text-sm space-x-2 px-4 py-2 bg-gray-300 text-black rounded-lg font-normal hover:bg-[#B8E55A] transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Retry</span>
          </button>
        </div>
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
          <ChevronLeft color="#C7EF6B" />
        </button>

        <h1 className="text-lg font-medium text-white">{getTransactionTitle(transaction.transaction_type)}</h1>

        <button
          onClick={handleHelpClick}
          className="w-8 h-8 bg-[#2a2a2a] rounded-full flex items-center justify-center"
        >
          <CircleQuestionMark color="#86B3F7" size={16} />
        </button>
      </div>

      {/* Transaction Amount */}
      <div className="text-center px-6 py-8">
        <h2
          className={`text-4xl font-bold ${getAmountColor(transaction.transaction_type)}`}
        >
          {getAmountPrefix(transaction.transaction_type)}
          {parseFloat(transaction.amount).toFixed(4)} {transaction.token_symbol}
        </h2>
      </div>

      {/* Transaction Details Card */}
      <div className="flex-1 px-6 py-4">
        <div className="bg-[#1a1a1a] rounded-xl p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Date</span>
              <span className="text-white font-medium">
                {formatDate(transaction.created_at)}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-gray-400">Status</span>
              <span className="text-white font-medium capitalize">
                {transaction.status}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-gray-400">Transaction Hash</span>
              <div className="flex items-center gap-2">
                <span className="text-white font-medium text-xs">
                  {transaction.transaction_hash.slice(0, 8)}...{transaction.transaction_hash.slice(-8)}
                </span>
                <a
                  href={getArbitrumScanUrl(transaction.transaction_hash)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#86B3F7] hover:text-[#96C3F7] transition-colors"
                >
                  <ExternalLink size={16} />
                </a>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-gray-400">Wallet Address</span>
              <span className="text-white font-medium text-xs">
                {transaction.wallet_address.slice(0, 8)}...{transaction.wallet_address.slice(-8)}
              </span>
            </div>

            {/* <div className="flex items-center justify-between">
              <span className="text-gray-400">Token Address</span>
              <span className="text-white font-medium text-xs">
                {transaction.token_address.slice(0, 8)}...{transaction.token_address.slice(-8)}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-gray-400">Source</span>
              <span className="text-white font-medium capitalize">
                {transaction.source}
              </span>
            </div> */}
          </div>
        </div>
      </div>

      {/* Help Drawer */}
      <HelpDrawer
        isOpen={showHelpDrawer}
        onClose={() => setShowHelpDrawer(false)}
        title="Transaction Guide"
        content={[
          "View detailed information about your transaction including amount, date, status, and fees.",
          "Status shows if your transaction succeeded, failed, or is pending.",
          "All transactions are recorded on the blockchain for transparency."
        ]}
      />

      {/* Bottom Navigation */}
      <BottomNavigation currentPath="/history" />
    </div>
  );
};
