/**
 * Authentication Context
 * Provides authentication state and methods throughout the app
 */

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { User, Wallet, AuthApiResponse } from '@/services/auth/types';
import { authService } from '@/services/auth';

// Auth State
interface AuthState {
  user: User | null;
  wallet: Wallet | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// Auth Actions
type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: { user: User; wallet: Wallet } }
  | { type: 'AUTH_FAILURE'; payload: string }
  | { type: 'AUTH_LOGOUT' }
  | { type: 'AUTH_CLEAR_ERROR' }
  | { type: 'AUTH_UPDATE_USER'; payload: User };

// Auth Context Type
interface AuthContextType {
  state: AuthState;
  login: (email: string, password: string) => Promise<AuthApiResponse<any>>;
  signup: (email: string, password: string, fullName: string) => Promise<AuthApiResponse<any>>;
  logout: () => Promise<void>;
  updateProfile: (data: { full_name?: string; email?: string }) => Promise<AuthApiResponse<User>>;
  clearError: () => void;
  refreshUser: () => Promise<void>;
}

// Initial State
const initialState: AuthState = {
  user: null,
  wallet: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

// Auth Reducer
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'AUTH_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        wallet: action.payload.wallet,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    case 'AUTH_FAILURE':
      return {
        ...state,
        user: null,
        wallet: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      };
    case 'AUTH_LOGOUT':
      return {
        ...state,
        user: null,
        wallet: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };
    case 'AUTH_CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    case 'AUTH_UPDATE_USER':
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

  // Initialize auth state on app load
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('auth_token');
      if (token) {
        try {
          dispatch({ type: 'AUTH_START' });
          const response = await authService.getCurrentUser();
          if (response.success && response.data) {
            // Get wallet info from user metadata
            const wallet: Wallet = {
              id: 'wallet_id',
              address: response.data.user_metadata.wallet_address,
              chain_type: 'ethereum',
            };
            dispatch({ type: 'AUTH_SUCCESS', payload: { user: response.data, wallet } });
          } else {
            dispatch({ type: 'AUTH_FAILURE', payload: 'Failed to authenticate' });
            localStorage.removeItem('auth_token');
          }
        } catch (error) {
          dispatch({ type: 'AUTH_FAILURE', payload: 'Authentication failed' });
          localStorage.removeItem('auth_token');
        }
      } else {
        dispatch({ type: 'AUTH_FAILURE', payload: 'No token found' });
      }
    };

    initializeAuth();
  }, []);

  // Auth Methods
  const login = async (email: string, password: string): Promise<AuthApiResponse<any>> => {
    dispatch({ type: 'AUTH_START' });
    
    try {
      const response = await authService.login({ email, password });
      if (response.success && response.data) {
        // Store token if provided
        if (response.data.token) {
          localStorage.setItem('auth_token', response.data.token);
        }
        
        dispatch({ 
          type: 'AUTH_SUCCESS', 
          payload: { 
            user: response.data.user, 
            wallet: response.data.wallet 
          } 
        });
      } else {
        dispatch({ type: 'AUTH_FAILURE', payload: response.message || 'Login failed' });
      }
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      dispatch({ type: 'AUTH_FAILURE', payload: errorMessage });
      return {
        success: false,
        message: errorMessage,
        data: null,
        error: errorMessage,
      };
    }
  };

  const signup = async (email: string, password: string, fullName: string): Promise<AuthApiResponse<any>> => {
    dispatch({ type: 'AUTH_START' });
    
    try {
      const response = await authService.signup({ email, password, full_name: fullName });
      if (response.success && response.data) {
        // Store token if provided
        if (response.data.token) {
          localStorage.setItem('auth_token', response.data.token);
        }
        
        dispatch({ 
          type: 'AUTH_SUCCESS', 
          payload: { 
            user: response.data.user, 
            wallet: response.data.wallet 
          } 
        });
      } else {
        dispatch({ type: 'AUTH_FAILURE', payload: response.message || 'Signup failed' });
      }
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Signup failed';
      dispatch({ type: 'AUTH_FAILURE', payload: errorMessage });
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
      // Continue with logout even if API call fails
    } finally {
      localStorage.removeItem('auth_token');
      dispatch({ type: 'AUTH_LOGOUT' });
    }
  };

  const updateProfile = async (data: { full_name?: string; email?: string }): Promise<AuthApiResponse<User>> => {
    try {
      const response = await authService.updateProfile(data);
      if (response.success && response.data) {
        dispatch({ type: 'AUTH_UPDATE_USER', payload: response.data });
      }
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Update failed';
      return {
        success: false,
        message: errorMessage,
        data: null as User,
        error: errorMessage,
      };
    }
  };

  const clearError = (): void => {
    dispatch({ type: 'AUTH_CLEAR_ERROR' });
  };

  const refreshUser = async (): Promise<void> => {
    try {
      const response = await authService.getCurrentUser();
      if (response.success && response.data) {
        dispatch({ type: 'AUTH_UPDATE_USER', payload: response.data });
      }
    } catch (error) {
      // Handle error silently or dispatch failure if needed
    }
  };

  const value: AuthContextType = {
    state,
    login,
    signup,
    logout,
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
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
