import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import type { ApiResponse } from './types';

const RAW_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:10000';
export const API_BASE_URL = RAW_URL.replace(/\/$/, '');
export const API_PREFIX = `${API_BASE_URL}/api/v1`;

export const api = axios.create({
  baseURL: API_PREFIX,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const status = error.response?.status;
    const url = error.config?.url ?? '';
    const isAuthRoute = url.includes('/auth/login') || url.includes('/auth/me');
    if (status === 401 && !isAuthRoute && typeof window !== 'undefined') {
      if (!window.location.pathname.startsWith('/login')) {
        window.location.href = '/login';
      }
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

export const apiPost = <T>(url: string, body?: unknown) =>
  request<T>({ url, method: 'POST', data: body });

export const apiPut = <T>(url: string, body?: unknown) =>
  request<T>({ url, method: 'PUT', data: body });

export const apiPatch = <T>(url: string, body?: unknown) =>
  request<T>({ url, method: 'PATCH', data: body });

export const apiDelete = <T>(url: string) => request<T>({ url, method: 'DELETE' });

export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: string } | undefined;
    if (data?.message) return data.message;
    if (error.code === 'ERR_NETWORK') return 'Cannot reach the server. Is the API running?';
    return error.message;
  }
  if (error instanceof Error) return error.message;
  return 'Something went wrong';
}

export async function downloadCsv(url: string, filename: string, params?: Record<string, unknown>) {
  const response = await api.get(url, { params, responseType: 'blob' });
  const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
}
