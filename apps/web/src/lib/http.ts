import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios'
import { env } from '@/lib/env'

export const http = axios.create({
  baseURL: env.VITE_API_BASE_URL,
  withCredentials: true,
})

const getStoredToken = (): string | null => {
  if (isRefreshing) {
    return localStorage.getItem("auth_token") || sessionStorage.getItem("auth_token");
  }

  let token = localStorage.getItem("auth_token");
  const expiry = localStorage.getItem("auth_expiry");
  
  if (token && expiry) {
    const expiryTime = parseInt(expiry) * 1000;
    if (Date.now() > expiryTime) {
      if (!isRefreshing) {
        removeStoredTokens();
      }
      return null;
    }
  }

  if (!token) {
    token = sessionStorage.getItem("auth_token");
  }

  return token;
};

const getStoredRefreshToken = (): string | null => {
  return (
    localStorage.getItem("refresh_token") ||
    sessionStorage.getItem("refresh_token")
  );
};

const removeStoredTokens = (): void => {
  localStorage.removeItem("auth_token");
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("auth_expiry");
  sessionStorage.removeItem("auth_token");
  sessionStorage.removeItem("refresh_token");
  sessionStorage.removeItem("auth_expiry");
};

const setStoredTokens = (
  accessToken: string,
  refreshToken: string,
  expiresAt?: number
): void => {
  const storage = localStorage.getItem("refresh_token")
    ? localStorage
    : sessionStorage;

  storage.setItem("auth_token", accessToken);
  storage.setItem("refresh_token", refreshToken);

  if (expiresAt) {
    storage.setItem("auth_expiry", expiresAt.toString());
  }
};

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (error?: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

http.interceptors.request.use((config) => {
  const token = getStoredToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

http.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      const isPublicEndpoint =
        originalRequest.url?.includes("/auth/signin") ||
        originalRequest.url?.includes("/auth/signup") ||
        originalRequest.url?.includes("/users/create") ||
        originalRequest.url?.includes("/auth/google") ||
        originalRequest.url?.includes("/auth/forgot-password") ||
        originalRequest.url?.includes("/auth/reset-password") ||
        originalRequest.url?.includes("/auth/refresh");

      if (isPublicEndpoint) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return http(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = getStoredRefreshToken();

      if (!refreshToken) {
        removeStoredTokens();
        processQueue(error, null);
        isRefreshing = false;
        return Promise.reject(error);
      }

      try {
        const refreshResponse = await http.post(
          "/auth/refresh",
          { refreshToken },
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        const responseData = refreshResponse.data?.data || refreshResponse.data;
        
        if (responseData?.access_token && responseData?.refresh_token) {
          const { access_token, refresh_token, expires_at } = responseData;

          setStoredTokens(access_token, refresh_token, expires_at);

          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${access_token}`;
          }

          processQueue(null, access_token);
          isRefreshing = false;

          return http(originalRequest);
        } else {
          throw new Error("Invalid refresh response");
        }
      } catch (refreshError) {
        removeStoredTokens();
        processQueue(refreshError, null);
        isRefreshing = false;

        window.dispatchEvent(new CustomEvent("auth:logout"));

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
)
