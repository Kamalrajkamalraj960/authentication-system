import axios from 'axios';

/**
 * Centralized Axios instance.
 *
 * Token strategy:
 *  - The refresh token lives in an httpOnly cookie (invisible to JS — XSS-safe).
 *  - The short-lived access token lives in memory (Redux) and is attached as a
 *    Bearer header by the request interceptor.
 *  - On a 401, the response interceptor transparently calls /auth/refresh once,
 *    updates the in-memory token, and replays the original request. Concurrent
 *    401s are queued behind a single refresh call (no thundering herd).
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // send/receive httpOnly cookies
  headers: { 'Content-Type': 'application/json' },
  timeout: 20000,
});

// ── Access-token accessor wired up from the store (avoids circular import) ──
let accessTokenGetter = () => null;
let onTokenRefreshed = () => {};
let onAuthFailure = () => {};

export const configureAuthBridge = ({ getToken, setToken, onLogout }) => {
  if (getToken) accessTokenGetter = getToken;
  if (setToken) onTokenRefreshed = setToken;
  if (onLogout) onAuthFailure = onLogout;
};

// ── Request interceptor: attach Bearer token ──
api.interceptors.request.use((config) => {
  const token = accessTokenGetter();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── Single-flight refresh handling ──
let isRefreshing = false;
let pendingQueue = [];

const flushQueue = (error, token = null) => {
  pendingQueue.forEach(({ resolve, reject }) => (error ? reject(error) : resolve(token)));
  pendingQueue = [];
};

// Endpoints that should NOT trigger an auto-refresh retry loop.
const NO_RETRY_PATHS = ['/auth/login', '/auth/register', '/auth/refresh'];

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { config, response } = error;
    if (!response) return Promise.reject(error); // network/timeout

    const isAuthEndpoint = NO_RETRY_PATHS.some((p) => config?.url?.includes(p));

    if (response.status === 401 && !config._retry && !isAuthEndpoint) {
      if (isRefreshing) {
        // Queue until the in-flight refresh resolves, then replay.
        return new Promise((resolve, reject) => {
          pendingQueue.push({ resolve, reject });
        })
          .then((token) => {
            config.headers.Authorization = `Bearer ${token}`;
            return api(config);
          })
          .catch((err) => Promise.reject(err));
      }

      config._retry = true;
      isRefreshing = true;

      try {
        const { data } = await api.post('/auth/refresh');
        const newToken = data?.data?.accessToken;
        onTokenRefreshed(newToken, data?.data?.user);
        flushQueue(null, newToken);
        config.headers.Authorization = `Bearer ${newToken}`;
        return api(config);
      } catch (refreshError) {
        flushQueue(refreshError, null);
        onAuthFailure();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

/** Normalize an axios error into a user-friendly message string. */
export const extractErrorMessage = (error, fallback = 'Something went wrong') => {
  if (error?.response?.data) {
    const { message, data } = error.response.data;
    const fieldError = data?.errors?.[0]?.message;
    return fieldError || message || fallback;
  }
  if (error?.code === 'ECONNABORTED') return 'Request timed out. Please try again.';
  if (error?.message === 'Network Error') return 'Cannot reach the server. Is it running?';
  return error?.message || fallback;
};

export default api;
