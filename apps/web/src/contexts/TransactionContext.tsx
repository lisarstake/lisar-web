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
import { transactionService, virtualAccountService } from "@/services";
import { useAuth } from "./AuthContext";

const mapNairaTypeToTransactionType = (
  type: string,
): TransactionData["transaction_type"] => {
  if (type === "withdrawal" || type === "conversion_out" || type === "fee") {
    return "withdrawal";
  }
  return "deposit";
};

const mapNairaStatusToTransactionStatus = (
  status: string,
): TransactionData["status"] => {
  if (status === "failed") return "failed";
  if (status === "completed") return "confirmed";
  return "pending";
};

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

      const [defaultResponse, nairaResponse] = await Promise.all([
        transactionService.getUserTransactions(state.user.user_id),
        virtualAccountService.getTransactions({
          limit: 100,
          offset: 0,
        }),
      ]);

      const defaultTransactions =
        defaultResponse.success && defaultResponse.data ? defaultResponse.data : [];

      const nairaTransactions =
        nairaResponse.success && nairaResponse.data
          ? nairaResponse.data.transactions.map((tx) => ({
              id: `naira-${tx.id}`,
              user_id: state.user?.user_id || "",
              transaction_hash: tx.reference,
              transaction_type: mapNairaTypeToTransactionType(tx.type),
              amount: String(tx.amount || 0),
              token_address: "",
              token_symbol: "NGN",
              wallet_address: "",
              wallet_id: "",
              status: mapNairaStatusToTransactionStatus(tx.status),
              source: "naira",
              svix_id: "",
              created_at: tx.createdAt,
            }))
          : [];

      const mergedTransactions = [...defaultTransactions, ...nairaTransactions];
      const sortedTransactions = mergedTransactions.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      );

      setTransactions(sortedTransactions);

      if (!defaultResponse.success && !nairaResponse.success) {
        setError(defaultResponse.message || "Failed to fetch transactions");
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
