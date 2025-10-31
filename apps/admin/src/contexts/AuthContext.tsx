/**
 * Admin Authentication Context
 */

import React, { createContext, useContext, useEffect, useReducer, ReactNode } from "react";
import { AdminUser, AuthApiResponse } from "@/services/auth/types";
import { authService } from "@/services/auth";

interface AuthState {
  user: AdminUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

type AuthAction =
  | { type: "AUTH_START" }
  | { type: "AUTH_SUCCESS"; payload: { user: AdminUser; token: string } }
  | { type: "AUTH_FAILURE"; payload: string }
  | { type: "AUTH_LOGOUT" };

interface AuthContextType {
  state: AuthState;
  createWallet: (email: string, password: string, fullName: string) => Promise<AuthApiResponse<any>>; // maps to createAdmin
  signin: (email: string, password: string, rememberMe?: boolean) => Promise<AuthApiResponse<any>>; // maps to login
  logout: () => Promise<void>;
}

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

const reducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case "AUTH_START":
      return { ...state, isLoading: true, error: null };
    case "AUTH_SUCCESS":
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    case "AUTH_FAILURE":
      return { ...state, isLoading: false, error: action.payload, user: null, token: null, isAuthenticated: false };
    case "AUTH_LOGOUT":
      return { ...state, user: null, token: null, isAuthenticated: false, isLoading: false, error: null };
    default:
      return state;
  }
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Initialize auth state using stored token
  useEffect(() => {
    const init = async () => {
      dispatch({ type: "AUTH_START" });
      const token = localStorage.getItem("auth_token") || sessionStorage.getItem("auth_token");
      if (!token) {
        dispatch({ type: "AUTH_FAILURE", payload: "Not authenticated" });
        return;
      }
      const me = await authService.getCurrentUser();
      if (me.success && me.data) {
        dispatch({ type: "AUTH_SUCCESS", payload: { user: me.data, token } });
      } else {
        dispatch({ type: "AUTH_FAILURE", payload: me.message || "Failed to load user" });
      }
    };
    init();
  }, []);

  // Map UI API to admin endpoints
  const createWallet = async (email: string, password: string, _fullName: string) => {
    dispatch({ type: "AUTH_START" });
    const res = await authService.createAdmin({ email, password, role: "admin" });
    if (!res.success) dispatch({ type: "AUTH_FAILURE", payload: res.message || "Signup failed" });
    else dispatch({ type: "AUTH_FAILURE", payload: "" }); // remain unauthenticated after signup
    return res;
  };

  const signin = async (email: string, password: string, rememberMe: boolean = false) => {
    dispatch({ type: "AUTH_START" });
    const res = await authService.login({ email, password }, rememberMe);
    if (res.success) {
      const me = await authService.getCurrentUser();
      if (me.success && me.data) {
        const token = localStorage.getItem("auth_token") || sessionStorage.getItem("auth_token") || "";
        dispatch({ type: "AUTH_SUCCESS", payload: { user: me.data, token } });
      } else {
        dispatch({ type: "AUTH_FAILURE", payload: me.message || "Failed to load user" });
      }
    } else {
      dispatch({ type: "AUTH_FAILURE", payload: res.message || "Login failed" });
    }
    return res;
  };

  const logout = async () => {
    await authService.logout();
    dispatch({ type: "AUTH_LOGOUT" });
  };

  const value: AuthContextType = { state, createWallet, signin, logout };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
};

