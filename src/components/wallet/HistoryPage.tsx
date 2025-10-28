import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  CircleQuestionMark,
} from "lucide-react";
import { HelpDrawer } from "@/components/general/HelpDrawer";
import { BottomNavigation } from "@/components/general/BottomNavigation";
import { TransactionList } from "@/components/wallet/TransactionList";
import { useTransactions } from "@/contexts/TransactionContext";
import { TransactionData } from "@/services/transactions/types";

export const HistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const [showHelpDrawer, setShowHelpDrawer] = useState(false);
  const { transactions, isLoading, error, refetch } = useTransactions();

  const handleBackClick = () => {
    navigate("/wallet");
  };

  const handleTransactionClick = (transaction: TransactionData) => {
    navigate(`/transaction-detail/${transaction.id}`);
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

        <h1 className="text-lg font-medium text-white">History</h1>

        <button
          onClick={handleHelpClick}
          className="w-8 h-8 bg-[#2a2a2a] rounded-full flex items-center justify-center"
        >
          <CircleQuestionMark color="#86B3F7" size={16} />
        </button>
      </div>

      {/* Transaction List */}
      <div className="flex-1 overflow-y-auto px-6 pb-20 scrollbar-hide">
        <TransactionList
          transactions={transactions}
          isLoading={isLoading}
          error={error}
          onRetry={refetch}
          onTransactionClick={handleTransactionClick}
          skeletonCount={5}
        />
      </div>

      {/* Help Drawer */}
      <HelpDrawer
        isOpen={showHelpDrawer}
        onClose={() => setShowHelpDrawer(false)}
        title="History Guide"
        content={[
          "View all your staking activities and transactions in one place.",
          "Green arrows show money coming in, red arrows show money going out.",
          "Click any transaction to see details like date, amount, and status.",
        ]}
      />

      {/* Bottom Navigation */}
      <BottomNavigation currentPath="/history" />
    </div>
  );
};
