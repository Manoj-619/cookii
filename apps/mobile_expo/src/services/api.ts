/**
 * Cookii API Client
 * ─────────────────
 * Axios instance with:
 *  • Base URL from EXPO_PUBLIC_API_URL env variable
 *  • Request interceptor: auto-attach Bearer JWT access token
 *  • Response interceptor: on 401, silently refresh token and retry once
 *  • TypeScript-typed helper methods for every API endpoint
 */

import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  InternalAxiosRequestConfig,
} from 'axios';

// ─── Token store (in-memory bridge from AsyncStorage-backed Zustand store) ─────
// We lazily resolve the token at request time to avoid circular imports.
let _getAccessToken: (() => string | null) | null = null;
let _getRefreshToken: (() => string | null) | null = null;
let _onTokenRefreshed: ((accessToken: string, refreshToken: string) => void) | null = null;
let _onAuthExpired: (() => void) | null = null;

export function configureApiClient(opts: {
  getAccessToken: () => string | null;
  getRefreshToken: () => string | null;
  onTokenRefreshed: (accessToken: string, refreshToken: string) => void;
  onAuthExpired: () => void;
}) {
  _getAccessToken = opts.getAccessToken;
  _getRefreshToken = opts.getRefreshToken;
  _onTokenRefreshed = opts.onTokenRefreshed;
  _onAuthExpired = opts.onAuthExpired;
}

// ─── Base URL ─────────────────────────────────────────────────────────────────
const BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

// ─── Axios instance ───────────────────────────────────────────────────────────
export const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 15_000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// ─── Request interceptor: attach Bearer token ────────────────────────────────
apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = _getAccessToken?.();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ─── Token refresh state ─────────────────────────────────────────────────────
let _isRefreshing = false;
let _failedQueue: Array<{
  resolve: (value: unknown) => void;
  reject: (reason?: any) => void;
  config: AxiosRequestConfig;
}> = [];

function processQueue(error: any, token: string | null) {
  _failedQueue.forEach(({ resolve, reject, config }) => {
    if (error || !token) {
      reject(error);
    } else {
      (config as InternalAxiosRequestConfig).headers = (config as InternalAxiosRequestConfig).headers || {} as any;
      (config as InternalAxiosRequestConfig).headers!.Authorization = `Bearer ${token}`;
      resolve(apiClient(config));
    }
  });
  _failedQueue = [];
}

// ─── Response interceptor: handle 401 → refresh → retry ─────────────────────
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retried?: boolean;
    };

    // Only handle 401 Unauthorized once per request
    if (error.response?.status !== 401 || originalRequest._retried) {
      return Promise.reject(error);
    }

    // Don't try to refresh the refresh-token endpoint itself
    if (originalRequest.url?.includes('/auth/token/refresh')) {
      _onAuthExpired?.();
      return Promise.reject(error);
    }

    originalRequest._retried = true;

    if (_isRefreshing) {
      // Queue request until ongoing refresh finishes
      return new Promise((resolve, reject) => {
        _failedQueue.push({ resolve, reject, config: originalRequest });
      });
    }

    _isRefreshing = true;

    try {
      const refreshToken = _getRefreshToken?.();
      if (!refreshToken) throw new Error('No refresh token available');

      const { data } = await axios.post(`${BASE_URL}/auth/token/refresh`, {
        refreshToken,
      });

      const { accessToken, refreshToken: newRefreshToken } = data.data;
      _onTokenRefreshed?.(accessToken, newRefreshToken);

      processQueue(null, accessToken);
      originalRequest.headers.Authorization = `Bearer ${accessToken}`;
      return apiClient(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);
      _onAuthExpired?.();
      return Promise.reject(refreshError);
    } finally {
      _isRefreshing = false;
    }
  },
);

// ─── Typed API response wrapper ──────────────────────────────────────────────
export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T;
}

// ─── Generic typed GET/POST helpers ─────────────────────────────────────────
export async function apiGet<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
  const res = await apiClient.get<ApiResponse<T>>(url, config);
  return res.data.data;
}

export async function apiPost<T>(
  url: string,
  body?: unknown,
  config?: AxiosRequestConfig,
): Promise<T> {
  const res = await apiClient.post<ApiResponse<T>>(url, body, config);
  return res.data.data;
}
