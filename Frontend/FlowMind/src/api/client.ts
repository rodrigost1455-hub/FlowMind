import axios, { AxiosError, AxiosInstance } from "axios";
import Constants from "expo-constants";

import { getRefreshToken, getToken, saveTokens, clearTokens } from "@/utils/storage";
import type { TokenPair } from "./types";

const baseURL =
  (Constants.expoConfig?.extra?.apiBaseUrl as string | undefined) ??
  "http://localhost:8000";

export const API_BASE_URL = baseURL;

export const api: AxiosInstance = axios.create({
  baseURL: `${baseURL}/api/v1`,
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

// ── Attach access token ──────────────────────────────────────────
api.interceptors.request.use(async (config) => {
  const token = await getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Refresh on 401 ───────────────────────────────────────────────
// A single in-flight refresh is shared by every concurrent request so a
// thundering herd of expired calls all wait on one new token pair.
let refreshing: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  const refresh = await getRefreshToken();
  if (!refresh) return null;
  try {
    const resp = await axios.post<TokenPair>(
      `${baseURL}/api/v1/auth/refresh`,
      { refresh_token: refresh },
      { headers: { "Content-Type": "application/json" } },
    );
    await saveTokens(resp.data);
    return resp.data.access_token;
  } catch {
    await clearTokens();
    return null;
  }
}

api.interceptors.response.use(
  (r) => r,
  async (error: AxiosError) => {
    const original = error.config as (typeof error.config & { _retry?: boolean }) | undefined;
    if (!original || error.response?.status !== 401 || original._retry) {
      return Promise.reject(error);
    }
    original._retry = true;
    refreshing ??= refreshAccessToken().finally(() => {
      refreshing = null;
    });
    const fresh = await refreshing;
    if (!fresh) return Promise.reject(error);
    original.headers = original.headers ?? {};
    (original.headers as Record<string, string>).Authorization = `Bearer ${fresh}`;
    return api.request(original);
  },
);

export function asMessage(error: unknown, fallback = "Something went wrong"): string {
  if (axios.isAxiosError(error)) {
    const detail = error.response?.data?.detail;
    if (typeof detail === "string") return detail;
    if (Array.isArray(detail) && detail[0]?.msg) return String(detail[0].msg);
    return error.message || fallback;
  }
  return fallback;
}
