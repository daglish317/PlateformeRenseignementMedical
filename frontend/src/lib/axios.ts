import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { authStorage } from "@/features/auth/utils/auth-storage";
import { useAuthStore } from "@/features/auth/store/auth-store";
import { tokenService } from "@/features/auth/api/token.service";

interface AxiosRequestConfigWithRetry extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

// Endpoints d'authentification publics : un 401 ne doit jamais déclencher
// de refresh de token (pas de session, l'erreur réelle doit remonter telle quelle).
const PUBLIC_AUTH_ENDPOINTS = [
  "/utilisateurs/google/",
  "/utilisateurs/login/",
  "/utilisateurs/register/",
  "/utilisateurs/token/refresh/",
];

const isPublicAuthEndpoint = (url?: string) =>
  PUBLIC_AUTH_ENDPOINTS.some((endpoint) => url?.includes(endpoint));

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: false,
});

// Request interceptor to add access token
api.interceptors.request.use(
  (config) => {
    const token = authStorage.getAccessToken();
    if (token && config.headers && !isPublicAuthEndpoint(config.url)) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle token refresh
let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

const subscribeTokenRefresh = (callback: (token: string) => void) => {
  refreshSubscribers.push(callback);
};

const onTokenRefreshed = (token: string) => {
  refreshSubscribers.forEach((callback) => callback(token));
  refreshSubscribers = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfigWithRetry;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !isPublicAuthEndpoint(originalRequest.url)
    ) {
      if (isRefreshing) {
        return new Promise((resolve) => {
          subscribeTokenRefresh((token: string) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            resolve(api(originalRequest));
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const tokens = await tokenService.refreshToken();
        useAuthStore.getState().setTokens(tokens);
        onTokenRefreshed(tokens.access);

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${tokens.access}`;
        }
        return api(originalRequest);
      } catch (refreshError) {
        useAuthStore.getState().clearAuth();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
