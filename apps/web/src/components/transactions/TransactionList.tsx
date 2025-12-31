import React from "react";
import { TransactionData, TransactionType } from "@/services/transactions/types";
import {
  ArrowUp,
  ArrowDown,
  SquareMinus,
  Info,
  AlertCircle,
  RefreshCw,
  PiggyBank,
} from "lucide-react";
import { EmptyState } from "@/components/general/EmptyState";

interface TransactionListProps {
  transactions: TransactionData[];
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
  onTransactionClick: (transaction: TransactionData) => void;
  skeletonCount?: number;
}

export const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  isLoading,
  error,
  onRetry,
  onTransactionClick,
  skeletonCount = 5,
}) => {
  const getTransactionIcon = (type: TransactionType) => {
    switch (type) {
      case "deposit":
        return <ArrowDown size={20} color="#C7EF6B" />;
      case "withdrawal":
        return <ArrowUp size={20} color="#FF6B6B" />;
      case "delegation":
        return <PiggyBank size={20} color="#C7EF6B" />;
      case "undelegation":
        return <SquareMinus size={20} color="#FF6B6B" />;
      case "mint":
        return <PiggyBank size={20} color="#C7EF6B" />;
      case "burn":
        return <SquareMinus size={20} color="#FF6B6B" />;
      default:
        return <PiggyBank size={20} color="#C7EF6B" />;
    }
  };

  const getAmountColor = (type: TransactionType) => {
    return type === "deposit" || type === "delegation" || type === "mint"
      ? "text-[#C7EF6B]"
      : "text-[#FF6B6B]";
  };

  const getAmountPrefix = (type: TransactionType) => {
    return type === "deposit" || type === "delegation" || type === "mint" ? "+" : "-";
  };

  const getTransactionTitle = (type: TransactionType) => {
    switch (type) {
      case "deposit":
        return "Deposit";
      case "withdrawal":
        return "Send";
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

  // Group transactions by date
  const transactionGroups = React.useMemo(() => {
    const groups: { [key: string]: TransactionData[] } = {};

    transactions.forEach((transaction) => {
      const date = new Date(transaction.created_at).toLocaleDateString(
        "en-US",
        {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        }
      );

      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(transaction);
    });

    return Object.entries(groups).map(([date, transactions]) => ({
      date,
      transactions,
    }));
  }, [transactions]);

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

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-6">
        <div className="w-16 h-16 bg-gray-100/10 rounded-full flex items-center justify-center mb-6">
          <AlertCircle className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">Error</h3>
        <p className="text-gray-400 text-center mb-6 max-w-sm">
          {error}
        </p>
        <button
          onClick={onRetry}
          className="flex items-center text-sm space-x-2 px-4 py-2 bg-gray-300 text-black rounded-lg font-normal hover:bg-[#B8E55A] transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Retry</span>
        </button>
      </div>
    );
  }

  if (transactionGroups.length === 0 && !isLoading) {
    return (
      <EmptyState
        icon={Info}
        iconColor="#86B3F7"
        iconBgColor="#2a2a2a"
        title="No transactions"
        description="You haven't made any transactions yet."
      />
    );
  }

  return (
    <div className="space-y-6">
      {isLoading
        ? Array.from({ length: skeletonCount }).map((_, index) => (
            <div key={`skeleton-${index}`} className="mb-6">
              <div className="h-4 bg-gray-700 rounded w-32 mb-3 animate-pulse"></div>
              <div className="space-y-3">
                {Array.from({ length: 2 }).map((_, itemIndex) => (
                  <div
                    key={`skeleton-item-${itemIndex}`}
                    className="flex items-center justify-between p-4 bg-[#1a1a1a] rounded-xl border border-[#2a2a2a]"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gray-700 rounded-full animate-pulse"></div>
                      <div className="space-y-2">
                        <div className="h-4 bg-gray-700 rounded w-20 animate-pulse"></div>
                        <div className="h-3 bg-gray-700 rounded w-16 animate-pulse"></div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="h-4 bg-gray-700 rounded w-16 animate-pulse"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        : transactionGroups.map((group, groupIndex) => (
            <div key={groupIndex} className="mb-6">
              <h2 className="text-gray-400 text-xs font-medium mb-3">
                {group.date}
              </h2>
              <div className="space-y-3">
                {group.transactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    onClick={() => onTransactionClick(transaction)}
                    className="flex items-center justify-between p-4 bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] hover:border-[#C7EF6B]/30 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-[#2a2a2a] rounded-full flex items-center justify-center">
                        {getTransactionIcon(transaction.transaction_type)}
                      </div>
                      <div>
                        <p className="text-white font-medium">
                          {getTransactionTitle(transaction.transaction_type)}
                        </p>
                        <p className="text-white/40 text-xs">
                        {formatDate(transaction.created_at)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p
                        className={`font-semibold ${getAmountColor(transaction.transaction_type)}`}
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
          ))}
    </div>
  );
};
