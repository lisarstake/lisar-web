/**
 * Admin Validator Context
 */

import React, { createContext, useContext, useEffect, useReducer, useCallback, ReactNode } from "react";
import { Validator, ValidatorApiResponse, ValidatorFilters, PaginatedValidatorsResponse, UpdateValidatorRequest, UpdateValidatorStatusRequest } from "@/services/validators/types";
import { validatorService } from "@/services/validators";

interface ValidatorState {
  validators: Validator[];
  paginatedValidators: PaginatedValidatorsResponse | null;
  selectedValidator: Validator | null;
  lastFilters: ValidatorFilters | null;
  isLoading: boolean;
  isLoadingSingle: boolean;
  isLoadingCreate: boolean;
  isLoadingUpdate: boolean;
  isLoadingUpdateStatus: boolean;
  error: string | null;
}

type ValidatorAction =
  | { type: "FETCH_VALIDATORS_START" }
  | { type: "FETCH_VALIDATORS_SUCCESS"; payload: PaginatedValidatorsResponse; filters: ValidatorFilters | null }
  | { type: "FETCH_VALIDATORS_FAILURE"; payload: string }
  | { type: "FETCH_VALIDATOR_START" }
  | { type: "FETCH_VALIDATOR_SUCCESS"; payload: Validator }
  | { type: "FETCH_VALIDATOR_FAILURE"; payload: string }
  | { type: "CREATE_VALIDATOR_START" }
  | { type: "CREATE_VALIDATOR_SUCCESS"; payload: Validator }
  | { type: "CREATE_VALIDATOR_FAILURE"; payload: string }
  | { type: "UPDATE_VALIDATOR_START" }
  | { type: "UPDATE_VALIDATOR_SUCCESS"; payload: Validator }
  | { type: "UPDATE_VALIDATOR_FAILURE"; payload: string }
  | { type: "UPDATE_VALIDATOR_STATUS_START" }
  | { type: "UPDATE_VALIDATOR_STATUS_SUCCESS"; payload: Validator }
  | { type: "UPDATE_VALIDATOR_STATUS_FAILURE"; payload: string }
  | { type: "CLEAR_SELECTED_VALIDATOR" }
  | { type: "CLEAR_ERROR" };

interface ValidatorContextType {
  state: ValidatorState;
  getValidators: (filters?: ValidatorFilters, forceRefresh?: boolean) => Promise<ValidatorApiResponse<PaginatedValidatorsResponse>>;
  getValidatorById: (id: string) => Promise<ValidatorApiResponse<Validator>>;
  createValidator: (request: { name: string; address: string; protocol: string; fee_pct: number; apy: number }) => Promise<ValidatorApiResponse<Validator>>;
  updateValidator: (id: string, request: UpdateValidatorRequest) => Promise<ValidatorApiResponse<Validator>>;
  updateValidatorStatus: (id: string, request: UpdateValidatorStatusRequest) => Promise<ValidatorApiResponse<Validator>>;
  clearSelectedValidator: () => void;
  clearError: () => void;
}

const initialState: ValidatorState = {
  validators: [],
  paginatedValidators: null,
  selectedValidator: null,
  lastFilters: null,
  isLoading: false,
  isLoadingSingle: false,
  isLoadingCreate: false,
  isLoadingUpdate: false,
  isLoadingUpdateStatus: false,
  error: null,
};

const reducer = (state: ValidatorState, action: ValidatorAction): ValidatorState => {
  switch (action.type) {
    case "FETCH_VALIDATORS_START":
      return { ...state, isLoading: true, error: null };
    case "FETCH_VALIDATORS_SUCCESS":
      return {
        ...state,
        validators: action.payload.validators,
        paginatedValidators: action.payload,
        lastFilters: action.filters,
        isLoading: false,
        error: null,
      };
    case "FETCH_VALIDATORS_FAILURE":
      return { ...state, isLoading: false, error: action.payload, validators: [], paginatedValidators: null };
    case "FETCH_VALIDATOR_START":
      return { ...state, isLoadingSingle: true, error: null };
    case "FETCH_VALIDATOR_SUCCESS":
      return {
        ...state,
        selectedValidator: action.payload,
        isLoadingSingle: false,
        error: null,
      };
    case "FETCH_VALIDATOR_FAILURE":
      return { ...state, isLoadingSingle: false, error: action.payload, selectedValidator: null };
    case "CREATE_VALIDATOR_START":
      return { ...state, isLoadingCreate: true, error: null };
    case "CREATE_VALIDATOR_SUCCESS":
      return {
        ...state,
        validators: [...state.validators, action.payload],
        // Invalidate cache so list refreshes on next fetch
        lastFilters: null,
        paginatedValidators: state.paginatedValidators
          ? {
              ...state.paginatedValidators,
              validators: [...state.paginatedValidators.validators, action.payload],
              total: (state.paginatedValidators.total || 0) + 1,
            }
          : null,
        isLoadingCreate: false,
        error: null,
      };
    case "CREATE_VALIDATOR_FAILURE":
      return { ...state, isLoadingCreate: false, error: action.payload };
    case "UPDATE_VALIDATOR_START":
      return { ...state, isLoadingUpdate: true, error: null };
    case "UPDATE_VALIDATOR_SUCCESS":
      return {
        ...state,
        validators: state.validators.map((v) =>
          v.id === action.payload.id ? action.payload : v
        ),
        selectedValidator: state.selectedValidator?.id === action.payload.id
          ? action.payload
          : state.selectedValidator,
        paginatedValidators: state.paginatedValidators
          ? {
              ...state.paginatedValidators,
              validators: state.paginatedValidators.validators.map((v) =>
                v.id === action.payload.id ? action.payload : v
              ),
            }
          : null,
        isLoadingUpdate: false,
        error: null,
      };
    case "UPDATE_VALIDATOR_FAILURE":
      return { ...state, isLoadingUpdate: false, error: action.payload };
    case "UPDATE_VALIDATOR_STATUS_START":
      return { ...state, isLoadingUpdateStatus: true, error: null };
    case "UPDATE_VALIDATOR_STATUS_SUCCESS":
      return {
        ...state,
        validators: state.validators.map((v) =>
          v.id === action.payload.id ? action.payload : v
        ),
        selectedValidator: state.selectedValidator?.id === action.payload.id
          ? action.payload
          : state.selectedValidator,
        paginatedValidators: state.paginatedValidators
          ? {
              ...state.paginatedValidators,
              validators: state.paginatedValidators.validators.map((v) =>
                v.id === action.payload.id ? action.payload : v
              ),
            }
          : null,
        isLoadingUpdateStatus: false,
        error: null,
      };
    case "UPDATE_VALIDATOR_STATUS_FAILURE":
      return { ...state, isLoadingUpdateStatus: false, error: action.payload };
    case "CLEAR_SELECTED_VALIDATOR":
      return { ...state, selectedValidator: null };
    case "CLEAR_ERROR":
      return { ...state, error: null };
    default:
      return state;
  }
};

const ValidatorContext = createContext<ValidatorContextType | undefined>(undefined);

export const ValidatorProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Helper function to compare filters
  const filtersMatch = useCallback((f1: ValidatorFilters | null | undefined, f2: ValidatorFilters | null | undefined): boolean => {
    if (!f1 && !f2) return true;
    if (!f1 || !f2) return false;
    return (
      (f1.page ?? 1) === (f2.page ?? 1) &&
      (f1.limit ?? 20) === (f2.limit ?? 20) &&
      (f1.status ?? undefined) === (f2.status ?? undefined)
    );
  }, []);

  const getValidators = useCallback(async (filters?: ValidatorFilters, forceRefresh: boolean = false): Promise<ValidatorApiResponse<PaginatedValidatorsResponse>> => {
    // Check if we have cached data for the same filters
    if (!forceRefresh && state.paginatedValidators && filtersMatch(state.lastFilters, filters)) {
      // Return cached data without making a request
      return {
        success: true,
        data: state.paginatedValidators,
      } as ValidatorApiResponse<PaginatedValidatorsResponse>;
    }

    dispatch({ type: "FETCH_VALIDATORS_START" });
    try {
      const response = await validatorService.getValidators(filters);
      if (response.success && response.data) {
        dispatch({ type: "FETCH_VALIDATORS_SUCCESS", payload: response.data, filters: filters ?? null });
      } else {
        dispatch({
          type: "FETCH_VALIDATORS_FAILURE",
          payload: response.message || "Failed to fetch validators",
        });
      }
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Network error";
      dispatch({ type: "FETCH_VALIDATORS_FAILURE", payload: errorMessage });
      return { success: false, error: errorMessage } as ValidatorApiResponse<PaginatedValidatorsResponse>;
    }
  }, [state.paginatedValidators, state.lastFilters, filtersMatch]);

  const getValidatorById = useCallback(async (id: string): Promise<ValidatorApiResponse<Validator>> => {
    dispatch({ type: "FETCH_VALIDATOR_START" });
    try {
      const response = await validatorService.getValidatorById(id);
      if (response.success && response.data) {
        dispatch({ type: "FETCH_VALIDATOR_SUCCESS", payload: response.data });
      } else {
        dispatch({
          type: "FETCH_VALIDATOR_FAILURE",
          payload: response.message || "Failed to fetch validator",
        });
      }
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Network error";
      dispatch({ type: "FETCH_VALIDATOR_FAILURE", payload: errorMessage });
      return { success: false, error: errorMessage } as ValidatorApiResponse<Validator>;
    }
  }, []);

  const createValidator = useCallback(async (request: { name: string; address: string; protocol: string; fee_pct: number; apy: number }): Promise<ValidatorApiResponse<Validator>> => {
    dispatch({ type: "CREATE_VALIDATOR_START" });
    try {
      const response = await validatorService.createValidator(request);
      if (response.success && response.data) {
        dispatch({ type: "CREATE_VALIDATOR_SUCCESS", payload: response.data });
      } else {
        dispatch({
          type: "CREATE_VALIDATOR_FAILURE",
          payload: response.message || "Failed to create validator",
        });
      }
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Network error";
      dispatch({ type: "CREATE_VALIDATOR_FAILURE", payload: errorMessage });
      return { success: false, error: errorMessage } as ValidatorApiResponse<Validator>;
    }
  }, []);

  const updateValidator = useCallback(async (id: string, request: UpdateValidatorRequest): Promise<ValidatorApiResponse<Validator>> => {
    dispatch({ type: "UPDATE_VALIDATOR_START" });
    try {
      const response = await validatorService.updateValidator(id, request);
      if (response.success && response.data) {
        dispatch({ type: "UPDATE_VALIDATOR_SUCCESS", payload: response.data });
      } else {
        dispatch({
          type: "UPDATE_VALIDATOR_FAILURE",
          payload: response.message || "Failed to update validator",
        });
      }
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Network error";
      dispatch({ type: "UPDATE_VALIDATOR_FAILURE", payload: errorMessage });
      return { success: false, error: errorMessage } as ValidatorApiResponse<Validator>;
    }
  }, []);

  const updateValidatorStatus = useCallback(async (id: string, request: UpdateValidatorStatusRequest): Promise<ValidatorApiResponse<Validator>> => {
    dispatch({ type: "UPDATE_VALIDATOR_STATUS_START" });
    try {
      const response = await validatorService.updateValidatorStatus(id, request);
      if (response.success && response.data) {
        dispatch({ type: "UPDATE_VALIDATOR_STATUS_SUCCESS", payload: response.data });
      } else {
        dispatch({
          type: "UPDATE_VALIDATOR_STATUS_FAILURE",
          payload: response.message || "Failed to update validator status",
        });
      }
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Network error";
      dispatch({ type: "UPDATE_VALIDATOR_STATUS_FAILURE", payload: errorMessage });
      return { success: false, error: errorMessage } as ValidatorApiResponse<Validator>;
    }
  }, []);

  const clearSelectedValidator = () => {
    dispatch({ type: "CLEAR_SELECTED_VALIDATOR" });
  };

  const clearError = () => {
    dispatch({ type: "CLEAR_ERROR" });
  };

  const value: ValidatorContextType = {
    state,
    getValidators,
    getValidatorById,
    createValidator,
    updateValidator,
    updateValidatorStatus,
    clearSelectedValidator,
    clearError,
  };

  return <ValidatorContext.Provider value={value}>{children}</ValidatorContext.Provider>;
};

export const useValidator = (): ValidatorContextType => {
  const ctx = useContext(ValidatorContext);
  if (!ctx) throw new Error("useValidator must be used within a ValidatorProvider");
  return ctx;
};

