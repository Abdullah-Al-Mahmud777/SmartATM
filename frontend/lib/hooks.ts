'use client';

import { useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { apiGet, apiPost, getErrorMessage } from './api';
import type {
  AdminLoginResponse,
  AdminMeResponse,
  AdminOverview,
  AdminSettings,
  AdminUser,
  AuthMe,
  SessionStatus,
} from './types';

export function useSessionStatus() {
  return useQuery({
    queryKey: ['session'],
    queryFn: () =>
      apiGet<SessionStatus>('/auth/session').then((response) => response.data),
    retry: false,
    staleTime: 30_000,
  });
}

export function useMe(enabled = true) {
  return useQuery({
    queryKey: ['me'],
    queryFn: () => apiGet<AuthMe>('/auth/me').then((response) => response.data),
    enabled,
    retry: false,
    staleTime: 60_000,
  });
}

export function useLogout() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => apiPost<null>('/auth/logout'),
    onSettled: () => {
      queryClient.clear();
      router.replace('/login');
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useAdminSession() {
  return useQuery({
    queryKey: ['adminSession'],
    queryFn: () => apiGet<AdminMeResponse>('/admin/me').then((response) => response.data),
    retry: false,
    staleTime: 30_000,
  });
}

export function useAdminLogin() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: { email: string; password: string; next?: string }) =>
      apiPost<AdminLoginResponse>('/admin/auth/login', {
        email: input.email,
        password: input.password,
      }),
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: ['adminSession'] });
      const target = response.data.mustChangePassword
        ? '/admin/setup-password'
        : variables.next && variables.next.startsWith('/admin')
          ? variables.next
          : '/admin/dashboard';
      router.push(target);
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useAdminLogout() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => apiPost<null>('/admin/auth/logout'),
    onSettled: () => {
      queryClient.removeQueries({ queryKey: ['adminSession'] });
      queryClient.removeQueries({ queryKey: ['adminOverview'] });
      queryClient.removeQueries({ queryKey: ['adminSettings'] });
      router.replace('/admin/login');
    },
    onError: () => toast.error('Could not sign out the admin session.'),
  });
}

export function useAdminRefresh() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => apiPost<{ admin: AdminUser; mustChangePassword: boolean }>('/admin/auth/refresh'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminSession'] });
    },
  });
}

export function useAdminOverview(enabled = true) {
  return useQuery({
    queryKey: ['adminOverview'],
    queryFn: () => apiGet<AdminOverview>('/admin/overview').then((response) => response.data),
    enabled,
    retry: false,
    staleTime: 30_000,
  });
}

export function useAdminSettings(enabled = true) {
  return useQuery({
    queryKey: ['adminSettings'],
    queryFn: () => apiGet<AdminSettings>('/admin/settings').then((response) => response.data),
    enabled,
    retry: false,
    staleTime: 60_000,
  });
}
