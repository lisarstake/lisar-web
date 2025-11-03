/**
 * Admin Transaction Context
 */

import React, {
  createContext,
  useContext,
  useEffect,
  useReducer,
  useCallback,
  useRef,
  ReactNode,
} from "react";
import {
  DashboardSummary,
  Transaction,
  TransactionStats,
  TransactionFilters,
  PaginatedTransactionsResponse,
} from "@/services/transactions/types";
import { transactionService } from "@/services/transactions";

interface TransactionState {
  dashboardSummary: DashboardSummary | null;
  transactions: Transaction[];
  transactionStats: TransactionStats | null;
  filteredTransactions: PaginatedTransactionsResponse | null;
  currentFilters: TransactionFilters | null;
  isLoadingSummary: boolean;
  isLoadingTransactions: boolean;
  isLoadingStats: boolean;
  isLoadingFilteredTransactions: boolean;
  error: string | null;
  lastFetched: number | null;
}

type TransactionAction =
  | { type: "FETCH_SUMMARY_START" }
  | { type: "FETCH_TRANSACTIONS_START" }
  | { type: "FETCH_STATS_START" }
  | { type: "FETCH_FILTERED_TRANSACTIONS_START"; payload: TransactionFilters }
  | { type: "FETCH_SUMMARY_SUCCESS"; payload: DashboardSummary }
  | { type: "FETCH_TRANSACTIONS_SUCCESS"; payload: Transaction[] }
  | { type: "FETCH_STATS_SUCCESS"; payload: TransactionStats }
  | {
      type: "FETCH_FILTERED_TRANSACTIONS_SUCCESS";
      payload: {
        data: PaginatedTransactionsResponse;
        filters: TransactionFilters;
      };
    }
  | { type: "FETCH_SUMMARY_FAILURE"; payload: string }
  | { type: "FETCH_TRANSACTIONS_FAILURE"; payload: string }
  | { type: "FETCH_STATS_FAILURE"; payload: string }
  | { type: "FETCH_FILTERED_TRANSACTIONS_FAILURE"; payload: string }
  | { type: "REFRESH_ALL" };

interface TransactionContextType {
  state: TransactionState;
  refreshDashboardSummary: () => Promise<void>;
  refreshTransactions: (limit?: number) => Promise<void>;
  refreshTransactionStats: () => Promise<void>;
  getFilteredTransactions: (filters: TransactionFilters) => Promise<void>;
  refreshAll: (limit?: number) => Promise<void>;
}

const initialState: TransactionState = {
  dashboardSummary: null,
  transactions: [],
  transactionStats: null,
  filteredTransactions: null,
  currentFilters: null,
  isLoadingSummary: true,
  isLoadingTransactions: true,
  isLoadingStats: true,
  isLoadingFilteredTransactions: false,
  error: null,
  lastFetched: null,
};

// Helper to compare filters
const areFiltersEqual = (
  f1: TransactionFilters | null,
  f2: TransactionFilters | null
): boolean => {
  if (!f1 || !f2) return false;
  return (
    (f1.page || 1) === (f2.page || 1) &&
    (f1.limit || 20) === (f2.limit || 20) &&
    (f1.status || "") === (f2.status || "") &&
    (f1.type || "") === (f2.type || "") &&
    (f1.sortBy || "created_at") === (f2.sortBy || "created_at") &&
    (f1.sortOrder || "desc") === (f2.sortOrder || "desc") &&
    (f1.userId || "") === (f2.userId || "")
  );
};

const reducer = (
  state: TransactionState,
  action: TransactionAction
): TransactionState => {
  switch (action.type) {
    case "FETCH_SUMMARY_START":
      return { ...state, isLoadingSummary: true, error: null };
    case "FETCH_TRANSACTIONS_START":
      return { ...state, isLoadingTransactions: true, error: null };
    case "FETCH_STATS_START":
      return { ...state, isLoadingStats: true, error: null };
    case "FETCH_FILTERED_TRANSACTIONS_START":
      return { ...state, isLoadingFilteredTransactions: true, error: null };
    case "FETCH_SUMMARY_SUCCESS":
      return {
        ...state,
        dashboardSummary: action.payload,
        isLoadingSummary: false,
        error: null,
        lastFetched: Date.now(),
      };
    case "FETCH_TRANSACTIONS_SUCCESS":
      return {
        ...state,
        transactions: action.payload,
        isLoadingTransactions: false,
        error: null,
        lastFetched: Date.now(),
      };
    case "FETCH_STATS_SUCCESS":
      return {
        ...state,
        transactionStats: action.payload,
        isLoadingStats: false,
        error: null,
        lastFetched: Date.now(),
      };
    case "FETCH_FILTERED_TRANSACTIONS_SUCCESS":
      return {
        ...state,
        filteredTransactions: action.payload.data,
        currentFilters: action.payload.filters,
        isLoadingFilteredTransactions: false,
        error: null,
        lastFetched: Date.now(),
      };
    case "FETCH_SUMMARY_FAILURE":
      return { ...state, isLoadingSummary: false, error: action.payload };
    case "FETCH_TRANSACTIONS_FAILURE":
      return { ...state, isLoadingTransactions: false, error: action.payload };
    case "FETCH_STATS_FAILURE":
      return { ...state, isLoadingStats: false, error: action.payload };
    case "FETCH_FILTERED_TRANSACTIONS_FAILURE":
      return {
        ...state,
        isLoadingFilteredTransactions: false,
        error: action.payload,
      };
    case "REFRESH_ALL":
      return {
        ...state,
        isLoadingSummary: true,
        isLoadingTransactions: true,
        isLoadingStats: true,
        error: null,
      };
    default:
      return state;
  }
};

const TransactionContext = createContext<TransactionContextType | undefined>(
  undefined
);

export const TransactionProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const stateRef = useRef(state);

  // Update ref whenever state changes
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // Initial fetch on mount
  useEffect(() => {
    refreshDashboardSummary();
    refreshTransactions(10);
    refreshTransactionStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const refreshDashboardSummary = async () => {
    dispatch({ type: "FETCH_SUMMARY_START" });
    try {
      const response = await transactionService.getDashboardSummary();
      if (response.success && response.data) {
        dispatch({ type: "FETCH_SUMMARY_SUCCESS", payload: response.data });
      } else {
        dispatch({
          type: "FETCH_SUMMARY_FAILURE",
          payload: response.message || "Failed to fetch dashboard summary",
        });
      }
    } catch (err) {
      dispatch({
        type: "FETCH_SUMMARY_FAILURE",
        payload: err instanceof Error ? err.message : "Network error",
      });
    }
  };

  const refreshTransactions = async (limit: number = 10) => {
    dispatch({ type: "FETCH_TRANSACTIONS_START" });
    try {
      const response = await transactionService.getTransactions(limit);
      if (response.success && response.data) {
        dispatch({
          type: "FETCH_TRANSACTIONS_SUCCESS",
          payload: response.data,
        });
      } else {
        dispatch({
          type: "FETCH_TRANSACTIONS_FAILURE",
          payload: response.message || "Failed to fetch transactions",
        });
      }
    } catch (err) {
      dispatch({
        type: "FETCH_TRANSACTIONS_FAILURE",
        payload: err instanceof Error ? err.message : "Network error",
      });
    }
  };

  const refreshTransactionStats = async () => {
    dispatch({ type: "FETCH_STATS_START" });
    try {
      const response = await transactionService.getTransactionStats();
      if (response.success && response.data) {
        dispatch({ type: "FETCH_STATS_SUCCESS", payload: response.data });
      } else {
        dispatch({
          type: "FETCH_STATS_FAILURE",
          payload: response.message || "Failed to fetch transaction stats",
        });
      }
    } catch (err) {
      dispatch({
        type: "FETCH_STATS_FAILURE",
        payload: err instanceof Error ? err.message : "Network error",
      });
    }
  };

  const getFilteredTransactions = useCallback(
    async (filters: TransactionFilters) => {
      // Check current state from ref to get latest values
      const currentState = stateRef.current;

      // Check if we already have data for these exact filters
      if (
        currentState.filteredTransactions &&
        currentState.currentFilters &&
        areFiltersEqual(currentState.currentFilters, filters)
      ) {
        return;
      }

      // Filters changed or no data exists, fetch from API
      dispatch({ type: "FETCH_FILTERED_TRANSACTIONS_START", payload: filters });
      try {
        const response = await transactionService.getAllTransactions(filters);
        if (response.success && response.data) {
          dispatch({
            type: "FETCH_FILTERED_TRANSACTIONS_SUCCESS",
            payload: { data: response.data, filters },
          });
        } else {
          dispatch({
            type: "FETCH_FILTERED_TRANSACTIONS_FAILURE",
            payload:
              response.message || "Failed to fetch filtered transactions",
          });
        }
      } catch (err) {
        dispatch({
          type: "FETCH_FILTERED_TRANSACTIONS_FAILURE",
          payload: err instanceof Error ? err.message : "Network error",
        });
      }
    },
    []
  );

  const refreshAll = async (limit: number = 10) => {
    dispatch({ type: "REFRESH_ALL" });
    await Promise.all([
      refreshDashboardSummary(),
      refreshTransactions(limit),
      refreshTransactionStats(),
    ]);
  };

  const value: TransactionContextType = {
    state,
    refreshDashboardSummary,
    refreshTransactions,
    refreshTransactionStats,
    getFilteredTransactions,
    refreshAll,
  };
  return (
    <TransactionContext.Provider value={value}>
      {children}
    </TransactionContext.Provider>
  );
};

export const useTransaction = (): TransactionContextType => {
  const ctx = useContext(TransactionContext);
  if (!ctx)
    throw new Error("useTransaction must be used within a TransactionProvider");
  return ctx;
};
