export type UserRole = 'admin' | 'manager' | 'operator';
export type UserStatus = 'active' | 'inactive' | 'suspended';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  phone?: string;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

export type AtmStatus = 'online' | 'offline' | 'maintenance';

export interface Denominations {
  thousand: number;
  fiveHundred: number;
  twoHundred: number;
  oneHundred: number;
  fifty: number;
}

export interface Atm {
  _id: string;
  atmId: string;
  name: string;
  area: string;
  location: { lat: number; lng: number; address: string };
  status: AtmStatus;
  cash: number;
  capacity: number;
  denominations?: Denominations;
  lastRefill?: string;
  lastService?: string;
  percentage?: number;
  level?: 'critical' | 'low' | 'medium' | 'healthy';
  createdAt?: string;
  updatedAt?: string;
}

export type TransactionType =
  | 'withdrawal'
  | 'deposit'
  | 'balance_inquiry'
  | 'transfer';
export type TransactionStatus = 'success' | 'failed' | 'pending';

export interface Transaction {
  _id: string;
  reference: string;
  atm: { _id: string; atmId: string; name: string; area?: string } | string;
  atmCode: string;
  type: TransactionType;
  amount: number;
  fee: number;
  status: TransactionStatus;
  cardMasked: string;
  customerName: string;
  createdAt: string;
  updatedAt: string;
}

export type AlertType =
  | 'cash_low'
  | 'cash_out'
  | 'offline'
  | 'maintenance'
  | 'security'
  | 'network';
export type AlertSeverity = 'low' | 'medium' | 'high' | 'critical';
export type AlertStatus = 'active' | 'acknowledged' | 'resolved';

export interface Alert {
  _id: string;
  type: AlertType;
  severity: AlertSeverity;
  status: AlertStatus;
  title: string;
  message: string;
  atm?: { _id: string; atmId: string; name: string; area?: string };
  atmCode?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Settings {
  _id: string;
  orgName: string;
  currency: string;
  currencySymbol: string;
  timezone: string;
  lowCashThreshold: number;
  criticalCashThreshold: number;
  refreshInterval: number;
  alertEmail: string;
  maintenanceMode: boolean;
}

export interface DashboardSummary {
  totalAtms: number;
  online: number;
  offline: number;
  maintenance: number;
  uptimePercentage: number;
  cash: { total: number; capacity: number; percentage: number };
  transactionsToday: {
    count: number;
    volume: number;
    change: number;
    volumeChange: number;
  };
  successRate: { value: number; change: number };
  activeAlerts: number;
}

export interface OverviewPoint {
  date: string;
  transactions: number;
  successful: number;
  volume: number;
}

export interface CashAvailabilityItem {
  id: string;
  atmId: string;
  name: string;
  area: string;
  status: AtmStatus;
  cash: number;
  capacity: number;
  percentage: number;
  level: 'critical' | 'low' | 'medium' | 'healthy';
}

export interface TopAtm {
  id: string;
  atmId: string;
  name: string;
  area: string;
  status: AtmStatus;
  transactions: number;
  volume: number;
}

export interface ReportOverview {
  period: string;
  days: number;
  totals: {
    count: number;
    volume: number;
    success: number;
    failed: number;
    pending: number;
    successRate: number;
    averagePerDay: number;
  };
  byType: Array<{ _id: TransactionType; count: number; volume: number }>;
  byDay: Array<{ _id: string; count: number; volume: number }>;
  topAtms: Array<{ _id: string; count: number; volume: number }>;
  statusDistribution: Record<string, number>;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  meta?: PaginationMeta;
}
