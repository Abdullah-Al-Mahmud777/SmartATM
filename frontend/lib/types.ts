export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  meta?: PaginationMeta & Record<string, unknown>;
  errors?: { field: string; message: string }[];
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  unread?: number;
}

export interface NotificationPreferences {
  transactions: boolean;
  lowBalance: boolean;
  loginAlerts: boolean;
  bills: boolean;
  loans: boolean;
}

export interface User {
  id: string;
  userId: string;
  email: string;
  fullName: string;
  mobile: string;
  dateOfBirth: string;
  lowBalanceThresholdPaisa: number;
  notificationPreferences: NotificationPreferences;
  lastLoginAt: string | null;
  createdAt: string;
}

export interface Account {
  id: string;
  accountNumber: string;
  accountType: 'savings' | 'current';
  branchCode: string;
  branchName: string;
  holderName: string;
  balancePaisa: number;
  availableBalancePaisa: number;
  currency: 'BDT';
  status: 'active' | 'dormant' | 'closed';
  isPrimary: boolean;
  openedAt: string;
}

export type TransactionType =
  | 'deposit'
  | 'withdrawal'
  | 'transfer_debit'
  | 'transfer_credit'
  | 'exchange'
  | 'bill_payment'
  | 'mobile_recharge'
  | 'card_payment'
  | 'loan_installment'
  | 'fdr_open'
  | 'dps_contribution'
  | 'fee'
  | 'interest'
  | 'reversal';

export interface Transaction {
  id: string;
  accountId: string;
  type: TransactionType;
  direction: 'debit' | 'credit';
  amountPaisa: number;
  feePaisa: number;
  balanceAfterPaisa: number;
  referenceNumber: string;
  counterpartyName: string | null;
  counterpartyAccount: string | null;
  description: string | null;
  status: 'completed' | 'pending' | 'cancelled' | 'failed';
  channel: 'online' | 'mobile' | 'branch' | 'atm' | 'system';
  cancelableUntil?: string | null;
  completedAt?: string | null;
  cancelledAt?: string | null;
  cancelledBy?: string | null;
  createdAt: string;
}

export interface MoneyMovement {
  accountId: string;
  balancePaisa: number;
  availableBalancePaisa: number;
  transaction: Transaction;
}

export interface TransferResult {
  transferReference: string;
  fromAccount: Account;
  toAccount: Account;
  debit: Transaction;
  credit: Transaction;
}

export interface ExchangeDetails {
  rate: number;
  foreignCurrency: 'USD' | 'EUR' | 'GBP';
  foreignAmountPaisa: number;
}

export interface ExchangeResult {
  exchange: ExchangeDetails;
  accountId: string;
  balancePaisa: number;
  availableBalancePaisa: number;
  transaction: Transaction;
}

export interface ExchangeRates {
  rates: Record<string, number>;
}

export interface DashboardData {
  accounts: Account[];
  selectedAccount: Account | null;
  summary: {
    totalBalancePaisa: number;
    accountCount: number;
    monthlyInflowPaisa: number;
    monthlyOutflowPaisa: number;
    unreadNotifications: number;
    lastLoginAt: string | null;
    lowBalanceThresholdPaisa: number;
  };
  recentTransactions: Transaction[];
}

export interface SessionStatus {
  authenticated: boolean;
}

export interface AuthMe {
  user: User;
  accounts: Account[];
}

export interface AuthSession extends AuthMe {
  csrfToken: string;
}

export interface SecurityQuestion {
  id: string;
  question: string;
}

export interface Notification {
  id: string;
  type:
    | 'transaction'
    | 'low_balance'
    | 'login'
    | 'security'
    | 'welcome'
    | 'bill'
    | 'loan'
    | 'card'
    | 'support';
  title: string;
  message: string;
  severity: 'info' | 'success' | 'warning' | 'danger';
  isRead: boolean;
  readAt: string | null;
  createdAt: string;
}

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  level: 'SUPER_ADMIN' | 'ADMIN';
  status?: string;
  passwordChangeRequired?: boolean;
}

export interface AdminLoginResponse {
  admin: AdminUser;
  expiresInSeconds: number;
  mustChangePassword: boolean;
}

export interface AdminMeResponse {
  admin: AdminUser;
  mustChangePassword?: boolean;
}

export interface AdminOverviewAlert {
  code: string;
  severity: string;
  title: string;
  description: string;
  count: number;
  amountPaisa: number;
}

export interface AdminOverview {
  totals: {
    users: number;
    accounts: number;
    balancePaisa: number;
  };
  today: {
    deposit: { count: number; volumePaisa: number };
    withdrawal: { count: number; volumePaisa: number };
    transfer: { count: number; volumePaisa: number };
    exchange: { count: number; volumePaisa: number };
  };
  pendingWithdrawals: { count: number; volumePaisa: number };
  newRegistrations: { today: number; last7Days: number };
  lockedAndBlocked: { count: number };
  chart: Array<{ date: string; count: number; volumePaisa: number }>;
  alerts: AdminOverviewAlert[];
}

export interface AdminSettings {
  key: string;
  transactionFeePaisa: number;
  withdrawCancelWindowSeconds: number;
  defaultDailyLimitPaisa: number;
  defaultMonthlyLimitPaisa: number;
  userAutoLogoutMinutes: number;
  approvalThresholdPaisa: number;
  announcement: string | null;
  maintenanceMode: boolean;
}
