import React, { useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { CircleQuestionMark } from "lucide-react";
import { HelpDrawer } from "@/components/general/HelpDrawer";
import { BottomNavigation } from "@/components/general/BottomNavigation";
import { TransactionList } from "@/components/transactions/TransactionList";
import { TransactionDetailsDrawer } from "@/components/transactions/TransactionDetailsDrawer";
import { useTransactions } from "@/contexts/TransactionContext";
import { TransactionData } from "@/services/transactions/types";

export const HistoryPage: React.FC = () => {
  const location = useLocation();
  const [showHelpDrawer, setShowHelpDrawer] = useState(false);
  const [selectedTransaction, setSelectedTransaction] =
    useState<TransactionData | null>(null);
  const { transactions, isLoading, error, refetch } = useTransactions();

  const walletTypeFromState = (location.state as { walletType?: string } | null)
    ?.walletType;

  const filteredTransactions = useMemo(() => {
    const fiatTxTypes = ["deposit", "withdrawal"];
    if (walletTypeFromState === "staking") {
      return transactions.filter(
        (tx) => tx.token_symbol?.toUpperCase() === "LPT",
      );
    }

    if (walletTypeFromState === "savings") {
      return transactions.filter(
        (tx) => tx.token_symbol?.toUpperCase() !== "LPT",
      );
    }

    return transactions.filter((tx) =>
      fiatTxTypes.includes(tx.transaction_type),
    );
  }, [transactions, walletTypeFromState]);

  const handleTransactionClick = (transaction: TransactionData) => {
    setSelectedTransaction(transaction);
  };

  const handleHelpClick = () => {
    setShowHelpDrawer(true);
  };

  return (
    <div className="h-screen bg-[#050505] text-white flex flex-col">
      {/* Header */}
      <div className="flex items-start justify-between px-6 py-6">
        <div>
          <h1 className="text-lg font-medium text-white">Activity</h1>
          <p className="text-xs text-gray-500">
            View all your recent transactions
          </p>
        </div>
        {/* <button
          onClick={handleHelpClick}
          className="w-8 h-8 bg-[#505050] rounded-full flex items-center justify-center"
        >
          <CircleQuestionMark color="#86B3F7" size={16} />
        </button> */}
      </div>

      {/* Transaction List */}
      {filteredTransactions.length === 0 && !isLoading && !error ? (
        <div className="flex-1 flex flex-col items-center justify-center px-6 mb-32">
          <TransactionList
            transactions={filteredTransactions}
            isLoading={isLoading}
            error={error}
            onRetry={refetch}
            onTransactionClick={handleTransactionClick}
            skeletonCount={5}
          />
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto overscroll-contain px-6 pb-20 scrollbar-hide">
          <TransactionList
            transactions={filteredTransactions}
            isLoading={isLoading}
            error={error}
            onRetry={refetch}
            onTransactionClick={handleTransactionClick}
            skeletonCount={5}
          />
        </div>
      )}

      {/* Help Drawer */}
      <HelpDrawer
        isOpen={showHelpDrawer}
        onClose={() => setShowHelpDrawer(false)}
        title="History Guide"
        content={[
          "View all your transactions in one place.",
          "Click any transaction to see details like date, amount, and status.",
        ]}
      />

      <TransactionDetailsDrawer
        transaction={selectedTransaction}
        isOpen={selectedTransaction !== null}
        onClose={() => setSelectedTransaction(null)}
      />

      {/* Bottom Navigation */}
      <BottomNavigation currentPath="/history" />
    </div>
  );
};
