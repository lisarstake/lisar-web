/**
 * Authentication Context
 * Provides authentication state and methods throughout the app
 */

import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  ReactNode,
} from "react";
import { User, Wallet, Session, AuthApiResponse } from "@/services/auth/types";
import { authService } from "@/services/auth";
import mixpanel from 'mixpanel-browser';

// Auth State
interface AuthState {
  user: User | null;
  wallet: Wallet | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// Auth Actions
type AuthAction =
  | { type: "AUTH_START" }
  | {
      type: "AUTH_SUCCESS";
      payload: { user: User; wallet: Wallet; session: Session };
    }
  | { type: "AUTH_FAILURE"; payload: string }
  | { type: "AUTH_LOGOUT" }
  | { type: "AUTH_CLEAR_ERROR" }
  | { type: "AUTH_UPDATE_USER"; payload: User };

// Auth Context Type
interface AuthContextType {
  state: AuthState;
  createWallet: (
    email: string,
    password: string,
    fullName: string
  ) => Promise<AuthApiResponse<any>>;
  signin: (
    email: string,
    password: string,
    rememberMe?: boolean
  ) => Promise<AuthApiResponse<any>>;
  signinWithGoogle: () => Promise<void>;
  handleGoogleCallback: () => Promise<AuthApiResponse<any>>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<AuthApiResponse<any>>;
  resetPassword: (
    accessToken: string,
    newPassword: string
  ) => Promise<AuthApiResponse<any>>;
  updateProfile: (data: {
    full_name?: string;
    username?: string;
    email?: string;
    img?: string;
    DOB?: string;
    country?: string;
    state?: string;
    fiat_type?: string;
  }) => Promise<AuthApiResponse<User>>;
  clearError: () => void;
  refreshUser: () => Promise<void>;
}

// Initial State
const initialState: AuthState = {
  user: null,
  wallet: null,
  session: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

// Auth Reducer
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case "AUTH_START":
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case "AUTH_SUCCESS":
      return {
        ...state,
        user: action.payload.user,
        wallet: action.payload.wallet,
        session: action.payload.session,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    case "AUTH_FAILURE":
      return {
        ...state,
        user: null,
        wallet: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      };
    case "AUTH_LOGOUT":
      return {
        ...state,
        user: null,
        wallet: null,
        session: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };
    case "AUTH_CLEAR_ERROR":
      return {
        ...state,
        error: null,
      };
    case "AUTH_UPDATE_USER":
      return {
        ...state,
        user: action.payload,
      };
    default:
      return state;
  }
};

// Create Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth Provider Component
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    const initializeAuth = async () => {
      const token =
        localStorage.getItem("auth_token") ||
        sessionStorage.getItem("auth_token");
      const refreshToken =
        localStorage.getItem("refresh_token") ||
        sessionStorage.getItem("refresh_token");
      const expiry =
        localStorage.getItem("auth_expiry") ||
        sessionStorage.getItem("auth_expiry");

      if (token) {
        try {
          dispatch({ type: "AUTH_START" });

          const isExpired = expiry && Date.now() > parseInt(expiry) * 1000;

          if (isExpired && refreshToken) {
            // Try to refresh the token
            const refreshResponse = await authService.refreshToken({
              refreshToken,
            });

            if (refreshResponse.success && refreshResponse.data) {
              // Token refreshed successfully, get user data
              const response = await authService.getCurrentUser();

              if (response.success && response.data) {
                const wallet: Wallet = {
                  id: response.data.wallet_id || "wallet_id",
                  address: response.data.wallet_address,
                  chain_type: response.data.chain_type || "ethereum",
                };

                const session: Session = {
                  access_token: refreshResponse.data.access_token,
                  refresh_token: refreshResponse.data.refresh_token,
                  expires_in: refreshResponse.data.expires_in,
                  expires_at: refreshResponse.data.expires_at,
                  token_type: refreshResponse.data.token_type,
                };

                dispatch({
                  type: "AUTH_SUCCESS",
                  payload: { user: response.data, wallet, session },
                });
              } else {
                throw new Error("Failed to get user after refresh");
              }
            } else {
              throw new Error("Token refresh failed");
            }
          } else {
            // Token not expired, validate it
            const response = await authService.getCurrentUser();
            if (response.success && response.data) {
              const wallet: Wallet = {
                id: response.data.wallet_id || "wallet_id",
                address: response.data.wallet_address,
                chain_type: response.data.chain_type || "ethereum",
              };

              const session: Session = {
                access_token: token,
                refresh_token: refreshToken || "",
                expires_in: 3600,
                expires_at: expiry
                  ? parseInt(expiry)
                  : Date.now() / 1000 + 3600,
                token_type: "bearer",
              };

              dispatch({
                type: "AUTH_SUCCESS",
                payload: { user: response.data, wallet, session },
              });
            } else {
              localStorage.removeItem("auth_token");
              localStorage.removeItem("refresh_token");
              localStorage.removeItem("auth_expiry");
              sessionStorage.removeItem("auth_token");
              sessionStorage.removeItem("refresh_token");
              sessionStorage.removeItem("auth_expiry");
              dispatch({ type: "AUTH_LOGOUT" });
            }
          }
        } catch (error) {
          localStorage.removeItem("auth_token");
          localStorage.removeItem("refresh_token");
          localStorage.removeItem("auth_expiry");
          sessionStorage.removeItem("auth_token");
          sessionStorage.removeItem("refresh_token");
          sessionStorage.removeItem("auth_expiry");
          dispatch({ type: "AUTH_LOGOUT" });
        }
      } else {
        dispatch({ type: "AUTH_LOGOUT" });
      }
    };

    initializeAuth();
  }, []);

  // Listen for logout events from HTTP interceptor
  useEffect(() => {
    const handleLogout = () => {
      dispatch({ type: "AUTH_LOGOUT" });
    };

    window.addEventListener("auth:logout", handleLogout);
    return () => window.removeEventListener("auth:logout", handleLogout);
  }, []);

  useEffect(() => {
    if (!state.isAuthenticated || !state.session?.refresh_token) return;

    const checkTokenExpiry = async () => {
      const expiry =
        localStorage.getItem("auth_expiry") ||
        sessionStorage.getItem("auth_expiry");
      const refreshToken =
        localStorage.getItem("refresh_token") ||
        sessionStorage.getItem("refresh_token");

      if (!expiry || !refreshToken) return;

      const expiresAt = parseInt(expiry) * 1000;
      const now = Date.now();
      const timeUntilExpiry = expiresAt - now;
      const fiveMinutes = 5 * 60 * 1000;

      if (timeUntilExpiry > 0 && timeUntilExpiry < fiveMinutes) {
        try {
          const refreshResponse = await authService.refreshToken({
            refreshToken,
          });

          if (refreshResponse.success && refreshResponse.data) {
            const response = await authService.getCurrentUser();

            if (response.success && response.data) {
              const wallet: Wallet = {
                id: response.data.wallet_id || "wallet_id",
                address: response.data.wallet_address,
                chain_type: response.data.chain_type || "ethereum",
              };

              const session: Session = {
                access_token: refreshResponse.data.access_token,
                refresh_token: refreshResponse.data.refresh_token,
                expires_in: refreshResponse.data.expires_in,
                expires_at: refreshResponse.data.expires_at,
                token_type: refreshResponse.data.token_type,
              };

              dispatch({
                type: "AUTH_SUCCESS",
                payload: { user: response.data, wallet, session },
              });
            }
          }
        } catch (error) {
          console.error("Proactive token refresh failed:", error);
        }
      }
    };

    const interval = setInterval(checkTokenExpiry, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [state.isAuthenticated, state.session?.refresh_token]);

  const createWallet = async (
    email: string,
    password: string,
    fullName: string
  ): Promise<AuthApiResponse<any>> => {
    dispatch({ type: "AUTH_START" });

    try {
      const response = await authService.createWallet({
        email,
        password,
        full_name: fullName,
      });
      if (response.success && response.data) {
        // Track Sign Up event
        mixpanel.track('Sign Up', {
          email: email,
          signup_method: 'email',
          full_name: fullName,
        });
        
        // Return the wallet data for the next step
        return response;
      } else {
        dispatch({
          type: "AUTH_FAILURE",
          payload: response.message || "Wallet creation failed",
        });
        return response;
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Wallet creation failed";
      dispatch({ type: "AUTH_FAILURE", payload: errorMessage });
      return {
        success: false,
        message: errorMessage,
        data: null,
        error: errorMessage,
      };
    }
  };

  const signin = async (
    email: string,
    password: string,
    rememberMe: boolean = false
  ): Promise<AuthApiResponse<any>> => {
    dispatch({ type: "AUTH_START" });

    try {
      // Check if there are pending confirmation tokens
      const pendingTokens = localStorage.getItem("pending_confirmation_tokens");

      if (pendingTokens) {
        const tokens = JSON.parse(pendingTokens);

        // Choose storage based on rememberMe
        const storage = rememberMe ? localStorage : sessionStorage;

        // Store tokens
        storage.setItem("auth_token", tokens.access_token);
        storage.setItem("refresh_token", tokens.refresh_token);

        // Store expiration if rememberMe is true
        if (rememberMe && tokens.expires_at) {
          storage.setItem("auth_expiry", tokens.expires_at.toString());
        }

        // Clear pending tokens
        localStorage.removeItem("pending_confirmation_tokens");

        // Get user info from token
        const userResponse = await authService.getCurrentUser();

        if (userResponse && userResponse.success && userResponse.data) {
          // Create wallet info from user data
          const wallet: Wallet = {
            id: userResponse.data.wallet_id || "wallet_id",
            address: userResponse.data.wallet_address,
            chain_type: userResponse.data.chain_type || "ethereum",
          };

          // Create session info
          const session: Session = {
            access_token: tokens.access_token,
            refresh_token: tokens.refresh_token,
            expires_in: tokens.expires_in,
            expires_at: tokens.expires_at,
            token_type: tokens.token_type || "bearer",
          };

          dispatch({
            type: "AUTH_SUCCESS",
            payload: {
              user: userResponse.data,
              wallet,
              session,
            },
          });

          // Identify user and track Sign In
          mixpanel.identify(userResponse.data.user_id);
          mixpanel.people.set({
            '$email': userResponse.data.email,
            '$name': userResponse.data.full_name,
            'username': userResponse.data.username,
            'wallet_address': userResponse.data.wallet_address,
          });
          mixpanel.track('Sign In', {
            user_id: userResponse.data.user_id,
            email: userResponse.data.email,
            login_method: 'email',
            success: true,
          });

          return {
            success: true,
            message: "Login successful",
            data: { user: userResponse.data, session },
            error: undefined,
          };
        } else {
          dispatch({
            type: "AUTH_FAILURE",
            payload: "Invalid email or password",
          });
          return {
            success: false,
            message: "Invalid email or password",
            data: null,
            error: "Invalid email or password",
          };
        }
      } else {
        // Normal login flow (no pending confirmation tokens)
        const response = await authService.signin({ email, password });
        if (response.success && response.data) {
          // Choose storage based on rememberMe
          const storage = rememberMe ? localStorage : sessionStorage;

          // Store tokens
          storage.setItem("auth_token", response.data.session.access_token);
          storage.setItem("refresh_token", response.data.session.refresh_token);

          // Store expiration if rememberMe is true
          if (rememberMe && response.data.session.expires_at) {
            storage.setItem(
              "auth_expiry",
              response.data.session.expires_at.toString()
            );
          }

          // Get user data from the profile endpoint
          const userResponse = await authService.getCurrentUser();

          if (userResponse && userResponse.success && userResponse.data) {
            // Get wallet info from user data
            const wallet: Wallet = {
              id: userResponse.data.wallet_id || "wallet_id",
              address: userResponse.data.wallet_address,
              chain_type: userResponse.data.chain_type || "ethereum",
            };

            dispatch({
              type: "AUTH_SUCCESS",
              payload: {
                user: userResponse.data,
                wallet,
                session: response.data.session,
              },
            });

            // Identify user and track Sign In
            mixpanel.identify(userResponse.data.user_id);
            mixpanel.people.set({
              '$email': userResponse.data.email,
              '$name': userResponse.data.full_name,
              'username': userResponse.data.username,
              'wallet_address': userResponse.data.wallet_address,
            });
            mixpanel.track('Sign In', {
              user_id: userResponse.data.user_id,
              email: userResponse.data.email,
              login_method: 'email',
              success: true,
            });
          }
        } else {
          dispatch({
            type: "AUTH_FAILURE",
            payload: response.message || "Signin failed",
          });
        }
        return response;
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Signin failed";
      dispatch({ type: "AUTH_FAILURE", payload: errorMessage });
      return {
        success: false,
        message: errorMessage,
        data: null,
        error: errorMessage,
      };
    }
  };

  const signinWithGoogle = async (): Promise<void> => {
    try {
      const response = await authService.initiateGoogleAuth();

      if (!response.success) {
        dispatch({
          type: "AUTH_FAILURE",
          payload: response.message || "Google OAuth failed",
        });
      }
      // If successful, the user will be redirected to Google OAuth
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Google OAuth failed";
      dispatch({ type: "AUTH_FAILURE", payload: errorMessage });
    }
  };

  const handleGoogleCallback = async (): Promise<AuthApiResponse<any>> => {
    try {
      dispatch({ type: "AUTH_START" });

      const response = await authService.handleGoogleCallback();

      if (response.success && response.data) {
        const data = response.data as any;

        const avatarUrl =
          data.user.user_metadata?.avatar_url ||
          data.user.user_metadata?.picture ||
          "";

        // Convert Google OAuth user to our User format
        const user: User = {
          user_id: data.user.id,
          email: data.user.email,
          username: data.user.email.split("@")[0],
          full_name: data.user.user_metadata?.full_name || "",
          wallet_address:
            data.user.user_metadata?.wallet_address ||
            data.wallet.wallet_address,
          wallet_id: data.wallet.wallet_id,
          chain_type: "ethereum",
          privy_user_id: data.wallet.privy_user_id,
          fiat_balance: 0,
          lpt_balance: 0,
          is_suspended: false,
          created_date: data.user.created_at,
          updated_at: data.user.updated_at,
          img: avatarUrl,
          is_totp_enabled: false,
        };

        const wallet: Wallet = {
          id: data.wallet.wallet_id,
          address: data.wallet.wallet_address,
          chain_type: "ethereum",
        };

        dispatch({
          type: "AUTH_SUCCESS",
          payload: {
            user,
            wallet,
            session: data.session,
          },
        });

        // Check if this is a new user (sign up) or existing user (sign in)
        const isNewUser = data.user.created_at && 
          (new Date().getTime() - new Date(data.user.created_at).getTime()) < 60000; // Within last minute

        // Identify user
        mixpanel.identify(user.user_id);
        mixpanel.people.set({
          '$email': user.email,
          '$name': user.full_name,
          'username': user.username,
          'wallet_address': user.wallet_address,
        });

        // Track event
        if (isNewUser) {
          mixpanel.track('Sign Up', {
            user_id: user.user_id,
            email: user.email,
            signup_method: 'google',
            full_name: user.full_name,
          });
        } else {
          mixpanel.track('Sign In', {
            user_id: user.user_id,
            email: user.email,
            login_method: 'google',
            success: true,
          });
        }

        return {
          success: true,
          message: "Google sign-in successful",
          data: data,
        };
      } else {
        dispatch({
          type: "AUTH_FAILURE",
          payload: response.message || "Google OAuth callback failed",
        });
        return response;
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Google OAuth callback failed";
      dispatch({ type: "AUTH_FAILURE", payload: errorMessage });
      return {
        success: false,
        message: errorMessage,
        data: null,
        error: errorMessage,
      };
    }
  };

  const forgotPassword = async (
    email: string
  ): Promise<AuthApiResponse<any>> => {
    try {
      const response = await authService.forgotPassword({ email });
      return response;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to send reset email";
      return {
        success: false,
        message: errorMessage,
        data: null,
        error: errorMessage,
      };
    }
  };

  const resetPassword = async (
    accessToken: string,
    newPassword: string
  ): Promise<AuthApiResponse<any>> => {
    try {
      const response = await authService.resetPassword({
        accessToken,
        newPassword,
      });
      return response;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to reset password";
      return {
        success: false,
        message: errorMessage,
        data: null,
        error: errorMessage,
      };
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await authService.logout();
    } catch (error) {
    } finally {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("refresh_token");
      dispatch({ type: "AUTH_LOGOUT" });
    }
  };

  const updateProfile = async (data: {
    full_name?: string;
    email?: string;
    img?: string;
    DOB?: string;
    country?: string;
    state?: string;
    fiat_type?: string;
    username?: string;
  }): Promise<AuthApiResponse<User>> => {
    try {
      const response = await authService.updateProfile(data);
      if (response.success && response.data) {
        dispatch({ type: "AUTH_UPDATE_USER", payload: response.data });
      }
      return response;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Update failed";
      return {
        success: false,
        message: errorMessage,
        data: null as unknown as User,
        error: errorMessage,
      };
    }
  };

  const clearError = (): void => {
    dispatch({ type: "AUTH_CLEAR_ERROR" });
  };

  const refreshUser = async (): Promise<void> => {
    try {
      const response = await authService.getCurrentUser();
      if (response.success && response.data) {
        dispatch({ type: "AUTH_UPDATE_USER", payload: response.data });
      }
    } catch (error) {
      // Handle error silently or dispatch failure if needed
    }
  };

  const value: AuthContextType = {
    state,
    createWallet,
    signin,
    signinWithGoogle,
    handleGoogleCallback,
    logout,
    forgotPassword,
    resetPassword,
    updateProfile,
    clearError,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom Hook to use Auth Context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
