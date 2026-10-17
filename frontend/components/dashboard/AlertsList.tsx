'use client';

import Link from 'next/link';
import { AlertCircle, ArrowRight } from 'lucide-react';
import { useDashboardAlerts } from '@/hooks/useApi';
import { cn, timeAgo } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { EmptyState, ErrorState } from '@/components/shared/states';

const SEVERITY_ACCENT: Record<string, string> = {
  low: 'border-l-sky-400',
  medium: 'border-l-amber-400',
  high: 'border-l-orange-500',
  critical: 'border-l-red-500',
};

export function AlertsList() {
  const { data, isLoading, isError, refetch } = useDashboardAlerts(5);
  const alerts = data?.data ?? [];

  return (
    <Card className="flex h-full flex-col">
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle>Active Alerts</CardTitle>
          <p className="text-xs text-muted-foreground">Requires attention</p>
        </div>
        <Button asChild variant="ghost" size="sm" className="text-primary">
          <Link href="/alerts">
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="flex-1">
        {isError ? (
          <ErrorState message="Could not load alerts." onRetry={() => refetch()} />
        ) : isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full" />
            ))}
          </div>
        ) : alerts.length === 0 ? (
          <EmptyState
            title="No active alerts"
            description="The network is operating normally."
            icon={AlertCircle}
          />
        ) : (
          <div className="space-y-3">
            {alerts.map((alert) => (
              <div
                key={alert._id}
                className={cn(
                  'rounded-lg border border-l-4 bg-card p-3 transition-colors hover:bg-accent/50',
                  SEVERITY_ACCENT[alert.severity] ?? 'border-l-slate-300'
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-semibold">{alert.title}</p>
                  <StatusBadge kind="severity" value={alert.severity} />
                </div>
                <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                  {alert.message}
                </p>
                <div className="mt-1.5 flex items-center justify-between text-[11px] text-muted-foreground">
                  <span>{alert.atmCode ?? 'Network'}</span>
                  <span>{timeAgo(alert.createdAt)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
