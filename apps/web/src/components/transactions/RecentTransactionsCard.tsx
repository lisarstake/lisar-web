import React from "react";
import { Info, ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { TransactionData } from "@/services/transactions/types";
import { EmptyState } from "@/components/general/EmptyState";

interface RecentTransactionsCardProps {
  transactions: TransactionData[];
  isLoading: boolean;
  onTransactionClick: (transaction: TransactionData) => void;
  skeletonCount?: number;
  walletType?: string;
}

export const RecentTransactionsCard: React.FC<RecentTransactionsCardProps> = ({
  transactions,
  isLoading,
  onTransactionClick,
  skeletonCount = 3,
  walletType,
}) => {
  const isDepositTransaction = (type: TransactionData["transaction_type"]) => {
    return type === "deposit" || type === "delegation" || type === "mint";
  };

  const isWithdrawTransaction = (type: TransactionData["transaction_type"]) => {
    return type === "withdrawal" || type === "undelegation" || type === "burn";
  };

  const getTransactionTitle = (
    type: TransactionData["transaction_type"],
    walletType?: string,
  ) => {
    switch (type) {
      case "deposit":
        return "Deposit";
      case "withdrawal":
        return "Send";
      case "delegation":
        return "Deposit";
      case "undelegation":
        return "Withdraw";
      case "mint":
        return walletType === "savings" ? "Deposit" : "Deposit";
      case "burn":
        return walletType === "savings" ? "Withdraw" : "Withdraw";
      default:
        return "Transaction";
    }
  };

  const getAmountColor = (type: TransactionData["transaction_type"]) => {
    return "text-white/90";
  };

  const getAmountPrefix = (type: TransactionData["transaction_type"]) => {
    return type === "deposit" || type === "delegation" || type === "mint"
      ? "+"
      : "-";
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
      <div className="bg-[#151515] rounded-lg overflow-hidden">
        <div className="divide-y divide-[#505050]">
          {Array.from({ length: skeletonCount }).map((_, index) => (
            <div
              key={`skeleton-${index}`}
              className="flex items-center justify-between p-4"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-[#505050] rounded-full animate-pulse"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-[#505050] rounded-lg w-24 animate-pulse"></div>
                  <div className="h-3 bg-[#505050] rounded-lg w-20 animate-pulse"></div>
                </div>
              </div>
              <div className="h-5 bg-[#505050] rounded-lg w-20 animate-pulse"></div>
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
          iconBgColor="#505050"
          title="No recent transactions"
          description="Your most recent activity will appear here."
          className="py-20"
        />
      </div>
    );
  }

  return (
    <div className="bg-[#151515] rounded-lg overflow-hidden">
      <div className="divide-y divide-[#505050]">
        {transactions.map((transaction) => (
          <div
            key={transaction.id}
            onClick={() => onTransactionClick(transaction)}
            className="flex items-center justify-between p-4 hover:bg-[#505050]/30 transition-colors cursor-pointer"
          >
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              <div className="w-10 h-10 flex items-center justify-center shrink-0 bg-white/10 rounded-full">
                {isDepositTransaction(transaction.transaction_type) ? (
                  <ArrowDownLeft size={20} className="text-green-400" />
                ) : isWithdrawTransaction(transaction.transaction_type) ? (
                  <ArrowUpRight size={20} className="text-red-400" />
                ) : (
                  <ArrowDownLeft size={20} className="text-white" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium truncate">
                  {getTransactionTitle(
                    transaction.transaction_type,
                    walletType,
                  )}
                </p>
                <p className="text-white/40 text-xs">
                  {formatDate(transaction.created_at)}
                </p>
              </div>
            </div>
            <div className="text-right ml-3 shrink-0">
              <p
                className={`font-semibold text-[13px] ${getAmountColor(
                  transaction.transaction_type,
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
