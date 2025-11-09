import React, {
  createContext,
  useContext,
  useEffect,
  useReducer,
  ReactNode,
} from "react";
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
  createAdmin: (
    email: string,
    password: string,
    fullName: string
  ) => Promise<AuthApiResponse<any>>;
  signin: (
    email: string,
    password: string,
    rememberMe?: boolean
  ) => Promise<AuthApiResponse<any>>;
  logout: () => Promise<void>;
  requestPasswordReset: (email: string) => Promise<AuthApiResponse<any>>;
  verifyPasswordResetToken: (token: string) => Promise<AuthApiResponse<any>>;
  resetPassword: (
    token: string,
    newPassword: string
  ) => Promise<AuthApiResponse<any>>;
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
      return {
        ...state,
        isLoading: false,
        error: action.payload,
        user: null,
        token: null,
        isAuthenticated: false,
      };
    case "AUTH_LOGOUT":
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };
    default:
      return state;
  }
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(reducer, initialState);

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
            const refreshResponse = await authService.refreshToken({
              refreshToken,
            });

            if (refreshResponse.success && refreshResponse.data) {
              const response = await authService.getCurrentUser();

              if (response.success && response.data) {
                const updatedToken =
                  localStorage.getItem("auth_token") ||
                  sessionStorage.getItem("auth_token") ||
                  token;
                dispatch({
                  type: "AUTH_SUCCESS",
                  payload: { user: response.data, token: updatedToken },
                });
              } else {
                throw new Error("Failed to get user after refresh");
              }
            } else {
              throw new Error("Token refresh failed");
            }
          } else {
            const response = await authService.getCurrentUser();
            if (response.success && response.data) {
              const updatedToken =
                localStorage.getItem("auth_token") ||
                sessionStorage.getItem("auth_token") ||
                token;
              dispatch({
                type: "AUTH_SUCCESS",
                payload: { user: response.data, token: updatedToken },
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

  const createAdmin = async (
    email: string,
    password: string,
    _fullName: string
  ) => {
    dispatch({ type: "AUTH_START" });
    const res = await authService.createAdmin({
      email,
      password,
      role: "admin",
    });
    if (!res.success) {
      dispatch({
        type: "AUTH_FAILURE",
        payload: res.message || "Signup failed",
      });
    } else {
      dispatch({ type: "AUTH_FAILURE", payload: "" });
    }
    return res;
  };

  const signin = async (
    email: string,
    password: string,
    rememberMe: boolean = false
  ) => {
    dispatch({ type: "AUTH_START" });
    const res = await authService.login({ email, password }, rememberMe);

    if (res.success) {
      const storage = rememberMe ? localStorage : sessionStorage;
      if (res.data?.expiresIn) {
        const expiresAt = Math.floor(Date.now() / 1000) + res.data.expiresIn;
        storage.setItem("auth_expiry", expiresAt.toString());
      }

      const me = await authService.getCurrentUser();
      if (me.success && me.data) {
        const token =
          localStorage.getItem("auth_token") ||
          sessionStorage.getItem("auth_token") ||
          "";
        dispatch({ type: "AUTH_SUCCESS", payload: { user: me.data, token } });
      } else {
        dispatch({
          type: "AUTH_FAILURE",
          payload: me.message || "Failed to load user",
        });
      }
    } else {
      dispatch({
        type: "AUTH_FAILURE",
        payload: res.message || "Login failed",
      });
    }
    return res;
  };

  const logout = async () => {
    await authService.logout();
    dispatch({ type: "AUTH_LOGOUT" });
  };

  const requestPasswordReset = async (email: string) => {
    return await authService.requestPasswordReset({ email });
  };

  const verifyPasswordResetToken = async (token: string) => {
    return await authService.verifyPasswordResetToken({ token });
  };

  const resetPassword = async (token: string, newPassword: string) => {
    return await authService.resetPassword({ token, newPassword });
  };

  const value: AuthContextType = {
    state,
    createAdmin,
    signin,
    logout,
    requestPasswordReset,
    verifyPasswordResetToken,
    resetPassword,
  };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
};
