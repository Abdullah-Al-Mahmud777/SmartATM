'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  AlertTriangle,
  ArrowDownToLine,
  ArrowUpFromLine,
  ShieldCheck,
  Users,
  Wallet,
} from 'lucide-react';
import { useAdminOverview, useAdminSession } from '@/lib/hooks';
import { formatMoney } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatCard } from '@/components/portal/stat-card';
import { PageHeader } from '@/components/portal/portal-shell';
import { EmptyState } from '@/components/portal/empty-state';

export default function AdminDashboardPage() {
  const router = useRouter();
  const { data: session, isLoading: sessionLoading } = useAdminSession();
  const admin = session?.admin;
  const { data, isLoading, isError } = useAdminOverview(true);

  useEffect(() => {
    if (!sessionLoading && !admin) {
      router.replace(`/admin/login?next=${encodeURIComponent('/admin/dashboard')}`);
    }
  }, [sessionLoading, admin, router]);

  useEffect(() => {
    if (!sessionLoading && admin?.passwordChangeRequired) {
      router.replace('/admin/setup-password');
    }
  }, [sessionLoading, admin, router]);

  if (sessionLoading || isLoading) {
    return (
      <Card>
        <CardContent className="p-6 text-sm text-slate-500">Loading admin overview…</CardContent>
      </Card>
    );
  }

  if (isError || !data) {
    return (
      <Card>
        <CardContent className="p-6">
          <EmptyState
            icon={AlertTriangle}
            title="Could not load admin overview"
            description="Please try again in a moment."
          />
        </CardContent>
      </Card>
    );
  }

  if (!admin) {
    return null;
  }

  const overview = data;
  const chartMax = Math.max(...overview.chart.map((point) => point.volumePaisa), 1);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Admin Dashboard"
        description={`Welcome back, ${admin.name}. Platform overview and risk signals.`}
        actions={
          <Button variant="outline" onClick={() => router.refresh()}>
            Refresh
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard
          label="Total users"
          value={String(overview.totals.users)}
          hint="Registered customers"
          icon={Users}
        />
        <StatCard
          label="Total balance"
          value={formatMoney(overview.totals.balancePaisa)}
          hint="Across all accounts"
          icon={Wallet}
        />
        <StatCard
          label="Today's deposits"
          value={formatMoney(overview.today.deposit.volumePaisa)}
          hint={`${overview.today.deposit.count} deposit(s) today`}
          icon={ArrowDownToLine}
          tone="success"
        />
        <StatCard
          label="Pending withdrawals"
          value={String(overview.pendingWithdrawals.count)}
          hint={`${formatMoney(overview.pendingWithdrawals.volumePaisa)} awaiting completion`}
          icon={ArrowUpFromLine}
          tone="warning"
        />
        <StatCard
          label="New registrations"
          value={String(overview.newRegistrations.last7Days)}
          hint={`${overview.newRegistrations.today} today`}
          icon={Users}
        />
        <StatCard
          label="Locked / blocked"
          value={String(overview.lockedAndBlocked.count)}
          hint="Users needing attention"
          icon={ShieldCheck}
          tone="neutral"
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Last 7 days</CardTitle>
          </CardHeader>
          <CardContent>
            {overview.chart.length === 0 ? (
              <EmptyState
                icon={AlertTriangle}
                title="No activity"
                description="Transactions in the last 7 days will appear here."
              />
            ) : (
              <div className="space-y-2">
                {overview.chart.map((point) => (
                  <div key={point.date} className="flex items-center gap-3">
                    <span className="w-24 text-xs font-medium text-slate-500">{point.date}</span>
                    <div className="h-3 flex-1 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-sky-500"
                        style={{ width: `${Math.max(2, (point.volumePaisa / chartMax) * 100)}%` }}
                      />
                    </div>
                    <span className="w-24 text-right text-xs tabular-nums text-slate-600">
                      {formatMoney(point.volumePaisa)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            {overview.alerts.length === 0 ? (
              <EmptyState icon={ShieldCheck} title="All clear" description="No alerts right now." />
            ) : (
              <div className="space-y-2">
                {overview.alerts.map((alert) => (
                  <div
                    key={alert.code}
                    className="flex items-start justify-between gap-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5"
                  >
                    <div>
                      <div className="text-sm font-semibold text-amber-900">{alert.title}</div>
                      <div className="mt-0.5 text-xs text-amber-800">{alert.description}</div>
                    </div>
                    <div className="text-right text-xs font-semibold text-amber-900">
                      {alert.count}
                      <div className="font-normal text-amber-700">{formatMoney(alert.amountPaisa)}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
