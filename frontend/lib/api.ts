import axios, {
  AxiosError,
  AxiosRequestConfig,
  InternalAxiosRequestConfig,
} from 'axios';
import type { ApiResponse } from './types';

const configuredApiUrl = process.env.NEXT_PUBLIC_API_URL?.trim();

if (!configuredApiUrl) {
  throw new Error(
    'NEXT_PUBLIC_API_URL is not configured. Set it in frontend/.env.local, for example http://localhost:4000/api/v1.'
  );
}

try {
  new URL(configuredApiUrl);
} catch {
  throw new Error('NEXT_PUBLIC_API_URL must be a valid absolute URL.');
}

export const API_BASE_URL = configuredApiUrl.replace(/\/+$/, '');
export const API_PREFIX = API_BASE_URL.endsWith('/api/v1')
  ? API_BASE_URL
  : `${API_BASE_URL}/api/v1`;

const CSRF_COOKIE = 'bank_csrf';
export const AUTH_EXPIRED_EVENT = 'smartbank:auth-expired';

export const api = axios.create({
  baseURL: API_PREFIX,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

function readCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const entry = document.cookie
    .split('; ')
    .find((cookie) => cookie.startsWith(`${name}=`));
  return entry ? decodeURIComponent(entry.slice(name.length + 1)) : null;
}

async function ensureCsrfToken(): Promise<string | null> {
  const existing = readCookie(CSRF_COOKIE);
  if (existing) return existing;

  try {
    const response = await api.get<ApiResponse<{ csrfToken: string }>>('/auth/csrf');
    return response.data.data.csrfToken;
  } catch {
    return readCookie(CSRF_COOKIE);
  }
}

api.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const method = (config.method ?? 'get').toUpperCase();
  if (!['GET', 'HEAD', 'OPTIONS'].includes(method)) {
    const token = await ensureCsrfToken();
    if (token) config.headers.set('X-CSRF-Token', token);
  }
  return config;
});

let refreshPromise: Promise<void> | null = null;

function notifySignInRequired(): void {
  if (typeof window === 'undefined') return;
  const path = window.location.pathname;
  if (!['/login', '/register', '/forgot-password'].includes(path)) {
    window.dispatchEvent(new Event(AUTH_EXPIRED_EVENT));
  }
}

interface RetryableConfig extends AxiosRequestConfig {
  _retry?: boolean;
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as RetryableConfig | undefined;
    const status = error.response?.status;
    const url = original?.url ?? '';
    const isAdminAuthMutation =
      url.includes('/admin/auth/login') ||
      url.includes('/admin/auth/logout') ||
      url.includes('/admin/auth/change-password');
    const isAuthMutation =
      url.includes('/auth/login') ||
      url.includes('/auth/refresh') ||
      url.includes('/auth/recovery') ||
      url.includes('/auth/register') ||
      isAdminAuthMutation;

    if (status === 401 && original && !original._retry && !isAuthMutation) {
      original._retry = true;
      const isAdminFlow = url.startsWith('/admin');
      const refreshUrl = isAdminFlow ? '/admin/auth/refresh' : '/auth/refresh';
      try {
        if (!refreshPromise) {
          refreshPromise = api
            .post(refreshUrl)
            .then(() => undefined)
            .finally(() => {
              refreshPromise = null;
            });
        }
        await refreshPromise;
        return api.request(original);
      } catch {
        notifySignInRequired();
        return Promise.reject(error);
      }
    }

    if (
      status === 401 &&
      !isAuthMutation &&
      typeof window !== 'undefined' &&
      !window.location.pathname.startsWith('/login')
    ) {
      notifySignInRequired();
    }

    return Promise.reject(error);
  }
);

export async function request<T>(config: AxiosRequestConfig): Promise<ApiResponse<T>> {
  const { data } = await api.request<ApiResponse<T>>(config);
  return data;
}

export const apiGet = <T>(url: string, params?: Record<string, unknown>) =>
  request<T>({ url, method: 'GET', params });

export const apiPost = <T>(
  url: string,
  body?: unknown,
  config?: AxiosRequestConfig
) => request<T>({ url, method: 'POST', data: body, ...config });

export function createIdempotencyKey(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `idem-${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
}

export const apiPatch = <T>(url: string, body?: unknown) =>
  request<T>({ url, method: 'PATCH', data: body });

export const apiPut = <T>(url: string, body?: unknown) =>
  request<T>({ url, method: 'PUT', data: body });

export const apiDelete = <T>(url: string) => request<T>({ url, method: 'DELETE' });

export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as
      | { message?: string; errors?: { field: string; message: string }[] }
      | undefined;
    if (data?.errors?.length) return data.errors[0].message;
    if (data?.message) return data.message;
    if (!error.response) {
      return `Cannot reach the SmartBank API at ${API_BASE_URL}. Make sure the backend is running and NEXT_PUBLIC_API_URL is correct.`;
    }
    return error.message;
  }
  if (error instanceof Error) return error.message;
  return 'Something went wrong.';
}

export async function downloadFile(
  url: string,
  filename: string,
  params?: Record<string, unknown>
): Promise<void> {
  const response = await api.get(url, { params, responseType: 'blob' });
  const disposition = response.headers['content-disposition'] as string | undefined;
  const match = disposition?.match(/filename="?([^"]+)"?/);
  const finalName = match?.[1] ?? filename;
  const blobUrl = URL.createObjectURL(response.data as Blob);
  const link = document.createElement('a');
  link.href = blobUrl;
  link.download = finalName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(blobUrl);
}
