/**
 * Admin User Context
 */

import React, { createContext, useContext, useReducer, useCallback, ReactNode } from "react";
import { User, UserApiResponse, UserFilters, PaginatedUsersResponse, UserStats, UserDetail, SuspendUserRequest, UpdateUserBalanceRequest } from "@/services/users/types";
import { userService } from "@/services/users";

interface UserState {
  users: User[];
  paginatedUsers: PaginatedUsersResponse | null;
  userStats: UserStats | null;
  selectedUser: UserDetail | null;
  lastFilters: UserFilters | null;
  isLoading: boolean;
  isLoadingStats: boolean;
  isLoadingSingle: boolean;
  isLoadingSuspend: boolean;
  isLoadingUnsuspend: boolean;
  isLoadingBalanceUpdate: boolean;
  error: string | null;
}

type UserAction =
  | { type: "FETCH_USERS_START" }
  | { type: "FETCH_USERS_SUCCESS"; payload: PaginatedUsersResponse; filters: UserFilters | null }
  | { type: "FETCH_USERS_FAILURE"; payload: string }
  | { type: "FETCH_USER_STATS_START" }
  | { type: "FETCH_USER_STATS_SUCCESS"; payload: UserStats }
  | { type: "FETCH_USER_STATS_FAILURE"; payload: string }
  | { type: "FETCH_USER_START" }
  | { type: "FETCH_USER_SUCCESS"; payload: UserDetail }
  | { type: "FETCH_USER_FAILURE"; payload: string }
  | { type: "SUSPEND_USER_START" }
  | { type: "SUSPEND_USER_SUCCESS" }
  | { type: "SUSPEND_USER_FAILURE"; payload: string }
  | { type: "UNSUSPEND_USER_START" }
  | { type: "UNSUSPEND_USER_SUCCESS" }
  | { type: "UNSUSPEND_USER_FAILURE"; payload: string }
  | { type: "UPDATE_USER_BALANCE_START" }
  | { type: "UPDATE_USER_BALANCE_SUCCESS" }
  | { type: "UPDATE_USER_BALANCE_FAILURE"; payload: string }
  | { type: "CLEAR_SELECTED_USER" }
  | { type: "CLEAR_ERROR" };

interface UserContextType {
  state: UserState;
  getUserStats: () => Promise<UserApiResponse<UserStats>>;
  getUsers: (filters?: UserFilters, forceRefresh?: boolean) => Promise<UserApiResponse<PaginatedUsersResponse>>;
  getUserById: (userId: string) => Promise<UserApiResponse<UserDetail>>;
  suspendUser: (userId: string, request: SuspendUserRequest) => Promise<UserApiResponse<void>>;
  unsuspendUser: (userId: string) => Promise<UserApiResponse<void>>;
  updateUserBalance: (userId: string, request: UpdateUserBalanceRequest) => Promise<UserApiResponse<void>>;
  clearSelectedUser: () => void;
  clearError: () => void;
}

const initialState: UserState = {
  users: [],
  paginatedUsers: null,
  userStats: null,
  selectedUser: null,
  lastFilters: null,
  isLoading: false,
  isLoadingStats: false,
  isLoadingSingle: false,
  isLoadingSuspend: false,
  isLoadingUnsuspend: false,
  isLoadingBalanceUpdate: false,
  error: null,
};

const reducer = (state: UserState, action: UserAction): UserState => {
  switch (action.type) {
    case "FETCH_USERS_START":
      return { ...state, isLoading: true, error: null };
    case "FETCH_USERS_SUCCESS":
      return {
        ...state,
        users: action.payload.users,
        paginatedUsers: action.payload,
        lastFilters: action.filters,
        isLoading: false,
        error: null,
      };
    case "FETCH_USERS_FAILURE":
      return { ...state, isLoading: false, error: action.payload, users: [], paginatedUsers: null };
    case "FETCH_USER_STATS_START":
      return { ...state, isLoadingStats: true, error: null };
    case "FETCH_USER_STATS_SUCCESS":
      return {
        ...state,
        userStats: action.payload,
        isLoadingStats: false,
        error: null,
      };
    case "FETCH_USER_STATS_FAILURE":
      return { ...state, isLoadingStats: false, error: action.payload };
    case "FETCH_USER_START":
      return { ...state, isLoadingSingle: true, error: null };
    case "FETCH_USER_SUCCESS":
      return {
        ...state,
        selectedUser: action.payload,
        isLoadingSingle: false,
        error: null,
      };
    case "FETCH_USER_FAILURE":
      return { ...state, isLoadingSingle: false, error: action.payload, selectedUser: null };
    case "SUSPEND_USER_START":
      return { ...state, isLoadingSuspend: true, error: null };
    case "SUSPEND_USER_SUCCESS":
      return {
        ...state,
        isLoadingSuspend: false,
        // Invalidate cache so list refreshes on next fetch
        lastFilters: null,
        error: null,
      };
    case "SUSPEND_USER_FAILURE":
      return { ...state, isLoadingSuspend: false, error: action.payload };
    case "UNSUSPEND_USER_START":
      return { ...state, isLoadingUnsuspend: true, error: null };
    case "UNSUSPEND_USER_SUCCESS":
      return {
        ...state,
        isLoadingUnsuspend: false,
        // Invalidate cache so list refreshes on next fetch
        lastFilters: null,
        error: null,
      };
    case "UNSUSPEND_USER_FAILURE":
      return { ...state, isLoadingUnsuspend: false, error: action.payload };
    case "UPDATE_USER_BALANCE_START":
      return { ...state, isLoadingBalanceUpdate: true, error: null };
    case "UPDATE_USER_BALANCE_SUCCESS":
      return {
        ...state,
        isLoadingBalanceUpdate: false,
        // Invalidate cache so list refreshes on next fetch
        lastFilters: null,
        error: null,
      };
    case "UPDATE_USER_BALANCE_FAILURE":
      return { ...state, isLoadingBalanceUpdate: false, error: action.payload };
    case "CLEAR_SELECTED_USER":
      return { ...state, selectedUser: null };
    case "CLEAR_ERROR":
      return { ...state, error: null };
    default:
      return state;
  }
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Helper function to compare filters
  const filtersMatch = useCallback((f1: UserFilters | null | undefined, f2: UserFilters | null | undefined): boolean => {
    if (!f1 && !f2) return true;
    if (!f1 || !f2) return false;
    return (
      (f1.page ?? 1) === (f2.page ?? 1) &&
      (f1.limit ?? 50) === (f2.limit ?? 50) &&
      (f1.status ?? "all") === (f2.status ?? "all") &&
      (f1.sortBy ?? undefined) === (f2.sortBy ?? undefined) &&
      (f1.sortOrder ?? "asc") === (f2.sortOrder ?? "asc")
    );
  }, []);

  const getUserStats = useCallback(async (): Promise<UserApiResponse<UserStats>> => {
    dispatch({ type: "FETCH_USER_STATS_START" });
    try {
      const response = await userService.getUserStats();
      if (response.success && response.data) {
        dispatch({ type: "FETCH_USER_STATS_SUCCESS", payload: response.data });
      } else {
        dispatch({
          type: "FETCH_USER_STATS_FAILURE",
          payload: response.message || "Failed to fetch user statistics",
        });
      }
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Network error";
      dispatch({ type: "FETCH_USER_STATS_FAILURE", payload: errorMessage });
      return { success: false, error: errorMessage } as UserApiResponse<UserStats>;
    }
  }, []);

  const getUsers = useCallback(async (filters?: UserFilters, forceRefresh: boolean = false): Promise<UserApiResponse<PaginatedUsersResponse>> => {
    // Check if we have cached data for the same filters
    if (!forceRefresh && state.paginatedUsers && filtersMatch(state.lastFilters, filters)) {
      // Return cached data without making a request
      return {
        success: true,
        data: state.paginatedUsers,
      } as UserApiResponse<PaginatedUsersResponse>;
    }

    dispatch({ type: "FETCH_USERS_START" });
    try {
      const response = await userService.getUsers(filters);
      if (response.success && response.data) {
        dispatch({ type: "FETCH_USERS_SUCCESS", payload: response.data, filters: filters ?? null });
      } else {
        dispatch({
          type: "FETCH_USERS_FAILURE",
          payload: response.message || "Failed to fetch users",
        });
      }
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Network error";
      dispatch({ type: "FETCH_USERS_FAILURE", payload: errorMessage });
      return { success: false, error: errorMessage } as UserApiResponse<PaginatedUsersResponse>;
    }
  }, [state.paginatedUsers, state.lastFilters, filtersMatch]);

  const getUserById = useCallback(async (userId: string): Promise<UserApiResponse<UserDetail>> => {
    dispatch({ type: "FETCH_USER_START" });
    try {
      const response = await userService.getUserById(userId);
      if (response.success && response.data) {
        dispatch({ type: "FETCH_USER_SUCCESS", payload: response.data });
      } else {
        dispatch({
          type: "FETCH_USER_FAILURE",
          payload: response.message || "Failed to fetch user",
        });
      }
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Network error";
      dispatch({ type: "FETCH_USER_FAILURE", payload: errorMessage });
      return { success: false, error: errorMessage } as UserApiResponse<UserDetail>;
    }
  }, []);

  const suspendUser = useCallback(async (userId: string, request: SuspendUserRequest): Promise<UserApiResponse<void>> => {
    dispatch({ type: "SUSPEND_USER_START" });
    try {
      const response = await userService.suspendUser(userId, request);
      if (response.success) {
        dispatch({ type: "SUSPEND_USER_SUCCESS" });
      } else {
        dispatch({
          type: "SUSPEND_USER_FAILURE",
          payload: response.message || "Failed to suspend user",
        });
      }
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Network error";
      dispatch({ type: "SUSPEND_USER_FAILURE", payload: errorMessage });
      return { success: false, error: errorMessage } as UserApiResponse<void>;
    }
  }, []);

  const unsuspendUser = useCallback(async (userId: string): Promise<UserApiResponse<void>> => {
    dispatch({ type: "UNSUSPEND_USER_START" });
    try {
      const response = await userService.unsuspendUser(userId);
      if (response.success) {
        dispatch({ type: "UNSUSPEND_USER_SUCCESS" });
      } else {
        dispatch({
          type: "UNSUSPEND_USER_FAILURE",
          payload: response.message || "Failed to unsuspend user",
        });
      }
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Network error";
      dispatch({ type: "UNSUSPEND_USER_FAILURE", payload: errorMessage });
      return { success: false, error: errorMessage } as UserApiResponse<void>;
    }
  }, []);

  const updateUserBalance = useCallback(async (userId: string, request: UpdateUserBalanceRequest): Promise<UserApiResponse<void>> => {
    dispatch({ type: "UPDATE_USER_BALANCE_START" });
    try {
      const response = await userService.updateUserBalance(userId, request);
      if (response.success) {
        dispatch({ type: "UPDATE_USER_BALANCE_SUCCESS" });
      } else {
        dispatch({
          type: "UPDATE_USER_BALANCE_FAILURE",
          payload: response.message || "Failed to update user balance",
        });
      }
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Network error";
      dispatch({ type: "UPDATE_USER_BALANCE_FAILURE", payload: errorMessage });
      return { success: false, error: errorMessage } as UserApiResponse<void>;
    }
  }, []);

  const clearSelectedUser = useCallback(() => {
    dispatch({ type: "CLEAR_SELECTED_USER" });
  }, []);

  const clearError = useCallback(() => {
    dispatch({ type: "CLEAR_ERROR" });
  }, []);

  const value: UserContextType = {
    state,
    getUserStats,
    getUsers,
    getUserById,
    suspendUser,
    unsuspendUser,
    updateUserBalance,
    clearSelectedUser,
    clearError,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUser = (): UserContextType => {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used within a UserProvider");
  return ctx;
};

