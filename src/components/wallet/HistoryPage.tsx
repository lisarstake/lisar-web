import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  CircleQuestionMark,
  ArrowUp,
  ArrowDown,
  TrendingUp,
  SquareMinus,
  ChartSpline,
  Send,
} from "lucide-react";
import { HelpDrawer } from "@/components/general/HelpDrawer";
import { BottomNavigation } from "@/components/general/BottomNavigation";
import { getTransactionGroups } from "@/data/transactions";
import { Transaction } from "@/types/transaction";

export const HistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const [showHelpDrawer, setShowHelpDrawer] = useState(false);
  const transactionGroups = getTransactionGroups();

  const handleBackClick = () => {
    navigate("/wallet");
  };

  const handleTransactionClick = (transaction: Transaction) => {
    navigate(`/transaction-detail/${transaction.id}`);
  };

  const handleHelpClick = () => {
    setShowHelpDrawer(true);
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "fund-wallet":
        return <ArrowUp size={20} color="#C7EF6B" />;
      case "withdraw-stake":
        return <ArrowDown size={20} color="#FF6B6B" />;
      case "withdrawal":
        return <Send size={20} color="#FF6B6B" />;
      case "stake":
     
        return <ChartSpline size={20} color="#C7EF6B" />;
      case "unstake":
        return <SquareMinus size={20} color="#86B3F7" />;
      default:
        return <ChartSpline size={20} color="#C7EF6B" />;
    }
  };

  const getAmountColor = (type: string) => {
    switch (type) {
      case "fund-wallet":
      case "stake":
        return "text-[#C7EF6B]";
      case "withdraw-stake":
      case "withdrawal":
     
        return "text-[#FF6B6B]";
      default:
        return "text-[#86B3F7]";
    }
  };

  const getAmountPrefix = (type: string) => {
    switch (type) {
      case "fund-wallet":
      case "stake":
      case "orchestrator-stake":
        return "+";
      case "withdraw-stake":
      case "withdrawal":
      case "unstake":
        return "-";
      default:
        return "+";
    }
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
        {transactionGroups.map((group, groupIndex) => (
          <div key={groupIndex} className="mb-6">
            <h2 className="text-gray-400 text-sm font-medium mb-3">
              {group.date}
            </h2>
            <div className="space-y-3">
              {group.transactions.map((transaction) => (
                <div
                  key={transaction.id}
                  onClick={() => handleTransactionClick(transaction)}
                  className="flex items-center justify-between p-4 bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] hover:border-[#C7EF6B]/30 transition-colors cursor-pointer"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-[#2a2a2a] rounded-full flex items-center justify-center">
                      {getTransactionIcon(transaction.type)}
                    </div>
                    <div>
                      <p className="text-white font-medium">
                        {transaction.title}
                      </p>
                      <p className="text-gray-400 text-sm">
                        {transaction.status}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className={`font-semibold ${getAmountColor(transaction.type)}`}
                    >
                      {getAmountPrefix(transaction.type)}
                      {transaction.amount} {transaction.currency}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Help Drawer */}
      <HelpDrawer
        isOpen={showHelpDrawer}
        onClose={() => setShowHelpDrawer(false)}
        title="History Guide"
        content={[
          "View all your staking activities and transactions in one place.",
          "Green arrows show money coming in, red arrows show money going out.",
          "Click any transaction to see details like date, amount, and status."
        ]}
      />

      {/* Bottom Navigation */}
      <BottomNavigation currentPath="/history" />
    </div>
  );
};
