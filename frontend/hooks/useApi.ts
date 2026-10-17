'use client';

import {
  useMutation,
  useQuery,
  useQueryClient,
  keepPreviousData,
} from '@tanstack/react-query';
import { toast } from 'sonner';
import { apiDelete, apiGet, apiPatch, apiPost, apiPut, getErrorMessage } from '@/lib/api';
import type {
  Alert,
  ApiResponse,
  Atm,
  CashAvailabilityItem,
  DashboardSummary,
  OverviewPoint,
  PaginationMeta,
  ReportOverview,
  Settings,
  TopAtm,
  Transaction,
  User,
} from '@/lib/types';

export const queryKeys = {
  me: ['me'] as const,
  summary: ['dashboard', 'summary'] as const,
  overview: (days: number) => ['dashboard', 'overview', days] as const,
  atmMap: ['dashboard', 'atm-map'] as const,
  cashAvailability: ['dashboard', 'cash-availability'] as const,
  recentTransactions: ['dashboard', 'recent-transactions'] as const,
  topAtms: ['dashboard', 'top-atms'] as const,
  dashboardAlerts: ['dashboard', 'alerts'] as const,
  atms: (params?: unknown) => ['atms', params] as const,
  atm: (id: string) => ['atms', id] as const,
  transactions: (params?: unknown) => ['transactions', params] as const,
  cashOverview: (params?: unknown) => ['cash', 'overview', params] as const,
  alerts: (params?: unknown) => ['alerts', params] as const,
  alertStats: ['alerts', 'stats'] as const,
  users: (params?: unknown) => ['users', params] as const,
  settings: ['settings'] as const,
  report: (period: string) => ['reports', period] as const,
};

// ---------- Auth ----------
export const useMe = () =>
  useQuery({
    queryKey: queryKeys.me,
    queryFn: () => apiGet<User>('/auth/me'),
    retry: false,
    refetchInterval: false,
    staleTime: 5 * 60 * 1000,
  });

export const useLogin = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { email: string; password: string }) =>
      apiPost<{ user: User; token: string }>('/auth/login', payload),
    onSuccess: () => {
      qc.invalidateQueries();
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
};

export const useLogout = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => apiPost<null>('/auth/logout'),
    onSuccess: () => {
      qc.clear();
      window.location.href = '/login';
    },
  });
};

// ---------- Dashboard ----------
export const useSummary = () =>
  useQuery({
    queryKey: queryKeys.summary,
    queryFn: () => apiGet<DashboardSummary>('/dashboard/summary'),
  });

export const useTransactionOverview = (days = 7) =>
  useQuery({
    queryKey: queryKeys.overview(days),
    queryFn: () => apiGet<OverviewPoint[]>('/dashboard/transaction-overview', { days }),
  });

export const useAtmStatusMap = () =>
  useQuery({
    queryKey: queryKeys.atmMap,
    queryFn: () => apiGet<Atm[]>('/dashboard/atm-status-map'),
  });

export const useCashAvailability = () =>
  useQuery({
    queryKey: queryKeys.cashAvailability,
    queryFn: () =>
      apiGet<{ items: CashAvailabilityItem[]; summary: Record<string, number>; total: number }>(
        '/dashboard/cash-availability'
      ),
  });

export const useRecentTransactions = (limit = 8) =>
  useQuery({
    queryKey: queryKeys.recentTransactions,
    queryFn: () => apiGet<Transaction[]>('/dashboard/recent-transactions', { limit }),
  });

export const useTopAtms = (limit = 5) =>
  useQuery({
    queryKey: queryKeys.topAtms,
    queryFn: () => apiGet<TopAtm[]>('/dashboard/top-atms', { limit }),
  });

export const useDashboardAlerts = (limit = 5) =>
  useQuery({
    queryKey: queryKeys.dashboardAlerts,
    queryFn: () => apiGet<Alert[]>('/dashboard/alerts', { limit }),
  });

// ---------- ATMs ----------
export const useAtms = (params?: Record<string, unknown>) =>
  useQuery<ApiResponse<Atm[]>>({
    queryKey: queryKeys.atms(params),
    queryFn: () => apiGet<Atm[]>('/atms', params),
    placeholderData: keepPreviousData,
  });

export const useAtm = (id: string) =>
  useQuery({
    queryKey: queryKeys.atm(id),
    queryFn: () => apiGet<{ atm: Atm; recentTransactions: Transaction[]; alertCount: number }>(`/atms/${id}`),
    enabled: Boolean(id),
  });

export const useCreateAtm = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<Atm>) => apiPost<Atm>('/atms', payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['atms'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('ATM created');
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });
};

export const useUpdateAtm = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<Atm> }) =>
      apiPut<Atm>(`/atms/${id}`, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['atms'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('ATM updated');
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });
};

export const useDeleteAtm = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiDelete<null>(`/atms/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['atms'] });
      toast.success('ATM deleted');
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });
};

// ---------- Transactions ----------
export const useTransactions = (params?: Record<string, unknown>) =>
  useQuery<ApiResponse<Transaction[]>>({
    queryKey: queryKeys.transactions(params),
    queryFn: () => apiGet<Transaction[]>('/transactions', params),
    placeholderData: keepPreviousData,
  });

export const useCreateTransaction = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: {
      atm: string;
      type: string;
      amount: number;
      status?: string;
      customerName?: string;
    }) => apiPost<Transaction>('/transactions', payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['transactions'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Transaction recorded');
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });
};

// ---------- Cash ----------
export const useCashOverview = (params?: Record<string, unknown>) =>
  useQuery<ApiResponse<Atm[]>>({
    queryKey: queryKeys.cashOverview(params),
    queryFn: () => apiGet<Atm[]>('/cash/overview', params),
    placeholderData: keepPreviousData,
  });

export const useRefillAtm = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      denominations,
      technician,
    }: {
      id: string;
      denominations: Record<string, number>;
      technician?: string;
    }) => apiPost<Atm>(`/cash/${id}/refill`, { denominations, technician }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['cash'] });
      qc.invalidateQueries({ queryKey: ['atms'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('ATM refilled successfully');
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });
};

// ---------- Alerts ----------
export const useAlerts = (params?: Record<string, unknown>) =>
  useQuery<ApiResponse<Alert[]>>({
    queryKey: queryKeys.alerts(params),
    queryFn: () => apiGet<Alert[]>('/alerts', params),
    placeholderData: keepPreviousData,
  });

export const useAlertStats = () =>
  useQuery({
    queryKey: queryKeys.alertStats,
    queryFn: () =>
      apiGet<{
        bySeverity: Record<string, number>;
        byStatus: Record<string, number>;
        byType: Record<string, number>;
      }>('/alerts/stats'),
  });

export const useUpdateAlert = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      apiPatch<Alert>(`/alerts/${id}`, { status }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['alerts'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Alert updated');
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });
};

// ---------- Users ----------
export const useUsers = (params?: Record<string, unknown>) =>
  useQuery<ApiResponse<User[]>>({
    queryKey: queryKeys.users(params),
    queryFn: () => apiGet<User[]>('/users', params),
    placeholderData: keepPreviousData,
  });

export const useCreateUser = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<User> & { password: string }) =>
      apiPost<User>('/users', payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'] });
      toast.success('User created');
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });
};

export const useUpdateUser = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<User> & { password?: string } }) =>
      apiPut<User>(`/users/${id}`, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'] });
      toast.success('User updated');
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });
};

export const useDeleteUser = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiDelete<null>(`/users/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'] });
      toast.success('User deleted');
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });
};

// ---------- Settings ----------
export const useSettings = () =>
  useQuery({
    queryKey: queryKeys.settings,
    queryFn: () => apiGet<Settings>('/settings'),
  });

export const useUpdateSettings = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<Settings>) => apiPut<Settings>('/settings', payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.settings });
      toast.success('Settings saved');
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });
};

// ---------- Reports ----------
export const useReport = (period: string) =>
  useQuery({
    queryKey: queryKeys.report(period),
    queryFn: () => apiGet<ReportOverview>('/reports/overview', { period }),
  });

export type { PaginationMeta };
