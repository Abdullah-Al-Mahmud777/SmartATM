'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  AlertTriangle,
  ArrowDownToLine,
  ArrowRight,
  ArrowUpFromLine,
  BellRing,
  Loader2,
  RefreshCw,
  WalletCards,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  apiGet,
  apiPost,
  createIdempotencyKey,
  getErrorMessage,
} from '@/lib/api';
import { useMe } from '@/lib/hooks';
import type { DashboardData, MoneyMovement, Transaction } from '@/lib/types';
import { formatDateTime, formatMoney, maskAccountNumber } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { AccountCard } from '@/components/portal/account-card';
import { EmptyState } from '@/components/portal/empty-state';
import { MoneyActions } from '@/components/portal/money-actions';
import { PageHeader, PageSkeleton } from '@/components/portal/portal-shell';
import { RecentTransactionsCard } from '@/components/portal/transaction-list';
import { StatCard } from '@/components/portal/stat-card';

export default function DashboardPage() {
  const me = useMe();
  const queryClient = useQueryClient();
  const [accountId, setAccountId] = useState<string | null>(null);
  const [cancelTarget, setCancelTarget] = useState<Transaction | null>(null);

  const dashboard = useQuery({
    queryKey: ['dashboard', accountId ?? 'default'],
    queryFn: () =>
      apiGet<DashboardData>(
        '/dashboard',
        accountId ? { accountId } : undefined
      ).then((response) => response.data),
  });

  const cancelWithdrawal = useMutation({
    mutationFn: (id: string) =>
      apiPost<MoneyMovement>(
        `/transactions/${id}/cancel`,
        undefined,
        { headers: { 'Idempotency-Key': createIdempotencyKey() } }
      ),
    onSuccess: (response) => {
      toast.success(response.message);
      setCancelTarget(null);
      void queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      void queryClient.invalidateQueries({ queryKey: ['me'] });
      void queryClient.invalidateQueries({ queryKey: ['transactions'] });
      void queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });

  if (dashboard.isLoading || me.isLoading) return <PageSkeleton />;

  if (dashboard.isError || !dashboard.data) {
    return (
      <Card>
        <EmptyState
          icon={AlertTriangle}
          title="Could not load your dashboard"
          description={getErrorMessage(dashboard.error)}
          action={
            <Button variant="outline" onClick={() => dashboard.refetch()}>
              <RefreshCw className="h-4 w-4" />
              Try again
            </Button>
          }
        />
      </Card>
    );
  }

  const data = dashboard.data;
  const user = me.data?.user;
  const firstName = user?.fullName.split(' ')[0] ?? 'there';
  const selectedId = accountId ?? data.selectedAccount?.id ?? null;
  const cancelAccount = cancelTarget
    ? data.accounts.find((account) => account.id === cancelTarget.accountId)
    : undefined;

  const lowAccount = data.accounts.find(
    (account) =>
      account.status === 'active' &&
      account.availableBalancePaisa < data.summary.lowBalanceThresholdPaisa
  );

  return (
    <div className="space-y-7">
      <PageHeader
        title={`Good to see you, ${firstName}`}
        description={
          data.summary.lastLoginAt
            ? `Last sign-in ${new Intl.DateTimeFormat('en-GB', {
                dateStyle: 'medium',
                timeStyle: 'short',
                timeZone: 'Asia/Dhaka',
              }).format(new Date(data.summary.lastLoginAt))}`
            : 'Welcome to your SmartBank customer portal.'
        }
        actions={
          <Button asChild variant="outline">
            <Link href="/transactions">
              All transactions
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        }
      />

      {lowAccount && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <div>
            <span className="font-semibold">Low balance alert.</span>{' '}
            Account {maskAccountNumber(lowAccount.accountNumber)} is below your{' '}
            {formatMoney(data.summary.lowBalanceThresholdPaisa)} threshold.
          </div>
        </div>
      )}

      <MoneyActions accounts={data.accounts} />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total balance"
          value={formatMoney(data.summary.totalBalancePaisa)}
          hint={`Across ${data.summary.accountCount} account${
            data.summary.accountCount === 1 ? '' : 's'
          }`}
          icon={WalletCards}
        />
        <StatCard
          label="Money in this month"
          value={formatMoney(data.summary.monthlyInflowPaisa)}
          hint="All deposits and credits"
          icon={ArrowDownToLine}
          tone="success"
        />
        <StatCard
          label="Money out this month"
          value={formatMoney(data.summary.monthlyOutflowPaisa)}
          hint="All payments and debits"
          icon={ArrowUpFromLine}
          tone="warning"
        />
        <StatCard
          label="Unread alerts"
          value={String(data.summary.unreadNotifications)}
          hint="In-app notifications"
          icon={BellRing}
          tone="neutral"
        />
      </div>

      <section>
        <div className="mb-3 flex items-end justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Your accounts</h2>
            <p className="mt-0.5 text-xs text-slate-500">
              Select an account to focus its recent activity.
            </p>
          </div>
          <Link
            href="/accounts"
            className="text-sm font-medium text-primary underline-offset-4 hover:underline"
          >
            Manage accounts
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {data.accounts.map((account) => (
            <AccountCard
              key={account.id}
              account={account}
              selected={account.id === selectedId}
              allowSelect={data.accounts.length > 1}
              onSelect={(next) => setAccountId(next.id)}
            />
          ))}
        </div>
      </section>

      <section>
        {dashboard.isFetching && !dashboard.isLoading ? (
          <div className="mb-2 flex items-center justify-end gap-1.5 text-xs text-slate-400">
            <RefreshCw className="h-3 w-3 animate-spin" />
            Refreshing
          </div>
        ) : null}

        {data.selectedAccount && (
          <div className="mb-2 text-xs text-slate-500">
            Showing activity for{' '}
            <span className="font-mono font-medium text-slate-700">
              {maskAccountNumber(data.selectedAccount.accountNumber)}
            </span>
          </div>
        )}

        {data.recentTransactions.length > 0 ? (
          <RecentTransactionsCard
            transactions={data.recentTransactions}
            accounts={data.accounts}
            accountId={data.selectedAccount?.id}
            onCancelWithdrawal={setCancelTarget}
            cancellingId={
              cancelWithdrawal.isPending ? cancelWithdrawal.variables : null
            }
          />
        ) : (
          <div>
            <div className="mb-3">
              <h2 className="text-base font-semibold text-slate-900">Recent activity</h2>
            </div>
            <Card>
              <EmptyState
                icon={WalletCards}
                title="No transactions yet"
                description="Activity for the selected account will appear here as soon as it happens."
              />
            </Card>
          </div>
        )}
      </section>

      <Dialog
        open={Boolean(cancelTarget)}
        onOpenChange={(open) => {
          if (!open && !cancelWithdrawal.isPending) setCancelTarget(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel this withdrawal?</DialogTitle>
            <DialogDescription>
              {cancelTarget
                ? `${formatMoney(
                    cancelTarget.amountPaisa
                  )} will be returned to your account${
                    cancelAccount
                      ? ` ending ${cancelAccount.accountNumber.slice(-4)}`
                      : ''
                  }.`
                : ''}
            </DialogDescription>
          </DialogHeader>
          {cancelTarget && (
            <div className="space-y-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs text-slate-600">
              <div className="flex items-center justify-between gap-3">
                <span>Reference</span>
                <span className="font-mono font-medium text-slate-800">
                  {cancelTarget.referenceNumber}
                </span>
              </div>
              {cancelTarget.cancelableUntil && (
                <div className="flex items-center justify-between gap-3">
                  <span>Cancellable until</span>
                  <span className="font-medium text-slate-800">
                    {formatDateTime(cancelTarget.cancelableUntil)}
                  </span>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setCancelTarget(null)}
              disabled={cancelWithdrawal.isPending}
            >
              Keep withdrawal
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={() =>
                cancelTarget && cancelWithdrawal.mutate(cancelTarget.id)
              }
              disabled={cancelWithdrawal.isPending}
            >
              {cancelWithdrawal.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Cancelling...
                </>
              ) : (
                'Cancel withdrawal'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
