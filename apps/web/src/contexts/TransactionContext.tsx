import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import {
  TransactionData,
  TransactionType,
} from "@/services/transactions/types";
import { transactionService } from "@/services";
import { useAuth } from "./AuthContext";

interface TransactionContextType {
  transactions: TransactionData[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  getTransactionsByType: (type: TransactionType) => TransactionData[];
}

const TransactionContext = createContext<TransactionContextType | undefined>(
  undefined
);

interface TransactionProviderProps {
  children: ReactNode;
}

export const TransactionProvider: React.FC<TransactionProviderProps> = ({
  children,
}) => {
  const [transactions, setTransactions] = useState<TransactionData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { state } = useAuth();

  const fetchTransactions = async () => {
    if (!state.user?.user_id) {
      setTransactions([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await transactionService.getUserTransactions(
        state.user.user_id
      );

      if (response.success && response.data) {
        // Sort transactions by created_at (newest first)
        const sortedTransactions = response.data.sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        setTransactions(sortedTransactions);
      } else {
        setError(response.message || "Failed to fetch transactions");
      }
    } catch (err) {
      setError("An error occurred while fetching transactions");
    } finally {
      setIsLoading(false);
    }
  };

  const refetch = async () => {
    await fetchTransactions();
  };

  const getTransactionsByType = (type: TransactionType): TransactionData[] => {
    return transactions.filter(
      (transaction) => transaction.transaction_type === type
    );
  };

  // Fetch transactions on mount and when user changes
  useEffect(() => {
    fetchTransactions();
  }, [state.user?.user_id]);

  const value: TransactionContextType = {
    transactions,
    isLoading,
    error,
    refetch,
    getTransactionsByType,
  };

  return (
    <TransactionContext.Provider value={value}>
      {children}
    </TransactionContext.Provider>
  );
};

export const useTransactions = () => {
  const context = useContext(TransactionContext);
  if (context === undefined) {
    throw new Error(
      "useTransactions must be used within a TransactionProvider"
    );
  }
  return context;
};
