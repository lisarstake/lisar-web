import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ChevronLeft, CircleQuestionMark } from "lucide-react";
import { HelpDrawer } from "@/components/general/HelpDrawer";
import { BottomNavigation } from "@/components/general/BottomNavigation";
import { transactions } from "@/data/transactions";
import { Transaction } from "@/types/transaction";

export const TransactionDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { transactionId } = useParams<{ transactionId: string }>();
  const [showHelpDrawer, setShowHelpDrawer] = useState(false);

  const transaction = transactions.find((t) => t.id === transactionId);

  if (!transaction) {
    return (
      <div className="h-screen bg-[#050505] text-white flex items-center justify-center">
        <p>Transaction not found</p>
      </div>
    );
  }

  const handleBackClick = () => {
    navigate("/history");
  };

  const handleHelpClick = () => {
    setShowHelpDrawer(true);
  };

  const getAmountColor = (type: string) => {
    switch (type) {
      case "fund-wallet":
      case "stake":
        return "text-[#C7EF6B]";
      case "withdraw-stake":
      case "withdrawal":
      case "unstake":
        return "text-[#FF6B6B]";
      default:
        return "text-[#C7EF6B]";
    }
  };

  const getAmountPrefix = (type: string) => {
    switch (type) {
      case "fund-wallet":
      case "stake":
        return "+";
      case "withdraw-stake":
      case "withdrawal":
      case "unstake":
        return "-";
      default:
        return "+";
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
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

        <h1 className="text-lg font-medium text-white">{transaction.title}</h1>

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
          className={`text-4xl font-bold ${getAmountColor(transaction.type)}`}
        >
          {getAmountPrefix(transaction.type)}
          {transaction.amount} {transaction.currency}
        </h2>
      </div>

      {/* Transaction Details Card */}
      <div className="flex-1 px-6 py-4">
        <div className="bg-[#1a1a1a] rounded-xl p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Date</span>
              <span className="text-white font-medium">
                {formatDate(transaction.date)}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-gray-400">Status</span>
              <span className="text-white font-medium capitalize">
                {transaction.status}
              </span>
            </div>

            {transaction.to && (
              <div className="flex items-center justify-between">
                <span className="text-gray-400">To</span>
                <span className="text-white font-medium">{transaction.to}</span>
              </div>
            )}

            {transaction.from && (
              <div className="flex items-center justify-between">
                <span className="text-gray-400">From</span>
                <span className="text-white font-medium">
                  {transaction.from}
                </span>
              </div>
            )}

            {transaction.network && (
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Network</span>
                <span className="text-white font-medium">
                  {transaction.network}
                </span>
              </div>
            )}

            {transaction.fee && (
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Network fee</span>
                <span className="text-white font-medium">
                  {transaction.fee} {transaction.currency}
                </span>
              </div>
            )}
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
