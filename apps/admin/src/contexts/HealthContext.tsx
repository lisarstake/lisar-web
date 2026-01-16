/**
 * Admin Health Context
 */

import React, { createContext, useContext, useEffect, useReducer, useCallback, ReactNode } from "react";
import { ExternalServicesHealth, AdminPanelHealth, HealthApiResponse } from "@/services/health/types";
import { healthService } from "@/services/health";

interface HealthState {
  dashboardHealth: ExternalServicesHealth | null;
  adminHealth: AdminPanelHealth | null;
  isLoading: boolean;
  error: string | null;
  lastFetched: number | null;
}

type HealthAction =
  | { type: "HEALTH_START" }
  | { type: "HEALTH_DASHBOARD_SUCCESS"; payload: ExternalServicesHealth }
  | { type: "HEALTH_ADMIN_SUCCESS"; payload: AdminPanelHealth }
  | { type: "HEALTH_FAILURE"; payload: string }
  | { type: "HEALTH_REFRESH" };

interface HealthContextType {
  state: HealthState;
  refreshDashboardHealth: () => Promise<void>;
  refreshAdminHealth: () => Promise<void>;
  refreshAll: () => Promise<void>;
}

const initialState: HealthState = {
  dashboardHealth: null,
  adminHealth: null,
  isLoading: false,
  error: null,
  lastFetched: null,
};

const reducer = (state: HealthState, action: HealthAction): HealthState => {
  switch (action.type) {
    case "HEALTH_START":
      return { ...state, isLoading: true, error: null };
    case "HEALTH_DASHBOARD_SUCCESS":
      return {
        ...state,
        dashboardHealth: action.payload,
        isLoading: false,
        error: null,
        lastFetched: Date.now(),
      };
    case "HEALTH_ADMIN_SUCCESS":
      return {
        ...state,
        adminHealth: action.payload,
        isLoading: false,
        error: null,
        lastFetched: Date.now(),
      };
    case "HEALTH_FAILURE":
      return { ...state, isLoading: false, error: action.payload };
    case "HEALTH_REFRESH":
      return { ...state, isLoading: true, error: null };
    default:
      return state;
  }
};

const HealthContext = createContext<HealthContextType | undefined>(undefined);

export const HealthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const refreshDashboardHealth = useCallback(async () => {
    dispatch({ type: "HEALTH_START" });
    try {
      const response = await healthService.getDashboardHealth();
      if (response.success && response.data) {
        dispatch({ type: "HEALTH_DASHBOARD_SUCCESS", payload: response.data });
      } else {
        dispatch({ type: "HEALTH_FAILURE", payload: response.message || "Failed to fetch dashboard health" });
      }
    } catch (err) {
      dispatch({ type: "HEALTH_FAILURE", payload: err instanceof Error ? err.message : "Network error" });
    }
  }, []);

  const refreshAdminHealth = useCallback(async () => {
    try {
      const response = await healthService.getAdminHealth();
      if (response.success && response.data) {
        dispatch({ type: "HEALTH_ADMIN_SUCCESS", payload: response.data });
      }
    } catch (err) {
  
    }
  }, []);

  const refreshAll = useCallback(async () => {
    dispatch({ type: "HEALTH_REFRESH" });
    await Promise.all([refreshDashboardHealth(), refreshAdminHealth()]);
  }, [refreshDashboardHealth, refreshAdminHealth]);

  const value: HealthContextType = { state, refreshDashboardHealth, refreshAdminHealth, refreshAll };
  return <HealthContext.Provider value={value}>{children}</HealthContext.Provider>;
};

export const useHealth = (): HealthContextType => {
  const ctx = useContext(HealthContext);
  if (!ctx) throw new Error("useHealth must be used within a HealthProvider");
  return ctx;
};

