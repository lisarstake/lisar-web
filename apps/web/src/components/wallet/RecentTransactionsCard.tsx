import React from "react";
import { ArrowDown, ArrowUp, SquareMinus, PiggyBank, Info } from "lucide-react";
import { TransactionData } from "@/services/transactions/types";
import { EmptyState } from "@/components/general/EmptyState";

interface RecentTransactionsCardProps {
  transactions: TransactionData[];
  isLoading: boolean;
  onTransactionClick: (transaction: TransactionData) => void;
  skeletonCount?: number;
}

export const RecentTransactionsCard: React.FC<RecentTransactionsCardProps> = ({
  transactions,
  isLoading,
  onTransactionClick,
  skeletonCount = 3,
}) => {
  const getTransactionIcon = (type: TransactionData["transaction_type"]) => {
    switch (type) {
      case "deposit":
        return <ArrowDown size={18} className="text-[#C7EF6B]" />;
      case "withdrawal":
        return <ArrowUp size={18} className="text-[#FF6B6B]" />;
      case "delegation":
        return <PiggyBank size={18} className="text-[#C7EF6B]" />;
      case "undelegation":
        return <SquareMinus size={18} className="text-[#FF6B6B]" />;
      case "mint":
        return <PiggyBank size={18} className="text-[#C7EF6B]" />;
      case "burn":
        return <SquareMinus size={18} className="text-[#FF6B6B]" />;
      default:
        return <PiggyBank size={18} className="text-[#C7EF6B]" />;
    }
  };

  const getTransactionTitle = (type: TransactionData["transaction_type"]) => {
    switch (type) {
      case "deposit":
        return "Deposit";
      case "withdrawal":
        return "Withdraw";
      case "delegation":
        return "Vest";
      case "undelegation":
        return "Redeem";
      case "mint":
        return "Vest";
      case "burn":
        return "Redeem";
      default:
        return "Transaction";
    }
  };

  const getIconBackgroundColor = (
    type: TransactionData["transaction_type"]
  ) => {
    return type === "deposit" || type === "delegation" || type === "mint"
      ? "bg-[#C7EF6B]/10"
      : "bg-[#FF6B6B]/10";
  };

  const getAmountColor = (type: TransactionData["transaction_type"]) => {
    return type === "deposit" || type === "delegation" || type === "mint"
      ? "text-[#C7EF6B]"
      : "text-[#FF6B6B]";
  };

  const getAmountPrefix = (type: TransactionData["transaction_type"]) => {
    return type === "deposit" || type === "delegation" || type === "mint" ? "+" : "-";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      // year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  if (isLoading) {
    return (
      <div className="bg-[#1a1a1a] rounded-lg border border-[#2a2a2a] overflow-hidden">
        <div className="divide-y divide-[#2a2a2a]">
          {Array.from({ length: skeletonCount }).map((_, index) => (
            <div
              key={`skeleton-${index}`}
              className="flex items-center justify-between p-4"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-[#2a2a2a] rounded-full animate-pulse"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-[#2a2a2a] rounded-lg w-24 animate-pulse"></div>
                  <div className="h-3 bg-[#2a2a2a] rounded-lg w-20 animate-pulse"></div>
                </div>
              </div>
              <div className="h-5 bg-[#2a2a2a] rounded-lg w-20 animate-pulse"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (transactions.length === 0 && !isLoading) {
    return (
      <div className="overflow-hidden">
        <EmptyState
          icon={Info}
          iconColor="#86B3F7"
          iconBgColor="#2a2a2a"
          title="No recent transactions"
          description="Your most recent activity will appear here."
          className="py-20"
        />
      </div>
    );
  }

  return (
    <div className="bg-[#1a1a1a] rounded-lg border border-[#2a2a2a] overflow-hidden ">
      <div className="divide-y divide-[#2a2a2a]">
        {transactions.map((transaction) => (
          <div
            key={transaction.id}
            onClick={() => onTransactionClick(transaction)}
            className="flex items-center justify-between p-4 hover:bg-[#2a2a2a]/30 transition-colors cursor-pointer"
          >
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${getIconBackgroundColor(
                  transaction.transaction_type
                )}`}
              >
                {getTransactionIcon(transaction.transaction_type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium truncate">
                  {getTransactionTitle(transaction.transaction_type)}
                </p>
                <p className="text-white/40 text-xs">
                  {formatDate(transaction.created_at)}
                </p>
              </div>
            </div>
            <div className="text-right ml-3 shrink-0">
              <p
                className={`font-semibold text-sm ${getAmountColor(
                  transaction.transaction_type
                )}`}
              >
                {getAmountPrefix(transaction.transaction_type)}
                {parseFloat(transaction.amount).toFixed(2)}{" "}
                {transaction.token_symbol}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
